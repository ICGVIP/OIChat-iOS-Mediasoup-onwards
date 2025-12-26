import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import {
  mediaDevices,
  MediaStream,
  RTCAudioSession,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import RNCallKeep from 'react-native-callkeep';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState } from 'react-native';
import { useSelector } from 'react-redux';
import uuid from 'react-native-uuid';
import { navigate } from '../utils/staticNavigationutils';

const RTCContext = createContext(null);
export const useRTC = () => useContext(RTCContext);

export const RTCProvider = ({ children }) => {

  const user = useSelector(state => state.user.value);
  const contacts = useSelector(state => state.contacts.value?.contacts || []);

  /* ================= UI STATE ================= */
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteStreamTracksCount, setRemoteStreamTracksCount] = useState(0); // Force re-render when tracks change
  const [type, setType] = useState('');
  const [info, setInfo] = useState({});
  const [micStatus, setMicStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(true);
  const [remoteMicMuted, setRemoteMicMuted] = useState(false); // Track if remote user has muted their producer
  const [remoteVideoMuted, setRemoteVideoMuted] = useState(false); // Track if remote user has muted their video producer

  /* ================= REFS ================= */
  const socket = useRef(null);
  const device = useRef(null);
  const sendTransport = useRef(null);
  const recvTransport = useRef(null);
  const producers = useRef(new Map());
  const consumers = useRef(new Map());
  const currentCallId = useRef(null);
  const remoteStreamRef = useRef(null);
  const callUUID = useRef(null);
  const incomingCallSetupComplete = useRef(null); // Promise resolver for app-killed scenario
  const incomingCallSetupPromise = useRef(null); // Promise that resolves when setup is complete
  const incomingCallSetupCallId = useRef(null); // Track which callId the setup is for (prevents duplicate setup)
  const audioSessionStartedRef = useRef(false);


  const iceServers = [
    {
      urls: 'turn:standard.relay.metered.ca:80',
      username: 'c8902592aed4c91e18a8d929',
      credential: 'tqk/vYs01A5r9hj3',
    },
    {
      urls: 'turn:standard.relay.metered.ca:80?transport=tcp',
      username: 'c8902592aed4c91e18a8d929',
      credential: 'tqk/vYs01A5r9hj3',
    },
    {
      urls: 'turn:standard.relay.metered.ca:443',
      username: 'c8902592aed4c91e18a8d929',
      credential: 'tqk/vYs01A5r9hj3',
    },
    {
      urls: 'turns:standard.relay.metered.ca:443?transport=tcp',
      username: 'c8902592aed4c91e18a8d929',
      credential: 'tqk/vYs01A5r9hj3',
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
      socket.current.emit('register', user.data.id);
      
      // Check AsyncStorage for pending call (app-killed scenario)
      // This ensures info.callId is available immediately, even before 'incoming-call' event fires
      try {
        const callDataStr = await AsyncStorage.getItem('incomingCallData');
        if (callDataStr) {
          const callData = JSON.parse(callDataStr);
          console.log('📦 [RTC] Found pending call in AsyncStorage:', callData);
          
          // Restore info state immediately so processAccept can use it
          // Prioritize callerName from VoIP push, fallback to handle or Unknown
          setInfo({
            id: callData.callerId || callData.handle,
            callId: callData.callId,
            type: callData.callType || 'video',
            name: callData.callerName || callData.handle || 'Unknown'
          });
          console.log('✅ [RTC] Restored info with name from AsyncStorage:', callData.callerName || callData.handle || 'Unknown');
          
          // Also set currentCallId ref
          currentCallId.current = callData.callId;
          
          // Restore UUID if available
          if (callData.uuid) {
            callUUID.current = callData.uuid;
            console.log('✅ [RTC] Restored UUID from AsyncStorage:', callUUID.current);
          }
          
          console.log('✅ [RTC] Restored call info from AsyncStorage - callId:', callData.callId);
        }
      } catch (e) {
        console.error('❌ [RTC] Error reading AsyncStorage on connect:', e);
      }
    });

    /* ---------- INCOMING CALL ---------- */
    socket.current.on('incoming-call', async (data) => {
      const { callId, fromUserId, callType, rtpCapabilities, sendTransport, recvTransport } = data;

      console.log('📞 [RTC] Incoming call event received, callId:', callId);

      // IDEMPOTENCY CHECK: If we already set up for this callId, skip duplicate setup
      // This prevents errors when server resends 'incoming-call' on reconnect
      if (incomingCallSetupCallId.current === callId && 
          device.current && 
          sendTransport.current && 
          recvTransport.current && 
          localStream) {
        console.log('ℹ️ [RTC] Setup already complete for callId', callId, '- skipping duplicate setup');
        
        // Still update info state and signal completion (in case promise is waiting)
        setInfo({ id: fromUserId, callId, type: callType, name: fromUserId.toString() });
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
            console.log('✅ [RTC] Using VoIP push UUID:', callUUID.current);
          } else {
            callUUID.current = uuid.v4();
            console.log('🆕 [RTC] Generated new UUID (callId mismatch):', callUUID.current);
          }
        } else {
          callUUID.current = uuid.v4();
          console.log('🆕 [RTC] Generated new UUID (no VoIP push data):', callUUID.current);
        }
      } catch (e) {
        callUUID.current = uuid.v4();
        console.log('🆕 [RTC] Generated new UUID (error reading storage):', callUUID.current);
      }

      // Get caller name - prioritize VoIP push data, then contacts, then fallback
      let callerName = fromUserId.toString();
      if (existingCallData?.callerName) {
        // Use name from VoIP push if available
        callerName = existingCallData.callerName;
        console.log('✅ [RTC] Using caller name from VoIP push:', callerName);
      } else if (contacts && contacts.length > 0) {
        // Fallback to contacts lookup
        const contact = contacts.find(c => 
          c.isRegistered && c.server_info?.id === parseInt(fromUserId)
        );
        if (contact?.item) {
          const firstName = contact.item.firstName || '';
          const lastName = contact.item.lastName || '';
          callerName = `${firstName} ${lastName}`.trim() || contact.item.name || callerName;
          console.log('✅ [RTC] Using caller name from contacts:', callerName);
        }
      }

      // Initialize device and create transports BEFORE showing incoming call screen
      // Only if not already initialized for this call
      console.log('⏳ [RTC] Initializing device and transports...');
      
      // Reset device/transports if they exist for a different call
      if (device.current && currentCallId.current !== callId) {
        console.log('🔄 [RTC] Resetting device/transports for new call');
        device.current = null;
        sendTransport.current = null;
        recvTransport.current = null;
      }
      
      await initDevice(rtpCapabilities);
      await createRecvTransport(recvTransport);
      await createSendTransport(sendTransport);

      const stream = await getLocalStream(callType);
      setLocalStream(stream);

      // Update info state (may have been pre-populated from AsyncStorage on connect)
      // This ensures we have the latest data from server
      setInfo({ id: fromUserId, callId, type: callType, name: callerName });
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
        ...(existingCallData || {}), // Preserve any VoIP push data
      };
      await AsyncStorage.setItem('incomingCallData', JSON.stringify(callData));
      console.log('💾 [RTC] Saved call data to AsyncStorage');

      // Signal that setup is complete (only if promise exists and hasn't been resolved)
      if (incomingCallSetupComplete.current) {
        console.log('✅ [RTC] Signaling incoming call setup complete for callId:', callId);
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
        console.log('📱 [RTC] Displayed CallKeep UI with UUID:', callUUID.current);
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
    socket.current.on('new-producer', async ({ producerId, kind }) => {
      await consume(producerId);
    });

    /* ---------- CALL ENDED ---------- */
    socket.current.on('call-ended', () => {
      endCall();
    });

    /* ---------- REMOTE USER MUTED/UNMUTED ---------- */
    socket.current.on('remote-user-muted', ({ userId, callId }) => {
      console.log('🔇 [RTC] Received remote-user-muted event:', { userId, callId, currentCallId: currentCallId.current, infoId: info.id });
      // Update state if it's the current call (no userId check needed - only one remote user per call)
      if (callId === currentCallId.current) {
        console.log('✅ [RTC] Remote user muted their producer - updating state');
        setRemoteMicMuted(true);
      } else {
        console.log('⚠️ [RTC] Remote-user-muted event ignored - callId mismatch');
      }
    });

    socket.current.on('remote-user-unmuted', ({ userId, callId }) => {
      console.log('🔊 [RTC] Received remote-user-unmuted event:', { userId, callId, currentCallId: currentCallId.current, infoId: info.id });
      // Update state if it's the current call (no userId check needed - only one remote user per call)
      if (callId === currentCallId.current) {
        console.log('✅ [RTC] Remote user unmuted their producer - updating state');
        setRemoteMicMuted(false);
      } else {
        console.log('⚠️ [RTC] Remote-user-unmuted event ignored - callId mismatch');
      }
    });

    /* ---------- REMOTE USER VIDEO MUTED/UNMUTED ---------- */
    socket.current.on('remote-user-video-muted', ({ userId, callId }) => {
      console.log('📴 [RTC] Received remote-user-video-muted event:', { userId, callId, currentCallId: currentCallId.current, infoId: info.id });
      // Update state if it's the current call
      if (callId === currentCallId.current) {
        console.log('✅ [RTC] Remote user muted their video producer - updating state');
        setRemoteVideoMuted(true);
      } else {
        console.log('⚠️ [RTC] Remote-user-video-muted event ignored - callId mismatch');
      }
    });

    socket.current.on('remote-user-video-unmuted', ({ userId, callId }) => {
      console.log('📹 [RTC] Received remote-user-video-unmuted event:', { userId, callId, currentCallId: currentCallId.current, infoId: info.id });
      // Update state if it's the current call
      if (callId === currentCallId.current) {
        console.log('✅ [RTC] Remote user unmuted their video producer - updating state');
        setRemoteVideoMuted(false);
      } else {
        console.log('⚠️ [RTC] Remote-user-video-unmuted event ignored - callId mismatch');
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
  
    console.log('🔊 [RTC] Forcing audio output');
  
    InCallManager.start({ media: 'audio' });
    InCallManager.setForceSpeakerphoneOn(true);
  
    audioSessionStartedRef.current = true;
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

    sendTransport.current.on('connect', ({ dtlsParameters }, cb, eb) => {
      try{
      socket.current.emit(
        'connect-transport',
        { callId: currentCallId.current, transportId: params.id, dtlsParameters },
        (response) => {
          if (response?.error) {
            cb(response.error);
          } else {
            cb();
          }
        }
      );
      } catch(error){
        eb('Connect-transport socket error: ', error);
      }
      
    });

    sendTransport.current.on('produce', ({ kind, rtpParameters }, cb, eb) => {

      try{
      socket.current.emit(
        'create-producer',
        {
          callId: currentCallId.current,
          transportId: params.id,
          kind,
          rtpParameters,
        },
        ({ producerId }) => {
          cb({ id: producerId });
        }
      );
      } catch(error){
        eb('Create-producer socket error: ', error);
      }

    });

    sendTransport.current.on('connectionstatechange', (state) => {
      // Connection state change handler
      console.log('Send transport connection state changed:', state);
    });

    sendTransport.current.on('icegatheringstatechange', (state) => {
      // Connection state change handler
      console.log('Send transport ICE gathering state changed:', state);
    });

    sendTransport.current.on('icecandidateerror', (error) => {
      // Connection state change handler
      console.log('Send transport ICE candidate error:', error);
    });
  };

  const createRecvTransport = async (params) => {
    recvTransport.current = device.current.createRecvTransport({...params, iceServers});

    recvTransport.current.on('connect', ({ dtlsParameters }, cb, eb) => {
      try{
      socket.current.emit(
        'connect-transport',
        { callId: currentCallId.current, transportId: params.id, dtlsParameters },
        (response) => {
          if (response?.error) {
            cb(response.error);
          } else {
            cb();
          }
        }
      );
      } catch(error){
        eb('Receive-transport connect socket error: ', error);
      }
      
    });

    recvTransport.current.on('connectionstatechange', (state) => {
      // Connection state change handler
      console.log('Send transport connection state changed:', state);
    });

    recvTransport.current.on('icegatheringstatechange', (state) => {
      // Connection state change handler
      console.log('Receive transport ICE gathering state changed:', state);
      });
      
    recvTransport.current.on('icecandidateerror', (error) => {
      // Connection state change handler
      console.log('Receive transport ICE candidate error:', error);
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
      console.warn('⚠️ [RTC] No audio producer found - cannot toggle mute');
      return null;
    }

    try {
      if (audioProducer.paused) {
        // Resume producer (unmute)
        await audioProducer.resume();
        console.log('🔊 [RTC] Audio producer resumed (unmuted)');
        socket.current.emit('mute-audio', { callId: currentCallId.current, producerId: audioProducer.id, muted: false });
        return true; // Unmuted
      } else {
        // Pause producer (mute)
        await audioProducer.pause();
        console.log('🔇 [RTC] Audio producer paused (muted)');
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
      console.warn('⚠️ [RTC] No video producer found - cannot toggle video');
      return null;
    }

    try {
      if (videoProducer.paused) {
        // Resume producer (unmute video)
        await videoProducer.resume();
        console.log('📹 [RTC] Video producer resumed (video on)');
        socket.current.emit('mute-video', { callId: currentCallId.current, producerId: videoProducer.id, muted: false });
        return true; // Video on
      } else {
        // Pause producer (mute video)
        await videoProducer.pause();
        console.log('📴 [RTC] Video producer paused (video off)');
        socket.current.emit('mute-video', { callId: currentCallId.current, producerId: videoProducer.id, muted: true });
        return false; // Video off
      }
    } catch (error) {
      console.error('❌ [RTC] Error toggling video producer:', error);
      return null; // Error
    }
  };

  /* ================= CONSUME ================= */

  const consume = async (producerId) => {
    if (!recvTransport.current) {
      return;
    }

    if (!device.current) {
      return;
    }

    const data = await new Promise((resolve, reject) => {
      socket.current.emit(
        'create-consumer',
        {
          callId: currentCallId.current,
          producerId,
          rtpCapabilities: device.current.rtpCapabilities,
        },
        (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        }
      );
    });

    const consumer = await recvTransport.current.consume(data);
    consumers.current.set(producerId, consumer);
    
    socket.current.emit('resume-consumer', {
      callId: currentCallId.current,
      consumerId: consumer.id,
    }, (response) => {
      // Resume consumer response handler
    });
    
    await consumer.resume();

    if (!remoteStreamRef.current) {
      remoteStreamRef.current = new MediaStream();
    }

    // Add track to the existing stream (only if not already added)
    const track = consumer.track;
    if (track) {
      const existingTracks = remoteStreamRef.current.getTracks();
      const trackExists = existingTracks.some(t => t.id === track.id);
      
      if (!trackExists) {
        const initialMutedState = track.muted;
        const initialEnabledState = track.enabled;
        
        remoteStreamRef.current.addTrack(track);
        
        // Track audio track state for micStatus
        if (track.kind === 'audio') {
          const isMicOn = track.enabled && !track.muted;
          setMicStatus(isMicOn);
          
          // CRITICAL: Ensure audio track is enabled and not muted
          if (!track.enabled) {
            track.enabled = true;
          }
          
          console.log(
            '🔊 [RTC] Remote audio track arrived',
            track.readyState,
            track.enabled,
            track.muted
          );
          
          // 🔥 THIS IS THE FIX
          startAudioOutput();
          // Setup mute/unmute handlers for audio
          const handleAudioMute = () => {
            setMicStatus(false);
          };
          
          const handleAudioUnmute = () => {
            if (track.enabled) {
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
            setMicStatus(false);
            clearInterval(track._audioEnabledCheckInterval);
          };
        }
        
        if (track.kind === 'video') {
          let wasUnmuted = !initialMutedState;
          let hasReceivedFrames = false;
          track._muteEventTimeout = null;
          
          const handleMute = () => {
            if (track._muteEventTimeout) {
              clearTimeout(track._muteEventTimeout);
              track._muteEventTimeout = null;
            }
            
            if (wasUnmuted && hasReceivedFrames) {
              setRemoteStreamTracksCount(remoteStreamRef.current.getTracks().length);
            } else {
              track._muteEventTimeout = setTimeout(() => {
                if (track.muted && !hasReceivedFrames) {
                  setRemoteStreamTracksCount(remoteStreamRef.current.getTracks().length);
                }
                track._muteEventTimeout = null;
              }, 1000);
            }
            
            setRemoteStreamTracksCount(remoteStreamRef.current.getTracks().length);
          };
          
          const handleUnmute = () => {
            wasUnmuted = true;
            hasReceivedFrames = true;
            
            if (track._muteEventTimeout) {
              clearTimeout(track._muteEventTimeout);
              track._muteEventTimeout = null;
            }
            
            setRemoteStreamTracksCount(remoteStreamRef.current.getTracks().length);
          };
          
          const handleEnabledChange = () => {
            setRemoteStreamTracksCount(remoteStreamRef.current.getTracks().length);
            const isVideoOn = track.enabled && !track.muted;
            console.log('📹 [VIDEO DEBUG] Video track enabled changed - Enabled:', track.enabled, 'Muted:', track.muted, 'VideoStatus:', isVideoOn);
            setVideoStatus(isVideoOn);
          };
          
          if (track.addEventListener) {
            track.addEventListener('mute', handleMute);
            track.addEventListener('unmute', handleUnmute);
          } else if (track.onmute !== undefined) {
            track.onmute = handleMute;
            track.onunmute = handleUnmute;
          }
          
          const enabledCheckInterval = setInterval(() => {
            const currentEnabled = track.enabled;
            if (currentEnabled !== track._lastEnabledState) {
              track._lastEnabledState = currentEnabled;
              handleEnabledChange();
            }
          }, 500);
          
          track._lastEnabledState = track.enabled;
          track._enabledCheckInterval = enabledCheckInterval;
          
          if (!initialMutedState) {
            wasUnmuted = true;
          }
          
          // Set initial video status
          const isVideoOn = track.enabled && !track.muted;
          setVideoStatus(isVideoOn);
        }
      }
    }

    const tracksCount = remoteStreamRef.current.getTracks().length;
    const audioTracks = remoteStreamRef.current.getAudioTracks();
    const videoTracks = remoteStreamRef.current.getVideoTracks();
    
    setRemoteStream(remoteStreamRef.current);
    setRemoteStreamTracksCount(tracksCount);
    
    // Final audio status check
    if (audioTracks.length > 0) {
      const audioTrack = audioTracks[0];
      const isAudioPlaying = audioTrack.readyState === 'live' && audioTrack.enabled && !audioTrack.muted;
      console.log(isAudioPlaying ? '✅ Remote audio is playing' : '❌ Remote audio is NOT playing');
    }
  };

  /* ================= CALL ACTIONS ================= */

  const startCall = async (partnerId, callType) => {
    const stream = await getLocalStream(callType);
    setLocalStream(stream);

    socket.current.emit(
      'start-call',
      { toUserId: partnerId, callType },
      async ({ callId, rtpCapabilities, sendTransport, recvTransport }) => {
        currentCallId.current = callId;

        // Use callId as UUID for CallKeep (instead of generating new one)
        callUUID.current = callId;

        // Activate audio session BEFORE creating transports and producing
        // if (Platform.OS === 'ios') {
        //   try {
        //     RTCAudioSession.audioSessionDidActivate();
        //   } catch (err) {
        //     // Error activating audio session
        //   }
        // }

        await initDevice(rtpCapabilities);
        await createSendTransport(sendTransport);
        await createRecvTransport(recvTransport);
        
        await produce(stream, callType);

        setInfo({ id: partnerId, callId, type: callType });
        
        navigate('Outgoing Call');

        InCallManager.start({ ringback: 'DEFAULT' });
      }
    );
  };

  const processAccept = async () => {
    // If CallKeep call exists, answer it first to activate CallKit audio session
    if (callUUID.current) {
      try {
        console.log('📞 [RTC] Answering CallKeep call with UUID:', callUUID.current);
        RNCallKeep.answerIncomingCall(callUUID.current);
        console.log('✅ [RTC] CallKeep call answered');
      } catch (e) {
        console.error('❌ [RTC] Error answering CallKeep call:', e);
        // Continue anyway - CallKeep might not be active if app was open
      }
    }

    // Fallback: If info.callId is not available, try to get it from AsyncStorage
    let callIdToUse = info.callId;
    let userIdToUse = info.id;
    
    if (!callIdToUse) {
      console.log('⚠️ [RTC] info.callId not available, checking AsyncStorage...');
      try {
        const callDataStr = await AsyncStorage.getItem('incomingCallData');
        if (callDataStr) {
          const callData = JSON.parse(callDataStr);
          callIdToUse = callData.callId;
          userIdToUse = callData.callerId || callData.handle;
          console.log('✅ [RTC] Using callId from AsyncStorage:', callIdToUse);
          
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

    console.log('📞 [RTC] Accepting call with callId:', callIdToUse, 'userId:', userIdToUse);

    socket.current.emit(
      'accept-call',
      { callId: callIdToUse, fromUserId: userIdToUse },
      async () => {
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

        const stream = localStream || (await getLocalStream(info.type));
        setLocalStream(stream);

        await produce(stream, info.type);

        navigate('Video Call');
        
        // Ensure audio is routed correctly after accepting
        // if (info.type === 'video') {
        //   InCallManager.setForceSpeakerphoneOn(true);
        // }

        // InCallManager.stopRingtone();
        // InCallManager.start({ media: info.type === 'video' ? 'video' : 'audio' });

        console.log('✅ [RTC] Call accepted and producing');

      }
    );
  };

  const endCall = async () => {
    console.log('🛑 [RTC] endCall called - stopping all tracks and cleaning up');
    
    // CRITICAL: Stop local stream tracks FIRST (before closing producers/transports)
    // This ensures mic/camera indicators disappear on iOS immediately
    if (localStream) {
      console.log('🛑 [RTC] Stopping local stream tracks');
      localStream.getTracks().forEach(track => {
        try {
          track.stop();
          track.enabled = false;
          console.log('✅ [RTC] Stopped local track:', track.kind, track.id);
        } catch (e) {
          console.error('❌ [RTC] Error stopping local track:', e);
        }
      });
    }

    // Notify server about call end (before closing transports)
    if (socket.current && currentCallId.current) {
      try {
        socket.current.emit('end-call', { callId: currentCallId.current });
        console.log('✅ [RTC] Notified server about call end');
      } catch (e) {
        console.error('❌ [RTC] Error notifying server:', e);
      }
    }

    // Stop remote stream tracks
    if (remoteStreamRef.current) {
      console.log('🛑 [RTC] Stopping remote stream tracks');
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
    console.log('🛑 [RTC] Closing producers');
    producers.current.forEach(p => {
      try {
        p.close();
      } catch (e) {
        console.error('❌ [RTC] Error closing producer:', e);
      }
    });
    
    // Close consumers
    console.log('🛑 [RTC] Closing consumers');
    consumers.current.forEach(c => {
      try {
        // Clean up any intervals and timeouts on consumer tracks
        if (c.track?._enabledCheckInterval) {
          clearInterval(c.track._enabledCheckInterval);
        }
        if (c.track?._audioEnabledCheckInterval) {
          clearInterval(c.track._audioEnabledCheckInterval);
        }
        if (c.track?._muteEventTimeout) {
          clearTimeout(c.track._muteEventTimeout);
          c.track._muteEventTimeout = null;
        }
        if (c.track?._frameWaitInterval) {
          clearInterval(c.track._frameWaitInterval);
          c.track._frameWaitInterval = null;
        }
        c.close();
      } catch (e) {
        console.error('❌ [RTC] Error closing consumer:', e);
      }
    });

    // Close transports
    console.log('🛑 [RTC] Closing transports');
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

    setLocalStream(null);
    setRemoteStream(null);
    setRemoteStreamTracksCount(0); // Reset track count
    setRemoteMicMuted(false); // Reset remote mute status
    setRemoteVideoMuted(false); // Reset remote video mute status
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
        console.log('✅ [CALLKEEP] Ended call with UUID:', callUUID.current);
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
    const isSetupComplete = 
      device.current && 
      sendTransport.current && 
      recvTransport.current && 
      localStream &&
      socket.current?.connected &&
      incomingCallSetupCallId.current === currentCallId.current; // Ensure setup is for current call

    if (isSetupComplete) {
      console.log('✅ [RTC] Mediasoup setup already complete - device, transports, stream, and socket ready for callId:', currentCallId.current);
      return Promise.resolve();
    }

    console.log('⏳ [RTC] Waiting for mediasoup setup...', {
      hasDevice: !!device.current,
      hasSendTransport: !!sendTransport.current,
      hasRecvTransport: !!recvTransport.current,
      hasLocalStream: !!localStream,
      socketConnected: socket.current?.connected,
      setupCallId: incomingCallSetupCallId.current,
      currentCallId: currentCallId.current
    });

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
        remoteMicMuted, // Export remote mute status
        remoteVideoMuted, // Export remote video mute status
        toggleMuteProducer, // Export mute toggle function
        toggleVideoProducer, // Export video toggle function
        waitForIncomingCallSetup, // Export for NavigationWrapper
        socket: socket.current, // Export socket for connection checking
      }}
    >
      {children}
    </RTCContext.Provider>
  );
};
