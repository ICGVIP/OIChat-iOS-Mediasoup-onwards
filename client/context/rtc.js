import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import {
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import RNCallKeep from 'react-native-callkeep';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import uuid from 'react-native-uuid';
import { navigate, popToTop, replace, navigationRef } from '../utils/staticNavigationutils';
import { ParticipantManager } from './participantManager';
import { SoundManager } from './soundManager';
import { StreamManager } from './streamManager';


const RTCContext = createContext(null);
export const useRTC = () => useContext(RTCContext);

// ---- Debug logging (gated) ----
// Toggle at runtime (dev) with: global.__RTC_DEBUG__ = true/false
const RTC_DEBUG_DEFAULT = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
const rtcDbgEnabled = () =>
  (typeof global !== 'undefined' && global.__RTC_DEBUG__ !== undefined)
    ? !!global.__RTC_DEBUG__
    : RTC_DEBUG_DEFAULT;
const rtcDbg = (event, data = {}) => {
  if (!rtcDbgEnabled()) return;
  try {
    console.log(`[RTC] ${event}`, data);
  } catch {
    // ignore
  }
};

export const RTCProvider = ({ children }) => {

  const user = useSelector(state => state.user.value);
  const contacts = useSelector(state => state.contacts.value?.contacts || []);

  /* ================= UI STATE ================= */
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null); // Keep for 1:1 compatibility
  const [remoteStreamTracksCount, setRemoteStreamTracksCount] = useState(0); // Force re-render when tracks change
  const [type, setType] = useState('');
  const [info, setInfo] = useState({});
  const [micStatus, setMicStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(true);
  const [remoteMicMuted, setRemoteMicMuted] = useState(false); // Track if remote user has muted their producer (1:1 compatibility)
  const [remoteVideoMuted, setRemoteVideoMuted] = useState(false); // Track if remote user has muted their video producer (1:1 compatibility)

  /* ================= PARTICIPANT STATE (Group Calls) ================= */
  const participantManager = useRef(new ParticipantManager());
  const streamManager = useRef(new StreamManager());
  const soundManager = useRef(new SoundManager());
  
  // Array for UI rendering order (maintains join order)
  const [participantsList, setParticipantsList] = useState([]);
  // Call info
  const [callInfo, setCallInfo] = useState({
    callId: null,
    type: 'video',
    participantCount: 0,
  });

  /* ================= REFS ================= */
  const socket = useRef(null);
  const device = useRef(null);
  const sendTransport = useRef(null);
  const recvTransport = useRef(null);
  const producers = useRef(new Map());
  const consumers = useRef(new Map()); // Map<producerId, { consumer, userId, kind, source?: string }>
  const currentCallId = useRef(null);
  const remoteStreamRef = useRef(null); // Keep for 1:1 compatibility
  const lastRemoteStreamTracksCount = useRef(0); // Track last count to prevent unnecessary updates
  const remoteVideoMutedRef = useRef(false); // Guard to avoid redundant state updates
  const remoteStreamSetRef = useRef(false); // Whether we've ever set remoteStream for current call (1:1)
  const consumingProducerIdsRef = useRef(new Set()); // Prevent duplicate consume() calls per producerId
  const pendingProducerQueueRef = useRef([]); // Queue new-producer events until recvTransport exists
  const callModeRef = useRef({ isGroupCall: false }); // Avoid relying on React state inside socket handlers
  const screenProducerRef = useRef(null);
  const localScreenStreamRef = useRef(null);

  const [activeScreenShare, setActiveScreenShare] = useState(null); // { userId, stream, isLocal, aspectRatio }
  const [isStartingScreenShare, setIsStartingScreenShare] = useState(false);
  // iOS background behavior: camera capture usually stops when app backgrounds.
  // We proactively signal "video off" so peers don't see a frozen frame.
  const appStateRef = useRef(AppState.currentState || 'active');
  const autoVideoMutedRef = useRef(false);
  // Map of { [userIdStr]: { firstName, lastName, username } } from calls server for non-contact name fallback.
  const participantsInfoRef = useRef({});
  const callUUID = useRef(null);
  const incomingCallSetupComplete = useRef(null); // Promise resolver for app-killed scenario
  const incomingCallSetupPromise = useRef(null); // Promise that resolves when setup is complete
  const incomingCallSetupCallId = useRef(null); // Track which callId the setup is for (prevents duplicate setup)
  const audioSessionStartedRef = useRef(false);
  const acceptInProgressRef = useRef(false);
  const acceptedCallIdRef = useRef(null);
  const acceptSucceededCallIdRef = useRef(null); // set immediately after accept-call success (before join-call)
  const callKeepActiveMarkedRef = useRef(false);
  const callKeepAnsweredRef = useRef(false);
  const lastIncomingCallRef = useRef(null); // { callId, fromUserId, callType, participants, rtpCapabilities, receivedAt }
  const socketRegisteredRef = useRef(false);


  const iceServers = [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:standard.relay.metered.ca:80",
      username: "c8902592aed4c91e18a8d929",
      credential: "tqk/vYs01A5r9hj3",
    },
    {
      urls: "turn:standard.relay.metered.ca:80?transport=tcp",
      username: "c8902592aed4c91e18a8d929",
      credential: "tqk/vYs01A5r9hj3",
    },
    {
      urls: "turn:standard.relay.metered.ca:443",
      username: "c8902592aed4c91e18a8d929",
      credential: "tqk/vYs01A5r9hj3",
    },
    {
      urls: "turns:standard.relay.metered.ca:443?transport=tcp",
      username: "c8902592aed4c91e18a8d929",
      credential: "tqk/vYs01A5r9hj3",
    }
  ];
  
  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!user?.data?.id) return;

    socket.current = io('http://216.126.78.3:8502', {
      path: '/calls',
      transports: ['polling', 'websocket'],
    });

    socket.current.on('connect', async () => {
      rtcDbg('socket.connect', { socketId: socket.current?.id, userId: user?.data?.id });
      socketRegisteredRef.current = false;
      socket.current.emit('register', user.data.id, (res) => {
        socketRegisteredRef.current = !!res?.success;
        rtcDbg('socket.register.ack', { res, socketRegistered: socketRegisteredRef.current });
        // If CallKeep is waiting, register ack is a strong signal we're ready to accept.
        if (incomingCallSetupComplete.current && currentCallId.current && incomingCallSetupCallId.current === currentCallId.current) {
          try { incomingCallSetupComplete.current(); } catch {}
          incomingCallSetupComplete.current = null;
          incomingCallSetupPromise.current = null;
        }
      });
      rtcDbg('socket.register.emit', { userId: user?.data?.id });
      // Check AsyncStorage for pending call (app-killed scenario)
      // This ensures info.callId is available immediately, even before 'incoming-call' event fires
      try {
        const callDataStr = await AsyncStorage.getItem('incomingCallData');
        if (callDataStr) {
          const callData = JSON.parse(callDataStr);
          rtcDbg('socket.connect.incomingCallData.found', {
            callId: callData?.callId,
            callerId: callData?.callerId,
            handle: callData?.handle,
            hasUuid: !!callData?.uuid,
            callType: callData?.callType,
          });
          
          
          // Restore info state immediately so processAccept can use it
          // Prioritize callerName from VoIP push, fallback to handle or Unknown
          setInfo({
            id: callData.callerId || callData.handle,
            callId: callData.callId,
            type: callData.callType || 'video',
            name: callData.callerName || callData.handle || 'Unknown'
          });
          
          
          // Also set currentCallId ref
          currentCallId.current = callData.callId;
          // Mark incoming-call "setup" as ready for this callId (even if we never got the socket incoming-call yet).
          incomingCallSetupCallId.current = callData.callId;
          rtcDbg('incomingCallSetup.marked_from_storage', {
            currentCallId: currentCallId.current,
            incomingCallSetupCallId: incomingCallSetupCallId.current,
            socketConnected: socket.current?.connected,
          });
          
          // Restore UUID if available
          if (callData.uuid) {
            callUUID.current = callData.uuid;
            
          }
          
          // If something (e.g., CallKeep answer handler) is waiting for call context + socket,
          // unblock it as soon as we have a callId + socket connection.
          if (incomingCallSetupComplete.current) {
            rtcDbg('incomingCallSetup.resolve_from_storage_on_connect', {
              currentCallId: currentCallId.current,
              incomingCallSetupCallId: incomingCallSetupCallId.current,
              socketConnected: socket.current?.connected,
            });
            try { incomingCallSetupComplete.current(); } catch {}
            incomingCallSetupComplete.current = null;
            incomingCallSetupPromise.current = null;
          }
          
        }
      } catch (e) {
        console.error('❌ [RTC] Error reading AsyncStorage on connect:', e);
      }
    });

    socket.current.on('disconnect', (reason) => {
      rtcDbg('socket.disconnect', { socketId: socket.current?.id, reason });
    });

    socket.current.on('connect_error', (err) => {
      rtcDbg('socket.connect_error', { message: err?.message || String(err) });
    });

    /* ---------- INCOMING CALL ---------- */
    socket.current.on('incoming-call', async (data) => {
      const { callId, fromUserId, callType, rtpCapabilities, participants, callerFirstName, callerLastName, participantsInfo } = data;

      rtcDbg('incoming-call', {
        callId,
        fromUserId,
        callType,
        participantsCount: Array.isArray(participants) ? participants.length : undefined,
        hasRtpCaps: !!rtpCapabilities,
      });

      // Keep an in-memory copy for cold-start CallKeep answer races (state/AsyncStorage may not be ready yet).
      lastIncomingCallRef.current = {
        callId,
        fromUserId,
        callType,
        participants,
        rtpCapabilities,
        receivedAt: Date.now(),
      };

      // IDEMPOTENCY CHECK: If we already set up for this callId, skip duplicate setup
      // This prevents errors when server resends 'incoming-call' on reconnect
      if (incomingCallSetupCallId.current === callId) {
        
        // Ensure currentCallId is set even if we early-return (CallKeep cold-start can race here).
        if (!currentCallId.current) {
          currentCallId.current = callId;
        }

        // Still update info state and signal completion (in case promise is waiting)
        setInfo({ id: fromUserId, callId, type: callType, name: fromUserId.toString(), participants });
        if (incomingCallSetupComplete.current) {
          incomingCallSetupComplete.current();
          incomingCallSetupComplete.current = null;
          incomingCallSetupPromise.current = null;
        }
        return; // Exit early - setup already done
      }

      // Mark that we're setting up for this callId
      incomingCallSetupCallId.current = callId;
      currentCallId.current = callId;

      // Check if VoIP push already saved data (for app-killed scenario)
      let existingCallData = null;
      try {
        const existing = await AsyncStorage.getItem('incomingCallData');
        if (existing) {
          existingCallData = JSON.parse(existing);
          // Use VoIP push UUID if callId matches
          if (existingCallData.callId === callId && existingCallData.uuid) {
            callUUID.current = existingCallData.uuid;
            
          } else {
            callUUID.current = uuid.v4();
            
          }
        } else {
          callUUID.current = uuid.v4();
          
        }
      } catch (e) {
        callUUID.current = uuid.v4();
        
      }

      // Merge any server-provided participantsInfo into a ref so we can show names for non-contacts.
      try {
        const mergedInfo = {
          ...(existingCallData?.participantsInfo || {}),
          ...(participantsInfo || {}),
        };
        if (mergedInfo && typeof mergedInfo === 'object') {
          participantsInfoRef.current = mergedInfo;
        }
      } catch (e) {}

      // Decide call mode & display name (group vs 1:1)
      const participantList = Array.isArray(participants) ? participants : [fromUserId];
      const myIdStr = user?.data?.id?.toString?.();
      const otherIds = participantList
        .map(x => x?.toString?.() ?? String(x))
        .filter(id => id && id !== myIdStr);

      callModeRef.current.isGroupCall = otherIds.length > 1;

      const lookupName = (idStr, serverFirstName = null, serverLastName = null) => {
        const c = contacts?.find?.(ct => ct?.isRegistered && ct?.server_info?.id?.toString?.() === idStr);
        if (c?.item) {
          const first = c.item.firstName || '';
          const last = c.item.lastName || '';
          return `${first} ${last}`.trim() || c.item.name || 'Unknown';
        }
        // Fallback to server-provided firstName/lastName if not in contacts
        if (serverFirstName || serverLastName) {
          return `${serverFirstName || ''} ${serverLastName || ''}`.trim() || 'Unknown';
        }
        // Fallback to participantsInfo (server-provided per-user info)
        try {
          const pi = participantsInfoRef.current?.[idStr];
          const full = `${pi?.firstName || ''} ${pi?.lastName || ''}`.trim();
          return full || pi?.username || 'Unknown';
        } catch (e) {
          return 'Unknown';
        }
      };

      const formatGroupName = (ids) => {
        const names = ids.map(lookupName);
        if (names.length <= 2) return names.join(' & ');
        return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
      };

      // Get caller name - prioritize VoIP push data, then server firstName/lastName from socket event, then participants-based group name, then contacts, then fallback
      // Use firstName/lastName from socket event if available (more recent than AsyncStorage)
      const serverFirst = callerFirstName || existingCallData?.callerFirstName || null;
      const serverLast = callerLastName || existingCallData?.callerLastName || null;
      
      let callerName = fromUserId.toString();
      if (existingCallData?.callerName) {
        // Use name from VoIP push if available
        callerName = existingCallData.callerName;
        
      } else if (otherIds.length > 1) {
        // For group calls, use server firstName/lastName if available for each participant
        const names = otherIds.map(idStr => {
          // Use server firstName/lastName for the caller (fromUserId), contacts for others
          return lookupName(idStr, idStr === fromUserId.toString() ? serverFirst : null, idStr === fromUserId.toString() ? serverLast : null);
        });
        callerName = names.length <= 2 ? names.join(' & ') : `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
        
      } else if (contacts && contacts.length > 0) {
        // Fallback to contacts lookup
        const contact = contacts.find(c => 
          c.isRegistered && c.server_info?.id === parseInt(fromUserId)
        );
        if (contact?.item) {
          const firstName = contact.item.firstName || '';
          const lastName = contact.item.lastName || '';
          callerName = `${firstName} ${lastName}`.trim() || contact.item.name || callerName;
        } else {
          // Not in contacts - use server firstName/lastName if available
          if (serverFirst || serverLast) {
            callerName = `${serverFirst || ''} ${serverLast || ''}`.trim() || callerName;
          }
        }
      } else {
        // No contacts at all - use server firstName/lastName if available
        if (serverFirst || serverLast) {
          callerName = `${serverFirst || ''} ${serverLast || ''}`.trim() || callerName;
        }
      }

      // Initialize device and create transports BEFORE showing incoming call screen
      // IMPORTANT: We intentionally do NOT create transports or start producing media here.
      // Transports (and produce/consume) will happen only after user taps Accept via processAccept().

      // Update info state (may have been pre-populated from AsyncStorage on connect)
      // This ensures we have the latest data from server
      setInfo({
        id: fromUserId,
        callId,
        type: callType,
        name: callerName,
        participants: participantList,
        ...(participantsInfoRef.current ? { participantsInfo: participantsInfoRef.current } : {}),
        ...(callerFirstName ? { callerFirstName } : {}),
        ...(callerLastName ? { callerLastName } : {}),
      });
      replace('Incoming Call');
      
      // Ensure currentCallId is set (may have been set from AsyncStorage)
      if (currentCallId.current !== callId) {
        currentCallId.current = callId;
      }

      // Merge VoIP data with socket event data and save
      const callData = {
        callId,
        uuid: callUUID.current,
        callerId: fromUserId,
        callType,
        callerName,
        participants: participantList,
        rtpCapabilities,
        ...(participantsInfoRef.current ? { participantsInfo: participantsInfoRef.current } : {}),
        ...(callerFirstName ? { callerFirstName } : {}),
        ...(callerLastName ? { callerLastName } : {}),
        ...(existingCallData || {}), // Preserve any VoIP push data (may override with more recent socket data)
      };
      await AsyncStorage.setItem('incomingCallData', JSON.stringify(callData));
      

      // Signal that setup is complete (only if promise exists and hasn't been resolved)
      if (incomingCallSetupComplete.current) {
        
        incomingCallSetupComplete.current();
        incomingCallSetupComplete.current = null;
        incomingCallSetupPromise.current = null;
      }

      // Always show CallKeep UI (even when app is open) for consistent audio session management
      // Only show if not already shown for this call
      try {
        RNCallKeep.displayIncomingCall(
          callUUID.current,
          fromUserId.toString(),
          callerName,
          'generic',
          callType === 'video'
        );
        
      } catch (e) {
        console.error('❌ [RTC] Error displaying CallKeep UI:', e);
        // Fallback: Show IncomingCall screen if CallKeep fails
        // InCallManager incoming ringtone disabled (CallKeep handles ringing)
        // InCallManager.startRingtone();
        setTimeout(() => {
          replace('Incoming Call');
        }, 100);
      }
    });

    /* ---------- CALL ACCEPTED ---------- */
    socket.current.on('call-accepted', ({ callId }) => {
      currentCallId.current = callId;

      if (!info.type) {
        // Try to preserve the call type - we'll need to get it from somewhere
        // For now, assume it's a video call if we're in VideoCall screen
      }

      replace('Video Call');

      InCallManager.stopRingback();
      const callType = info.type || 'video';
      InCallManager.start({ media: callType === 'video' ? 'video' : 'audio' });
    });

    /* ---------- NEW PRODUCER ---------- */
    socket.current.on('new-producer', async ({ producerId, kind, userId, source }) => {
      
      if (!currentCallId.current) {
        
        return;
      }
      // Idempotency: never consume the same producer twice
      if (consumers.current.has(producerId) || consumingProducerIdsRef.current.has(producerId)) {
        
        return;
      }
      // If recv transport isn't ready yet, queue this producer and consume after we create recvTransport.
      if (!recvTransport.current) {
        pendingProducerQueueRef.current.push({ producerId, userId, kind, source });
        rtcDbg('new-producer.queued', { producerId, kind, userId, source });
        return;
      }
      try {
        await consume(producerId, userId, source);
      } catch (e) {
        console.error('❌ [RTC] consume() failed for new-producer', { producerId, kind, userId, source, error: e?.message || e });
      }
    });

    /* ---------- PRODUCER CLOSED (e.g., screen share stopped) ---------- */
    socket.current.on('producer-closed', ({ callId, producerId, userId, kind, source }) => {
      try {
        if (callId && currentCallId.current && String(callId) !== String(currentCallId.current)) return;
        const meta = consumers.current.get(producerId);
        if (meta?.consumer) {
          try { meta.consumer.close(); } catch (e) {}
        }
        consumers.current.delete(producerId);

        if (source === 'screen') {
          const uidStr = userId?.toString?.() ?? String(userId);
          setActiveScreenShare((prev) => {
            if (!prev) return prev;
            if ((prev.userId?.toString?.() ?? String(prev.userId)) !== uidStr) return prev;
            return null;
          });
        }
      } catch (e) {}
    });

    /* ---------- CALL INVITATION (for participants added to existing call) ---------- */
    socket.current.on('call-invitation', async (data) => {
      const { callId, fromUserId, callType, rtpCapabilities } = data;
      

      try {
        // Treat call-invitation like an incoming call: do NOT create transports or start producing media yet.
        currentCallId.current = callId;
        callUUID.current = callId;

        setInfo({
          id: fromUserId,
          callId,
          type: callType,
          name: fromUserId?.toString?.() ?? String(fromUserId),
          participants: [fromUserId],
        });

        try {
          await AsyncStorage.setItem(
            'incomingCallData',
            JSON.stringify({
              callId,
              uuid: callUUID.current,
              callerId: fromUserId,
              callType,
              callerName: fromUserId?.toString?.() ?? String(fromUserId),
              participants: [fromUserId],
              rtpCapabilities,
            })
          );
        } catch (e) {
          // ignore
        }

        replace('Incoming Call');
      } catch (error) {
        console.error('❌ [RTC] Error handling call invitation:', error);
      }
    });

    /* ---------- PARTICIPANT JOINED ---------- */
    socket.current.on('participant-joined', ({ callId, userId, initial }) => {
      if (callId !== currentCallId.current) return;
      
      // Stop any outgoing ringback as soon as anyone actually joins.
      try { InCallManager.stopRingback(); } catch (e) {}
      
      
      
      // userId can be array if multiple joined
      const userIds = Array.isArray(userId) ? userId : [userId];
      
      userIds.forEach(uid => {
        markParticipantJoined(uid, { suppressSound: !!initial });
      });
    });

    /* ---------- PARTICIPANT INVITED (mid-call add, show "Ringing…") ---------- */
    socket.current.on('participant-invited', ({ callId, userIds, byUserId, userInfo }) => {
      if (callId !== currentCallId.current) return;
      const ids = Array.isArray(userIds) ? userIds : (userIds != null ? [userIds] : []);
      if (!ids.length) return;

      // If we are currently in a 1:1 call UI, upgrading to group can cause the existing remote tile
      // to show "Connecting…" because 1:1 uses `remoteStream` while group uses ParticipantManager streams.
      // Fix: seed ParticipantManager with local + existing remote and copy the already-established remoteStream in.
      if (!callModeRef.current.isGroupCall) {
        try {
          const myIdStr = user?.data?.id?.toString?.() ?? (user?.data?.id != null ? String(user.data.id) : null);
          const existingOtherIdStr =
            info?.id?.toString?.() ??
            participantManager.current?.getParticipantsList?.()?.find?.((p) => !p?.isLocal)?.userId ??
            null;

          const pmCount = participantManager.current?.getParticipantCount?.() || 0;
          // Ensure we have local + existing remote in the manager (idempotent enough for this use)
          if (existingOtherIdStr && pmCount < 2) {
            participantManager.current.initializeParticipants([existingOtherIdStr], user, localStream, contacts, true);
          }

          // Carry over the already-established 1:1 remote stream into the participant entry.
          // IMPORTANT: do NOT use React state `remoteStream` here (socket handlers run with stale closures).
          // Use `remoteStreamRef.current` (kept current by consume()).
          const establishedRemoteStream =
            remoteStreamRef.current ||
            participantManager.current?.getParticipant?.(existingOtherIdStr)?.stream ||
            streamManager.current?.getParticipantStream?.(existingOtherIdStr) ||
            null;
          if (existingOtherIdStr && establishedRemoteStream) {
            const prevP = participantManager.current?.getParticipant?.(existingOtherIdStr);
            const nextStreamKey = (prevP?.streamKey || 0) + 1;
            participantManager.current.updateParticipant(existingOtherIdStr, {
              stream: establishedRemoteStream,
              streamKey: nextStreamKey, // force tile remount
              callStatus: 'joined',
            });
            // Best-effort copy mute state from current React state.
            // (Mute UI correctness is secondary here; the main goal is to preserve the video stream.)
            try { participantManager.current.updateParticipantMute(existingOtherIdStr, 'audio', !!remoteMicMuted); } catch {}
            try { participantManager.current.updateParticipantMute(existingOtherIdStr, 'video', !!remoteVideoMuted); } catch {}
          }

          callModeRef.current.isGroupCall = true;

          const seeded = participantManager.current.getParticipantsList();
          setParticipantsList([...seeded]);
          setCallInfo((prev) => ({
            ...(prev || {}),
            participantCount: Math.max(prev?.participantCount || 0, (participantManager.current.getParticipantCount?.() || seeded.length) + ids.length),
          }));

          // Keep info.participants in sync so other screens/fallbacks don't keep a stale group label.
          setInfo((prev) => {
            const prevArr = Array.isArray(prev?.participants)
              ? prev.participants
              : (myIdStr && existingOtherIdStr ? [myIdStr, existingOtherIdStr] : []);
            const uniq = new Set(prevArr.map((x) => x?.toString?.() ?? String(x)));
            ids.forEach((x) => uniq.add(x?.toString?.() ?? String(x)));
            uniq.delete('');
            uniq.delete('undefined');
            uniq.delete('null');
            return { ...(prev || {}), participants: Array.from(uniq) };
          });

          rtcDbg('participant-invited.upgradeToGroup', {
            callId,
            existingOtherIdStr,
            addedIds: ids.map((x) => x?.toString?.() ?? String(x)),
            seededParticipants: participantManager.current.getParticipantsList().map((p) => ({ userId: p.userId, isLocal: p.isLocal, callStatus: p.callStatus, hasStream: !!p.stream })),
          });
        } catch (e) {
          rtcDbg('participant-invited.upgradeToGroup.error', { error: e?.message || String(e) });
        }
      }

      ids.forEach(uid => {
        const uidStr = uid?.toString?.() ?? String(uid);
        // Merge server-provided info for this invited user (if present).
        try {
          if (userInfo && typeof userInfo === 'object') {
            participantsInfoRef.current = { ...(participantsInfoRef.current || {}), [uidStr]: userInfo };
          }
        } catch (e) {}

        const contact = contacts.find(c =>
          c.server_info?.id === uid || c.server_info?.id === parseInt(uid)
        );
        const firstName = contact?.item?.firstName || null;
        const lastName = contact?.item?.lastName || null;
        const server = participantsInfoRef.current?.[uidStr] || null;
        const serverFull = `${server?.firstName || ''} ${server?.lastName || ''}`.trim();
        const name =
          contact?.item?.name ||
          (firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : null) ||
          serverFull ||
          server?.username ||
          'Unknown';
        addParticipant(uid, {
          name,
          firstName,
          lastName,
          username: server?.username || null,
          avatar: contact?.server_info?.avatar,
          isLocal: false,
          stream: null, // triggers "Ringing…" in VideoCall
          callStatus: 'invited',
          suppressSound: true,
          invitedBy: byUserId,
        });
      });
    });

    /* ---------- PARTICIPANT NO ANSWER (invite timed out) ---------- */
    socket.current.on('participant-no-answer', ({ callId, userId }) => {
      if (callId !== currentCallId.current) return;
      if (userId == null) return;
      removeParticipant(userId);
    });

    /* ---------- CALL EXPIRED (invitee-side timeout) ---------- */
    socket.current.on('call-expired', async ({ callId }) => {
      try {
        if (!callId) return;
        // If we already accepted/joined and have transports, ignore.
        if (acceptedCallIdRef.current === callId) return;
        if (sendTransport.current || recvTransport.current) return;
        if (currentCallId.current && currentCallId.current !== callId) return;

        // Stop ringing UIs without ending the whole call for others.
        try { InCallManager.stopRingtone(); } catch (e) {}
        try { InCallManager.stopRingback(); } catch (e) {}

        if (callUUID.current) {
          try { RNCallKeep.endCall(callUUID.current); } catch (e) {}
          callUUID.current = null;
        }

        // Clear stored invite if it matches.
        try {
          const saved = await AsyncStorage.getItem('incomingCallData');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.callId === callId) {
              await AsyncStorage.removeItem('incomingCallData');
            }
          }
        } catch (e) {
          // ignore
        }

        currentCallId.current = null;
        setInfo({});
        popToTop();
        // If the call screens were reached via `replace()`, the stack may only contain the call screen.
        // In that case popToTop() is a no-op and we'd be left rendering an empty VideoCall.
        // Fall back to Home.
        try {
          const cur = navigationRef.getCurrentRoute?.()?.name;
          if (cur === 'Video Call' || cur === 'Incoming Call' || cur === 'Outgoing Call') {
            replace('Home');
          }
        } catch {}
      } catch (e) {
        // ignore
      }
    });

    /* ---------- PARTICIPANT LEFT ---------- */
    socket.current.on('participant-left', ({ callId, userId }) => {
      if (callId !== currentCallId.current) return;
      removeParticipant(userId);
    });

    /* ---------- CALL ENDED ---------- */
    socket.current.on('call-ended', () => {
      // Don't emit "leave/end" back to server; server initiated this.
      endCall({ emitToServer: false });
    });

    /* ---------- REMOTE USER MUTED/UNMUTED ---------- */
    socket.current.on('remote-user-muted', ({ userId, callId }) => {
      
      if (callId === currentCallId.current) {
        if (callModeRef.current.isGroupCall) {
          
          updateParticipantMute(userId, 'audio', true);
        } else {
          // 1:1: only apply mute state for the currently displayed remote user
          const targetId = info?.id?.toString?.() ?? null;
          if (!targetId || targetId === userId?.toString?.()) {
            setRemoteMicMuted(true);
          }
        }
      } else {
        
      }
    });

    socket.current.on('remote-user-unmuted', ({ userId, callId }) => {
      
      if (callId === currentCallId.current) {
        if (callModeRef.current.isGroupCall) {
          
          updateParticipantMute(userId, 'audio', false);
        } else {
          const targetId = info?.id?.toString?.() ?? null;
          if (!targetId || targetId === userId?.toString?.()) {
            setRemoteMicMuted(false);
          }
        }
      } else {
        
      }
    });

    /* ---------- REMOTE USER VIDEO MUTED/UNMUTED ---------- */
    socket.current.on('remote-user-video-muted', ({ userId, callId }) => {
      
      if (callId === currentCallId.current) {
        if (callModeRef.current.isGroupCall) {
          
          updateParticipantMute(userId, 'video', true);
        } else {
          const targetId = info?.id?.toString?.() ?? null;
          if (!targetId || targetId === userId?.toString?.()) {
            setRemoteVideoMuted(true);
          }
        }
      } else {
        
      }
    });

    socket.current.on('remote-user-video-unmuted', ({ userId, callId }) => {
      
      if (callId === currentCallId.current) {
        if (callModeRef.current.isGroupCall) {
          
          updateParticipantMute(userId, 'video', false);
        } else {
          const targetId = info?.id?.toString?.() ?? null;
          if (!targetId || targetId === userId?.toString?.()) {
            setRemoteVideoMuted(false);
          }
        }
      } else {
        
      }
    });

    return () => socket.current?.disconnect();
  }, [user?.data?.id]);

  // iOS: when app backgrounds (PiP), treat local camera as "video off" for remote peers via socket mute-video.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      // Leaving foreground
      if ((nextState === 'inactive' || nextState === 'background') && prev === 'active') {
        try {
          if (!currentCallId.current) return;
          if ((info?.type || '') !== 'video') return;
          const videoProducer = producers.current.get('video');
          if (!videoProducer) return;

          // Only auto-mute if video is currently ON (don't override manual mute).
          if (videoStatus === false) return;

          autoVideoMutedRef.current = true;
          socket.current?.emit?.('mute-video', { callId: currentCallId.current, producerId: videoProducer.id, muted: true });
          setVideoStatus(false);
        } catch (e) {}
      }

      // Returning foreground
      if (nextState === 'active' && (prev === 'inactive' || prev === 'background')) {
        try {
          if (!autoVideoMutedRef.current) return;
          autoVideoMutedRef.current = false;

          if (!currentCallId.current) return;
          if ((info?.type || '') !== 'video') return;
          const videoProducer = producers.current.get('video');
          if (!videoProducer) return;

          socket.current?.emit?.('mute-video', { callId: currentCallId.current, producerId: videoProducer.id, muted: false });
          setVideoStatus(true);
        } catch (e) {}
      }
    });

    return () => {
      try { sub?.remove?.(); } catch {}
    };
  }, [info?.type, videoStatus]);

  /* ================= DEVICE ================= */

  const initDevice = async (rtpCapabilities) => {
    if (device.current) return;

    device.current = new mediasoupClient.Device();
    await device.current.load({ routerRtpCapabilities: rtpCapabilities });
  };

  const startAudioOutput = () => {
    if (audioSessionStartedRef.current) return;
  
    
  
    InCallManager.start({ media: 'audio' });
    InCallManager.setForceSpeakerphoneOn(true);
  
    audioSessionStartedRef.current = true;
  };

  /* ================= PARTICIPANT MANAGEMENT ================= */

  // Initialize participants (only for group calls - 1:1 doesn't need this)
  // IMPORTANT: pass localStreamOverride when you have the fresh stream in-hand, because setLocalStream() is async.
  const initializeParticipants = (participantIds, includeLocal = false, localStreamOverride = null) => {
    rtcDbg('initializeParticipants.start', {
      participantIds,
      participantIdsLength: participantIds?.length || 0,
      includeLocal,
      hasLocalStream: !!localStreamOverride || !!localStream,
    });
    
    const newList = participantManager.current.initializeParticipants(
      participantIds,
      user,
      localStreamOverride || localStream,
      contacts,
      includeLocal
    );
    
    rtcDbg('initializeParticipants.afterManagerInit', {
      newListLength: newList.length,
      newListUserIds: newList.map(p => p.userId),
    });
    
    // Default participant status:
    // - local user: joined
    // - remote users: invited (until we receive participant-joined for them)
    try {
      newList.forEach((p) => {
        if (!p?.userId) return;
        if (p.isLocal) {
          participantManager.current.updateParticipant(p.userId, { callStatus: 'joined' });
        } else {
          participantManager.current.updateParticipant(p.userId, { callStatus: p.callStatus || 'invited' });
        }
      });
    } catch (e) {
      rtcDbg('initializeParticipants.statusUpdateError', { error: e?.message || e });
    }

    // Hydrate remote participants with server-provided names when they're not in contacts.
    // ParticipantManager.initializeParticipants() only knows about phone contacts, so without this
    // non-contacts would show as "Unknown" in group tiles.
    try {
      (Array.isArray(newList) ? newList : []).forEach((p) => {
        if (!p?.userId || p?.isLocal) return;
        const idStr = p.userId?.toString?.() ?? String(p.userId);
        const pi = participantsInfoRef.current?.[idStr] || null;
        if (!pi) return;

        const full = `${pi.firstName || ''} ${pi.lastName || ''}`.trim();
        // Only overwrite if current name is missing/unknown/id-like.
        const nameLooksBad =
          !p.name ||
          p.name === 'Unknown' ||
          p.name === idStr;
        if (nameLooksBad) {
          participantManager.current.updateParticipant(idStr, {
            firstName: pi.firstName || p.firstName || null,
            lastName: pi.lastName || p.lastName || null,
            username: pi.username || p.username || null,
            name: full || pi.username || 'Unknown',
          });
        } else {
          // Still stash username if we have it.
          if (pi.username && !p.username) {
            participantManager.current.updateParticipant(idStr, { username: pi.username });
          }
        }
      });
    } catch (e) {
      rtcDbg('initializeParticipants.hydrateNamesError', { error: e?.message || String(e) });
    }

    const finalList = participantManager.current.getParticipantsList();
    
    rtcDbg('initializeParticipants.final', {
      finalListLength: finalList.length,
      finalListUserIds: finalList.map(p => ({ userId: p.userId, callStatus: p.callStatus, isLocal: p.isLocal })),
    });

    // Only set state if it's actually a group call (3+ participants)
    // IMPORTANT: Also respect callModeRef.isGroupCall if it's already set (e.g., by processAccept)
    // This ensures that if we have 3+ total participants (including ringing), we show group view
    const shouldBeGroupCall = finalList.length > 2 || callModeRef.current.isGroupCall;
    
    if (shouldBeGroupCall) {
      callModeRef.current.isGroupCall = true;
      // IMPORTANT: Only update state if it's not already set (to avoid overwriting processAccept's state)
      // Check if participantsList is already populated - if so, merge/update instead of replace
      setParticipantsList(prevList => {
        // If we already have participants, merge with new ones (preserve existing state)
        if (prevList && prevList.length > 0) {
          const merged = finalList.map(newP => {
            const existing = prevList.find(p => p.userId === newP.userId);
            // Preserve existing participant state (stream, callStatus) if it exists
            return existing ? { ...newP, ...existing } : newP;
          });
          rtcDbg('initializeParticipants.mergeState', {
            prevListLength: prevList.length,
            finalListLength: finalList.length,
            mergedLength: merged.length,
            mergedUserIds: merged.map(p => p.userId),
          });
          return merged;
        }
        // Otherwise, set new list
        rtcDbg('initializeParticipants.newState', {
          finalListLength: finalList.length,
          finalListUserIds: finalList.map(p => p.userId),
        });
        return [...finalList];
      });
      // Preserve existing participantCount if set (includes ringing participants), otherwise use finalList.length
      setCallInfo(prev => {
        const newCount = prev?.participantCount || finalList.length;
        rtcDbg('initializeParticipants.setState', {
          finalListLength: finalList.length,
          finalListUserIds: finalList.map(p => p.userId),
          participantCount: newCount,
          prevParticipantCount: prev?.participantCount,
        });
        return { 
          ...prev, 
          participantCount: newCount 
        };
      });
    } else {
      // For 1:1, just initialize the manager but don't update state
      // This keeps the manager in sync but avoids unnecessary re-renders
      callModeRef.current.isGroupCall = false;
    }
  };

  const markParticipantJoined = (userId, { suppressSound = false } = {}) => {
    const userIdStr = userId?.toString?.() ?? String(userId);
    const existing = participantManager.current.getParticipant(userIdStr);
    if (existing) {
      participantManager.current.updateParticipant(userIdStr, { callStatus: 'joined' });
      if (callModeRef.current.isGroupCall) {
        setParticipantsList(participantManager.current.getParticipantsList());
      }
      return;
    }

    const contact = contacts.find(c =>
      c.server_info?.id === userId || c.server_info?.id === parseInt(userId)
    );
    const server = participantsInfoRef.current?.[userIdStr] || null;
    const serverFull = `${server?.firstName || ''} ${server?.lastName || ''}`.trim();
    addParticipant(userId, {
      name: contact?.item?.name || contact?.item?.firstName || serverFull || server?.username || 'Unknown',
      firstName: contact?.item?.firstName || server?.firstName || null,
      lastName: contact?.item?.lastName || server?.lastName || null,
      username: server?.username || null,
      avatar: contact?.server_info?.avatar,
      isLocal: false,
      callStatus: 'joined',
      suppressSound,
    });
  };

  // Add participant (only update state for group calls)
  const addParticipant = (userId, participantData) => {
    // If name is missing and we have firstName/lastName, construct name
    let finalData = { ...participantData };
    if (!finalData.name || finalData.name === 'Unknown' || finalData.name === userId?.toString()) {
      const contact = contacts.find(c =>
        c.isRegistered && (c.server_info?.id === userId || c.server_info?.id === parseInt(userId))
      );
      if (contact?.item) {
        const first = contact.item.firstName || '';
        const last = contact.item.lastName || '';
        finalData.name = `${first} ${last}`.trim() || contact.item.name || 'Unknown';
        finalData.firstName = contact.item.firstName || null;
        finalData.lastName = contact.item.lastName || null;
      } else if (participantsInfoRef.current?.[userId?.toString?.() ?? String(userId)]) {
        const idStr = userId?.toString?.() ?? String(userId);
        const pi = participantsInfoRef.current?.[idStr];
        const full = `${pi?.firstName || ''} ${pi?.lastName || ''}`.trim();
        finalData.firstName = pi?.firstName || finalData.firstName || null;
        finalData.lastName = pi?.lastName || finalData.lastName || null;
        finalData.username = pi?.username || finalData.username || null;
        finalData.name = full || pi?.username || 'Unknown';
      } else if (finalData.firstName || finalData.lastName) {
        // Use server-provided firstName/lastName if available
        finalData.name = `${finalData.firstName || ''} ${finalData.lastName || ''}`.trim() || finalData.username || 'Unknown';
      } else {
        // Last resort: never show raw userId.
        finalData.name = finalData.username || 'Unknown';
      }
    }
    
    const participant = participantManager.current.addParticipant(userId, finalData);
    if (participant) {
      const currentCount = participantManager.current.getParticipantCount();
      // Only update state if it's a group call
      if (currentCount > 2) {
        callModeRef.current.isGroupCall = true;
        // IMPORTANT: Always derive list from ParticipantManager to avoid duplicates in React state.
        setParticipantsList(participantManager.current.getParticipantsList());
        setCallInfo(prev => ({ ...prev, participantCount: currentCount }));
      }
      if (!participantData?.suppressSound) {
        soundManager.current.playJoinSound();
      }
    }
  };

  // Remove participant (only update state for group calls)
  const removeParticipant = (userId) => {
    // Clean up consumers for this user
    const userIdStr = userId.toString();
    consumers.current.forEach((consumerData, producerId) => {
      if (consumerData.userId === userIdStr) {
        try {
          consumerData.consumer.close();
        } catch (e) {
          console.error('❌ [RTC] Error closing consumer:', e);
        }
        consumers.current.delete(producerId);
      }
    });

    if (participantManager.current.removeParticipant(userId)) {
      streamManager.current.removeParticipantStream(userId);
      const currentCount = participantManager.current.getParticipantCount();
      // Only update state if it's still a group call
      if (currentCount > 2) {
        // IMPORTANT: Always derive list from ParticipantManager to avoid duplicates/stale state.
        setParticipantsList(participantManager.current.getParticipantsList());
        setCallInfo(prev => ({ ...prev, participantCount: currentCount }));
        callModeRef.current.isGroupCall = true;
      } else {
        // Dropped to 2 participants (me + 1). Switch UI to 1:1 *but* keep using the existing stream
        // we already have for the remaining participant, otherwise VideoCall's big RTCView goes black.
        const list = participantManager.current.getParticipantsList();
        const remainingRemote = (list || []).find(p => !p.isLocal);

        callModeRef.current.isGroupCall = false;
        setParticipantsList([]);
        setCallInfo(prev => ({ ...prev, participantCount: currentCount }));

        if (remainingRemote?.stream) {
          try {
            setRemoteStream(remainingRemote.stream);
            // Force 1:1 RTCView refresh
            setRemoteStreamTracksCount((n) => (typeof n === 'number' ? n + 1 : 1));
            // Carry over mute status so 1:1 screen reflects it
            setRemoteMicMuted(!!remainingRemote?.muted?.mic);
            setRemoteVideoMuted(!!remainingRemote?.muted?.video);

            // Update info to the remaining remote (prevents stale group labels like "Lucky & Moon is muted")
            try {
              const myIdStr = user?.data?.id?.toString?.() ?? (user?.data?.id != null ? String(user.data.id) : null);
              const otherIdStr = remainingRemote?.userId?.toString?.() ?? null;
              if (otherIdStr) {
                setInfo(prev => ({
                  ...(prev || {}),
                  id: otherIdStr,
                  name: remainingRemote?.name || otherIdStr,
                  participants: [myIdStr, otherIdStr].filter(Boolean),
                }));
              }
            } catch (e) {}
          } catch (e) {
            // ignore
          }
        } else {
          // No remaining stream yet (they may still be connecting)
          setRemoteStream(null);
        }
      }
      soundManager.current.playLeaveSound();
    }
  };

  // Update participant mute status (only update state for group calls)
  const updateParticipantMute = (userId, kind, muted) => {
    const userIdStr = userId.toString();
    const isGroupCall = !!callModeRef.current.isGroupCall;
    
    // Update manager
    participantManager.current.updateParticipantMute(userIdStr, kind, muted);
    
    // Only update React state for group calls to avoid re-renders in 1:1
    if (isGroupCall) {
      const participant = participantManager.current.getParticipant(userIdStr);
      if (participant) {
        setParticipantsList(prev => 
          prev.map(p => p.userId === userIdStr ? { ...p, muted: participant.muted } : p)
        );
      }
    }
  };

  /* ================= MEDIA ================= */

  const getLocalStream = async (type) => {
    return mediaDevices.getUserMedia({
      audio: true,
      video: type === 'video',
    });
  };

  /* ================= TRANSPORTS ================= */

  const createSendTransport = async (params) => {
    sendTransport.current = device.current.createSendTransport({...params, iceServers});
    rtcDbg('sendTransport.created', { transportId: params?.id, callId: currentCallId.current });

    // CRITICAL: Log ICE state changes
    sendTransport.current.on('icestatechange', (iceState) => {
      console.log(`🧊 [RTC] sendTransport ICE state: ${iceState}`);
      rtcDbg('sendTransport.icestatechange', { iceState, transportId: params?.id });
    });

    sendTransport.current.on('connectionstatechange', (state) => {
      console.log(`🔌 [RTC] sendTransport connection state: ${state}`);
      rtcDbg('sendTransport.connectionstatechange', { state, transportId: params?.id });
    });

    sendTransport.current.on('icegatheringstatechange', (state) => {
      console.log(`🧊 [RTC] sendTransport ICE gathering state: ${state}`);
      rtcDbg('sendTransport.icegatheringstatechange', { state, transportId: params?.id });
    });

    sendTransport.current.on('icecandidateerror', (event) => {
      console.error('❌ [RTC] sendTransport ICE candidate error', {
        address: event.address,
        port: event.port,
        url: event.url,
        errorCode: event.errorCode,
        errorText: event.errorText,
      });
      rtcDbg('sendTransport.icecandidateerror', { 
        address: event.address,
        port: event.port,
        errorCode: event.errorCode,
        errorText: event.errorText,
      });
    });

    sendTransport.current.on('connect', ({ dtlsParameters }, cb, eb) => {
      try {
        const payload = { callId: currentCallId.current, transportId: params.id, dtlsParameters };
        rtcDbg('sendTransport.connect', { callId: payload.callId, transportId: payload.transportId });

        socket.current.emit('connect-transport', payload, (response) => {
          if (response?.error) {
            console.error('❌ [RTC] connect-transport failed (send)', {
              callId: payload.callId,
              transportId: payload.transportId,
              error: response.error,
            });
            rtcDbg('sendTransport.connect.error', { callId: payload.callId, transportId: payload.transportId, error: response.error });
            eb(new Error(response.error));
            return;
          }
          rtcDbg('sendTransport.connect.ok', { callId: payload.callId, transportId: payload.transportId });
          cb();
        });
      } catch (error) {
        console.error('❌ [RTC] connect-transport socket error (send)', error);
        rtcDbg('sendTransport.connect.exception', { message: error?.message || String(error) });
        eb(error);
      }
      
    });

    sendTransport.current.on('produce', ({ kind, rtpParameters, appData }, cb, eb) => {

      try {
        rtcDbg('sendTransport.produce', { callId: currentCallId.current, transportId: params?.id, kind, source: appData?.source });
        socket.current.emit(
          'create-producer',
          {
            callId: currentCallId.current,
            transportId: params.id,
            kind,
            rtpParameters,
            appData: appData && typeof appData === 'object' ? appData : undefined,
          },
          (response) => {
            if (response?.error) {
              console.error('❌ [RTC] create-producer failed:', response.error, { kind, callId: currentCallId.current });
              rtcDbg('sendTransport.produce.error', { callId: currentCallId.current, kind, error: response.error });
              eb(new Error(response.error));
              return;
            }
            const producerId = response?.producerId;
            rtcDbg('sendTransport.produce.ok', { callId: currentCallId.current, kind, producerId });
            cb({ id: producerId });
          }
        );
      } catch (error) {
        console.error('❌ [RTC] Create-producer socket error:', error);
        rtcDbg('sendTransport.produce.exception', { message: error?.message || String(error) });
        eb(error);
      }

    });
  };

  const createRecvTransport = async (params) => {
    recvTransport.current = device.current.createRecvTransport({...params, iceServers});
    rtcDbg('recvTransport.created', { transportId: params?.id, callId: currentCallId.current });

    // CRITICAL: Log ICE state changes to diagnose why recv transport never connects
    recvTransport.current.on('icestatechange', (iceState) => {
      console.log(`🧊 [RTC] recvTransport ICE state: ${iceState}`);
      rtcDbg('recvTransport.icestatechange', { iceState, transportId: params?.id });
    });

    recvTransport.current.on('connectionstatechange', (state) => {
      console.log(`🔌 [RTC] recvTransport connection state: ${state}`);
      rtcDbg('recvTransport.connectionstatechange', { state, transportId: params?.id });
    });

    recvTransport.current.on('icegatheringstatechange', (state) => {
      console.log(`🧊 [RTC] recvTransport ICE gathering state: ${state}`);
      rtcDbg('recvTransport.icegatheringstatechange', { state, transportId: params?.id });
    });

    // This fires when an ICE candidate fails to connect
    recvTransport.current.on('icecandidateerror', (event) => {
      console.error('❌ [RTC] recvTransport ICE candidate error', {
        address: event.address,
        port: event.port,
        url: event.url,
        errorCode: event.errorCode,
        errorText: event.errorText,
      });
      rtcDbg('recvTransport.icecandidateerror', { 
        address: event.address,
        port: event.port,
        errorCode: event.errorCode,
        errorText: event.errorText,
      });
    });

    recvTransport.current.on('connect', ({ dtlsParameters }, cb, eb) => {
      try {
        const payload = { callId: currentCallId.current, transportId: params.id, dtlsParameters };
        rtcDbg('recvTransport.connect', { callId: payload.callId, transportId: payload.transportId });

        socket.current.emit('connect-transport', payload, (response) => {
          if (response?.error) {
            console.error('❌ [RTC] connect-transport failed (recv)', {
              callId: payload.callId,
              transportId: payload.transportId,
              error: response.error,
            });
            rtcDbg('recvTransport.connect.error', { callId: payload.callId, transportId: payload.transportId, error: response.error });
            eb(new Error(response.error));
            return;
          }
          rtcDbg('recvTransport.connect.ok', { callId: payload.callId, transportId: payload.transportId });
          cb();
        });
      } catch (error) {
        console.error('❌ [RTC] connect-transport socket error (recv)', error);
        rtcDbg('recvTransport.connect.exception', { message: error?.message || String(error) });
        eb(error);
      }
      
    });

    // Drain any queued producers now that recvTransport exists
    try {
      const queued = pendingProducerQueueRef.current;
      if (Array.isArray(queued) && queued.length) {
        pendingProducerQueueRef.current = [];
        rtcDbg('new-producer.queue.drain', { count: queued.length });
        for (const p of queued) {
          try {
            await consume(p.producerId, p.userId, p?.source);
          } catch (e) {
            console.error('❌ [RTC] consume() failed (queued producer)', {
              producerId: p?.producerId,
              userId: p?.userId,
              error: e?.message || e,
            });
          }
        }
      }
    } catch (e) {
      // ignore
    }
    
  };

  /* ================= PRODUCE ================= */

  const produce = async (stream, callType) => {

    const audio = stream.getAudioTracks()[0];
    const video = stream.getVideoTracks()[0];

    
    if (audio) {
      const producer = await sendTransport.current.produce({ track: audio });
      producers.current.set('audio', producer);
    }

    if (callType === 'video' && video) {
      const producer = await sendTransport.current.produce({ track: video });
      producers.current.set('video', producer);
    }
    
  };

  const toggleMuteProducer = async () => {
    const audioProducer = producers.current.get('audio');
    if (!audioProducer) {
      
      return null;
    }

    try {
      if (audioProducer.paused) {
        // Resume producer (unmute)
        await audioProducer.resume();
        
        socket.current.emit('mute-audio', { callId: currentCallId.current, producerId: audioProducer.id, muted: false });
        
        // Update local participant mute status in group calls
        if (callModeRef.current.isGroupCall && user?.data?.id) {
          const myIdStr = user.data.id.toString();
          participantManager.current.updateParticipantMute(myIdStr, 'audio', false);
          setParticipantsList(participantManager.current.getParticipantsList());
        }
        
        // Update micStatus state for UI consistency
        setMicStatus(true);
        
        return true; // Unmuted
      } else {
        // Pause producer (mute)
        await audioProducer.pause();
        
        socket.current.emit('mute-audio', { callId: currentCallId.current, producerId: audioProducer.id, muted: true });
        
        // Update local participant mute status in group calls
        if (callModeRef.current.isGroupCall && user?.data?.id) {
          const myIdStr = user.data.id.toString();
          participantManager.current.updateParticipantMute(myIdStr, 'audio', true);
          setParticipantsList(participantManager.current.getParticipantsList());
        }
        
        // Update micStatus state for UI consistency
        setMicStatus(false);
        
        return false; // Muted
      }
    } catch (error) {
      console.error('❌ [RTC] Error toggling producer mute:', error);
      return null; // Error
    }
  };

  const toggleVideoProducer = async () => {
    const videoProducer = producers.current.get('video');
    if (!videoProducer) {
      
      return null;
    }

    try {
      if (videoProducer.paused) {
        // Resume producer (unmute video)
        await videoProducer.resume();
        
        socket.current.emit('mute-video', { callId: currentCallId.current, producerId: videoProducer.id, muted: false });
        
        // Update local participant mute status in group calls
        if (callModeRef.current.isGroupCall && user?.data?.id) {
          const myIdStr = user.data.id.toString();
          participantManager.current.updateParticipantMute(myIdStr, 'video', false);
          setParticipantsList(participantManager.current.getParticipantsList());
        }
        
        // Update videoStatus state for UI consistency
        setVideoStatus(true);
        
        return true; // Video on
      } else {
        // Pause producer (mute video)
        await videoProducer.pause();
        
        socket.current.emit('mute-video', { callId: currentCallId.current, producerId: videoProducer.id, muted: true });
        
        // Update local participant mute status in group calls
        if (callModeRef.current.isGroupCall && user?.data?.id) {
          const myIdStr = user.data.id.toString();
          participantManager.current.updateParticipantMute(myIdStr, 'video', true);
          setParticipantsList(participantManager.current.getParticipantsList());
        }
        
        // Update videoStatus state for UI consistency
        setVideoStatus(false);
        
        return false; // Video off
      }
    } catch (error) {
      console.error('❌ [RTC] Error toggling video producer:', error);
      return null; // Error
    }
  };

  /* ================= CONSUME ================= */

  const consume = async (producerId, userId, source) => {
    if (!recvTransport.current || !device.current) {
      return;
    }

    // Idempotency: don't consume same producer twice (or concurrently)
    if (consumers.current.has(producerId) || consumingProducerIdsRef.current.has(producerId)) {
      
      return;
    }
    consumingProducerIdsRef.current.add(producerId);

    // If userId not provided, try to get from existing consumer data (backward compatibility)
    if (!userId) {
      const existingConsumer = consumers.current.get(producerId);
      if (existingConsumer?.userId) {
        userId = existingConsumer.userId;
      } else {
        // Fallback: for 1:1 calls, use info.id
        userId = info.id?.toString();
        
      }
    }

    const userIdStr = userId?.toString();
    const sourceStr = source?.toString?.() ?? (source != null ? String(source) : null);
    
    // Avoid relying only on callModeRef (can be stale during late joins).
    const participantCount = participantManager.current?.getParticipantCount?.() || 0;
    const isGroupCall =
      !!callModeRef.current.isGroupCall ||
      participantCount > 2 ||
      (Array.isArray(participantsList) && participantsList.length > 2) ||
      (Array.isArray(info?.participants) && info.participants.length > 2);

    try {
      const data = await new Promise((resolve, reject) => {
        rtcDbg('create-consumer.emit', { callId: currentCallId.current, producerId, userId: userIdStr });
        socket.current.emit(
          'create-consumer',
          {
            callId: currentCallId.current,
            producerId,
            rtpCapabilities: device.current.rtpCapabilities,
          },
          (response) => {
            if (response.error) {
              console.error('❌ [RTC] create-consumer failed', { producerId, error: response.error });
              rtcDbg('create-consumer.error', { callId: currentCallId.current, producerId, error: response.error });
              reject(new Error(response.error));
            } else {
              rtcDbg('create-consumer.ok', {
                callId: currentCallId.current,
                producerId,
                kind: response?.kind,
                consumerId: response?.id,
              });
              resolve(response);
            }
          }
        );
      });

      const consumer = await recvTransport.current.consume(data);
      rtcDbg('recvTransport.consume.ok', { producerId, consumerId: consumer?.id, kind: consumer?.kind, userId: userIdStr });
    
      // Store consumer with userId mapping
      consumers.current.set(producerId, {
        consumer,
        userId: userIdStr,
        kind: consumer.kind,
        source: sourceStr,
      });
    
      socket.current.emit('resume-consumer', {
        callId: currentCallId.current,
        consumerId: consumer.id,
      }, (response) => {
        if (response?.error) {
          rtcDbg('resume-consumer.error', { consumerId: consumer.id, error: response.error });
        } else {
          rtcDbg('resume-consumer.ok', { consumerId: consumer.id, ...response });
        }
      });
    
      await consumer.resume();
      rtcDbg('consumer.resume.client_ok', { consumerId: consumer?.id, kind: consumer?.kind });
      

    // If this is a screen share track, do NOT mix it into the participant camera stream.
    // We render it separately as a pinned "presentation" tile.
    if (sourceStr === 'screen' && consumer?.kind === 'video') {
      try {
        const track = consumer.track;
        if (track) {
          const s = new MediaStream();
          s.addTrack(track);
          let ar = null;
          try {
            const settings = track.getSettings?.();
            if (settings?.width && settings?.height) {
              ar = settings.width / settings.height;
            }
          } catch (e) {}

          setActiveScreenShare({
            userId: userIdStr,
            stream: s,
            isLocal: false,
            aspectRatio: ar,
          });

          track.onended = () => {
            setActiveScreenShare((prev) => {
              if (!prev) return prev;
              if ((prev.userId?.toString?.() ?? String(prev.userId)) !== userIdStr) return prev;
              return null;
            });
          };
        }
      } catch (e) {}
      return;
    }

    // Map consumer to participant (camera/audio)
    streamManager.current.mapConsumerToParticipant(producerId, userIdStr);

    // Add track to participant's stream.
    // IMPORTANT: StreamManager recreates a NEW MediaStream instance when the track set changes,
    // which makes RTCView updates reliable on React Native.
    const track = consumer.track;
    
    
    if (track) {
      // If we successfully received a track for this user, they are definitely "joined".
      // This prevents "Ringing…" getting stuck if participant-joined signaling was missed/raced.
      try {
        const existingP = participantManager.current.getParticipant?.(userIdStr);
        if (existingP) {
          participantManager.current.updateParticipant(userIdStr, { callStatus: 'joined' });
        } else if (isGroupCall) {
          const contact = contacts.find(c =>
            c.server_info?.id === userIdStr || c.server_info?.id === parseInt(userIdStr)
          );
          const server = participantsInfoRef.current?.[userIdStr] || null;
          const serverFull = `${server?.firstName || ''} ${server?.lastName || ''}`.trim();
          addParticipant(userIdStr, {
            name: contact?.item?.name || contact?.item?.firstName || serverFull || server?.username || 'Unknown',
            firstName: contact?.item?.firstName || server?.firstName || null,
            lastName: contact?.item?.lastName || server?.lastName || null,
            username: server?.username || null,
            avatar: contact?.server_info?.avatar,
            isLocal: false,
            callStatus: 'joined',
            suppressSound: true,
          });
        }
        if (isGroupCall) {
          setParticipantsList(participantManager.current.getParticipantsList());
        }
      } catch (e) {}

      const updatedParticipantStream = streamManager.current.addTrackToParticipantStream(userIdStr, track);
      rtcDbg('track.attached', {
        callId: currentCallId.current,
        userId: userIdStr,
        producerId,
        kind: track.kind,
        participantVideoTracks: updatedParticipantStream?.getVideoTracks?.()?.length || 0,
        participantAudioTracks: updatedParticipantStream?.getAudioTracks?.()?.length || 0,
        isGroupCall,
      });
      
      const initialMutedState = track.muted;
      const initialEnabledState = track.enabled;
        
        // Track audio track state
        if (track.kind === 'audio') {
          const isMicOn = track.enabled && !track.muted;
          
          // IMPORTANT: In group calls, do NOT infer mute from track events (they are noisy during negotiation).
          // Rely on server events (remote-user-muted/unmuted) for participant mute UI.
          if (!isGroupCall) {
            setMicStatus(isMicOn);
          }
          
          // CRITICAL: Ensure audio track is enabled and not muted
          if (!track.enabled) {
            track.enabled = true;
          }
          
          
          
          // 🔥 THIS IS THE FIX
          startAudioOutput();
          
          // Setup mute/unmute handlers for audio
          
          if (!isGroupCall) {
            const handleAudioMute = () => {
              setRemoteMicMuted(true);
              setMicStatus(false);
            };
            
            const handleAudioUnmute = () => {
              if (track.enabled) {
                setRemoteMicMuted(false);
                setMicStatus(true);
              }
            };
            
            const handleAudioEnabledChange = () => {
              const isMicOn = track.enabled && !track.muted;
              setMicStatus(isMicOn);
            };
            
            if (track.addEventListener) {
              track.addEventListener('mute', handleAudioMute);
              track.addEventListener('unmute', handleAudioUnmute);
            } else if (track.onmute !== undefined) {
              track.onmute = handleAudioMute;
              track.onunmute = handleAudioUnmute;
            }
            
            // Poll for enabled state changes (since there's no event)
            const audioEnabledCheckInterval = setInterval(() => {
              const currentEnabled = track.enabled;
              if (currentEnabled !== track._lastAudioEnabledState) {
                track._lastAudioEnabledState = currentEnabled;
                handleAudioEnabledChange();
              }
            }, 500);
            
            track._lastAudioEnabledState = track.enabled;
            track._audioEnabledCheckInterval = audioEnabledCheckInterval;
            
            track.onended = () => {
              setRemoteMicMuted(true);
              setMicStatus(false);
              clearInterval(track._audioEnabledCheckInterval);
            };
          }
        }
        
        if (track.kind === 'video') {
          // IMPORTANT:
          // For 1:1 calls, do NOT infer "remote video off" from track.muted/track.enabled or mute/unmute events.
          // In react-native-webrtc these can flap during negotiation / renderer startup and incorrectly force UI fallback.
          // Keep remoteVideoMuted as a pure server-driven signal (remote-user-video-muted/unmuted),
          // matching the known-good 1:1 implementation.
          if (!isGroupCall) {
            const isVideoOn = track.enabled && !track.muted;
            
            setVideoStatus(isVideoOn);
          }
        }

        // Update participant's stream reference (only for group calls)
        if (isGroupCall) {
          participantManager.current.setParticipantStream(userIdStr, updatedParticipantStream);
          const participant = participantManager.current.getParticipant(userIdStr);
          if (participant) {
            // Only update state if it's actually a group call
            setParticipantsList(prev => 
              prev.map(p => p.userId === userIdStr ? { 
                ...p, 
                stream: updatedParticipantStream,
                // Extra safety: also force RTCView remount (some RN builds are still flaky)
                streamKey: (p.streamKey || 0) + 1,
              } : p)
            );
          }
        }
      }

    // For 1:1 compatibility, update remoteStream (only if not group call)
    const isGroupCallFinal = !!callModeRef.current.isGroupCall;
    
    
    if (!isGroupCallFinal) {
      const remoteCompositeStream = streamManager.current.getParticipantStream(userIdStr);
      if (!remoteCompositeStream) return;

      // Keep ref in sync for any legacy code paths
      remoteStreamRef.current = remoteCompositeStream;

      const tracksCount = remoteCompositeStream.getTracks().length;
      const audioTracks = remoteCompositeStream.getAudioTracks();
      const videoTracks = remoteCompositeStream.getVideoTracks();
    
      
    
      // Only update state if count changed OR we haven't set remoteStream yet for this call
      if (tracksCount !== lastRemoteStreamTracksCount.current || !remoteStreamSetRef.current) {
        lastRemoteStreamTracksCount.current = tracksCount;
        setRemoteStream(remoteCompositeStream);
        setRemoteStreamTracksCount(tracksCount);
        remoteStreamSetRef.current = true;
        rtcDbg('remoteStream.updated', {
          userId: userIdStr,
          tracksCount,
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
        });
      }
    
      // Final audio status check
      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0];
        const isAudioPlaying = audioTrack.readyState === 'live' && audioTrack.enabled && !audioTrack.muted;
        
      }
      
      // Final video status check
      if (videoTracks.length > 0) {
        const videoTrack = videoTracks[0];
        const isVideoPlaying = videoTrack.readyState === 'live' && videoTrack.enabled && !videoTrack.muted;
        
      } else {
        
      }
    } else {
      
    }
    } catch (e) {
      console.error('❌ [RTC] consume() error', { producerId, userId, message: e?.message || e });
      throw e;
    } finally {
      consumingProducerIdsRef.current.delete(producerId);
    }
  };

  /* ================= SCREEN SHARE ================= */

  const startScreenShare = async () => {
    if (isStartingScreenShare) return;
    if (!currentCallId.current) {
      Alert.alert('Error', 'No active call');
      return;
    }
    if (!sendTransport.current) {
      Alert.alert('Error', 'Call not ready yet');
      return;
    }
    if (screenProducerRef.current) {
      return; // already sharing
    }
    // Only one active screen share per call: if someone else is sharing, block locally with a friendly message.
    if (activeScreenShare?.stream && !activeScreenShare?.isLocal) {
      Alert.alert(
        'Screen Sharing Unavailable',
        'Someone else is already sharing their screen. Ask them to stop, then you can share.'
      );
      return;
    }

    setIsStartingScreenShare(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const track = stream?.getVideoTracks?.()?.[0];
      if (!track) {
        throw new Error('No screen video track');
      }

      localScreenStreamRef.current = stream;

      let ar = null;
      try {
        const settings = track.getSettings?.();
        if (settings?.width && settings?.height) ar = settings.width / settings.height;
      } catch (e) {}

      try {
        track.enabled = true;
      } catch (e) {}

      // Use the native-backed MediaStream returned by getDisplayMedia for local preview.
      // (Derived streams can be flaky for ReplayKit tracks on iOS.)
      const previewStream = stream;

      setActiveScreenShare({
        userId: user?.data?.id?.toString?.() ?? String(user?.data?.id),
        stream: previewStream,
        isLocal: true,
        aspectRatio: ar,
      });

      // Force a rebind shortly after start — ReplayKit frames may begin a tick later, and RTCView can miss the first attach.
      setTimeout(() => {
        try {
          if (!screenProducerRef.current) return;
          setActiveScreenShare(prev => {
            if (!prev?.isLocal) return prev;
            // Re-assign to a fresh object to force RTCView remount keyed by stream id/props.
            return { ...prev, stream: stream };
          });
        } catch (e) {}
      }, 700);

      const producer = await sendTransport.current.produce({
        track,
        appData: { source: 'screen' },
      });
      screenProducerRef.current = producer;

      track.onended = () => {
        stopScreenShare();
      };

      rtcDbg('screenshare.local.started', {
        callId: currentCallId.current,
        streamId: stream?.id,
        trackId: track?.id,
        enabled: track?.enabled,
        muted: track?.muted,
        readyState: track?.readyState,
        settings: track?.getSettings?.() || null,
      });
    } catch (e) {
      console.error('❌ [RTC] startScreenShare failed', e?.message || e);
      Alert.alert('Error', e?.message || 'Failed to start screen sharing');
      setActiveScreenShare((prev) => (prev?.isLocal ? null : prev));
      try {
        localScreenStreamRef.current?.getTracks?.()?.forEach?.((t) => t.stop?.());
      } catch (err) {}
      localScreenStreamRef.current = null;
    } finally {
      setIsStartingScreenShare(false);
    }
  };

  const stopScreenShare = async () => {
    try {
      const producer = screenProducerRef.current;
      const producerId = producer?.id;
      try { producer?.close?.(); } catch (e) {}
      screenProducerRef.current = null;

      try {
        localScreenStreamRef.current?.getTracks?.()?.forEach?.((t) => t.stop?.());
      } catch (e) {}
      localScreenStreamRef.current = null;

      setActiveScreenShare((prev) => (prev?.isLocal ? null : prev));

      if (producerId && currentCallId.current) {
        socket.current.emit('close-producer', { callId: currentCallId.current, producerId }, () => {});
      }
    } catch (e) {
      console.error('❌ [RTC] stopScreenShare failed', e?.message || e);
    }
  };

  /* ================= CALL ACTIONS ================= */

  const startCall = async (partnerIdOrIds, callType) => {
    
    
    // Normalize to array (backward compatible)
    const participantIds = Array.isArray(partnerIdOrIds) ? partnerIdOrIds : [partnerIdOrIds];
    

    // Call mode (don’t rely on participantsList length inside socket callbacks)
    callModeRef.current.isGroupCall = participantIds.length > 1;
    
    
    // Check max participants limit (10)
    if (participantIds.length > 10) {
      console.error('❌ [RTC] Max participants exceeded:', participantIds.length);
      Alert.alert('Error', 'Maximum 10 participants allowed per call');
      return;
    }

    // Check if socket is connected
    if (!socket.current || !socket.current.connected) {
      console.error('❌ [RTC] Socket not connected!', { 
        hasSocket: !!socket.current, 
        connected: socket.current?.connected 
      });
      Alert.alert('Error', 'Not connected to server. Please check your connection.');
      return;
    }
    

    try {
      
      const stream = await getLocalStream(callType);
      
      setLocalStream(stream);

      
      
      socket.current.emit(
        'start-call',
        { toUserIds: participantIds, callType }, // Send array
        async (response) => {
          
          
          if (response.error) {
            console.error('❌ [RTC] Server error in start-call:', response.error);
            Alert.alert('Error', `Failed to start call: ${response.error}`);
            return;
          }

          const { callId, rtpCapabilities } = response;
          

          currentCallId.current = callId;

          // Use callId as UUID for CallKeep (instead of generating new one)
          callUUID.current = callId;
          

          try {
            
            await initDevice(rtpCapabilities);
            
            const joinCall = () =>
              new Promise((resolve, reject) => {
                socket.current.emit('join-call', { callId }, (res) => {
                  if (res?.error) return reject(new Error(res.error));
                  resolve(res);
                });
              });

            const createTransport = (direction) =>
              new Promise((resolve, reject) => {
                socket.current.emit('create-transport', { callId, direction }, (res) => {
                  if (res?.error) return reject(new Error(res.error));
                  resolve(res?.transportOptions);
                });
              });

            const getProducers = () =>
              new Promise((resolve, reject) => {
                socket.current.emit('get-producers', { callId }, (res) => {
                  if (res?.error) return reject(new Error(res.error));
                  resolve(res?.producers || []);
                });
              });

            try {
              const joinRes = await joinCall();
              try {
                if (joinRes?.participantsInfo && typeof joinRes.participantsInfo === 'object') {
                  participantsInfoRef.current = { ...(participantsInfoRef.current || {}), ...joinRes.participantsInfo };
                }
              } catch (e) {}

              // IMPORTANT: set group mode early (before any consume happens) so late-join races don't route media into 1:1.
              if (Array.isArray(participantIds) && participantIds.length > 1) {
                callModeRef.current.isGroupCall = true;
              }

              const recvTransportParams = await createTransport('recv');
              const sendTransportParams = await createTransport('send');

              await createRecvTransport(recvTransportParams);
              await createSendTransport(sendTransportParams);

              // Initialize participants BEFORE producing/consuming to avoid 1:1 routing during negotiation.
              if (participantIds.length > 1) {
                initializeParticipants(participantIds, true, stream);
                setCallInfo({ callId, type: callType, participantCount: participantIds.length + 1 });
              } else {
                participantManager.current.initializeParticipants(participantIds, user, stream, contacts, true);
              }

              await produce(stream, callType);

              const existing = await getProducers();
              if (Array.isArray(existing) && existing.length) {
                for (const p of existing) {
                  try {
                    await consume(p.producerId, p.userId, p?.source);
                  } catch (e) {
                    console.error('❌ [RTC] consume() failed (existing producer)', {
                      producerId: p?.producerId,
                      userId: p?.userId,
                      error: e?.message || e,
                    });
                  }
                }
              }
            } catch (e) {
              console.error('❌ [RTC] join/createTransport/getProducers failed (caller):', e?.message || e);
              Alert.alert('Error', `Failed to join call: ${e?.message || e}`);
              return;
            }
            
            // (participants are initialized earlier now)
            
            setInfo({ 
              id: participantIds.length === 1 ? participantIds[0] : null, // For 1:1 compatibility
              callId, 
              type: callType,
              participants: [user?.data?.id, ...participantIds].filter(Boolean),
              ...(participantsInfoRef.current ? { participantsInfo: participantsInfoRef.current } : {}),
            });
            
            
            
            replace('Outgoing Call');
            

            
            try {
              InCallManager.start({ ringback: 'DEFAULT' });
              
            } catch (e) {
              
            }
          } catch (error) {
            console.error('❌ [RTC] Error during call setup:', error);
            Alert.alert('Error', `Call setup failed: ${error.message}`);
          }
        }
      );
    } catch (error) {
      console.error('❌ [RTC] Error in startCall:', error);
      Alert.alert('Error', `Failed to start call: ${error.message}`);
    }
  };

  const addParticipantsToCall = async (participantIds) => {
    if (!currentCallId.current) {
      Alert.alert('Error', 'No active call');
      return;
    }

    const ids = Array.isArray(participantIds) ? participantIds : (participantIds != null ? [participantIds] : []);
    if (!ids.length) return;

    // Check max participants limit (10). Use ParticipantManager (participantsList can be empty in 1:1 mode).
    const currentCount = participantManager.current?.getParticipantCount?.() || 0;
    if (currentCount + ids.length > 10) {
      Alert.alert('Error', 'Maximum 10 participants allowed per call');
      return;
    }

    // If this call started as 1:1, explicitly upgrade to group mode now so:
    // - we can show the ringing tile immediately
    // - consume() routes media into participant streams rather than 1:1 remoteStream
    if (!callModeRef.current.isGroupCall) {
      try {
        const myIdStr = user?.data?.id?.toString?.() ?? (user?.data?.id != null ? String(user.data.id) : null);
        const existingOtherIdStr =
          info?.id?.toString?.() ??
          participantManager.current?.getParticipantsList?.()?.find?.((p) => !p?.isLocal)?.userId ??
          null;

        // Ensure participantManager has local + existing remote before we add invitees.
        // If it's already initialized, this call is idempotent (initializeParticipants would replace),
        // so only run if we don't already have >= 2 participants.
        const pmCount = participantManager.current?.getParticipantCount?.() || 0;
        if (existingOtherIdStr && pmCount < 2) {
          participantManager.current.initializeParticipants([existingOtherIdStr], user, localStream, contacts, true);
        }

        // Carry over the existing 1:1 remote stream into the participant entry so the caller tile doesn't go black
        // when we switch to group view.
        if (existingOtherIdStr && remoteStream) {
          participantManager.current.updateParticipant(existingOtherIdStr, {
            stream: remoteStream,
            callStatus: 'joined',
          });
        }

        callModeRef.current.isGroupCall = true;

        // Seed group UI immediately (even before invite is acknowledged by server).
        const seeded = participantManager.current.getParticipantsList();
        setParticipantsList([...seeded]);
        setCallInfo((prev) => ({ ...(prev || {}), participantCount: participantManager.current.getParticipantCount() || seeded.length }));

        // Also keep info.participants in sync so future fallbacks know this is a group call.
        setInfo((prev) => {
          const prevArr = Array.isArray(prev?.participants) ? prev.participants : (myIdStr && existingOtherIdStr ? [myIdStr, existingOtherIdStr] : []);
          const uniq = new Set(prevArr.map((x) => x?.toString?.() ?? String(x)));
          ids.forEach((x) => uniq.add(x?.toString?.() ?? String(x)));
          uniq.delete('');
          uniq.delete('undefined');
          uniq.delete('null');
          return { ...(prev || {}), participants: Array.from(uniq) };
        });

        rtcDbg('addParticipantsToCall.upgradeToGroup', {
          callId: currentCallId.current,
          existingOtherIdStr,
          addedIds: ids.map((x) => x?.toString?.() ?? String(x)),
          participantsAfterSeed: participantManager.current.getParticipantsList().map((p) => ({ userId: p.userId, isLocal: p.isLocal, callStatus: p.callStatus })),
        });
      } catch (e) {
        rtcDbg('addParticipantsToCall.upgradeToGroup.error', { error: e?.message || String(e) });
      }
    }

    // Optimistically add ringing tiles immediately (server will also broadcast participant-invited to everyone).
    ids.forEach(uid => {
      const uidStr = uid?.toString?.() ?? String(uid);
      const contact = contacts.find(c =>
        c.server_info?.id === uid || c.server_info?.id === parseInt(uid)
      );
      const firstName = contact?.item?.firstName || null;
      const lastName = contact?.item?.lastName || null;
      const server = participantsInfoRef.current?.[uidStr] || null;
      const serverFull = `${server?.firstName || ''} ${server?.lastName || ''}`.trim();
      const name =
        contact?.item?.name ||
        (firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : null) ||
        serverFull ||
        server?.username ||
        'Unknown';
      addParticipant(uid, {
        name,
        firstName: firstName || server?.firstName || null,
        lastName: lastName || server?.lastName || null,
        username: server?.username || null,
        avatar: contact?.server_info?.avatar,
        isLocal: false,
        stream: null,
        callStatus: 'invited',
        suppressSound: true,
      });
    });

    socket.current.emit(
      'add-participants',
      { callId: currentCallId.current, participantIds: ids },
      (response) => {
        if (response.error) {
          console.error('❌ [RTC] Error adding participants:', response.error);
          Alert.alert('Error', 'Failed to add participants: ' + response.error);
        } else {
          // If server rejects/filters some users (already in call / max cap), it will still be reflected by join/no-answer events.
        }
      }
    );
  };

  const processAccept = async ({ source } = {}) => {
    // Stop any app-level ringing immediately (IncomingCall screen uses InCallManager ringtone)
    try {
      InCallManager.stopRingtone();
      InCallManager.stopRingback();
    } catch (e) {
      // ignore
    }

    // Cold-start reality:
    // - React state (info) may not be populated yet when CallKeep answer fires.
    // - AsyncStorage write from index.js / incoming-call handler may not have completed yet.
    // So prefer refs and last socket 'incoming-call' snapshot first.
    let callIdToUse =
      info.callId ||
      currentCallId.current ||
      incomingCallSetupCallId.current ||
      lastIncomingCallRef.current?.callId;
    let userIdToUse =
      info.id ||
      lastIncomingCallRef.current?.fromUserId;
    let callTypeToUse =
      info.type ||
      lastIncomingCallRef.current?.callType;
    
    rtcDbg('processAccept.start', {
      source,
      infoCallId: info?.callId,
      infoUserId: info?.id,
      infoType: info?.type,
      currentCallId: currentCallId.current,
      incomingCallSetupCallId: incomingCallSetupCallId.current,
      socketConnected: socket.current?.connected,
      hasDevice: !!device.current,
      hasSendTransport: !!sendTransport.current,
      hasRecvTransport: !!recvTransport.current,
      time: Date.now(),
    });
    
    if (!callIdToUse) {
      
      try {
        const callDataStr = await AsyncStorage.getItem('incomingCallData');
        if (callDataStr) {
          const callData = JSON.parse(callDataStr);
          rtcDbg('processAccept.storage.found', {
            callId: callData?.callId,
            callerId: callData?.callerId,
            handle: callData?.handle,
            callType: callData?.callType,
          });
          callIdToUse = callData.callId;
          userIdToUse = callData.callerId || callData.handle;
          callTypeToUse = callTypeToUse || callData.callType;
          
          
          // Update info state with AsyncStorage data if not already set
          if (!info.type && callData.callType) {
            setInfo({
              id: userIdToUse,
              callId: callIdToUse,
              type: callData.callType,
              name: callData.callerName || 'Unknown'
            });
          }
        }
      } catch (e) {
        console.error('❌ [RTC] Error reading AsyncStorage in processAccept:', e);
      }
    }

    if (!callIdToUse) {
      console.error('❌ [RTC] No callId available - cannot accept call');
      rtcDbg('processAccept.no_callId_abort', { source, currentCallId: currentCallId.current, socketConnected: socket.current?.connected });
      // Throw so CallKeep answer handler can treat this as a failure and end the call gracefully.
      throw new Error('No callId available - cannot accept call');
    }

    // Default to video if type is unknown (server typically sends it; AsyncStorage should have it too)
    callTypeToUse = callTypeToUse || 'video';

    // If accept initiated from in-app UI (IncomingCall screen), we must answer CallKeep to dismiss the VoIP/CallKit UI.
    // IMPORTANT: Do this only once to avoid loops.
    if (Platform.OS === 'ios') {
      if (source === 'callkeep') {
        callKeepAnsweredRef.current = true;
      } else if (source === 'ui' && callUUID.current && !callKeepAnsweredRef.current) {
        try {
          callKeepAnsweredRef.current = true;
          
          RNCallKeep.answerIncomingCall(callUUID.current);
        } catch (e) {
          
        }
      }
    }

    // Idempotency: processAccept must run only once per callId (prevents flicker + duplicate producers)
    if (acceptedCallIdRef.current === callIdToUse) {
      
      return;
    }
    if (acceptInProgressRef.current) {
      
      return;
    }
    acceptInProgressRef.current = true;

    // Mark call mode and callId refs early
    currentCallId.current = callIdToUse;
    rtcDbg('processAccept.before_accept_call_emit', {
      callId: callIdToUse,
      fromUserId: userIdToUse,
      callType: callTypeToUse,
      socketConnected: socket.current?.connected,
    });

    

    try {
      await new Promise((resolve, reject) => {
        socket.current.emit(
          'accept-call',
          { callId: callIdToUse, fromUserId: userIdToUse },
          async (response) => {
            try {
              if (response?.error) {
                console.error('❌ [RTC] accept-call failed:', response.error);
                acceptInProgressRef.current = false;
                return reject(new Error(response.error));
              }

              // Mark accept succeeded as soon as server confirms it.
              acceptSucceededCallIdRef.current = callIdToUse;

        // Don't manually activate RTCAudioSession when CallKeep is active
        // CallKeep/AppDelegate handles audio session activation via CallKit
        // Only activate manually if CallKeep is not active (fallback)
        // if (Platform.OS === 'ios' && !callUUID.current) {
        //   try {
        //     RTCAudioSession.audioSessionDidActivate();
        //     console.log('🔊 [RTC] Manually activated audio session (no CallKeep)');
        //   } catch (err) {
        //     console.error('❌ [RTC] Error activating audio session:', err);
        //   }
        // }

          // Create transports ONLY after accept (join-call), then produce/consume.
              const rtpCapsToUse = response?.rtpCapabilities;
              if (!rtpCapsToUse) {
                console.error('❌ [RTC] accept-call missing rtpCapabilities');
                acceptInProgressRef.current = false;
                return reject(new Error('accept-call missing rtpCapabilities'));
              }

          // Reset transports if they exist from a previous call (safety)
          if (sendTransport.current || recvTransport.current) {
            try { sendTransport.current?.close?.(); } catch (e) {}
            try { recvTransport.current?.close?.(); } catch (e) {}
            sendTransport.current = null;
            recvTransport.current = null;
          }

          // Ensure device is initialized
          await initDevice(rtpCapsToUse);

          const joinCall = () =>
            new Promise((resolve, reject) => {
              socket.current.emit('join-call', { callId: callIdToUse }, (res) => {
                if (res?.error) return reject(new Error(res.error));
                resolve(res);
              });
            });

          const createTransport = (direction) =>
            new Promise((resolve, reject) => {
              socket.current.emit('create-transport', { callId: callIdToUse, direction }, (res) => {
                if (res?.error) return reject(new Error(res.error));
                resolve(res?.transportOptions);
              });
            });

          const getProducers = () =>
            new Promise((resolve, reject) => {
              socket.current.emit('get-producers', { callId: callIdToUse }, (res) => {
                if (res?.error) return reject(new Error(res.error));
                resolve(res?.producers || []);
              });
            });

              try {
            const joinRes = await joinCall();
            try {
              if (joinRes?.participantsInfo && typeof joinRes.participantsInfo === 'object') {
                participantsInfoRef.current = { ...(participantsInfoRef.current || {}), ...joinRes.participantsInfo };
              }
            } catch (e) {}
            const recvTransportParams = await createTransport('recv');
            const sendTransportParams = await createTransport('send');

            await createRecvTransport(recvTransportParams);
            await createSendTransport(sendTransportParams);

              // Ensure we have the right local media and producers.
              // We must not duplicate producers (flicker), but we DO want to produce video if this is a video call.
              let streamToUse = localStream;
              if (!streamToUse) {
                streamToUse = await getLocalStream(callTypeToUse);
                setLocalStream(streamToUse);
              } else if (callTypeToUse === 'video') {
                // If we somehow ended up with audio-only stream (e.g., stale info.type), reacquire with video.
                const hasVideo = (streamToUse.getVideoTracks?.()?.length || 0) > 0;
                if (!hasVideo) {
                  try {
                    const upgraded = await getLocalStream('video');
                    setLocalStream(upgraded);
                    streamToUse = upgraded;
                  } catch (e) {
                    console.error('❌ [RTC] Failed to upgrade local stream to video:', e);
                  }
                }
              }

              // IMPORTANT: Initialize participants on callee side (so group call shows tiles immediately).
              // If we don't do this, consume() may run in "group mode" but there will be no participants to attach streams to,
              // and VideoCall will fall back to the 1:1 "Connecting…" screen with no caller tile.
              try {
                const myIdStr = user?.data?.id?.toString?.() ?? (user?.data?.id != null ? String(user.data.id) : null);

                // Prefer participants from join-call response (authoritative), then info, then AsyncStorage (VoIP/app-killed).
                let participantList = Array.isArray(joinRes?.participants) ? joinRes.participants : (Array.isArray(info?.participants) ? info.participants : null);
                let fromAsyncStorage = false;
                if (!participantList) {
                  const saved = await AsyncStorage.getItem('incomingCallData');
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed?.callId === callIdToUse && Array.isArray(parsed?.participants)) {
                      participantList = parsed.participants;
                      fromAsyncStorage = true;
                    }
                  }
                }
                
                rtcDbg('processAccept.participantListSource', {
                  fromJoinRes: Array.isArray(joinRes?.participants),
                  fromInfo: Array.isArray(info?.participants),
                  fromAsyncStorage,
                  participantList,
                  participantListLength: participantList?.length || 0,
                  joinResParticipants: joinRes?.participants,
                  infoParticipants: info?.participants,
                });

                // Get caller ID from server response (participantList from server doesn't include caller)
                const creatorId = joinRes?.creatorId ? (joinRes.creatorId?.toString?.() ?? String(joinRes.creatorId)) : null;
                
                // Build complete list of other participants (including caller if not in participantList)
                // IMPORTANT: Include ALL participants from participantList (even those who haven't joined yet)
                // so they show up as "Ringing..." tiles in the group view
                const otherIdsSet = new Set();
                
                // Add ALL participants from participantList (these are the invited targets)
                (participantList || []).forEach((x) => {
                  const id = x?.toString?.() ?? String(x);
                  if (id && id !== myIdStr) {
                    otherIdsSet.add(id);
                    rtcDbg('processAccept.addingParticipantFromList', { id, myIdStr, willAdd: id !== myIdStr });
                  } else {
                    rtcDbg('processAccept.skippingParticipantFromList', { id, myIdStr, reason: id === myIdStr ? 'isLocal' : 'invalid' });
                  }
                });
                
                // Add caller if they're not already in the list and not the local user
                if (creatorId && creatorId !== myIdStr) {
                  if (!otherIdsSet.has(creatorId)) {
                    otherIdsSet.add(creatorId);
                    rtcDbg('processAccept.addingCreator', { creatorId, myIdStr });
                  } else {
                    rtcDbg('processAccept.creatorAlreadyInList', { creatorId });
                  }
                } else {
                  rtcDbg('processAccept.skippingCreator', { creatorId, myIdStr, reason: !creatorId ? 'noCreatorId' : 'isLocal' });
                }
                
                const otherIds = Array.from(otherIdsSet);
                
                rtcDbg('processAccept.participantListBuilding', {
                  participantList,
                  participantListLength: participantList?.length || 0,
                  myIdStr,
                  creatorId,
                  otherIds,
                  otherIdsCount: otherIds.length,
                  otherIdsSetSize: otherIdsSet.size,
                });

                // Get list of already-joined participants from server (so we mark them as 'joined' not 'invited')
                const alreadyJoined = Array.isArray(joinRes?.alreadyJoined) ? joinRes.alreadyJoined.map(x => x?.toString?.() ?? String(x)) : [];
                
                // Compute total participants as a unique set (server joinRes.participants may include the local user,
                // and typically excludes the creator/caller).
                const uniqueIds = new Set();
                try {
                  (participantList || []).forEach((x) => uniqueIds.add(x?.toString?.() ?? String(x)));
                  if (creatorId) uniqueIds.add(creatorId);
                } catch {}
                // Remove any empty/invalid ids
                uniqueIds.delete('');
                uniqueIds.delete('undefined');
                uniqueIds.delete('null');
                const totalParticipants = uniqueIds.size;

                // Group call if there are 3+ total participants (local + 2+ others).
                // (otherIds excludes local user by construction)
                const isGroupCall = otherIds.length >= 2;

                rtcDbg('processAccept.groupDetection', {
                  callId: callIdToUse,
                  participantList,
                  creatorId,
                  otherIds,
                  otherIdsCount: otherIds.length,
                  totalParticipants,
                  alreadyJoined,
                  willBeGroupCall: isGroupCall,
                });
                
                if (isGroupCall) {
                  // Mark as group *immediately* so consume() routes tracks into participant streams, not 1:1 remoteStream.
                  callModeRef.current.isGroupCall = true;
                  
                  rtcDbg('processAccept.beforeInitialize', {
                    otherIds,
                    otherIdsLength: otherIds.length,
                    includeLocal: true,
                  });
                  
                  // Initialize participants - this will create local + all otherIds (including caller)
                  // IMPORTANT: This REPLACES the entire participantsMap, so all participants in otherIds must be included
                  initializeParticipants(otherIds, true, streamToUse);
                  
                  // Force update participantsList and callInfo to ensure group view shows
                  const finalList = participantManager.current.getParticipantsList();
                  
                  rtcDbg('processAccept.afterInitialize', {
                    finalListLength: finalList.length,
                    finalListUserIds: finalList.map(p => p.userId),
                    finalListDetails: finalList.map(p => ({ userId: p.userId, callStatus: p.callStatus, isLocal: p.isLocal, hasStream: !!p.stream })),
                    otherIds,
                  });
                  
                  // IMPORTANT: Set state immediately and explicitly to ensure UI updates
                  setParticipantsList([...finalList]); // Create new array to force React re-render
                  setCallInfo({ callId: callIdToUse, type: callTypeToUse, participantCount: totalParticipants });
                  
                  rtcDbg('processAccept.afterSetState', {
                    finalListLength: finalList.length,
                    participantCount: totalParticipants,
                  });
                  
                  // Mark already-joined participants as 'joined' (not 'invited') so UI shows them correctly
                  // IMPORTANT: Only mark participants who are in otherIds AND in alreadyJoined as 'joined'
                  // All other participants in otherIds should remain as 'invited' (showing "Ringing...")
                  alreadyJoined.forEach((joinedId) => {
                    const joinedIdStr = joinedId?.toString?.() ?? String(joinedId);
                    if (otherIds.includes(joinedIdStr)) {
                      participantManager.current.updateParticipant(joinedIdStr, { callStatus: 'joined' });
                    }
                  });
                  
                  // Ensure all participants in otherIds exist and have correct status
                  // This ensures invited participants (who haven't joined) show up as "Ringing..." tiles
                  otherIds.forEach((participantId) => {
                    const existing = participantManager.current.getParticipant(participantId);
                    if (!existing) {
                      // This shouldn't happen, but if it does, add them with correct status
                      const contact = contacts.find(c =>
                        c.server_info?.id === participantId || c.server_info?.id === parseInt(participantId)
                      );
                      const firstName = contact?.item?.firstName || null;
                      const lastName = contact?.item?.lastName || null;
                      const pIdStr = participantId?.toString?.() ?? String(participantId);
                      const server = participantsInfoRef.current?.[pIdStr] || null;
                      const serverFull = `${server?.firstName || ''} ${server?.lastName || ''}`.trim();
                      const name =
                        contact?.item?.name ||
                        (firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : null) ||
                        serverFull ||
                        server?.username ||
                        'Unknown';
                      participantManager.current.addParticipant(participantId, {
                        name,
                        firstName: firstName || server?.firstName || null,
                        lastName: lastName || server?.lastName || null,
                        username: server?.username || null,
                        avatar: contact?.server_info?.avatar,
                        callStatus: alreadyJoined.includes(participantId) ? 'joined' : 'invited',
                      });
                    } else if (!alreadyJoined.includes(participantId)) {
                      // Ensure non-joined participants have 'invited' status (for "Ringing..." display)
                      participantManager.current.updateParticipant(participantId, { callStatus: 'invited' });
                    }
                  });
                  
                  // Refresh participants list again to reflect status changes
                  const finalListAfterStatusUpdate = participantManager.current.getParticipantsList();
                  setParticipantsList([...finalListAfterStatusUpdate]); // Create new array to force React re-render
                  
                  rtcDbg('processAccept.participantStatusFinal', {
                    otherIds,
                    alreadyJoined,
                    finalParticipants: finalListAfterStatusUpdate.map(p => ({
                      userId: p.userId,
                      callStatus: p.callStatus,
                      hasStream: !!p.stream,
                      isLocal: p.isLocal,
                    })),
                    finalListLength: finalListAfterStatusUpdate.length,
                    willSetStateWith: finalListAfterStatusUpdate.map(p => p.userId),
                  });
                  
                  rtcDbg('processAccept.groupCallInitialized', {
                    callId: callIdToUse,
                    totalParticipants,
                    participantsListLength: finalList.length,
                    otherIds,
                    callInfoParticipantCount: totalParticipants,
                  });
                } else {
                  // Ensure 1:1 mode so consume() updates remoteStream
                  callModeRef.current.isGroupCall = false;
                }

                // Keep info.participants in sync (helps later fallbacks + UI correctness)
                try {
                  if (Array.isArray(participantList) && participantList.length) {
                    setInfo(prev => ({ ...(prev || {}), participants: participantList }));
                  }
                } catch (e) {}
              } catch (e) {
                console.error('❌ [RTC] Error initializing participants in processAccept:', e);
                // ignore UI init failures; media should still work
              }
              
              // Ensure ParticipantManager is initialized for *true 1:1* calls so we can dynamically upgrade to group later.
              // IMPORTANT: Do NOT run this for group calls, because it replaces the participants map and will drop
              // invited (ringing) participants for late joiners.
              if (!callModeRef.current.isGroupCall) {
                try {
                  const myIdStr = user?.data?.id?.toString?.() ?? (user?.data?.id != null ? String(user.data.id) : null);
                  const otherIdStr = userIdToUse?.toString?.() ?? (userIdToUse != null ? String(userIdToUse) : null);
                  if (myIdStr && otherIdStr) {
                    // Include local + caller
                    participantManager.current.initializeParticipants([otherIdStr], user, streamToUse, contacts, true);
                  }
                } catch (e) {
                  // ignore
                }
              } else {
                rtcDbg('processAccept.skip1to1ManagerInit', { reason: 'groupCall', callId: callIdToUse });
              }

              const audioProducer = producers.current.get('audio');
              const videoProducer = producers.current.get('video');

              // Always ensure audio producer exists
              if (!audioProducer) {
                try {
                  const audioTrack = streamToUse?.getAudioTracks?.()?.[0];
                  if (audioTrack) {
                    const p = await sendTransport.current.produce({ track: audioTrack });
                    producers.current.set('audio', p);
                  }
                } catch (e) {
                  console.error('❌ [RTC] Failed to produce audio on accept:', e);
                }
              }

              // Ensure video producer exists when call is video
              if (callTypeToUse === 'video' && !videoProducer) {
                try {
                  const videoTrack = streamToUse?.getVideoTracks?.()?.[0];
                  if (videoTrack) {
                    const p = await sendTransport.current.produce({ track: videoTrack });
                    producers.current.set('video', p);
                  }
                } catch (e) {
                  console.error('❌ [RTC] Failed to produce video on accept:', e);
                }
              }

              const existing = await getProducers();
              rtcDbg('processAccept.getProducers', {
                callId: callIdToUse,
                existingProducersCount: Array.isArray(existing) ? existing.length : 0,
                existingProducers: Array.isArray(existing) ? existing.map(p => ({ producerId: p?.producerId, userId: p?.userId, kind: p?.kind })) : [],
                isGroupCall: callModeRef.current.isGroupCall,
              });
              
              if (Array.isArray(existing) && existing.length) {
                for (const p of existing) {
                  try {
                    rtcDbg('processAccept.consuming', { producerId: p?.producerId, userId: p?.userId, kind: p?.kind, source: p?.source });
                    await consume(p.producerId, p.userId, p?.source);
                    rtcDbg('processAccept.consumed', { producerId: p?.producerId, userId: p?.userId, kind: p?.kind, source: p?.source });
                  } catch (e) {
                    console.error('❌ [RTC] consume() failed (existing producer)', {
                      producerId: p?.producerId,
                      userId: p?.userId,
                      error: e?.message || e,
                    });
                    rtcDbg('processAccept.consume.error', { producerId: p?.producerId, userId: p?.userId, error: e?.message || e });
                  }
                }
              } else {
                rtcDbg('processAccept.noExistingProducers', { callId: callIdToUse });
              }

              // Resolve setup promise if waiting (for app-killed scenario)
              if (incomingCallSetupComplete.current) {
                incomingCallSetupComplete.current();
                incomingCallSetupComplete.current = null;
                incomingCallSetupCallId.current = currentCallId.current;
                
              }

                // --- iOS cold-start audio session reassert (CallKit can deactivate audio during app launch) ---
                // If CallKit emitted endCall during cold-start, AVAudioSession can end up deactivated or misrouted.
                // Video may still render, but audio becomes silent both ways.
                if (Platform.OS === 'ios' && source === 'callkeep') {
                  try {
                    const media = callTypeToUse === 'video' ? 'video' : 'audio';
                    // Re-activate and route audio via InCallManager (best-effort).
                    InCallManager.start({ media });
                    InCallManager.setForceSpeakerphoneOn(true);
                    rtcDbg('audioSession.reassert', { media, callId: callIdToUse });

                    // Retry after a short delay to win races with CallKit/session changes.
                    setTimeout(() => {
                      try {
                        InCallManager.start({ media });
                        InCallManager.setForceSpeakerphoneOn(true);
                        rtcDbg('audioSession.reassert.retry', { media, callId: callIdToUse });
                      } catch {}
                    }, 600);
                  } catch (e) {
                    rtcDbg('audioSession.reassert.error', { error: e?.message || String(e), callId: callIdToUse });
                  }
                }

                replace('Video Call');
                
                acceptedCallIdRef.current = callIdToUse;
                acceptSucceededCallIdRef.current = callIdToUse;
                acceptInProgressRef.current = false;
                return resolve();
              } catch (e) {
                console.error('❌ [RTC] join/createTransport/getProducers failed (callee):', e?.message || e);
                acceptInProgressRef.current = false;
                return reject(e);
              }

            } catch (err) {
              acceptInProgressRef.current = false;
              return reject(err);
            }
          }
        );
      });
    } catch (e) {
      console.error('❌ [RTC] processAccept failed:', e?.message || e);
      acceptInProgressRef.current = false;
      throw e;
    }
  };

  // Used by NavigationWrapper's CallKeep endCall handler to decide whether to notify server.
  const shouldEmitLeaveToServer = () => {
    try {
      const cid = currentCallId.current;
      if (!cid) return false;
      // If we've actually accepted (or completed accept+join) then leaving should notify server.
      if (acceptedCallIdRef.current === cid) return true;
      if (acceptSucceededCallIdRef.current === cid) return true;
      // If transports exist, we're definitely in a joined call state.
      if (sendTransport.current || recvTransport.current) return true;
      return false;
    } catch {
      return false;
    }
  };

  const endCall = async ({ emitToServer = true } = {}) => {
    
    
    // Stop screen sharing first (best-effort) to avoid leaking ReplayKit capture sessions.
    try {
      await stopScreenShare();
    } catch (e) {}

    // CRITICAL: Stop local stream tracks FIRST (before closing producers/transports)
    // This ensures mic/camera indicators disappear on iOS immediately
    if (localStream) {
      
      localStream.getTracks().forEach(track => {
        try {
          track.stop();
          track.enabled = false;
          
        } catch (e) {
          console.error('❌ [RTC] Error stopping local track:', e);
        }
      });
    }

    // Notify server about leaving the call (before closing transports)
    if (emitToServer && socket.current && currentCallId.current) {
      try {
        socket.current.emit('leave-call', { callId: currentCallId.current });
      } catch (e) {
        console.error('❌ [RTC] Error notifying server (leave-call):', e);
      }
    }

    // Stop remote stream tracks
    if (remoteStreamRef.current) {
      
      remoteStreamRef.current.getTracks().forEach(track => {
        try {
        if (track._enabledCheckInterval) {
          clearInterval(track._enabledCheckInterval);
        }
          if (track._audioEnabledCheckInterval) {
            clearInterval(track._audioEnabledCheckInterval);
          }
        if (track._muteEventTimeout) {
          clearTimeout(track._muteEventTimeout);
          track._muteEventTimeout = null;
        }
        if (track._frameWaitInterval) {
          clearInterval(track._frameWaitInterval);
          track._frameWaitInterval = null;
          }
          track.stop();
          track.enabled = false;
        } catch (e) {
          console.error('❌ [RTC] Error stopping remote track:', e);
        }
      });
    }
    
    // Close producers (this also stops their tracks)
    
    producers.current.forEach(p => {
      try {
        p.close();
      } catch (e) {
        console.error('❌ [RTC] Error closing producer:', e);
      }
    });
    
    // Close consumers
    
    consumers.current.forEach((consumerData, producerId) => {
      try {
        const consumer = consumerData.consumer || consumerData; // Support both old and new structure
      // Clean up any intervals and timeouts on consumer tracks
        if (consumer.track?._enabledCheckInterval) {
          clearInterval(consumer.track._enabledCheckInterval);
        }
        if (consumer.track?._audioEnabledCheckInterval) {
          clearInterval(consumer.track._audioEnabledCheckInterval);
        }
        if (consumer.track?._muteEventTimeout) {
          clearTimeout(consumer.track._muteEventTimeout);
          consumer.track._muteEventTimeout = null;
        }
        if (consumer.track?._frameWaitInterval) {
          clearInterval(consumer.track._frameWaitInterval);
          consumer.track._frameWaitInterval = null;
        }
        consumer.close();
      } catch (e) {
        console.error('❌ [RTC] Error closing consumer:', e);
      }
    });

    // Close transports
    
    try {
    sendTransport.current?.close();
    } catch (e) {
      console.error('❌ [RTC] Error closing send transport:', e);
    }
    try {
    recvTransport.current?.close();
    } catch (e) {
      console.error('❌ [RTC] Error closing recv transport:', e);
    }

    producers.current.clear();
    consumers.current.clear();

    // Clean up participant streams and managers
    participantManager.current.clear();
    streamManager.current.clear();
    soundManager.current.cleanup();
    setParticipantsList([]);

    setLocalStream(null);
    setRemoteStream(null);
    setRemoteStreamTracksCount(0); // Reset track count
    lastRemoteStreamTracksCount.current = 0; // Reset ref
    remoteStreamSetRef.current = false;
    consumingProducerIdsRef.current.clear();
    callModeRef.current.isGroupCall = false;
    acceptInProgressRef.current = false;
    acceptedCallIdRef.current = null;
    acceptSucceededCallIdRef.current = null;
    callKeepActiveMarkedRef.current = false;
    callKeepAnsweredRef.current = false;
    setRemoteMicMuted(false); // Reset remote mute status
    setRemoteVideoMuted(false); // Reset remote video mute status
    setCallInfo({ callId: null, type: 'video', participantCount: 0 });
    popToTop();
    // If stack cannot pop (common after using replace() for call flow), ensure we still exit call UI.
    try {
      const cur = navigationRef.getCurrentRoute?.()?.name;
      if (cur === 'Video Call' || cur === 'Incoming Call' || cur === 'Outgoing Call') {
        replace('Home');
      }
    } catch {}
    setInfo({});

    device.current = null;
    currentCallId.current = null;
    remoteStreamRef.current = null;
    setActiveScreenShare(null);

    audioSessionStartedRef.current = false;
    InCallManager.stop();
    
    // End CallKeep call if UUID exists (for both incoming and outgoing calls)
    if (callUUID.current) {
      try {
        RNCallKeep.endCall(callUUID.current);
        
      } catch (e) {
        console.error('❌ [CALLKEEP] Error ending call:', e);
      }
      callUUID.current = null;
    }
    
    RNCallKeep.endAllCalls();
    
    // Deactivate audio session on iOS (only if CallKeep isn't handling it)
    // CallKeep/AppDelegate handles deactivation via CallKit
    // if (Platform.OS === 'ios' && !callUUID.current) {
    //   try {
    //     RTCAudioSession.audioSessionDidDeactivate();
    //   } catch (e) {
    //     // Error deactivating audio session
    //   }
    // }
    
    // Clean up AsyncStorage
    try {
    await AsyncStorage.removeItem('incomingCallData');
    } catch (e) {
      // Error removing call data
    }

    // Reset setup promise and callId tracking
    incomingCallSetupComplete.current = null;
    incomingCallSetupPromise.current = null;
    incomingCallSetupCallId.current = null;
  };

  // Function to wait for incoming call setup (for app-killed scenario)
  // This ensures all mediasoup components are ready before accepting call
  const waitForIncomingCallSetup = async () => {
    // With the "classic room flow", we DO NOT create transports before Accept.
    // For CallKeep cold-start accept, what we really need is:
    // - socket connected (so accept/join can be signaled)
    // - currentCallId known (from VoIP push AsyncStorage or server resend 'incoming-call')
    // - setup markers match current call (avoid stale resolves)
    //
    // IMPORTANT: In cold-start races we can have incomingCallSetupCallId already set (from socket 'incoming-call')
    // while currentCallId hasn't been set yet. In that case, promote setupCallId → currentCallId.
    try {
      if (!currentCallId.current && incomingCallSetupCallId.current) {
        currentCallId.current = incomingCallSetupCallId.current;
      }
    } catch {}
    const isSetupComplete =
      socket.current?.connected &&
      socketRegisteredRef.current &&
      !!currentCallId.current &&
      incomingCallSetupCallId.current === currentCallId.current;

    rtcDbg('waitForIncomingCallSetup.check', {
      socketConnected: socket.current?.connected,
      socketRegistered: socketRegisteredRef.current,
      currentCallId: currentCallId.current,
      incomingCallSetupCallId: incomingCallSetupCallId.current,
      isSetupComplete,
      time: Date.now(),
    });

    if (isSetupComplete) {
      
      return Promise.resolve();
    }

    

    // Create promise if it doesn't exist or if it's for a different call
    if (!incomingCallSetupPromise.current || incomingCallSetupCallId.current !== currentCallId.current) {
      rtcDbg('waitForIncomingCallSetup.createPromise', {
        currentCallId: currentCallId.current,
        incomingCallSetupCallId: incomingCallSetupCallId.current,
        time: Date.now(),
      });
      incomingCallSetupPromise.current = new Promise((resolve) => {
        incomingCallSetupComplete.current = () => {
          rtcDbg('waitForIncomingCallSetup.resolved', {
            socketConnected: socket.current?.connected,
            currentCallId: currentCallId.current,
            incomingCallSetupCallId: incomingCallSetupCallId.current,
            time: Date.now(),
          });
          resolve();
        };
      });
    }
    return incomingCallSetupPromise.current;
  };

  return (
    <RTCContext.Provider
      value={{
        localStream,
        remoteStream,
        remoteStreamTracksCount,
        sendTransport, // Export to force re-renders when tracks are added
        recvTransport,
        type,
        info,
        startCall,
        processAccept,
        endCall,
        setType,
        micStatus,
        videoStatus,
        remoteMicMuted, // Export remote mute status (1:1 compatibility)
        remoteVideoMuted, // Export remote video mute status (1:1 compatibility)
        toggleMuteProducer, // Export mute toggle function
        toggleVideoProducer, // Export video toggle function
        waitForIncomingCallSetup, // Export for NavigationWrapper
        socket: socket.current, // Export socket for connection checking
        shouldEmitLeaveToServer,
        // Group call exports
        participantsList, // Array of participants for UI
        participantsMap: participantManager.current, // ParticipantManager instance for lookups
        callInfo, // Call information
        addParticipantsToCall, // Function to add members to call
        // Screen share (ReplayKit / getDisplayMedia)
        activeScreenShare,
        isStartingScreenShare,
        startScreenShare,
        stopScreenShare,
      }}
    >
      {children}
    </RTCContext.Provider>
  );
};
