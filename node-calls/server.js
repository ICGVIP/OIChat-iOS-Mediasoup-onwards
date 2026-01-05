/**
 * Mediasoup-based WebRTC Signaling Server
 * Stable 1:1 calling – React Native compatible
 */
process.env.DEBUG = "mediasoup*"
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mediasoup = require('mediasoup');
const cors = require('cors');
const crypto = require('crypto');
const { Console } = require('console');

// ---- Debug logging (gated) ----
// Enable with: CALLS_DEBUG=1 node server.js
const CALLS_DEBUG = process.env.CALLS_DEBUG === '1';
const slog = (event, data = {}) => {
  if (!CALLS_DEBUG) return;
  try {
    console.log(`[CALLS] ${event}`, data);
  } catch {
    // ignore
  }
};

// Delayed stats probe (to prove whether RTP is actually flowing)
// - Producer: bytesReceived should grow if clients can send RTP to server.
// - Consumer: bytesSent should grow if server can send RTP to clients.
const scheduleStatsProbe = (callData, { callId, userId, kind, producer, consumer, transport, label }) => {
  if (!CALLS_DEBUG) return;
  try {
    const peer = callData?.peers?.get?.(userId);
    if (!peer) return;
    if (!peer._statsTimers) peer._statsTimers = [];

    const t = setTimeout(async () => {
      try {
        if (producer?.getStats) {
          const stats = await producer.getStats();
          const s = Array.isArray(stats) ? stats[0] : stats;
          slog('stats.producer', {
            label,
            callId,
            userId,
            kind,
            producerId: producer.id,
            bytesReceived: s?.bytesReceived,
            packetsReceived: s?.packetsReceived,
            bitrate: s?.bitrate,
          });
        }

        if (consumer?.getStats) {
          const stats = await consumer.getStats();
          const s = Array.isArray(stats) ? stats[0] : stats;
          slog('stats.consumer', {
            label,
            callId,
            userId,
            kind,
            consumerId: consumer.id,
            producerId: consumer.producerId,
            bytesSent: s?.bytesSent,
            packetsSent: s?.packetsSent,
            bitrate: s?.bitrate,
          });
        }

        if (transport?.getStats) {
          const stats = await transport.getStats();
          const s = Array.isArray(stats) ? stats[0] : stats;
          slog('stats.transport', {
            label,
            callId,
            userId,
            transportId: transport.id,
            bytesReceived: s?.bytesReceived,
            bytesSent: s?.bytesSent,
            dtlsState: transport.dtlsState,
            iceState: transport.iceState,
          });
        }
      } catch (e) {
        slog('stats.probe.error', { label, callId, userId, error: e?.message || String(e) });
      }
    }, 2500);

    peer._statsTimers.push(t);
  } catch {
    // ignore
  }
};

// Database setup for VoIP push notifications
// Load models and sequelize at top level (like node-chats does)
const sequelize = require('./config/sequelize');
const User = require('./models/User');
const AdditionalUserDetails = require('./models/AdditionalUserDetails');
const sendVoipNotification = require('./config/apnProvider');

// Build a small participant info map for UI name fallback when users are not in phone contacts.
// Returned shape: { [userIdStr]: { firstName, lastName, username } }
async function getUsersInfoMap(ids = []) {
  try {
    if (!process.env.SQL_URL || !User) return null;
    const uniqueStr = Array.from(new Set((Array.isArray(ids) ? ids : [])
      .map(x => (x?.toString?.() ?? String(x)))
      .filter(Boolean)));
    if (!uniqueStr.length) return null;

    const uniqueNums = uniqueStr
      .map(s => parseInt(s, 10))
      .filter(n => Number.isFinite(n));
    if (!uniqueNums.length) return null;

    const users = await User.findAll({ where: { id: uniqueNums }, raw: true });
    const map = {};
    for (const u of (Array.isArray(users) ? users : [])) {
      const idStr = (u?.id?.toString?.() ?? String(u?.id));
      if (!idStr) continue;
      map[idStr] = {
        firstName: u?.firstName || null,
        lastName: u?.lastName || null,
        username: u?.username || null,
      };
    }
    return Object.keys(map).length ? map : null;
  } catch {
    return null;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

/* ================= SERVER ================= */

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/calls',
});

/* ================= MEDIASOUP CONFIG ================= */

const mediasoupConfig = {
  worker: {
    // IMPORTANT:
    // These ports MUST be open on your server's firewall/security group (UDP + TCP).
    // Group calls create multiple WebRtcTransports, so keep this range comfortably large.
    rtcMinPort: 40000,
    rtcMaxPort: 40024,
    logLevel: 'warn',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
  },
  router: {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: { 'x-google-start-bitrate': 1000 },
      },
      {
        kind: 'video',
        mimeType: 'video/h264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1,
        },
      },
    ],
  },
};

/* ================= STATE ================= */

let mediasoupWorker;
const activeCalls = new Map();
const userSockets = new Map();

// Ring/invite timeout (hard cap)
const INVITE_TIMEOUT_MS = 60 * 1000;

function _toNumOrStr(id) {
  return (typeof id === 'number' || typeof id === 'string') ? id : (id?.toString?.() ?? String(id));
}

function getParticipantsSnapshot(callData) {
  const ids = new Set();
  try {
    if (callData?.creatorId != null) ids.add(_toNumOrStr(callData.creatorId));
    if (callData?.peers?.size) {
      for (const [uid] of callData.peers) ids.add(_toNumOrStr(uid));
    }
    if (Array.isArray(callData?.participantIds)) {
      callData.participantIds.forEach((uid) => ids.add(_toNumOrStr(uid)));
    }
  } catch {}
  return Array.from(ids);
}

function ensureInvites(callData) {
  if (!callData.invites) callData.invites = new Map(); // Map<userId, { invitedAt, expiresAt, inviterId, timer }>
  return callData.invites;
}

function ensureInviteMeta(callData) {
  if (!callData.inviteMeta) callData.inviteMeta = new Map(); // Map<userIdStr, { invitedAt, expiresAt, inviterId }>
  return callData.inviteMeta;
}

function clearInviteTimer(callData, userId) {
  try {
    const invites = callData?.invites;
    const inviteMeta = callData?.inviteMeta;
    const key = _toNumOrStr(userId);
    const entry = invites?.get?.(key);
    if (entry?.timer) {
      try { clearTimeout(entry.timer); } catch {}
    }
    invites?.delete?.(key);
    inviteMeta?.delete?.(key);
  } catch {}
}

function broadcastToPeers(io, callData, event, payload, { excludeUserId } = {}) {
  try {
    for (const [uid] of callData.peers) {
      if (excludeUserId != null && _toNumOrStr(uid) === _toNumOrStr(excludeUserId)) continue;
      const sid = userSockets.get(uid);
      if (sid) io.to(sid).emit(event, payload);
    }
  } catch {}
}

// ---- Screen share guard: only one active screen share producer per call ----
function getActiveScreenShare(callData) {
  try {
    const s = callData?.activeScreenShare;
    if (s && s.producerId && s.userId != null) return s;
  } catch {}
  return null;
}

function clearActiveScreenShare(callData, producerId) {
  try {
    const cur = callData?.activeScreenShare;
    if (!cur) return;
    if (!producerId || cur.producerId === producerId) {
      callData.activeScreenShare = null;
    }
  } catch {}
}

