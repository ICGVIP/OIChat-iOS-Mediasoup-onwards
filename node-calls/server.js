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
    rtcMinPort: 40000,
    rtcMaxPort: 40003,
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
  const transport = await router.createWebRtcTransport({
    listenIps: [
      {
        ip: '0.0.0.0',
        announcedIp: '216.126.78.3',
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
      if (callData.voipPushSent && callData.calleeUserId === userId) {
        const calleePeer = callData.peers.get(userId);
        // Only resend if:
        // 1. User is not already in peers (hasn't accepted yet)
        // 2. Transports still exist (call hasn't been accepted)
        // 3. Incoming call hasn't been sent via socket yet (only VoIP push was sent)
        if (!calleePeer && callData.calleeTransports && !callData.incomingCallSent) {
          socket.emit('incoming-call', {
            callId,
            fromUserId: Array.from(callData.peers.keys())[0], // Get caller ID
            callType: callData.callType || 'video',
            rtpCapabilities: callData.router.rtpCapabilities,
            sendTransport: callData.calleeTransports.sendTransportParams,
            recvTransport: callData.calleeTransports.recvTransportParams,
          });
          // Mark that incoming-call was sent via socket (prevents duplicate sends on reconnect)
          callData.incomingCallSent = true;
          console.log('📤 [SERVER] Resent incoming-call event to reconnected user', userId, 'for call', callId);
        } else if (calleePeer) {
          console.log('ℹ️ [SERVER] User', userId, 'already in call', callId, '- skipping incoming-call resend');
        } else if (!callData.calleeTransports) {
          console.log('ℹ️ [SERVER] Call', callId, 'already accepted - skipping incoming-call resend');
        } else if (callData.incomingCallSent) {
          console.log('ℹ️ [SERVER] Incoming-call already sent to user', userId, 'for call', callId, '- skipping duplicate');
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
  socket.on('start-call', async ({ toUserId, callType }, cb) => {
    try {
      console.log('📞 [SERVER] Call request received from user', socket.userId, 'to', toUserId, 'type:', callType);
      const callId = crypto.randomUUID();
      const router = await createRouter();
      const callData = { router, peers: new Map(), callType };
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

      // Create transports for callee (pre-create for faster connection)
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

      cb({
        callId,
        sendTransport: callerSend.params,
        recvTransport: callerRecv.params,
        rtpCapabilities: router.rtpCapabilities,
      });

      const calleeSocket = userSockets.get(toUserId);
      if (calleeSocket) {
        // Callee is online - send via socket
        io.to(calleeSocket).emit('incoming-call', {
          callId,
          fromUserId: socket.userId,
          callType,
          rtpCapabilities: router.rtpCapabilities,
          sendTransport: calleeSend.params,
          recvTransport: calleeRecv.params,
        });
        // Mark that incoming-call was sent via socket (prevents duplicate on reconnect)
        callData.incomingCallSent = true;
        console.log('📤 [SERVER] Incoming call sent to callee via socket', toUserId);
      } else {
        // Callee is offline - send VoIP push notification (if database is available)
        if (User && sendVoipNotification) {
          try {
            const caller = await User.findByPk(socket.userId, { raw: true });
            const callee = await User.findByPk(toUserId, { raw: true });
            
            if (callee && callee.voip_token) {
              // Get caller name
              let callerName = caller?.firstName || caller?.phone || socket.userId.toString();
              const voipUUID = crypto.randomUUID();
              
              // Store call data for when client reconnects
              callData.voipPushSent = true;
              callData.voipUUID = voipUUID;
              callData.calleeUserId = toUserId;
              
              // Send VoIP push notification
              sendVoipNotification(callee.voip_token, {
                uuid: voipUUID,
                callId,
                callerId: socket.userId,
                callType,
                callerName,
                handle: caller?.firstName || caller?.phone || socket.userId.toString(),
                hasVideo: callType === 'video',
              });
              console.log('📱 [SERVER] VoIP push notification sent to callee', toUserId, 'UUID:', voipUUID);
            } else {
              console.log('⚠️ [SERVER] Callee not found or no VoIP token', toUserId);
            }
          } catch (error) {
            console.error('❌ [SERVER] Error sending VoIP push notification:', error);
          }
        } else {
          console.log('⚠️ [SERVER] Database not available - cannot send VoIP push notification to offline user', toUserId);
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

      // Use pre-created transports for callee
      if (!callData.calleeTransports) {
        return cb({ error: 'Callee transports not found' });
      }

      callData.peers.set(socket.userId, {
        sendTransport: callData.calleeTransports.sendTransport,
        recvTransport: callData.calleeTransports.recvTransport,
        producers: new Map(),
        consumers: new Map(),
      });

      // Clean up temporary storage
      delete callData.calleeTransports;

      cb({
        rtpCapabilities: callData.router.rtpCapabilities,
      });

      const callerPeer = callData.peers.get(fromUserId);
      if (callerPeer && callerPeer.producers.size > 0) {
        const calleeSocketId = userSockets.get(socket.userId);
        if (calleeSocketId) {
          callerPeer.producers.forEach((producer, producerId) => {
            io.to(calleeSocketId).emit('new-producer', { 
              producerId,
              kind: producer.kind 
            });
          });
        }
      }

      const callerSocket = userSockets.get(fromUserId);
      if (callerSocket) {
        io.to(callerSocket).emit('call-accepted', { callId });
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

      for (const [uid] of callData.peers) {
        if (uid !== socket.userId) {
          const sid = userSockets.get(uid);
          if (sid) {
            io.to(sid).emit('new-producer', { 
              producerId: producer.id,
              kind: producer.kind 
            });
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