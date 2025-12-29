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

// Database setup for VoIP push notifications (optional - only if SQL_URL is set)
let sequelize = null;
let User = null;
let sendVoipNotification = null;

if (process.env.SQL_URL) {
  try {
    sequelize = require('../node-chats/config/sequelize');
    User = require('../node-chats/models/User');
    sendVoipNotification = require('../node-chats/config/apnProvider');
    console.log('✅ [DATABASE] Database modules loaded');
  } catch (error) {
    console.warn('⚠️ [DATABASE] Failed to load database modules (VoIP push disabled):', error.message);
  }
} else {
  console.warn('⚠️ [DATABASE] SQL_URL not set - VoIP push notifications disabled');
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
    rtcMaxPort: 40041,
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

  socket.on('register', userId => {
    socket.userId = userId;
    userSockets.set(userId, socket.id);
    slog('socket.register', { userId, socketId: socket.id });
    
    // When user reconnects, resend the incoming-call event if:
    // - they are a target participant for that call
    // - they haven't joined yet
    // - we haven't already resent it (per-user idempotency)
    for (const [callId, callData] of activeCalls.entries()) {
      const calleePeer = callData.peers.get(userId);
      const callerId = callData.creatorId ?? Array.from(callData.peers.keys())[0];
      const allParticipants = Array.isArray(callData.participantIds)
        ? [callerId, ...callData.participantIds]
        : [callerId];

      // Per-user idempotency (prevents resend storms)
      if (!callData.incomingCallSentMap) {
        callData.incomingCallSentMap = new Map();
      }
      if (callData.incomingCallSentMap.get(userId)) {
        continue;
      }

      const isTargetParticipant = Array.isArray(callData.participantIds)
        ? callData.participantIds.includes(userId)
        : false;

      if (!calleePeer && isTargetParticipant) {
        slog('incoming-call.resend', { callId, toUserId: userId, fromUserId: callerId });
        socket.emit('incoming-call', {
          callId,
          fromUserId: callerId,
          callType: callData.callType || 'video',
          rtpCapabilities: callData.router.rtpCapabilities,
          participants: allParticipants,
        });
        callData.incomingCallSentMap.set(userId, true);
        console.log('📤 [SERVER] Resent incoming-call event to reconnected user', userId, 'for call', callId);
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
        return cb({ error: 'No participants specified' });
      }

      console.log('📞 [SERVER] Call request received from user', socket.userId, 'to', participantIds, 'type:', callType);
      const callId = crypto.randomUUID();
      const router = await createRouter();
      const callData = {
        router,
        peers: new Map(),
        callType,
        creatorId: socket.userId,
        participantIds, // targets (excluding caller)
        incomingCallSentMap: new Map(),
        accepted: new Set(),
      };
      activeCalls.set(callId, callData);

      console.log('✅ [SERVER] Sending call setup data to caller (no transports yet)', {
        callId,
        hasRtpCapabilities: !!router.rtpCapabilities,
      });

      // NOTE: Transports are created only when a user explicitly joins the call via 'join-call'.
      cb({ callId, rtpCapabilities: router.rtpCapabilities });

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
          io.to(calleeSocket).emit('incoming-call', {
            callId,
            fromUserId: socket.userId,
            callType,
            rtpCapabilities: router.rtpCapabilities,
            participants: [socket.userId, ...participantIds],
          });
          callData.incomingCallSentMap.set(toUserId, true);
          console.log('✅ [SERVER] Incoming call sent to participant via socket', toUserId);
      } else {
          console.log('⚠️ [SERVER] Participant', toUserId, 'is offline (no socket found)');
          // Participant is offline - send VoIP push notification (if database is available)
        if (User && sendVoipNotification) {
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
                });
              
              // Send VoIP push notification
              sendVoipNotification(callee.voip_token, {
                uuid: voipUUID,
                callId,
                callerId: socket.userId,
                callType,
                callerName,
                handle: caller?.firstName || caller?.phone || socket.userId.toString(),
                hasVideo: callType === 'video',
                participants: [socket.userId, ...participantIds],
              });
                console.log('📱 [SERVER] VoIP push notification sent to participant', toUserId, 'UUID:', voipUUID);
            } else {
                console.log('⚠️ [SERVER] Participant not found or no VoIP token', toUserId);
            }
          } catch (error) {
            console.error('❌ [SERVER] Error sending VoIP push notification:', error);
          }
        } else {
          console.log('⚠️ [SERVER] Database not available - cannot send VoIP push notification to offline user', toUserId);
          }
        }
      }
    } catch (e) {
      cb({ error: e.message });
    }
  });

  /* ---------- ACCEPT CALL ---------- */
  socket.on('accept-call', async ({ callId, fromUserId }, cb) => {
    try {
      const callData = activeCalls.get(callId);
      if (!callData) return cb({ error: 'Call not found' });

      if (!callData.accepted) callData.accepted = new Set();
      callData.accepted.add(socket.userId);
      console.log('✅ [SERVER] Participant accepted call', { callId, userId: socket.userId });

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
      const callData = activeCalls.get(callId);
      if (!callData) return cb?.({ error: 'Call not found' });

      const allowed =
        socket.userId === callData.creatorId ||
        (Array.isArray(callData.participantIds) && callData.participantIds.includes(socket.userId));
      if (!allowed) return cb?.({ error: 'Not allowed to join this call' });

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
          consumers: new Map(),
          joinedAt: Date.now(),
        });
        console.log('✅ [SERVER] Participant joined call (peer registered)', { callId, userId: socket.userId });
      } else {
        console.log('✅ [SERVER] Participant re-joined call (peer exists)', { callId, userId: socket.userId });
      }

      cb?.({ success: true, rtpCapabilities: callData.router.rtpCapabilities });

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
            producers.push({ producerId, kind: producer.kind, userId: uid });
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
  socket.on('create-producer', async ({ callId, kind, rtpParameters }, cb) => {
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
      slog('create-producer', { callId, userId: socket.userId, kind });
      const producer = await peer.sendTransport.produce({ kind, rtpParameters });
      peer.producers.set(producer.id, producer);
      console.log('✅ [SERVER] Producer created - ID:', producer.id, 'Kind:', kind, 'Media is being sent from user', socket.userId);
      slog('create-producer.ok', { callId, userId: socket.userId, kind, producerId: producer.id });

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
        if (!callData.participantIds.includes(userId)) callData.participantIds.push(userId);

        // Send invitation to new participant (NO transports yet - created on join)
        const participantSocket = userSockets.get(userId);
        if (participantSocket) {
          io.to(participantSocket).emit('call-invitation', {
            callId,
            fromUserId: socket.userId,
            callType: callData.callType,
            rtpCapabilities: callData.router.rtpCapabilities,
          });
          console.log('📤 [SERVER] Call invitation sent to participant', userId);
        }

        addedParticipants.push(userId);
      }

      cb({ success: true, addedParticipants });
    } catch (e) {
      cb({ error: e.message });
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
      
      // Clean up any active calls this user was part of
      for (const [callId, callData] of activeCalls.entries()) {
        if (callData.peers.has(socket.userId)) {
          console.log('📴 [SERVER] User', socket.userId, 'disconnected during active call', callId, '- ending call');
          // Trigger end-call cleanup (will be idempotent)
          const endCallEvent = { callId };
          // Manually trigger cleanup logic
          if (!callData.closing) {
            callData.closing = true;
            
            // Notify other users
            for (const [uid] of callData.peers) {
              if (uid !== socket.userId) {
                const sid = userSockets.get(uid);
                if (sid) {
                  io.to(sid).emit('call-ended', { callId });
                }
              }
            }
            
            // Clean up resources (simplified - full cleanup happens on next end-call)
            try {
              const peer = callData.peers.get(socket.userId);
              if (peer) {
                // Stop pending stats probes
                if (peer._statsTimers && Array.isArray(peer._statsTimers)) {
                  peer._statsTimers.forEach(t => {
                    try { clearTimeout(t); } catch (e) {}
                  });
                  peer._statsTimers = [];
                }
                peer.producers?.forEach(p => { try { p.close(); } catch(e) {} });
                peer.consumers?.forEach(c => { try { c.close(); } catch(e) {} });
                try { peer.sendTransport?.close(); } catch(e) {}
                try { peer.recvTransport?.close(); } catch(e) {}
              }
              callData.peers.delete(socket.userId);
            } catch (e) {
              console.warn('⚠️ [SERVER] Error cleaning up disconnected user:', e.message);
            }
            
            // If no peers left, fully clean up the call
            if (callData.peers.size === 0) {
              try {
                try { callData.router?.close(); } catch(e) {}
                activeCalls.delete(callId);
                console.log('✅ [SERVER] Fully cleaned up call', callId, 'after all users disconnected');
              } catch (e) {
                console.warn('⚠️ [SERVER] Error fully cleaning up call:', e.message);
              }
            }
          }
        }
      }
    }
  });
});

/* ================= START ================= */

const PORT = process.env.PORT || 8502;

(async () => {
  // Initialize database connection for VoIP push notifications (if available)
  if (sequelize) {
    try {
      await sequelize.authenticate();
      console.log('✅ [DATABASE] Connection established successfully');
    } catch (error) {
      console.error('⚠️ [DATABASE] Unable to connect to database (VoIP push disabled):', error.message);
      // Disable database features if connection fails
      User = null;
      sendVoipNotification = null;
    }
  }
  
  mediasoupWorker = await createWorker();
  server.listen(PORT, '0.0.0.0');
  console.log(`🚀 [SERVER] Mediasoup signaling server running on port ${PORT}`);
})();