function scheduleInviteTimeout({ io, callId, callData, inviteeId, inviterId }) {
  const invites = ensureInvites(callData);
  const inviteMeta = ensureInviteMeta(callData);
  const key = _toNumOrStr(inviteeId);

  // Idempotent: if an invite already exists and hasn't expired, keep it.
  const existing = invites.get(key);
  const now = Date.now();
  if (existing?.expiresAt && existing.expiresAt > now) return;

  const invitedAt = now;
  const expiresAt = invitedAt + INVITE_TIMEOUT_MS;

  const timer = setTimeout(() => {
    try {
      slog('invite.timeout.fired', {
        callId,
        inviteeId: key,
        now: Date.now(),
        invitedAt,
        expiresAt,
        msLate: Date.now() - expiresAt,
        participantIdsBefore: callData?.participantIds,
        peers: Array.from(callData?.peers?.keys?.() || []),
        accepted: Array.from(callData?.accepted?.values?.() || []),
      });
      // If they already accepted or joined, do nothing.
      if (callData?.accepted?.has?.(inviteeId) || callData?.peers?.has?.(inviteeId)) {
        clearInviteTimer(callData, inviteeId);
        return;
      }

      // Remove from allowed list so late-accept cannot join after timeout.
      if (Array.isArray(callData.participantIds)) {
        callData.participantIds = callData.participantIds.filter((x) => _toNumOrStr(x) !== key);
      }
      try { callData.incomingCallSentMap?.delete?.(inviteeId); } catch {}

      clearInviteTimer(callData, inviteeId);

      // Notify invitee (dismiss incoming UI / CallKeep) if online.
      const inviteeSocket = userSockets.get(inviteeId);
      if (inviteeSocket) {
        io.to(inviteeSocket).emit('call-expired', { callId, reason: 'timeout' });
      } else {
        // Invitee offline: send a "call ended" VoIP push so CallKit UI dismisses.
        try {
          const vp = callData?.voipPushes;
          const vpEntry =
            (vp && vp.get && (vp.get(inviteeId) || vp.get(key))) || null;
          const voipUUID = vpEntry?.voipUUID;
          const voipToken = vpEntry?.voipToken;
          if (sendVoipNotification && voipUUID && voipToken) {
            slog('invite.timeout.send_end_voip', { callId, inviteeId: key, voipUUID, tokenLen: voipToken?.length });
            sendVoipNotification(voipToken, {
              uuid: voipUUID,
              callId,
              action: 'end',
              reason: 'timeout',
            });
          }
        } catch (e) {
          slog('invite.timeout.send_end_voip.error', { callId, inviteeId: key, error: e?.message || String(e) });
        }
      }

      // Notify everyone in the call so they can remove the "Ringing…" tile.
      broadcastToPeers(io, callData, 'participant-no-answer', { callId, userId: inviteeId, reason: 'timeout' });

      // If nobody answered and the caller is alone, end the call attempt.
      const remainingTargets = Array.isArray(callData.participantIds) ? callData.participantIds.length : 0;
      const joinedPeers = callData?.peers?.size || 0;
      const acceptedCount = callData?.accepted?.size || 0;

      if (joinedPeers <= 1 && remainingTargets === 0 && acceptedCount <= 1) {
        // Notify remaining peer(s) and let normal cleanup happen via end-call from client.
        broadcastToPeers(io, callData, 'call-ended', { callId, reason: 'timeout' });
      }
    } catch (e) {
      slog('invite.timeout.error', { callId, inviteeId, error: e?.message || String(e) });
    }
  }, INVITE_TIMEOUT_MS);

  invites.set(key, { invitedAt, expiresAt, inviterId: _toNumOrStr(inviterId), timer });
  inviteMeta.set(key, { invitedAt, expiresAt, inviterId: _toNumOrStr(inviterId) });
  slog('invite.scheduled', { callId, inviteeId: key, invitedAt, expiresAt, inviterId: _toNumOrStr(inviterId) });
}

function cleanupPeerResources(uid, peer) {
  try {
    // Stop pending stats probes
    if (peer?._statsTimers && Array.isArray(peer._statsTimers)) {
      peer._statsTimers.forEach(t => {
        try { clearTimeout(t); } catch (e) {}
      });
      peer._statsTimers = [];
    }

    // Close producers
    try {
      peer?.producers?.forEach?.((p) => {
        try { p?.close?.(); } catch (e) {}
      });
    } catch {}

    // Close consumers
    try {
      peer?.consumers?.forEach?.((c) => {
        try { c?.close?.(); } catch (e) {}
      });
    } catch {}

    // Close transports
    try { peer?.sendTransport?.close?.(); } catch (e) {}
    try { peer?.recvTransport?.close?.(); } catch (e) {}
  } catch (e) {
    console.warn('⚠️ [SERVER] Error cleaning peer resources for user', uid, ':', e?.message || e);
  }
}

function removeParticipantFromTargets(callData, userId) {
  try {
    if (Array.isArray(callData.participantIds)) {
      const key = _toNumOrStr(userId);
      callData.participantIds = callData.participantIds.filter((x) => _toNumOrStr(x) !== key);
    }
  } catch {}
}

function maybeEndCallIfSolo({ io, callId, callData }) {
  try {
    const peersCount = callData?.peers?.size || 0;
    if (peersCount === 0) {
      try { callData.router?.close?.(); } catch (e) {}
      activeCalls.delete(callId);
      return;
    }
    if (peersCount === 1) {
      const remainingUid = Array.from(callData.peers.keys())[0];
      const sid = userSockets.get(remainingUid);
      if (sid) io.to(sid).emit('call-ended', { callId, reason: 'last-participant-left' });

      // Best-effort cleanup (router/peers). Remaining client will cleanup locally.
      try {
        for (const [uid, peer] of callData.peers) {
          cleanupPeerResources(uid, peer);
        }
      } catch {}
      try { callData.router?.close?.(); } catch (e) {}
      activeCalls.delete(callId);
    }
  } catch (e) {
    slog('leave-call.maybeEnd.error', { callId, error: e?.message || String(e) });
  }
}

/* ================= MEDIASOUP ================= */

async function createWorker() {
  const worker = await mediasoup.createWorker(mediasoupConfig.worker);
  worker.on('died', () => {
    process.exit(1);
  });
  return worker;
}

async function createRouter() {
  const router = await mediasoupWorker.createRouter(mediasoupConfig.router);
  return router;
}

