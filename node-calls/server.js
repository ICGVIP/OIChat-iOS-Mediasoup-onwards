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
    rtcMinPort: Number(process.env.MEDIASOUP_RTC_MIN_PORT || 40000),
    rtcMaxPort: Number(process.env.MEDIASOUP_RTC_MAX_PORT || 40100),
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
  const announcedIp =
    process.env.MEDIASOUP_ANNOUNCED_IP ||
    process.env.ANNOUNCED_IP ||
    '216.126.78.3';

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
    
    // Check if there's a pending call for this user (from VoIP push)
    // When user reconnects after VoIP push, resend the incoming-call event
    // BUT only if they haven't already received it and aren't already in the call
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

      // 1:1 legacy (older push flow flags)
      const legacyShouldResend =
        callData.voipPushSent &&
        callData.calleeUserId === userId &&
        !!callData.calleeTransports;

      // Group-call offline push flow (new)
      const groupShouldResend =
        callData.voipPushes?.has?.(userId) &&
        !!callData.pendingTransports?.has?.(userId);

      if (!calleePeer && (legacyShouldResend || groupShouldResend)) {
        let sendTransportParams = null;
        let recvTransportParams = null;

        if (callData.calleeTransports) {
          sendTransportParams = callData.calleeTransports.sendTransportParams;
          recvTransportParams = callData.calleeTransports.recvTransportParams;
        } else if (callData.pendingTransports && callData.pendingTransports.has(userId)) {
          const pending = callData.pendingTransports.get(userId);
          sendTransportParams = pending.sendTransportParams;
          recvTransportParams = pending.recvTransportParams;
        }

        if (sendTransportParams && recvTransportParams) {
          socket.emit('incoming-call', {
            callId,
            fromUserId: callerId,
            callType: callData.callType || 'video',
            rtpCapabilities: callData.router.rtpCapabilities,
            sendTransport: sendTransportParams,
            recvTransport: recvTransportParams,
            participants: allParticipants,
          });
          callData.incomingCallSentMap.set(userId, true);
          console.log('📤 [SERVER] Resent incoming-call event to reconnected user', userId, 'for call', callId);
        }
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
      };
      activeCalls.set(callId, callData);

      // Create transports for caller
      const callerSend = await createWebRtcTransport(router);
      const callerRecv = await createWebRtcTransport(router);
      console.log('✅ [SERVER] Caller transports created - Send:', callerSend.transport.id, 'Recv:', callerRecv.transport.id);

      callData.peers.set(socket.userId, {
        sendTransport: callerSend.transport,
        recvTransport: callerRecv.transport,
        producers: new Map(),
        consumers: new Map(),
      });

      // For 1:1 calls, pre-create callee transports (for faster connection)
      // For group calls, create transports when each participant accepts
      if (participantIds.length === 1) {
        const calleeSend = await createWebRtcTransport(router);
        const calleeRecv = await createWebRtcTransport(router);
        console.log('✅ [SERVER] Callee transports pre-created - Send:', calleeSend.transport.id, 'Recv:', calleeRecv.transport.id);

        // Store callee transports (will be assigned when callee accepts)
        callData.calleeTransports = {
          sendTransport: calleeSend.transport,
          recvTransport: calleeRecv.transport,
          sendTransportParams: calleeSend.params,
          recvTransportParams: calleeRecv.params,
        };
      } else {
          // Group call - create transports for each participant
          callData.pendingTransports = new Map();
          for (const toUserId of participantIds) {
            const calleeSend = await createWebRtcTransport(router);
            const calleeRecv = await createWebRtcTransport(router);
            callData.pendingTransports.set(toUserId, {
              sendTransport: calleeSend.transport,
              recvTransport: calleeRecv.transport,
              sendTransportParams: calleeSend.params,
              recvTransportParams: calleeRecv.params,
            });
          }
      }

      console.log('✅ [SERVER] Sending call setup data to caller', {
        callId,
        hasRtpCapabilities: !!router.rtpCapabilities,
        hasSendTransport: !!callerSend.params,
        hasRecvTransport: !!callerRecv.params,
      });

      cb({
        callId,
        sendTransport: callerSend.params,
        recvTransport: callerRecv.params,
        rtpCapabilities: router.rtpCapabilities,
      });

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
          if (participantIds.length === 1) {
            // 1:1 call - use pre-created transports
            console.log('📤 [SERVER] Sending 1:1 incoming-call to', toUserId, 'via socket', calleeSocket);
            const incomingCallData = {
              callId,
              fromUserId: socket.userId,
              callType,
              rtpCapabilities: router.rtpCapabilities,
              sendTransport: callData.calleeTransports.sendTransportParams,
              recvTransport: callData.calleeTransports.recvTransportParams,
              participants: [socket.userId, ...participantIds],
            };
            console.log('📤 [SERVER] Incoming call data:', {
              callId,
              fromUserId: socket.userId,
              callType,
              hasRtpCapabilities: !!router.rtpCapabilities,
              hasSendTransport: !!callData.calleeTransports.sendTransportParams,
              hasRecvTransport: !!callData.calleeTransports.recvTransportParams,
            });
            io.to(calleeSocket).emit('incoming-call', incomingCallData);
            callData.incomingCallSentMap.set(toUserId, true);
            console.log('✅ [SERVER] Incoming call event emitted to socket', calleeSocket);
          } else {
            // Group call - use pre-created transports for this participant
            const transports = callData.pendingTransports.get(toUserId);
            if (transports) {
              console.log('📤 [SERVER] Sending group incoming-call to', toUserId);
              io.to(calleeSocket).emit('incoming-call', {
                callId,
                fromUserId: socket.userId,
                callType,
                rtpCapabilities: router.rtpCapabilities,
                sendTransport: transports.sendTransportParams,
                recvTransport: transports.recvTransportParams,
                participants: [socket.userId, ...participantIds],
              });
              callData.incomingCallSentMap.set(toUserId, true);
            } else {
              console.error('❌ [SERVER] No transports found for participant', toUserId);
            }
          }
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

      let transports = null;

      // Check if user already has transports (for participants added to existing call)
      const existingPeer = callData.peers.get(socket.userId);
      if (existingPeer) {
        // User already has transports (added via add-participants)
        transports = {
          sendTransport: existingPeer.sendTransport,
          recvTransport: existingPeer.recvTransport,
        };
        console.log('✅ [SERVER] Using existing transports for participant', socket.userId);
      } else if (callData.calleeTransports) {
        // 1:1 call - use pre-created transports
        transports = callData.calleeTransports;
        delete callData.calleeTransports;
        console.log('✅ [SERVER] Using callee transports for 1:1 call');
      } else if (callData.pendingTransports && callData.pendingTransports.has(socket.userId)) {
        // Group call - get transports for this participant
        const pending = callData.pendingTransports.get(socket.userId);
        transports = {
          sendTransport: pending.sendTransport,
          recvTransport: pending.recvTransport,
        };
        callData.pendingTransports.delete(socket.userId);
        console.log('✅ [SERVER] Using pending transports for group call');
      } else {
        console.error('❌ [SERVER] No transports found for participant', socket.userId);
        return cb({ error: 'Transports not found for participant' });
      }

      // Only create peer if it doesn't exist (for participants added via add-participants, it already exists)
      if (!existingPeer) {
      callData.peers.set(socket.userId, {
          sendTransport: transports.sendTransport,
          recvTransport: transports.recvTransport,
        producers: new Map(),
        consumers: new Map(),
      });
        console.log('✅ [SERVER] Created new peer entry for', socket.userId);
      } else {
        console.log('✅ [SERVER] Using existing peer entry for', socket.userId);
      }

      cb({
        rtpCapabilities: callData.router.rtpCapabilities,
      });

      // Notify all existing participants about new participant joining
      for (const [uid] of callData.peers) {
        if (uid !== socket.userId) {
          const sid = userSockets.get(uid);
          if (sid) {
            io.to(sid).emit('participant-joined', {
              callId,
              userId: socket.userId,
            });
          }
        }
      }

      // Send existing producers to new participant
      for (const [uid, peer] of callData.peers) {
        if (uid !== socket.userId && peer.producers.size > 0) {
        const calleeSocketId = userSockets.get(socket.userId);
        if (calleeSocketId) {
            peer.producers.forEach((producer, producerId) => {
            io.to(calleeSocketId).emit('new-producer', { 
              producerId,
                kind: producer.kind,
                userId: uid, // ✅ Add userId to new-producer event
              });
            });
          }
        }
      }

      // For 1:1 calls, notify caller
      if (callData.peers.size === 2) {
      const callerSocket = userSockets.get(fromUserId);
      if (callerSocket) {
        io.to(callerSocket).emit('call-accepted', { callId });
        }
      }
    } catch (e) {
      cb({ error: e.message });
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
        return cb?.({ error: 'Peer not found' });
      }

      const transport =
        peer.sendTransport.id === transportId
          ? peer.sendTransport
          : peer.recvTransport.id === transportId
          ? peer.recvTransport
          : null;

      if (!transport) {
        return cb?.({ error: 'Transport not found' });
      }

      const transportType = transport.id === peer.sendTransport.id ? 'Send' : 'Recv';
      console.log('🔌 [SERVER] Connecting', transportType, 'transport', transportId, 'for user', socket.userId);
      await transport.connect({ dtlsParameters });
      console.log('✅ [SERVER] Transport pipeline completed -', transportType, 'transport', transportId, 'connected for user', socket.userId);
      cb?.({ success: true });
    } catch (e) {
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

      console.log('📤 [SERVER] Media received from user', socket.userId, '- Kind:', kind);
      const producer = await peer.sendTransport.produce({ kind, rtpParameters });
      peer.producers.set(producer.id, producer);
      console.log('✅ [SERVER] Producer created - ID:', producer.id, 'Kind:', kind, 'Media is being sent from user', socket.userId);

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
      const consumer = await peer.recvTransport.consume({
        producerId,
        rtpCapabilities,
        paused: true,
      });

      peer.consumers.set(producerId, consumer);
      console.log('✅ [SERVER] Consumer created - ID:', consumer.id, 'Kind:', consumer.kind, 'for user', socket.userId);

      cb({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (e) {
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
        cb?.({ success: true });
      } else {
        cb?.({ success: true, alreadyResumed: true });
      }
    } catch (e) {
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

        // Create transports for new participant
        const sendTransport = await createWebRtcTransport(callData.router);
        const recvTransport = await createWebRtcTransport(callData.router);

        // Add to peers
        callData.peers.set(userId, {
          sendTransport: sendTransport.transport,
          recvTransport: recvTransport.transport,
          producers: new Map(),
          consumers: new Map(),
        });

        // Send invitation to new participant
        const participantSocket = userSockets.get(userId);
        if (participantSocket) {
          io.to(participantSocket).emit('call-invitation', {
            callId,
            fromUserId: socket.userId,
            callType: callData.callType,
            rtpCapabilities: callData.router.rtpCapabilities,
            sendTransport: sendTransport.params,
            recvTransport: recvTransport.params,
          });
          console.log('📤 [SERVER] Call invitation sent to participant', userId);
        }

        addedParticipants.push(userId);
      }

      // Notify existing participants about new participants
      for (const [uid] of callData.peers) {
        if (uid !== socket.userId && !addedParticipants.includes(uid)) {
          const sid = userSockets.get(uid);
          if (sid) {
            io.to(sid).emit('participant-joined', {
              callId,
              userId: addedParticipants, // Array of new user IDs
            });
          }
        }
      }

      // Send existing producers to new participants (after they accept)
      // This will be handled when they accept the call-invitation
      
      // Send new participants' producers to existing participants
      for (const addedUserId of addedParticipants) {
        const addedPeer = callData.peers.get(addedUserId);
        if (addedPeer && addedPeer.producers.size > 0) {
          // Notify all existing participants about new participant's producers
          for (const [uid] of callData.peers) {
            if (uid !== addedUserId && uid !== socket.userId) {
              const sid = userSockets.get(uid);
              if (sid) {
                addedPeer.producers.forEach((producer, producerId) => {
                  io.to(sid).emit('new-producer', {
                    producerId,
                    kind: producer.kind,
                    userId: addedUserId,
                  });
                  console.log('📤 [SERVER] Sent new-producer to existing participant', uid, 'for new participant', addedUserId);
                });
              }
            }
          }
        }
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

    // Collect all user IDs to notify (including callee if transports were pre-created)
    const usersToNotify = new Set();
    for (const [uid] of callData.peers) {
      usersToNotify.add(uid);
    }
    if (callData.calleeTransports && callData.calleeUserId) {
      usersToNotify.add(callData.calleeUserId);
    }

    // Clean up all peers safely
    for (const [uid, peer] of callData.peers) {
      try {
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

    // Clean up pre-created callee transports if they exist (idempotent)
    if (callData.calleeTransports) {
      try {
        if (callData.calleeTransports.sendTransport) {
          callData.calleeTransports.sendTransport.close();
          console.log('✅ [SERVER] Closed pre-created callee send transport');
        }
      } catch (e) {
        // Already closed or error - ignore silently
        console.warn('⚠️ [SERVER] Pre-created callee send transport already closed or error:', e.message);
      }
      try {
        if (callData.calleeTransports.recvTransport) {
          callData.calleeTransports.recvTransport.close();
          console.log('✅ [SERVER] Closed pre-created callee recv transport');
        }
      } catch (e) {
        // Already closed or error - ignore silently
        console.warn('⚠️ [SERVER] Pre-created callee recv transport already closed or error:', e.message);
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
                if (callData.calleeTransports) {
                  try { callData.calleeTransports.sendTransport?.close(); } catch(e) {}
                  try { callData.calleeTransports.recvTransport?.close(); } catch(e) {}
                }
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