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
import { navigate } from '../utils/staticNavigationutils';
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
  const consumers = useRef(new Map()); // Map<producerId, { consumer, userId, kind }>
  const currentCallId = useRef(null);
  const remoteStreamRef = useRef(null); // Keep for 1:1 compatibility
  const lastRemoteStreamTracksCount = useRef(0); // Track last count to prevent unnecessary updates
  const remoteVideoMutedRef = useRef(false); // Guard to avoid redundant state updates
  const remoteStreamSetRef = useRef(false); // Whether we've ever set remoteStream for current call (1:1)
  const consumingProducerIdsRef = useRef(new Set()); // Prevent duplicate consume() calls per producerId
  const callModeRef = useRef({ isGroupCall: false }); // Avoid relying on React state inside socket handlers
  const callUUID = useRef(null);
  const incomingCallSetupComplete = useRef(null); // Promise resolver for app-killed scenario
  const incomingCallSetupPromise = useRef(null); // Promise that resolves when setup is complete
  const incomingCallSetupCallId = useRef(null); // Track which callId the setup is for (prevents duplicate setup)
  const audioSessionStartedRef = useRef(false);
  const acceptInProgressRef = useRef(false);
  const acceptedCallIdRef = useRef(null);
  const callKeepActiveMarkedRef = useRef(false);
  const callKeepAnsweredRef = useRef(false);


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
      socket.current.emit('register', user.data.id);
      rtcDbg('socket.register.emit', { userId: user?.data?.id });
      // Check AsyncStorage for pending call (app-killed scenario)
      // This ensures info.callId is available immediately, even before 'incoming-call' event fires
      try {
        const callDataStr = await AsyncStorage.getItem('incomingCallData');
        if (callDataStr) {
          const callData = JSON.parse(callDataStr);
          
          
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
          
          // Restore UUID if available
          if (callData.uuid) {
            callUUID.current = callData.uuid;
            
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
      const { callId, fromUserId, callType, rtpCapabilities, sendTransport, recvTransport, participants } = data;

      rtcDbg('incoming-call', {
        callId,
        fromUserId,
        callType,
        participantsCount: Array.isArray(participants) ? participants.length : undefined,
        hasRtpCaps: !!rtpCapabilities,
        hasSendTransport: !!sendTransport,
        hasRecvTransport: !!recvTransport,
      });

      // IDEMPOTENCY CHECK: If we already set up for this callId, skip duplicate setup
      // This prevents errors when server resends 'incoming-call' on reconnect
      if (incomingCallSetupCallId.current === callId && 
      device.current && 
      sendTransport.current && 
      recvTransport.current && 
      localStream) {
        
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

      // Decide call mode & display name (group vs 1:1)
      const participantList = Array.isArray(participants) ? participants : [fromUserId];
      const myIdStr = user?.data?.id?.toString?.();
      const otherIds = participantList
        .map(x => x?.toString?.() ?? String(x))
        .filter(id => id && id !== myIdStr);

      callModeRef.current.isGroupCall = otherIds.length > 1;

      const lookupName = (idStr) => {
        const c = contacts?.find?.(ct => ct?.isRegistered && ct?.server_info?.id?.toString?.() === idStr);
        const first = c?.item?.firstName || '';
        const last = c?.item?.lastName || '';
        return `${first} ${last}`.trim() || c?.item?.name || idStr;
      };

      const formatGroupName = (ids) => {
        const names = ids.map(lookupName);
        if (names.length <= 2) return names.join(' & ');
        return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
      };

      // Get caller name - prioritize VoIP push data, then participants-based group name, then contacts, then fallback
      let callerName = fromUserId.toString();
      if (existingCallData?.callerName) {
        // Use name from VoIP push if available
        callerName = existingCallData.callerName;
        
      } else if (otherIds.length > 1) {
        callerName = formatGroupName(otherIds);
        
      } else if (contacts && contacts.length > 0) {
        // Fallback to contacts lookup
        const contact = contacts.find(c => 
          c.isRegistered && c.server_info?.id === parseInt(fromUserId)
        );
        if (contact?.item) {
          const firstName = contact.item.firstName || '';
          const lastName = contact.item.lastName || '';
          callerName = `${firstName} ${lastName}`.trim() || contact.item.name || callerName;
          
        }
      }

      // Initialize device and create transports BEFORE showing incoming call screen
      // Only if not already initialized for this call
      
      
      // Reset device/transports if they exist for a different call
      if (device.current && currentCallId.current !== callId) {
        
        device.current = null;
        sendTransport.current = null;
        recvTransport.current = null;
      }
      
      await initDevice(rtpCapabilities);
      await createRecvTransport(recvTransport);
      await createSendTransport(sendTransport);

      const stream = await getLocalStream(callType);
      setLocalStream(stream);

      // Initialize participants state for group calls so UI can render tiles
      if (otherIds.length > 1) {
        try {
          initializeParticipants(otherIds, true, stream);
        } catch (e) {
          
        }
      }

      // Update info state (may have been pre-populated from AsyncStorage on connect)
      // This ensures we have the latest data from server
      setInfo({ id: fromUserId, callId, type: callType, name: callerName, participants: participantList });
      navigate('Incoming Call');
      
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
        ...(existingCallData || {}), // Preserve any VoIP push data
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
        InCallManager.startRingtone();
        setTimeout(() => {
          navigate('Incoming Call');
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

      navigate('Video Call');

      InCallManager.stopRingback();
      const callType = info.type || 'video';
      InCallManager.start({ media: callType === 'video' ? 'video' : 'audio' });
    });

    /* ---------- NEW PRODUCER ---------- */
    socket.current.on('new-producer', async ({ producerId, kind, userId }) => {
      
      if (!currentCallId.current) {
        
        return;
      }
      // Idempotency: never consume the same producer twice
      if (consumers.current.has(producerId) || consumingProducerIdsRef.current.has(producerId)) {
        
        return;
      }
      try {
        await consume(producerId, userId);
      } catch (e) {
        console.error('❌ [RTC] consume() failed for new-producer', { producerId, kind, userId, error: e?.message || e });
      }
    });

    /* ---------- CALL INVITATION (for participants added to existing call) ---------- */
    socket.current.on('call-invitation', async (data) => {
      const { callId, fromUserId, callType, rtpCapabilities, sendTransport, recvTransport } = data;
      

      try {
        // Set current call ID
        currentCallId.current = callId;
        callUUID.current = callId;

        // Initialize device and transports
        if (!device.current) {
          
          await initDevice(rtpCapabilities);
        }
        if (!sendTransport.current) {
          
          await createSendTransport(sendTransport);
        }
        if (!recvTransport.current) {
          
          await createRecvTransport(recvTransport);
        }

        // Get local stream if not already available
        if (!localStream) {
          
          const stream = await getLocalStream(callType);
          setLocalStream(stream);
          await produce(stream, callType);
          
        }

        // Update info
        setInfo({ 
          id: fromUserId, 
          callId, 
          type: callType 
        });

        // Accept the invitation
        socket.current.emit('accept-call', { callId, fromUserId }, async (response) => {
          if (response?.error) {
            console.error('❌ [RTC] Error accepting call invitation:', response.error);
            return;
          }
          
          // Navigate to video call screen
          navigate('Video Call');
          // Producers will be sent via new-producer events
        });
      } catch (error) {
        console.error('❌ [RTC] Error handling call invitation:', error);
      }
    });

    /* ---------- PARTICIPANT JOINED ---------- */
    socket.current.on('participant-joined', ({ callId, userId }) => {
      if (callId !== currentCallId.current) return;
      
      
      
      // userId can be array if multiple joined
      const userIds = Array.isArray(userId) ? userId : [userId];
      
      userIds.forEach(uid => {
        const contact = contacts.find(c => 
          c.server_info?.id === uid || c.server_info?.id === parseInt(uid)
        );
        addParticipant(uid, {
          name: contact?.item?.name || contact?.item?.firstName || 'Unknown',
          avatar: contact?.server_info?.avatar,
          isLocal: false,
        });
        
      });
    });

    /* ---------- PARTICIPANT LEFT ---------- */
    socket.current.on('participant-left', ({ callId, userId }) => {
      if (callId !== currentCallId.current) return;
      removeParticipant(userId);
    });

    /* ---------- CALL ENDED ---------- */
    socket.current.on('call-ended', () => {
      endCall();
    });

    /* ---------- REMOTE USER MUTED/UNMUTED ---------- */
    socket.current.on('remote-user-muted', ({ userId, callId }) => {
      
      if (callId === currentCallId.current) {
        if (callModeRef.current.isGroupCall) {
          
          updateParticipantMute(userId, 'audio', true);
        } else {
          
          setRemoteMicMuted(true);
        }
      } else {
        
      }
    });

    socket.current.on('remote-user-unmuted', ({ userId, callId }) => {
      
      if (callId === currentCallId.current) {
        if (callModeRef.current.isGroupCall) {
          
          updateParticipantMute(userId, 'audio', false);
        } else {
          
          setRemoteMicMuted(false);
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
          
          setRemoteVideoMuted(true);
        }
      } else {
        
      }
    });

    socket.current.on('remote-user-video-unmuted', ({ userId, callId }) => {
      
      if (callId === currentCallId.current) {
        if (callModeRef.current.isGroupCall) {
          
          updateParticipantMute(userId, 'video', false);
        } else {
          
          setRemoteVideoMuted(false);
        }
      } else {
        
      }
    });

    return () => socket.current?.disconnect();
  }, [user?.data?.id]);

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
    const newList = participantManager.current.initializeParticipants(
      participantIds,
      user,
      localStreamOverride || localStream,
      contacts,
      includeLocal
    );
    
    // Only set state if it's actually a group call (3+ participants)
    // For 1:1 calls, we don't need participant state
    if (newList.length > 2) {
      callModeRef.current.isGroupCall = true;
      setParticipantsList(newList);
      setCallInfo(prev => ({ ...prev, participantCount: newList.length }));
    } else {
      // For 1:1, just initialize the manager but don't update state
      // This keeps the manager in sync but avoids unnecessary re-renders
      callModeRef.current.isGroupCall = false;
    }
  };

  // Add participant (only update state for group calls)
  const addParticipant = (userId, participantData) => {
    const participant = participantManager.current.addParticipant(userId, participantData);
    if (participant) {
      const currentCount = participantManager.current.getParticipantCount();
      // Only update state if it's a group call
      if (currentCount > 2) {
        callModeRef.current.isGroupCall = true;
        setParticipantsList(prev => [...prev, participant]);
        setCallInfo(prev => ({ ...prev, participantCount: currentCount }));
      }
      soundManager.current.playJoinSound();
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
        setParticipantsList(prev => prev.filter(p => p.userId !== userIdStr));
        setCallInfo(prev => ({ ...prev, participantCount: currentCount }));
        callModeRef.current.isGroupCall = true;
      } else {
        callModeRef.current.isGroupCall = false;
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

    sendTransport.current.on('produce', ({ kind, rtpParameters }, cb, eb) => {

      try {
        rtcDbg('sendTransport.produce', { callId: currentCallId.current, transportId: params?.id, kind });
        socket.current.emit(
          'create-producer',
          {
            callId: currentCallId.current,
            transportId: params.id,
            kind,
            rtpParameters,
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

    sendTransport.current.on('connectionstatechange', (state) => {
      // Connection state change handler
      rtcDbg('sendTransport.connectionstatechange', { state });
    });

    sendTransport.current.on('icegatheringstatechange', (state) => {
      rtcDbg('sendTransport.icegatheringstatechange', { state });
    });

    sendTransport.current.on('icecandidateerror', (error) => {
      // Connection state change handler
      rtcDbg('sendTransport.icecandidateerror', { error: error?.errorText || error?.message || String(error) });
    });
  };

  const createRecvTransport = async (params) => {
    recvTransport.current = device.current.createRecvTransport({...params, iceServers});
    rtcDbg('recvTransport.created', { transportId: params?.id, callId: currentCallId.current });

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

    recvTransport.current.on('connectionstatechange', (state) => {
      // Connection state change handler
      rtcDbg('recvTransport.connectionstatechange', { state });
    });

    recvTransport.current.on('icegatheringstatechange', (state) => {
      // Connection state change handler
      rtcDbg('recvTransport.icegatheringstatechange', { state });
    });
      
    recvTransport.current.on('icecandidateerror', (error) => {
      // Connection state change handler
      rtcDbg('recvTransport.icecandidateerror', { error: error?.errorText || error?.message || String(error) });
    });
    
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
        return true; // Unmuted
      } else {
        // Pause producer (mute)
        await audioProducer.pause();
        
        socket.current.emit('mute-audio', { callId: currentCallId.current, producerId: audioProducer.id, muted: true });
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
        return true; // Video on
      } else {
        // Pause producer (mute video)
        await videoProducer.pause();
        
        socket.current.emit('mute-video', { callId: currentCallId.current, producerId: videoProducer.id, muted: true });
        return false; // Video off
      }
    } catch (error) {
      console.error('❌ [RTC] Error toggling video producer:', error);
      return null; // Error
    }
  };

  /* ================= CONSUME ================= */

  const consume = async (producerId, userId) => {
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
    
    // Avoid relying on React state inside socket-driven code (can be stale)
    const isGroupCall = !!callModeRef.current.isGroupCall;

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
      

    // Map consumer to participant
    streamManager.current.mapConsumerToParticipant(producerId, userIdStr);

    // Add track to participant's stream.
    // IMPORTANT: StreamManager recreates a NEW MediaStream instance when the track set changes,
    // which makes RTCView updates reliable on React Native.
    const track = consumer.track;
    
    
    if (track) {
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

          const { callId, rtpCapabilities, sendTransport, recvTransport } = response;
          

          currentCallId.current = callId;

          // Use callId as UUID for CallKeep (instead of generating new one)
          callUUID.current = callId;
          

          try {
            
            await initDevice(rtpCapabilities);
            

            
            await createSendTransport(sendTransport);
            

            
            await createRecvTransport(recvTransport);
            
            
            
            await produce(stream, callType);
            

            // Initialize participants (only update state for group calls)
            
            if (participantIds.length > 1) {
              // Group call - initialize with state updates
              initializeParticipants(participantIds, true, stream);
              setCallInfo({ callId, type: callType, participantCount: participantIds.length + 1 });
              
            } else {
              // 1:1 call - initialize manager silently (no state updates to avoid re-renders)
              participantManager.current.initializeParticipants(participantIds, user, stream, contacts, true);
              
            }
            
            setInfo({ 
              id: participantIds.length === 1 ? participantIds[0] : null, // For 1:1 compatibility
              callId, 
              type: callType,
              participants: [user?.data?.id, ...participantIds].filter(Boolean),
            });
            
            
            
            navigate('Outgoing Call');
            

            
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

    // Check max participants limit (10)
    const currentCount = participantsList.length;
    if (currentCount + participantIds.length > 10) {
      Alert.alert('Error', 'Maximum 10 participants allowed per call');
      return;
    }

    socket.current.emit(
      'add-participants',
      { callId: currentCallId.current, participantIds },
      (response) => {
        if (response.error) {
          console.error('❌ [RTC] Error adding participants:', response.error);
          Alert.alert('Error', 'Failed to add participants: ' + response.error);
        } else {
          
          // Participants will be added via 'participant-joined' event
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

    // Fallback: If info.callId is not available, try to get it from AsyncStorage
    let callIdToUse = info.callId;
    let userIdToUse = info.id;
    let callTypeToUse = info.type;
    
    if (!callIdToUse) {
      
      try {
        const callDataStr = await AsyncStorage.getItem('incomingCallData');
        if (callDataStr) {
          const callData = JSON.parse(callDataStr);
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
      return;
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

    

    try {
      socket.current.emit(
        'accept-call',
        { callId: callIdToUse, fromUserId: userIdToUse },
        async (response) => {
          if (response?.error) {
            console.error('❌ [RTC] accept-call failed:', response.error);
            acceptInProgressRef.current = false;
            return;
          }

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

          // For CallKeep: do NOT call answerIncomingCall here (it can re-trigger answerCall loop).
          // Just mark active once, if possible.
          if (callUUID.current && !callKeepActiveMarkedRef.current) {
            try {
              RNCallKeep.setCurrentCallActive(callUUID.current);
              callKeepActiveMarkedRef.current = true;
              
            } catch (e) {
              
            }
          }

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

        // Resolve setup promise if waiting (for app-killed scenario)
        if (incomingCallSetupComplete.current) {
          incomingCallSetupComplete.current();
          incomingCallSetupComplete.current = null;
          incomingCallSetupCallId.current = currentCallId.current;
          
        }

        navigate('Video Call');
        
        // Ensure audio is routed correctly after accepting
        // if (info.type === 'video') {
        //   InCallManager.setForceSpeakerphoneOn(true);
        // }

        // InCallManager.stopRingtone();
        // InCallManager.start({ media: info.type === 'video' ? 'video' : 'audio' });

        

          acceptedCallIdRef.current = callIdToUse;
          acceptInProgressRef.current = false;
        }
      );
    } catch (e) {
      console.error('❌ [RTC] processAccept failed:', e?.message || e);
      acceptInProgressRef.current = false;
    }
  };

  const endCall = async () => {
    
    
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

    // Notify server about call end (before closing transports)
    if (socket.current && currentCallId.current) {
      try {
        socket.current.emit('end-call', { callId: currentCallId.current });
        
      } catch (e) {
        console.error('❌ [RTC] Error notifying server:', e);
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
    callKeepActiveMarkedRef.current = false;
    callKeepAnsweredRef.current = false;
    setRemoteMicMuted(false); // Reset remote mute status
    setRemoteVideoMuted(false); // Reset remote video mute status
    setCallInfo({ callId: null, type: 'video', participantCount: 0 });
    navigate('Home');
    setInfo({});

    device.current = null;
    currentCallId.current = null;
    remoteStreamRef.current = null;

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
    // Check if setup is already complete for the current call
    // Required components: device, sendTransport, recvTransport, localStream
    // Also verify setup is for the current callId (not a stale setup)
    // Note: localStream state might not be updated yet, so we check if producers exist as alternative
    const hasProducers = producers.current.size > 0;
    const isSetupComplete = 
      device.current && 
      sendTransport.current && 
      recvTransport.current && 
      (localStream || hasProducers) && // Accept either state or producers as proof
      socket.current?.connected &&
      incomingCallSetupCallId.current === currentCallId.current; // Ensure setup is for current call

    if (isSetupComplete) {
      
      return Promise.resolve();
    }

    

    // Create promise if it doesn't exist or if it's for a different call
    if (!incomingCallSetupPromise.current || incomingCallSetupCallId.current !== currentCallId.current) {
      incomingCallSetupPromise.current = new Promise((resolve) => {
        incomingCallSetupComplete.current = resolve;
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
        // Group call exports
        participantsList, // Array of participants for UI
        participantsMap: participantManager.current, // ParticipantManager instance for lookups
        callInfo, // Call information
        addParticipantsToCall, // Function to add members to call
      }}
    >
      {children}
    </RTCContext.Provider>
  );
};