async function createWebRtcTransport(router) {
  const announcedIp = '216.126.78.3';

  const transport = await router.createWebRtcTransport({
    listenIps: [
      {
        ip: '0.0.0.0',
        announcedIp,
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: 1000000,
  });

  // Transport state telemetry (super useful when media is "connecting" or silent)
  try {
    transport.on('icestatechange', (iceState) => {
      slog('transport.icestatechange', { transportId: transport.id, iceState });
    });
    transport.on('dtlsstatechange', (dtlsState) => {
      slog('transport.dtlsstatechange', { transportId: transport.id, dtlsState });
    });
    transport.on('sctpstatechange', (sctpState) => {
      slog('transport.sctpstatechange', { transportId: transport.id, sctpState });
    });
    transport.observer?.on?.('close', () => {
      slog('transport.close', { transportId: transport.id });
    });
  } catch {
    // ignore
  }

  slog('transport.created', {
    transportId: transport.id,
    announcedIp,
    iceCandidates: transport.iceCandidates?.length,
    hasUdp: true,
    hasTcp: true,
    preferUdp: true,
  });

  return {
    transport,
    params: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    },
  };
}

/* ================= SOCKET ================= */

io.on('connection', socket => {

  socket.on('register', async (userId, cb) => {
    socket.userId = userId;
    userSockets.set(userId, socket.id);
    slog('socket.register', { userId, socketId: socket.id });
    try { cb?.({ success: true, userId }); } catch {}
    
    // When user reconnects, resend the incoming-call event if:
    // - they are a target participant for that call
    // - they haven't joined yet
    // - we haven't already resent it (per-user idempotency)
    for (const [callId, callData] of activeCalls.entries()) {
        const calleePeer = callData.peers.get(userId);
      const callerId = callData.creatorId ?? Array.from(callData.peers.keys())[0];
      const allParticipants = getParticipantsSnapshot(callData);

      // Per-user idempotency (prevents resend storms)
      if (!callData.incomingCallSentMap) {
        callData.incomingCallSentMap = new Map();
      }
      if (callData.incomingCallSentMap.get(userId)) {
        continue;
      }

      const isTargetParticipant = (() => {
        try {
          const set = new Set((Array.isArray(callData.participantIds) ? callData.participantIds : []).map(_toNumOrStr));
          return set.has(_toNumOrStr(userId));
        } catch {
          return false;
        }
      })();

      if (!calleePeer && isTargetParticipant) {
        // Skip if invite already expired.
        const inv = callData?.invites?.get?.(_toNumOrStr(userId));
        if (inv?.expiresAt && inv.expiresAt <= Date.now()) {
          continue;
        }

        slog('incoming-call.resend', { callId, toUserId: userId, fromUserId: callerId });

        // Ensure we have cached participant info (for non-contact UI fallback names).
        try {
          if (!callData.participantsInfo) {
            callData.participantsInfo = await getUsersInfoMap([callerId, ...allParticipants]);
          }
        } catch {}
        
        // Fetch caller name if database is available
        let callerName = null;
        let callerFirstName = null;
        let callerLastName = null;
        if (process.env.SQL_URL) {
          try {
            const caller = await User.findByPk(callerId, { raw: true });
            if (caller) {
              callerFirstName = caller.firstName || null;
              callerLastName = caller.lastName || null;
              callerName = caller.firstName || caller.phone || callerId.toString();
            }
          } catch (e) {
            // ignore
          }
        }
        
          socket.emit('incoming-call', {
            callId,
          fromUserId: callerId,
            callType: callData.callType || 'video',
            rtpCapabilities: callData.router.rtpCapabilities,
          participants: allParticipants,
          ...(callData.participantsInfo ? { participantsInfo: callData.participantsInfo } : {}),
          ...(callerFirstName ? { callerFirstName } : {}),
          ...(callerLastName ? { callerLastName } : {}),
          ...(callerName ? { callerName } : {}),
          });
        callData.incomingCallSentMap.set(userId, true);
          console.log('📤 [SERVER] Resent incoming-call event to reconnected user', userId, 'for call', callId);

        // Ensure timeout is still enforced after reconnect.
        scheduleInviteTimeout({ io, callId, callData, inviteeId: userId, inviterId: callerId });
      }
    }
  });

  socket.on('mute-audio', ({ callId, producerId, muted }) => {
    const callData = activeCalls.get(callId);
    if (!callData) return;
  
    console.log(`${muted ? '🔇' : '🔊'} [SERVER] User ${socket.userId} ${muted ? 'muted' : 'unmuted'} audio in call ${callId}`);
  
    for (const [uid] of callData.peers) {
      if (uid !== socket.userId) {
        const sid = userSockets.get(uid);
        if (sid) {
          io.to(sid).emit(
            muted ? 'remote-user-muted' : 'remote-user-unmuted',
            { userId: socket.userId, callId }
          );
          console.log('📤 [SERVER] Notified user', uid, 'that user', socket.userId, muted ? 'is muted' : 'is unmuted');
        }
      }
    }
  });

  /* ---------- CALL REACTION (emoji) ---------- */
  // Client emits: { callId, emoji }
  // Server broadcasts: { callId, userId, emoji, ts }
  socket.on('call-reaction', async ({ callId, emoji }, cb) => {
    try {
      if (!callId) return cb?.({ error: 'Missing callId' });
      if (!socket.userId) return cb?.({ error: 'Socket not registered' });
      const callData = activeCalls.get(callId);
      if (!callData) return cb?.({ error: 'Call not found' });
      if (!callData?.peers?.has?.(socket.userId)) return cb?.({ error: 'User not in call' });

      const e = (emoji ?? '').toString();
      // Basic safety limits (avoid huge payloads). Most emoji are <= 2 UTF-16 code units.
      if (!e || e.length > 16) return cb?.({ error: 'Invalid emoji' });

      const payload = { callId, userId: socket.userId, emoji: e, ts: Date.now() };
      broadcastToPeers(io, callData, 'call-reaction', payload);
      cb?.({ success: true });
    } catch (e) {
      cb?.({ error: e?.message || String(e) });
    }
  });

  socket.on('mute-video', ({ callId, producerId, muted }) => {
    const callData = activeCalls.get(callId);
    if (!callData) return;
  
    console.log(`${muted ? '📴' : '📹'} [SERVER] User ${socket.userId} ${muted ? 'turned off' : 'turned on'} video in call ${callId}`);
  
    for (const [uid] of callData.peers) {
      if (uid !== socket.userId) {
        const sid = userSockets.get(uid);
        if (sid) {
          io.to(sid).emit(
            muted ? 'remote-user-video-muted' : 'remote-user-video-unmuted',
            { userId: socket.userId, callId }
          );
          console.log('📤 [SERVER] Notified user', uid, 'that user', socket.userId, muted ? 'turned off video' : 'turned on video');
        }
      }
    }
  });

  /* ---------- START CALL ---------- */
  socket.on('start-call', async ({ toUserIds, toUserId, callType }, cb) => {
    try {
      // Check if socket is registered
      if (!socket.userId) {
        console.error('❌ [SERVER] Socket not registered - user must call register first');
        return cb?.({ error: 'Socket not registered. Please register first.' });
      }

      console.log('📞 [SERVER] start-call event received', {
        fromUserId: socket.userId,
        toUserIds,
        toUserId,
        callType,
        hasCallback: typeof cb === 'function'
      });

      // Normalize to array (backward compatible)
      const participantIds = Array.isArray(toUserIds) ? toUserIds : (toUserId ? [toUserId] : []);
      console.log('📞 [SERVER] Normalized participant IDs:', participantIds);
      
      if (participantIds.length === 0) {
        console.error('❌ [SERVER] No participants specified');
        return cb?.({ error: 'No participants specified' });
      }

      console.log('📞 [SERVER] Call request received from user', socket.userId, 'to', participantIds, 'type:', callType);
      const callId = crypto.randomUUID();
      const router = await createRouter();
      
      if (!router || !router.rtpCapabilities) {
        console.error('❌ [SERVER] Failed to create router or router missing rtpCapabilities');
        return cb?.({ error: 'Failed to create router' });
      }
      
      const callData = {
        router,
        peers: new Map(),
        callType,
        creatorId: socket.userId,
        participantIds, // targets (excluding caller)
        incomingCallSentMap: new Map(),
        accepted: new Set(),
      };
      // Cache participant info for UI fallback names (non-contacts).
      try {
        callData.participantsInfo = await getUsersInfoMap([socket.userId, ...participantIds]);
      } catch {}
      activeCalls.set(callId, callData);

      console.log('✅ [SERVER] Sending call setup data to caller (no transports yet)', {
        callId,
        hasRtpCapabilities: !!router.rtpCapabilities,
      });

      // NOTE: Transports are created only when a user explicitly joins the call via 'join-call'.
      if (cb && typeof cb === 'function') {
        cb({ callId, rtpCapabilities: router.rtpCapabilities });
      }

      console.log('✅ [SERVER] Callback sent to caller');

      // Send incoming-call to all participants
      for (const toUserId of participantIds) {
        console.log('📤 [SERVER] Processing participant', toUserId);
      const calleeSocket = userSockets.get(toUserId);
        console.log('📤 [SERVER] Callee socket lookup', { 
          toUserId, 
          hasSocket: !!calleeSocket,
          socketId: calleeSocket 
        });
        
      if (calleeSocket) {
          // Participant is online - send via socket
          console.log('📤 [SERVER] Sending incoming-call to', toUserId, 'via socket', calleeSocket);
          
          // Fetch caller name if database is available
          let callerName = null;
          let callerFirstName = null;
          let callerLastName = null;
          if (process.env.SQL_URL) {
            try {
              const caller = await User.findByPk(socket.userId, { raw: true });
              if (caller) {
                callerFirstName = caller.firstName || null;
                callerLastName = caller.lastName || null;
                callerName = caller.firstName || caller.phone || socket.userId.toString();
              }
            } catch (e) {
              // ignore
            }
          }
          
        io.to(calleeSocket).emit('incoming-call', {
          callId,
          fromUserId: socket.userId,
          callType,
          rtpCapabilities: router.rtpCapabilities,
            participants: [socket.userId, ...participantIds],
            ...(callData.participantsInfo ? { participantsInfo: callData.participantsInfo } : {}),
            ...(callerFirstName ? { callerFirstName } : {}),
            ...(callerLastName ? { callerLastName } : {}),
            ...(callerName ? { callerName } : {}),
        });
          callData.incomingCallSentMap.set(toUserId, true);
          console.log('✅ [SERVER] Incoming call sent to participant via socket', toUserId);
          scheduleInviteTimeout({ io, callId, callData, inviteeId: toUserId, inviterId: socket.userId });
      } else {
          console.log('⚠️ [SERVER] Participant', toUserId, 'is offline (no socket found)');
          // Participant is offline - send VoIP push notification (if database is available)
        if (process.env.SQL_URL) {
          try {
            const caller = await User.findByPk(socket.userId, { raw: true });
            const callee = await User.findByPk(toUserId, { raw: true });
            
            if (callee && callee.voip_token) {
              // Get caller name
              let callerName = caller?.firstName || caller?.phone || socket.userId.toString();
              const voipUUID = crypto.randomUUID();
              
              // Store call data for when client reconnects
                if (!callData.voipPushes) {
                  callData.voipPushes = new Map();
                }
                callData.voipPushes.set(toUserId, {
                  voipUUID,
                  sent: true,
                  voipToken: callee.voip_token, // store for potential "end call" push on timeout
                });
              
              // Send VoIP push notification
              console.log('📱 [SERVER] Sending VoIP push to participant', toUserId, 'token length:', callee.voip_token?.length);
              sendVoipNotification(callee.voip_token, {
                uuid: voipUUID,
                callId,
                callerId: socket.userId,
                callType,
                callerName,
                handle: caller?.firstName || caller?.phone || socket.userId.toString(),
                hasVideo: callType === 'video',
                participants: [socket.userId, ...participantIds],
                ...(callData.participantsInfo ? { participantsInfo: callData.participantsInfo } : {}),
              }).then(() => {
                console.log('✅ [SERVER] VoIP push notification sent to participant', toUserId, 'UUID:', voipUUID);
                scheduleInviteTimeout({ io, callId, callData, inviteeId: toUserId, inviterId: socket.userId });
              }).catch(error => {
                console.error('❌ [SERVER] Failed to send VoIP push to participant', toUserId, ':', error.message);
              });
            } else {
                console.log('⚠️ [SERVER] Participant not found or no VoIP token', toUserId);
            }
          } catch (error) {
            console.error('❌ [SERVER] Error sending VoIP push notification:', error);
          }
        } else {
          console.log('⚠️ [SERVER] SQL_URL not set - cannot send VoIP push notification to offline user', toUserId);
          }
        }
      }
    } catch (e) {
      console.error('❌ [SERVER] Error in start-call callback:', e);
      if (cb && typeof cb === 'function') {
        cb({ error: e.message || 'Unknown error occurred' });
      }
    }
  });

  /* ---------- ACCEPT CALL ---------- */
  socket.on('accept-call', async ({ callId, fromUserId }, cb) => {
    try {
      if (!socket.userId) {
        slog('accept-call.denied.not_registered', { callId, socketId: socket.id });
        return cb({ error: 'Socket not registered' });
      }
      const callData = activeCalls.get(callId);
      if (!callData) return cb({ error: 'Call not found' });

      // IMPORTANT: participantIds may contain strings while socket.userId is a number (or vice-versa).
      // Use normalized string comparison to avoid false "Invite expired" rejects.
      const uidStr = _toNumOrStr(socket.userId);
      const creatorStr = _toNumOrStr(callData.creatorId);
      const participantSet = new Set((Array.isArray(callData.participantIds) ? callData.participantIds : []).map(_toNumOrStr));
      const inv = callData?.invites?.get?.(uidStr) || callData?.inviteMeta?.get?.(uidStr) || null;
      const invExpiresAt = inv?.expiresAt;
      const now = Date.now();
      const allowed =
        uidStr === creatorStr ||
        participantSet.has(uidStr) ||
        (typeof invExpiresAt === 'number' && invExpiresAt > now) ||
        callData?.peers?.has?.(socket.userId);
      if (!allowed) {
        slog('accept-call.denied.not_allowed', {
          callId,
          socketUserId: socket.userId,
          uidStr,
          creatorId: callData.creatorId,
          creatorStr,
          participantIds: callData.participantIds,
          participantSet: Array.from(participantSet),
          inviteMeta: inv ? { expiresAt: invExpiresAt, msUntilExpiry: (typeof invExpiresAt === 'number' ? invExpiresAt - now : null) } : null,
          peers: Array.from(callData?.peers?.keys?.() || []),
        });
        const sid = userSockets.get(socket.userId);
        if (sid) io.to(sid).emit('call-expired', { callId, reason: 'expired' });
        return cb({ error: 'Invite expired' });
      }

      if (!callData.accepted) callData.accepted = new Set();
      callData.accepted.add(socket.userId);
      console.log('✅ [SERVER] Participant accepted call', { callId, userId: socket.userId });

      clearInviteTimer(callData, socket.userId);
      cb({ success: true, rtpCapabilities: callData.router.rtpCapabilities });

      // For 1:1 calls, notify caller
      const callerSocket = userSockets.get(fromUserId);
      if (callerSocket) io.to(callerSocket).emit('call-accepted', { callId });
    } catch (e) {
      cb({ error: e.message });
    }
  });

  /* ---------- JOIN CALL (ROOM-STYLE: REGISTER PEER ONLY) ---------- */
  socket.on('join-call', async ({ callId }, cb) => {
    try {
      if (!socket.userId) {
        slog('join-call.denied.not_registered', { callId, socketId: socket.id });
        return cb?.({ error: 'Socket not registered' });
      }
      const callData = activeCalls.get(callId);
      if (!callData) return cb?.({ error: 'Call not found' });

      const uidStr = _toNumOrStr(socket.userId);
      const creatorStr = _toNumOrStr(callData.creatorId);
      const participantSet = new Set((Array.isArray(callData.participantIds) ? callData.participantIds : []).map(_toNumOrStr));
      const acceptedSet = new Set(Array.from(callData?.accepted?.values?.() || []).map(_toNumOrStr));
      const inv = callData?.invites?.get?.(uidStr) || callData?.inviteMeta?.get?.(uidStr) || null;
      const invExpiresAt = inv?.expiresAt;
      const now = Date.now();
      const allowed =
        uidStr === creatorStr ||
        participantSet.has(uidStr) ||
        acceptedSet.has(uidStr) ||
        (typeof invExpiresAt === 'number' && invExpiresAt > now);

      if (!allowed) {
        slog('join-call.denied.not_allowed', {
          callId,
          socketUserId: socket.userId,
          uidStr,
          creatorId: callData.creatorId,
          creatorStr,
          participantIds: callData.participantIds,
          participantSet: Array.from(participantSet),
          accepted: Array.from(acceptedSet),
          inviteMeta: inv ? { expiresAt: invExpiresAt, msUntilExpiry: (typeof invExpiresAt === 'number' ? invExpiresAt - now : null) } : null,
          peers: Array.from(callData?.peers?.keys?.() || []),
        });
        return cb?.({ error: 'Not allowed to join this call' });
      }

      // Snapshot currently joined peers BEFORE adding this user.
      const alreadyJoined = [];
      try {
        for (const [uid] of callData.peers) {
          if (_toNumOrStr(uid) !== _toNumOrStr(socket.userId)) alreadyJoined.push(uid);
        }
      } catch {}

      // Create or reuse peer entry (idempotent)
      const existingPeer = callData.peers.get(socket.userId);
      if (!existingPeer) {
      callData.peers.set(socket.userId, {
          transports: new Map(), // Map<transportId, transport>
          sendTransport: null,
          recvTransport: null,
          sendTransportParams: null,
          recvTransportParams: null,
        producers: new Map(),
          // Producer metadata to disambiguate camera vs screen share, etc.
          // Map<producerId, { source?: 'camera' | 'screen' | string }>
          producerMeta: new Map(),
        consumers: new Map(),
          joinedAt: Date.now(),
        });
        console.log('✅ [SERVER] Participant joined call (peer registered)', { callId, userId: socket.userId });
      } else {
        console.log('✅ [SERVER] Participant re-joined call (peer exists)', { callId, userId: socket.userId });
      }

      // Return enough info for clients to decide group-vs-1:1 deterministically (avoids late-joiner UI bugs).
      // IMPORTANT: Return ALL invited participants (callData.participantIds), not just joined ones.
      // This ensures the second joiner correctly detects it's a group call even if the third hasn't joined yet.
      const allParticipants = Array.isArray(callData.participantIds) && callData.participantIds.length > 0
        ? callData.participantIds
        : getParticipantsSnapshot(callData); // Fallback to joined peers if participantIds not set

      // Ensure we have cached participant info (for non-contact UI fallback names).
      try {
        if (!callData.participantsInfo) {
          callData.participantsInfo = await getUsersInfoMap([callData.creatorId, ...allParticipants]);
        }
      } catch {}
      
      cb?.({
        success: true,
        rtpCapabilities: callData.router.rtpCapabilities,
        participants: allParticipants,
        alreadyJoined,
        creatorId: callData.creatorId, // Include caller ID so client can add them to participants list
        participantsInfo: callData.participantsInfo || null,
      });

      // Tell the joining user who is already joined (so UI doesn't show them as "Ringing…").
      // This is an "initial" join list; it does NOT mean media is already flowing, just that peers exist.
      try {
        if (alreadyJoined.length) {
          io.to(socket.id).emit('participant-joined', { callId, userId: alreadyJoined, initial: true });
        }
      } catch (e) {}

      // Notify all existing participants about participant joining (now actually "joined")
      for (const [uid] of callData.peers) {
        if (uid !== socket.userId) {
          const sid = userSockets.get(uid);
          if (sid) {
            io.to(sid).emit('participant-joined', { callId, userId: socket.userId });
          }
        }
      }
    } catch (e) {
      cb?.({ error: e.message });
    }
  });

  /* ---------- CREATE TRANSPORT (ROOM-STYLE) ---------- */
  socket.on('create-transport', async ({ callId, direction }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      if (!callData) return cb?.({ error: 'Call not found' });

      const peer = callData.peers.get(socket.userId);
      if (!peer) return cb?.({ error: 'Peer not found (join-call first)' });

      const dir = (direction || '').toString().toLowerCase();
      if (dir !== 'send' && dir !== 'recv') return cb?.({ error: 'Invalid direction' });

      // Idempotent: if transport already exists, return params
      if (dir === 'send' && peer.sendTransport && peer.sendTransportParams) {
        return cb?.({ transportOptions: peer.sendTransportParams });
      }
      if (dir === 'recv' && peer.recvTransport && peer.recvTransportParams) {
        return cb?.({ transportOptions: peer.recvTransportParams });
      }

      const created = await createWebRtcTransport(callData.router);
      if (!peer.transports) peer.transports = new Map();
      peer.transports.set(created.transport.id, created.transport);

      if (dir === 'send') {
        peer.sendTransport = created.transport;
        peer.sendTransportParams = created.params;
      } else {
        peer.recvTransport = created.transport;
        peer.recvTransportParams = created.params;
      }

      slog('transport.created', {
        callId,
        userId: socket.userId,
        direction: dir,
        transportId: created.transport.id,
      });

      scheduleStatsProbe(callData, {
        label: `after create-transport(${dir})`,
        callId,
        userId: socket.userId,
        transport: created.transport,
      });

      cb?.({ transportOptions: created.params });
    } catch (e) {
      cb?.({ error: e.message });
    }
  });

  /* ---------- GET PRODUCERS (ROOM-STYLE) ---------- */
  socket.on('get-producers', async ({ callId }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      if (!callData) return cb?.({ error: 'Call not found' });
      if (!callData.peers.get(socket.userId)) return cb?.({ error: 'Peer not found (join-call first)' });

      const producers = [];
      for (const [uid, peer] of callData.peers) {
        if (uid === socket.userId) continue;
        if (peer?.producers?.size) {
          peer.producers.forEach((producer, producerId) => {
            const meta = peer?.producerMeta?.get?.(producerId) || null;
            producers.push({ producerId, kind: producer.kind, userId: uid, source: meta?.source || null });
          });
        }
      }
      cb?.({ producers });
    } catch (e) {
      cb?.({ error: e.message });
    }
  });

  /* ---------- CONNECT TRANSPORT ---------- */
  socket.on('connect-transport', async ({ callId, transportId, dtlsParameters }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      if (!callData) {
        return cb?.({ error: 'Call not found' });
      }

      const peer = callData.peers.get(socket.userId);
      if (!peer) {
        console.log('🔍 [SERVER] Peer not found for user', socket.userId);
        slog('connect-transport.peer_not_found', { callId, userId: socket.userId, transportId });
        return cb?.({ error: 'Peer not found' });
      }

      const transport =
        (peer?.transports && peer.transports.get(transportId)) ||
        (peer.sendTransport && peer.sendTransport.id === transportId ? peer.sendTransport : null) ||
        (peer.recvTransport && peer.recvTransport.id === transportId ? peer.recvTransport : null);

      if (!transport) {
        slog('connect-transport.transport_not_found', { callId, userId: socket.userId, transportId });
        return cb?.({ error: 'Transport not found' });
      }

      const transportType =
        peer.sendTransport && transport.id === peer.sendTransport.id
          ? 'Send'
          : peer.recvTransport && transport.id === peer.recvTransport.id
          ? 'Recv'
          : 'Unknown';
      console.log('🔌 [SERVER] Connecting', transportType, 'transport', transportId, 'for user', socket.userId);
      slog('connect-transport', {
        callId,
        userId: socket.userId,
        transportId,
        transportType,
        dtlsFingerprints: dtlsParameters?.fingerprints?.map?.(f => f.algorithm) || undefined,
      });
      await transport.connect({ dtlsParameters });
      console.log('✅ [SERVER] Transport pipeline completed -', transportType, 'transport', transportId, 'connected for user', socket.userId);
      slog('connect-transport.ok', { callId, userId: socket.userId, transportId, transportType });
      cb?.({ success: true });
    } catch (e) {
      slog('connect-transport.exception', { callId, userId: socket.userId, transportId, error: e?.message || String(e) });
      cb?.({ error: e.message });
    }
  });

  /* ---------- PRODUCE ---------- */
  socket.on('create-producer', async ({ callId, kind, rtpParameters, appData }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      const peer = callData?.peers.get(socket.userId);
      if (!peer) {
        return cb({ error: 'Peer not found' });
      }
      if (!peer.sendTransport) {
        return cb({ error: 'Send transport not found (create-transport send first)' });
      }

      console.log('📤 [SERVER] Media received from user', socket.userId, '- Kind:', kind);
      const source = (appData && typeof appData === 'object' ? appData.source : null) || null;
      slog('create-producer', { callId, userId: socket.userId, kind, source });

      // Enforce single active screen share per call
      if (source === 'screen') {
        const active = getActiveScreenShare(callData);
        if (active && _toNumOrStr(active.userId) !== _toNumOrStr(socket.userId)) {
          slog('create-producer.denied.screen_already_active', {
            callId,
            userId: socket.userId,
            activeUserId: active.userId,
            activeProducerId: active.producerId,
          });
          return cb({ error: 'Someone else is already sharing their screen. Ask them to stop, then you can share.' });
        }
      }

      const producer = await peer.sendTransport.produce({ kind, rtpParameters });
      peer.producers.set(producer.id, producer);
      try {
        if (!peer.producerMeta) peer.producerMeta = new Map();
        peer.producerMeta.set(producer.id, { source });
      } catch (e) {}
      if (source === 'screen') {
        callData.activeScreenShare = { producerId: producer.id, userId: socket.userId };
      }
      console.log('✅ [SERVER] Producer created - ID:', producer.id, 'Kind:', kind, 'Media is being sent from user', socket.userId);
      slog('create-producer.ok', { callId, userId: socket.userId, kind, source, producerId: producer.id });

      scheduleStatsProbe(callData, {
        label: 'after create-producer',
        callId,
        userId: socket.userId,
        kind,
        producer,
        transport: peer.sendTransport,
      });

      // Listen to producer pause/resume events (for mute functionality)

      // Send new producer to all other participants in the call
      for (const [uid] of callData.peers) {
        if (uid !== socket.userId) {
          const sid = userSockets.get(uid);
          if (sid) {
            io.to(sid).emit('new-producer', { 
              producerId: producer.id,
              kind: producer.kind,
              userId: socket.userId, // ✅ Add userId to new-producer event
              source,
            });
            console.log('📤 [SERVER] Sent new-producer to participant', uid, 'from', socket.userId, 'kind:', producer.kind);
          }
        }
      }

      cb({ producerId: producer.id });
    } catch (e) {
      slog('create-producer.exception', { callId, userId: socket.userId, kind, error: e?.message || String(e) });
      cb({ error: e.message });
    }
  });

  /* ---------- CLOSE PRODUCER (e.g., stop screenshare) ---------- */
  socket.on('close-producer', async ({ callId, producerId }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      const peer = callData?.peers.get(socket.userId);
      if (!callData || !peer) return cb?.({ error: 'Call/peer not found' });

      const producer = peer?.producers?.get?.(producerId);
      if (!producer) return cb?.({ error: 'Producer not found' });

      const meta = peer?.producerMeta?.get?.(producerId) || null;
      const source = meta?.source || null;
      const kind = producer?.kind || null;

      try { producer.close(); } catch (e) {}
      try { peer.producers.delete(producerId); } catch (e) {}
      try { peer.producerMeta?.delete?.(producerId); } catch (e) {}
      if (source === 'screen') {
        clearActiveScreenShare(callData, producerId);
      }

      // Inform other peers so they can remove UI tiles/consumers.
      for (const [uid] of callData.peers) {
        if (uid !== socket.userId) {
          const sid = userSockets.get(uid);
          if (sid) {
            io.to(sid).emit('producer-closed', { callId, producerId, userId: socket.userId, kind, source });
          }
        }
      }

      cb?.({ success: true });
    } catch (e) {
      cb?.({ error: e?.message || String(e) });
    }
  });

  /* ---------- CONSUME ---------- */
  socket.on('create-consumer', async ({ callId, producerId, rtpCapabilities }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      const peer = callData?.peers.get(socket.userId);
      if (!peer) {
        return cb({ error: 'Peer not found' });
      }
      if (!peer.recvTransport) {
        return cb({ error: 'Recv transport not found (create-transport recv first)' });
      }

      let producer;
      for (const [, p] of callData.peers) {
        if (p.producers.has(producerId)) {
          producer = p.producers.get(producerId);
          break;
        }
      }

      if (!producer) {
        return cb({ error: 'Producer not found' });
      }

      if (
        !callData.router.canConsume({
          producerId,
          rtpCapabilities,
        })
      ) {
        return cb({ error: 'Cannot consume' });
      }

      console.log('📥 [SERVER] Consumer requested by user', socket.userId, 'for producer', producerId, 'kind:', producer.kind);
      slog('create-consumer', { callId, userId: socket.userId, producerId, kind: producer.kind });
      const consumer = await peer.recvTransport.consume({
        producerId,
        rtpCapabilities,
        paused: true,
      });

      peer.consumers.set(producerId, consumer);
      console.log('✅ [SERVER] Consumer created - ID:', consumer.id, 'Kind:', consumer.kind, 'for user', socket.userId);
      slog('create-consumer.ok', { callId, userId: socket.userId, producerId, consumerId: consumer.id, kind: consumer.kind, paused: consumer.paused });

      scheduleStatsProbe(callData, {
        label: 'after create-consumer(paused)',
        callId,
        userId: socket.userId,
        kind: consumer.kind,
        consumer,
        transport: peer.recvTransport,
      });

      cb({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (e) {
      slog('create-consumer.exception', { callId, userId: socket.userId, producerId, error: e?.message || String(e) });
      cb({ error: e.message });
    }
  });

  /* ---------- RESUME CONSUMER ---------- */
  socket.on('resume-consumer', async ({ callId, consumerId }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      if (!callData) {
        return cb?.({ error: 'Call not found' });
      }

      const peer = callData.peers.get(socket.userId);
      if (!peer) {
        return cb?.({ error: 'Peer not found' });
      }

      const consumer = [...peer.consumers.values()].find(c => c.id === consumerId);
      if (!consumer) {
        return cb?.({ error: 'Consumer not found' });
      }

      if (consumer.paused) {
        await consumer.resume();
        console.log('▶️ [SERVER] Consumer resumed - ID:', consumerId, 'Kind:', consumer.kind, 'Media now flowing to user', socket.userId);
        slog('resume-consumer.ok', { callId, userId: socket.userId, consumerId, kind: consumer.kind });

        scheduleStatsProbe(callData, {
          label: 'after resume-consumer',
          callId,
          userId: socket.userId,
          kind: consumer.kind,
          consumer,
          transport: peer.recvTransport,
        });
        cb?.({ success: true });
      } else {
        slog('resume-consumer.already', { callId, userId: socket.userId, consumerId, kind: consumer.kind });
        cb?.({ success: true, alreadyResumed: true });
      }
    } catch (e) {
      slog('resume-consumer.exception', { callId, userId: socket.userId, consumerId, error: e?.message || String(e) });
      cb?.({ error: e.message });
    }
  });

  /* ---------- ADD PARTICIPANTS ---------- */
  socket.on('add-participants', async ({ callId, participantIds }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      if (!callData) {
        return cb({ error: 'Call not found' });
      }

      // Check if user is in the call
      if (!callData.peers.has(socket.userId)) {
        return cb({ error: 'User not in call' });
      }

      const addedParticipants = [];
      
      for (const userId of participantIds) {
        // Skip if already in call
        if (callData.peers.has(userId)) {
          continue;
        }

        // Check max participants (10)
        if (callData.peers.size >= 10) {
          console.log('⚠️ [SERVER] Max participants (10) reached for call', callId);
          break;
        }

        // Track as a target participant (so we can resend incoming-call on reconnect)
        if (!Array.isArray(callData.participantIds)) callData.participantIds = [];
        // Normalize to prevent duplicates when ids are sometimes strings and sometimes numbers.
        const existing = new Set(callData.participantIds.map(_toNumOrStr));
        if (!existing.has(_toNumOrStr(userId))) callData.participantIds.push(userId);

        const participantsSnapshot = getParticipantsSnapshot(callData);

        // Merge invited user's info into cached participantsInfo map (best-effort).
        try {
          const newInfo = await getUsersInfoMap([userId]);
          if (newInfo) {
            if (!callData.participantsInfo) callData.participantsInfo = {};
            callData.participantsInfo = { ...callData.participantsInfo, ...newInfo };
          }
        } catch {}

        // Notify existing peers immediately so UI can show "Ringing…" tiles (even if call started as 1:1).
        broadcastToPeers(io, callData, 'participant-invited', {
          callId,
          byUserId: socket.userId,
          userIds: [userId],
          userInfo: callData.participantsInfo?.[_toNumOrStr(userId)] || null,
        });

        // Send invitation to new participant (NO transports yet - created on accept/join)
        const participantSocket = userSockets.get(userId);
        if (participantSocket) {
          // Fetch caller name if database is available
          let callerName = null;
          let callerFirstName = null;
          let callerLastName = null;
          if (process.env.SQL_URL) {
            try {
              const caller = await User.findByPk(socket.userId, { raw: true });
              if (caller) {
                callerFirstName = caller.firstName || null;
                callerLastName = caller.lastName || null;
                callerName = caller.firstName || caller.phone || socket.userId.toString();
              }
            } catch (e) {
              // ignore
            }
          }
          
          io.to(participantSocket).emit('incoming-call', {
            callId,
            fromUserId: socket.userId,
            callType: callData.callType,
            rtpCapabilities: callData.router.rtpCapabilities,
            participants: participantsSnapshot,
            ...(callData.participantsInfo ? { participantsInfo: callData.participantsInfo } : {}),
            ...(callerFirstName ? { callerFirstName } : {}),
            ...(callerLastName ? { callerLastName } : {}),
            ...(callerName ? { callerName } : {}),
          });
          callData.incomingCallSentMap?.set?.(userId, true);
          console.log('📤 [SERVER] Incoming call (invite) sent to participant', userId);
        } else {
          // Participant is offline - send VoIP push (if available)
          if (process.env.SQL_URL) {
            try {
              const caller = await User.findByPk(socket.userId, { raw: true });
              const callee = await User.findByPk(userId, { raw: true });
              if (callee && callee.voip_token) {
                const callerName = caller?.firstName || caller?.phone || socket.userId.toString();
                const voipUUID = crypto.randomUUID();

                if (!callData.voipPushes) callData.voipPushes = new Map();
                callData.voipPushes.set(userId, { voipUUID, sent: true, voipToken: callee.voip_token });

                console.log('📱 [SERVER] Sending VoIP push to added participant', userId, 'token length:', callee.voip_token?.length);
                sendVoipNotification(callee.voip_token, {
                  uuid: voipUUID,
                  callId,
                  callerId: socket.userId,
                  callType: callData.callType,
                  callerName,
                  handle: caller?.firstName || caller?.phone || socket.userId.toString(),
                  hasVideo: callData.callType === 'video',
                  participants: participantsSnapshot,
                  ...(callData.participantsInfo ? { participantsInfo: callData.participantsInfo } : {}),
                }).then(() => {
                  console.log('✅ [SERVER] VoIP push notification sent to added participant', userId, 'UUID:', voipUUID);
                }).catch(error => {
                  console.error('❌ [SERVER] Failed to send VoIP push to added participant', userId, ':', error.message);
                });
              }
            } catch (error) {
              console.error('❌ [SERVER] Error sending VoIP push (add-participants):', error);
            }
          } else {
            console.log('⚠️ [SERVER] SQL_URL not set - cannot send VoIP push notification to offline user', userId);
          }
        }

        scheduleInviteTimeout({ io, callId, callData, inviteeId: userId, inviterId: socket.userId });
        addedParticipants.push(userId);
      }

      cb({ success: true, addedParticipants });
    } catch (e) {
      cb({ error: e.message });
    }
  });

  /* ---------- LEAVE CALL (GROUP-SAFE) ---------- */
  socket.on('leave-call', ({ callId }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      if (!callData) return cb?.({ success: true, alreadyEnded: true });

      const peer = callData.peers.get(socket.userId);
      if (!peer) {
        // Not in call; also ensure they're not still a target.
        removeParticipantFromTargets(callData, socket.userId);
        clearInviteTimer(callData, socket.userId);
        return cb?.({ success: true, notInCall: true });
      }

      console.log('🚪 [SERVER] User leaving call', { callId, userId: socket.userId });

      // If this user was actively sharing their screen, clear the lock.
      try {
        const active = getActiveScreenShare(callData);
        if (active && _toNumOrStr(active.userId) === _toNumOrStr(socket.userId)) {
          callData.activeScreenShare = null;
        }
      } catch {}

      // Remove from joined peers and targets (so they cannot rejoin without being invited again).
      callData.peers.delete(socket.userId);
      removeParticipantFromTargets(callData, socket.userId);
      try { callData.accepted?.delete?.(socket.userId); } catch {}
      clearInviteTimer(callData, socket.userId);

      // Notify remaining peers
      broadcastToPeers(io, callData, 'participant-left', { callId, userId: socket.userId });

      // Cleanup their mediasoup resources
      cleanupPeerResources(socket.userId, peer);

      cb?.({ success: true });

      // If only one (or zero) peer remains, end call for the last peer.
      maybeEndCallIfSolo({ io, callId, callData });
    } catch (e) {
      cb?.({ error: e?.message || String(e) });
    }
  });

  /* ---------- END CALL ---------- */
  socket.on('end-call', ({ callId }) => {
    const callData = activeCalls.get(callId);
    if (!callData) {
      // Call already ended - notify the user anyway
      const sid = userSockets.get(socket.userId);
      if (sid) io.to(sid).emit('call-ended', { callId });
      console.log('⚠️ [SERVER] End-call received for non-existent call', callId, 'from user', socket.userId);
      return;
    }

    // Check if cleanup is already in progress (prevent double cleanup)
    if (callData.closing) {
      console.log('⚠️ [SERVER] Call', callId, 'is already being closed');
      return;
    }

    // Mark as closing to prevent concurrent cleanup
    callData.closing = true;
    console.log('📴 [SERVER] Ending call', callId, 'initiated by user', socket.userId);

    // Notify other participants that this user left
    for (const [uid] of callData.peers) {
      if (uid !== socket.userId) {
        const sid = userSockets.get(uid);
        if (sid) {
          io.to(sid).emit('participant-left', {
            callId,
            userId: socket.userId,
          });
        }
      }
    }

    // Collect all user IDs to notify
    const usersToNotify = new Set();
    for (const [uid] of callData.peers) {
      usersToNotify.add(uid);
    }

    // Clean up all peers safely
    for (const [uid, peer] of callData.peers) {
      try {
        // Stop pending stats probes
        if (peer._statsTimers && Array.isArray(peer._statsTimers)) {
          peer._statsTimers.forEach(t => {
            try { clearTimeout(t); } catch (e) {}
          });
          peer._statsTimers = [];
        }

        // Close producers safely (idempotent - safe to call multiple times)
        if (peer.producers) {
          peer.producers.forEach(p => {
            try {
              if (p) {
                p.close();
                console.log('✅ [SERVER] Closed producer', p.id, 'for user', uid);
              }
            } catch (e) {
              // Already closed or error - ignore silently
              console.warn('⚠️ [SERVER] Producer already closed or error for user', uid, ':', e.message);
            }
          });
        }

        // Close consumers safely (idempotent - safe to call multiple times)
        if (peer.consumers) {
          peer.consumers.forEach(c => {
            try {
              if (c) {
                c.close();
                console.log('✅ [SERVER] Closed consumer', c.id, 'for user', uid);
              }
            } catch (e) {
              // Already closed or error - ignore silently
              console.warn('⚠️ [SERVER] Consumer already closed or error for user', uid, ':', e.message);
            }
          });
        }

        // Close transports safely (idempotent - safe to call multiple times)
        if (peer.sendTransport) {
          try {
            peer.sendTransport.close();
            console.log('✅ [SERVER] Closed send transport for user', uid);
          } catch (e) {
            // Already closed or error - ignore silently
            console.warn('⚠️ [SERVER] Send transport already closed or error for user', uid, ':', e.message);
          }
        }

        if (peer.recvTransport) {
          try {
            peer.recvTransport.close();
            console.log('✅ [SERVER] Closed recv transport for user', uid);
          } catch (e) {
            // Already closed or error - ignore silently
            console.warn('⚠️ [SERVER] Recv transport already closed or error for user', uid, ':', e.message);
          }
        }
      } catch (e) {
        console.error('❌ [SERVER] Error cleaning up peer', uid, ':', e.message);
      }
    }

    // Close router safely (idempotent)
    try {
      if (callData.router) {
        callData.router.close();
        console.log('✅ [SERVER] Closed router for call', callId);
      }
    } catch (e) {
      // Already closed or error - ignore silently
      console.warn('⚠️ [SERVER] Router already closed or error:', e.message);
    }

    // Notify all users that the call has ended
    usersToNotify.forEach(uid => {
      const sid = userSockets.get(uid);
      if (sid) {
        io.to(sid).emit('call-ended', { callId });
        console.log('📤 [SERVER] Notified user', uid, 'that call', callId, 'has ended');
      }
    });

    // Remove from active calls
    activeCalls.delete(callId);
    console.log('✅ [SERVER] Call', callId, 'fully cleaned up and removed');
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log('🔌 [SERVER] User', socket.userId, 'disconnected');
      
      // Clean up any active calls this user was part of (treat as leave-call; do NOT end call for everyone)
      for (const [callId, callData] of activeCalls.entries()) {
        if (callData.peers.has(socket.userId)) {
            try {
              const peer = callData.peers.get(socket.userId);
              callData.peers.delete(socket.userId);
            removeParticipantFromTargets(callData, socket.userId);
            try { callData.accepted?.delete?.(socket.userId); } catch {}
            clearInviteTimer(callData, socket.userId);

            broadcastToPeers(io, callData, 'participant-left', { callId, userId: socket.userId });
            cleanupPeerResources(socket.userId, peer);

            maybeEndCallIfSolo({ io, callId, callData });
              } catch (e) {
            console.warn('⚠️ [SERVER] Error handling disconnect leave-call:', e?.message || e);
          }
        }
      }
    }
  });
});

/* ================= START ================= */

const PORT = process.env.PORT || 8502;

(async () => {
  // Initialize database connection for VoIP push notifications (if SQL_URL is set)
  if (process.env.SQL_URL) {
    try {
      await sequelize.authenticate();
      console.log('✅ [DATABASE] Connection established successfully');
    } catch (error) {
      console.error('⚠️ [DATABASE] Unable to connect to database:', error.message);
      // Note: Models remain loaded, queries will fail gracefully if DB is unavailable
    }
  } else {
    console.warn('⚠️ [DATABASE] SQL_URL not set - VoIP push notifications may not work');
  }
  
  mediasoupWorker = await createWorker();
  server.listen(PORT, '0.0.0.0');
  console.log(`🚀 [SERVER] Mediasoup signaling server running on port ${PORT}`);
})();