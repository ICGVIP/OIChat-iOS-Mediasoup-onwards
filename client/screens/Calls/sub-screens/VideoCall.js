import React, {useState,useRef,useEffect, useCallback, useMemo} from 'react'
import {View,Text, StyleSheet, ImageBackground, TouchableOpacity,Dimensions, Alert, SafeAreaView, Animated, PanResponder, ActivityIndicator, Platform, useColorScheme, TextInput, ScrollView, Image, Pressable, FlatList, NativeModules, findNodeHandle} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Avatar } from 'react-native-paper';
import {useSelector} from 'react-redux';
import {RTCView, mediaDevices, ScreenCapturePickerView} from 'react-native-webrtc'
import { useRTC } from '../../../context/rtc';
import InCallManager from 'react-native-incall-manager';
import { Socket } from 'socket.io-client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNCallKeep from 'react-native-callkeep';
import { navigate } from '../../../utils/staticNavigationutils';
import { MenuView } from '@react-native-menu/menu';
import EmojiPicker from "rn-emoji-keyboard";
import {
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const barWidth = windowWidth*0.85;
const topMargin = windowHeight*0.08;

/* ================= PARTICIPANT VIEW COMPONENT ================= */
const ParticipantView = ({ participant, style, localMicStatus, localVideoStatus, reactionEmoji, callType }) => {
    const { userId, name, firstName, lastName, username, avatar, stream, muted, isLocal, streamKey } = participant;
    
    // Use participant.muted for all users (including local) - it's updated by toggle functions
    // For local user, also check localMicStatus/localVideoStatus as backup if muted object is stale
    const isMicMuted = !!muted?.mic || (isLocal && localMicStatus === false);
    const isVideoMuted = !!muted?.video || (isLocal && localVideoStatus === false);
    
    const isAudioCall = callType === 'audio';
    const hasVideo = !isAudioCall && !!stream && stream.getVideoTracks().length > 0 && !isVideoMuted;
    const isRinging = !isLocal && !stream && participant?.callStatus === 'invited'; // invited but not joined yet

    // Build display name: prefer name, then firstName/lastName, then username, then fallback.
    // IMPORTANT: Never show raw userId as a display name.
    const displayName = isLocal 
        ? 'You' 
        : (name && name !== 'Unknown' && name !== userId?.toString())
            ? name
            : (firstName || lastName)
                ? `${firstName || ''} ${lastName || ''}`.trim()
                : (username ? String(username) : 'Unknown');

    return (
        <View style={[styles.participantContainer, style]}>
                {/* Reaction (top-center, 30s TTL) */}
                {!!reactionEmoji && (
                    <View style={{
                        position: 'absolute',
                        top: 8,
                        alignSelf: 'center',
                        zIndex: 250,
                        elevation: 250,
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 16,
                    }}>
                        <Text style={{ fontSize: 26 }}>{reactionEmoji}</Text>
                    </View>
                )}
            {hasVideo ? (
                <RTCView
                    key={`rtc-${userId}-${streamKey || 0}`}
                    streamURL={stream.toURL()}
                    objectFit="cover"
                    style={StyleSheet.absoluteFill}
                    mirror={isLocal}
                />
            ) : (
                <View style={[StyleSheet.absoluteFill, styles.videoOffFallback]}>
                    {avatar ? (
                        <Avatar.Image size={60} source={{ uri: avatar }} />
                    ) : (
                        <Avatar.Text size={60} label={displayName?.charAt(0)?.toUpperCase() || '?'} />
                    )}
                    {/* Show camera-off icon for local user when video is muted */}
                    {isLocal && isVideoMuted && (
                        <View style={{ marginTop: 8, marginBottom: 4 }}>
                            <Feather name="video-off" size={24} color="rgba(255,255,255,0.7)" />
                        </View>
                    )}
                    <Text style={styles.participantNameFallback} numberOfLines={1} ellipsizeMode="tail">
                        {displayName}
                    </Text>
                        {/* Status line */}
                        <Text style={styles.participantStatusText} numberOfLines={1} ellipsizeMode="tail">
                            {isRinging
                                ? 'Ringing…'
                                : (isAudioCall ? 'Audio call' : (isVideoMuted ? 'Video off' : 'Connecting…'))}
                        </Text>
                </View>
            )}
            
            {/* Mute indicators overlay */}
            <View style={styles.participantOverlay}>
                {isMicMuted && (
                    <View style={styles.muteIndicator}>
                        <Feather name="mic-off" size={16} color="white" />
                    </View>
                )}
                {isVideoMuted && (
                    <View style={styles.muteIndicator}>
                        <Feather name="video-off" size={16} color="white" />
                    </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.participantNameOverlay} numberOfLines={1} ellipsizeMode="tail">
                        {displayName}
                    </Text>
                    {/* Show mic icon next to "You" when local user mutes mic */}
                    {isLocal && isMicMuted && (
                        <Feather name="mic-off" size={14} color="rgba(255,255,255,0.8)" />
                    )}
                </View>
            </View>
        </View>
    );
};

/* ================= GROUP CALL VIEW COMPONENT ================= */
const GroupCallView = ({ participants, localStream, localMicStatus, localVideoStatus, reactionsByUser, callType }) => {
    // Debug log to see what participants we're receiving
    useEffect(() => {
        console.log('📊 [GroupCallView] Received participants:', {
            count: participants?.length || 0,
            userIds: participants?.map(p => ({ userId: p.userId, callStatus: p.callStatus, isLocal: p.isLocal, hasStream: !!p.stream })) || [],
        });
    }, [participants]);
    
    // Ensure local participant is first
    const sortedParticipants = useMemo(() => {
        const local = participants.find(p => p.isLocal);
        const remote = participants.filter(p => !p.isLocal);
        return local ? [local, ...remote] : participants;
    }, [participants]);

    const gridPadding = 12;
    const gridGap = 10;
    const tileWidth = (windowWidth - (gridPadding * 2) - gridGap) / 2;
    const tileHeight = tileWidth * 1.35; // taller than wide

    return (
        <FlatList
            data={sortedParticipants}
            keyExtractor={(p) => p.userId?.toString?.() ?? String(p.userId)}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{
                padding: gridPadding,
                paddingTop: gridPadding + 16,
                paddingBottom: 220,
                backgroundColor: 'rgba(70,70,70,0.3)', // Greyish background like 1:1 calls // same in light/dark
            }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
                <ParticipantView
                    participant={item}
                    localMicStatus={localMicStatus}
                    localVideoStatus={localVideoStatus}
                    callType={callType}
                    reactionEmoji={reactionsByUser?.[item?.userId?.toString?.() ?? String(item?.userId)]?.emoji || null}
                    style={{
                        width: tileWidth,
                        height: tileHeight,
                        marginBottom: gridGap,
                    }}
                />
            )}
        />
    );
};

const VideoCall = ({navigation}) => {

    const {
        localStream,
        remoteStream,
        remoteStreamTracksCount, // Use to force re-render when tracks are added
        info,
        endCall,
        socket,
        callPartner,
        micStatus,
        videoStatus,
        remoteMicMuted, // Remote user's producer mute status
        remoteVideoMuted, // Remote user's video producer mute status
        toggleMuteProducer, // Function to pause/resume audio producer
        toggleVideoProducer, // Function to pause/resume video producer
        participantsList, // Array of participants for group calls
        callInfo, // Call information
        addParticipantsToCall, // Function to add members to call
        // Screen share (ReplayKit / getDisplayMedia)
        activeScreenShare,
        isStartingScreenShare,
        startScreenShare,
        stopScreenShare,
    } = useRTC();

    // If call state is already torn down (e.g., remote hung up and endCall() is popping the stack),
    // avoid briefly rendering the 1:1 "Audio Call" fallback with default name.
    if (!info?.callId && !localStream && !remoteStream && (!participantsList || participantsList.length === 0)) {
        return <></>;
    }
    let [video, setVideo] = useState(info?.type=='video');
    let [mic, setMic] = useState(true);
    let [isMenuOpen, setMenuOpen] = useState(false);
    const [name, setName] = useState('OIChat User');
    const [pic, setPic] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [streamsSwapped, setStreamsSwapped] = useState(false); // Track if streams are swapped
    const contacts = useSelector((state) => state.contacts.value.contacts);
    const user = useSelector((state) => state.user.value);
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const [availableRoutes, setAvailableRoutes] = useState({
        speaker: true,
        earpiece: true,
        bluetooth: false,
        wired: false,
      });
      
    const [selectedRoute, setSelectedRoute] = useState('speaker');
    
    // Bottom sheet ref and snap points
    const bottomSheetModalRef = useRef(null);
    const screenPickerRef = useRef(null);
    const screenHeight = Dimensions.get('window').height;
    // Calculate height to reach top edge of pillTop: insets.top + 10 (marginTop) + 44 (icon height) + some padding
    const snapPoints = useMemo(() => {
        const pillTopTopEdge = insets.top + 10 + 44 + 10; // Extra 10 for padding
        const addMembersSnapPoint = ((screenHeight - pillTopTopEdge) / screenHeight * 100).toFixed(0) + '%';
        return ['50%', addMembersSnapPoint];
    }, [insets.top, screenHeight]);
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isAddingMembersToCall, setIsAddingMembersToCall] = useState(false);
    const [emojiPicker, setEmojiPicker] = useState(false);
    // Reactions (server-broadcast) – keyed by userId -> { emoji, ts }
    const [reactionsByUser, setReactionsByUser] = useState({});
    const reactionTimersRef = useRef(new Map()); // Map<userIdStr, timeoutId>

    // IDs currently in the call (joined or invited). Used to disable "+ Add" for those contacts.
    const inCallIdSet = useMemo(() => {
        const s = new Set();
        try {
            if (user?.data?.id != null) s.add(String(user.data.id));
            if (info?.id != null) s.add(String(info.id)); // 1:1 remote partner
            (Array.isArray(info?.participants) ? info.participants : []).forEach((x) => {
                const idStr = x?.toString?.() ?? String(x);
                if (idStr) s.add(idStr);
            });
            (Array.isArray(participantsList) ? participantsList : []).forEach((p) => {
                const idStr = p?.userId?.toString?.() ?? String(p?.userId);
                if (idStr) s.add(idStr);
            });
        } catch {}
        s.delete('');
        s.delete('undefined');
        s.delete('null');
        return s;
    }, [participantsList, info?.id, info?.participants, user?.data?.id]);
      

    useEffect(() => {
        // Force speaker for video calls
        if (info?.type === 'video') {
            try { InCallManager.setForceSpeakerphoneOn(true); } catch {}
        }

        // Reset derived UI state whenever call partner changes (prevents stale group names after group -> 1:1 downgrade)
        setFirstName('');
        setLastName('');
        setPic('');

        // Resolve name: prefer info.name (rtc.js updates this on group -> 1:1 downgrade), otherwise contacts.
        let resolvedName = (info?.name && info.name !== 'Unknown') ? info.name : null;

        let matchedContact = null;
        if (Array.isArray(contacts) && info?.id != null) {
            for (let i of contacts) {
                if (i?.isRegistered && i?.server_info?.id === info.id) {
                    matchedContact = i;
                    break;
                }
            }
        }

        if (!resolvedName && matchedContact?.item) {
            resolvedName = matchedContact.item.name || `${matchedContact.item.firstName || ''} ${matchedContact.item.lastName || ''}`.trim();
        }

        setName(resolvedName || 'OIChat User');

        // Avatar
        if (matchedContact?.server_info?.avatar) {
            setPic(matchedContact.server_info.avatar);
        }

        // Only derive first/last when it looks like a single-person name (avoid parsing group titles like "A & B" / "A, B +1")
        const n = (resolvedName || '').toString();
        const looksLikeGroup = n.includes('&') || n.includes('+') || n.includes(',');
        if (!looksLikeGroup) {
            const parts = n.trim().split(/\s+/).filter(Boolean);
            if (parts.length >= 2) {
                setFirstName(parts[0]);
                setLastName(parts.slice(1).join(' '));
            } else if (matchedContact?.item?.firstName || matchedContact?.item?.lastName) {
                setFirstName(matchedContact.item.firstName || '');
                setLastName(matchedContact.item.lastName || '');
            }
        } else if (matchedContact?.item?.firstName || matchedContact?.item?.lastName) {
            // If we matched a contact, we can still show their first/last even if the resolvedName is a group title.
            setFirstName(matchedContact.item.firstName || '');
            setLastName(matchedContact.item.lastName || '');
        }
    }, [info?.id, info?.name, info?.type, contacts]);

    useEffect(() => {
        // Track status changes
        console.log('📊 [VideoCall] Status update:', { 
            micStatus, 
            remoteMicMuted, 
            videoStatus,
            hasRemoteStream: !!remoteStream,
            remoteStreamId: remoteStream?.id,
            remoteStreamTracksCount,
            remoteVideoTracks: remoteStream?.getVideoTracks()?.length || 0,
            remoteAudioTracks: remoteStream?.getAudioTracks()?.length || 0,
            remoteVideoMuted,
            remoteStreamURL: remoteStream && typeof remoteStream.toURL === 'function' ? remoteStream.toURL() : 'no toURL method'
        });
    }, [micStatus, videoStatus, remoteStream, remoteMicMuted, remoteStreamTracksCount, remoteVideoMuted]);

    // Reaction handling (30s TTL, replace on new reaction per user)
    const callIdForReactions = useMemo(() => (callInfo?.callId || info?.callId || null), [callInfo?.callId, info?.callId]);
    const localUserIdStr = useMemo(() => (user?.data?.id != null ? String(user.data.id) : null), [user?.data?.id]);

    const applyReaction = useCallback(({ userId, emoji, ts }) => {
        const uidStr = userId != null ? String(userId) : null;
        const e = (emoji ?? '').toString();
        if (!uidStr || !e) return;

        // Replace existing timer for this user
        try {
            const prev = reactionTimersRef.current.get(uidStr);
            if (prev) clearTimeout(prev);
        } catch {}

        setReactionsByUser(prev => ({
            ...(prev || {}),
            [uidStr]: { emoji: e, ts: typeof ts === 'number' ? ts : Date.now() },
        }));

        // Remove after 30s
        const t = setTimeout(() => {
            setReactionsByUser(prev => {
                const next = { ...(prev || {}) };
                delete next[uidStr];
                return next;
            });
            try { reactionTimersRef.current.delete(uidStr); } catch {}
        }, 30000);
        reactionTimersRef.current.set(uidStr, t);
    }, []);

    const sendReaction = useCallback((emojiStr) => {
        if (!callIdForReactions || !localUserIdStr) return;
        const e = (emojiStr ?? '').toString();
        if (!e) return;

        // Apply locally immediately
        applyReaction({ userId: localUserIdStr, emoji: e, ts: Date.now() });

        // Broadcast to call participants
        try {
            socket?.emit?.('call-reaction', { callId: callIdForReactions, emoji: e }, () => {});
        } catch {}
    }, [applyReaction, callIdForReactions, localUserIdStr, socket]);

    useEffect(() => {
        if (!socket?.on) return;
        const onReaction = (payload) => {
            if (!payload) return;
            const { callId, userId, emoji, ts } = payload;
            // Only accept reactions for this call
            if (callIdForReactions && callId && String(callId) !== String(callIdForReactions)) return;
            applyReaction({ userId, emoji, ts });
        };
        socket.on('call-reaction', onReaction);
        return () => {
            try { socket.off('call-reaction', onReaction); } catch {}
        };
    }, [socket, applyReaction, callIdForReactions]);

    // Cleanup timers when leaving call / switching calls
    useEffect(() => {
        setReactionsByUser({});
        try {
            reactionTimersRef.current.forEach((t) => clearTimeout(t));
            reactionTimersRef.current.clear();
        } catch {}
    }, [callIdForReactions]);

    // IMPORTANT: must be a boolean (avoid `{isGroupUI && ...}` rendering `0` and crashing with
    // "Text strings must be rendered within a Text component.")
    const isGroupUI =
        !!((participantsList && participantsList.length > 2) ||
        (typeof callInfo?.participantCount === 'number' && callInfo.participantCount > 2));

    // For 1:1 UI, show the most recent reaction (from either user) at top-center below pillTop.
    const latestReactionEmoji = useMemo(() => {
        const entries = Object.entries(reactionsByUser || {});
        if (!entries.length) return null;
        let best = null;
        for (const [, v] of entries) {
            if (!v?.emoji) continue;
            if (!best || (v.ts || 0) > (best.ts || 0)) best = v;
        }
        return best?.emoji || null;
    }, [reactionsByUser]);

    // Focused group-call debug logs (safe to keep during rollout)
    useEffect(() => {
        if (!participantsList || participantsList.length <= 2) return;
        const snapshot = participantsList.map(p => ({
            userId: p.userId,
            name: p.name,
            isLocal: p.isLocal,
            hasStream: !!p.stream,
            videoTracks: p.stream?.getVideoTracks?.()?.length || 0,
            audioTracks: p.stream?.getAudioTracks?.()?.length || 0,
            muted: p.muted,
        }));
        console.log('👥 [VideoCall] Group participants snapshot:', snapshot);
        console.log('🎥 [VideoCall] localStream tracks:', {
            hasLocalStream: !!localStream,
            videoTracks: localStream?.getVideoTracks?.()?.length || 0,
            audioTracks: localStream?.getAudioTracks?.()?.length || 0,
        });
    }, [participantsList, localStream]);

    useEffect(() => {
        probeAudioRoutes();
      
        const interval = setInterval(probeAudioRoutes, 2000); // catch AirPods plug/unplug
        return () => clearInterval(interval);
    }, []);
      

    const probeAudioRoutes = () => {
        const routes = {
          speaker: true,
          earpiece: true,
          bluetooth: false,
          wired: false,
        };
      
        InCallManager.getAudioUri((route) => {
          if (route === 'Bluetooth') routes.bluetooth = true;
          if (route === 'WiredHeadset') routes.wired = true;
      
          // Update selected route from OS
          if (route === 'Speaker') setSelectedRoute('speaker');
          else if (route === 'Bluetooth') setSelectedRoute('bluetooth');
          else setSelectedRoute('earpiece');
        });
      
        setAvailableRoutes(routes);
    };

    const setAudioRoute = (route) => {
        console.log('🔊 Switching audio route to:', route);
      
        if (Platform.OS === 'ios') {
          switch (route) {
            case 'speaker':
              InCallManager.setForceSpeakerphoneOn(true);
              break;
      
            case 'earpiece':
              InCallManager.setForceSpeakerphoneOn(false);
              break;
      
            case 'bluetooth':
              // iOS chooses BT device automatically
              InCallManager.setForceSpeakerphoneOn(false);
              break;
          }
        } else {
          // Android
          switch (route) {
            case 'speaker':
              InCallManager.setSpeakerphoneOn(true);
              break;
            case 'earpiece':
              InCallManager.setSpeakerphoneOn(false);
              break;
            case 'bluetooth':
              InCallManager.chooseAudioRoute('BLUETOOTH');
              break;
          }
        }
      
        setSelectedRoute(route);
    };
      
  
    const handleEndCall = async () => {
        try{
            // Ensure screen share stops when hanging up (in addition to RTC endCall cleanup).
            try {
                await stopScreenShare?.();
            } catch (e) {}

            // CRITICAL: End CallKeep call FIRST (before stopping tracks)
            // This ensures CallKit releases the audio/video session properly
            try {
                const callDataStr = await AsyncStorage.getItem('incomingCallData');
                if (callDataStr) {
                    const callData = JSON.parse(callDataStr);
                    const { uuid } = callData;
                    if (uuid) {
                        RNCallKeep.endCall(uuid);
                        // Wait for CallKit to release session
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            } catch (e) {
                // Error ending CallKeep call
            }
            
            // Stop InCallManager
            try {
                InCallManager.stop();
            } catch (e) {
                // Error stopping InCallManager
            }
            
            // Stop local tracks AFTER CallKeep is ended
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    try {
                        track.stop();
                        track.enabled = false;
                    } catch (e) {
                        // Error stopping track
                    }
                });
            }
            
            // Always call endCall to properly stop all tracks and release camera/mic
            await endCall();
            
            // Navigate back explicitly (endCall should handle this, but ensure it happens)
            // Use static navigation utility instead of navigation prop
            setTimeout(() => {
                navigate('Home');
            }, 200);
        }
        catch(err) {
            // Force cleanup even if there's an error
            try {
                // End CallKeep first
                try {
                    const callDataStr = await AsyncStorage.getItem('incomingCallData');
                    if (callDataStr) {
                        const callData = JSON.parse(callDataStr);
                        if (callData.uuid) {
                            RNCallKeep.endCall(callData.uuid);
                        }
                    }
                } catch (e) {
                    // Error in force CallKeep end
                }
                
                // Stop tracks
                if (localStream) {
                    localStream.getTracks().forEach(track => {
                        try {
                            track.stop();
                            track.enabled = false;
                        } catch (e) {
                            // Error in force stop
                        }
                    });
                }
                InCallManager.stop();
                await endCall();
                navigate('Home');
            } catch (e) {
                // Error in force cleanup
            }
        }
    };
  
    const toggleAudio = async () => {
      // Pause/resume the producer (this stops/starts sending audio to server)
      const newMuteState = await toggleMuteProducer();
      if (newMuteState !== null) {
        // Also update local track enabled state for UI feedback
        localStream?.getAudioTracks().forEach((track) => {
          track.enabled = newMuteState;
        });
        setMic(newMuteState);
      } else {
        // If toggle failed, just toggle local track as fallback
      localStream?.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMic((prev) => !prev);
      }
    };
  
    const toggleVideo = async () => {
      // Pause/resume the video producer (this stops/starts sending video to server)
      const newVideoState = await toggleVideoProducer();
      if (newVideoState !== null) {
        // Also update local track enabled state for UI feedback
        if (localStream) {
          const videoTracks = localStream.getVideoTracks();
          videoTracks.forEach((track) => {
            track.enabled = newVideoState;
          });
        }
        setVideo(newVideoState);
      } else {
        // If toggle failed, just toggle local track as fallback
      if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
      }
      setVideo((prev) => !prev);
      }
    };
    
    const flipCamera = () => {
        localStream?.getVideoTracks().forEach((track) => {
          track._switchCamera();
        });
    };

    // Track render state
    useEffect(() => {
        // Render state tracking
    }, [remoteStream, info?.type]);



    const handleMinimize = () => {
        console.log('📱 Minimize button pressed - PiP mode');
        // Avoid calling startIOSPIP/stopIOSPIP (can crash on some RN bridgeless/UIManager queue paths).
        // We rely on iosPIP.startAutomatically when the app backgrounds.
        Alert.alert('Picture in Picture', 'Swipe up to go Home to start PiP.');
    };

    const handleMenuDots = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index) => {
        console.log('Bottom sheet index:', index);
        // If sheet is closed, reset add-members UI state
        if (index === -1) {
            setShowAddMembers(false);
            setSearchText('');
            setIsAddingMembersToCall(false);
        }
    }, []);

    const handleSendMessage = () => {
        console.log('📱 Send Message pressed');
        bottomSheetModalRef.current?.dismiss();
    };

    const _showReplayKitPicker = () => {
        try {
            const tag = findNodeHandle(screenPickerRef.current);
            if (!tag) return false;
            NativeModules?.ScreenCapturePickerViewManager?.show?.(tag);
            return true;
                            } catch (e) {
            return false;
        }
    };

    const handleShareScreen = async () => {
        try {
            // Must be user-initiated: trigger ReplayKit Broadcast Picker.
            _showReplayKitPicker();
            bottomSheetModalRef.current?.dismiss();
            await startScreenShare();
        } catch (e) {
            console.error('❌ [VideoCall] handleShareScreen failed', e?.message || e);
            Alert.alert('Error', e?.message || 'Failed to start screen sharing');
        }
    };

    const handleStopShareScreen = async () => {
        try {
            bottomSheetModalRef.current?.dismiss();
            await stopScreenShare();
        } catch (e) {
            console.error('❌ [VideoCall] handleStopShareScreen failed', e?.message || e);
        }
    };

    const handleAddMembers = () => {
        console.log('📱 Add Members pressed');
        setShowAddMembers(true);
        // Expand bottom sheet to full height (index 1 = 90%)
        bottomSheetModalRef.current?.snapToIndex(1);
    };

    // Add a single member immediately (what users expect when tapping "+ Add")
    const addSingleToCall = async (contact) => {
        const memberId = contact?.server_info?.id;
        if (!memberId) return;
        if (isAddingMembersToCall) return;
        setIsAddingMembersToCall(true);
        try {
            await addParticipantsToCall([memberId]);
            setShowAddMembers(false);
            setSearchText('');
            bottomSheetModalRef.current?.dismiss();
        } catch (error) {
            console.error('❌ [VideoCall] Error adding single member:', error);
            Alert.alert('Error', 'Failed to add member to call');
        } finally {
            setIsAddingMembersToCall(false);
        }
    };

    const handleCopyLink = () => {
        console.log('📱 Copy Link pressed');
        bottomSheetModalRef.current?.dismiss();
    };

    const handleShareLink = () => {
        console.log('📱 Share Link pressed');
        bottomSheetModalRef.current?.dismiss();
    };

    const toggleStreams = () => {
        setStreamsSwapped(!streamsSwapped);
    };

    // NOTE:
    // We rely on `iosPIP.startAutomatically` / `iosPIP.stopAutomatically` for PiP lifecycle.

    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            {/* Hidden ReplayKit Broadcast Picker host view (required for iOS screen sharing) */}
            <View style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}>
                <ScreenCapturePickerView ref={screenPickerRef} />
            </View>

            {/*Upper Actions - Hangup and Minimize */}
            <View style={styles.pillTop}>
                <TouchableOpacity onPress={handleMinimize}>
                    <Avatar.Icon
                        size={44}
                        style={styles.circle}
                        icon={() => <Feather name="minimize-2" size={22} color="black" />}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEndCall}>
                    <Avatar.Icon 
                        size={44} 
                        style={styles.decline} 
                        icon={() => (
                            <MaterialIcons name="call-end" size={24} color="white" />
                        )} 
                    />
                </TouchableOpacity>
            </View>

            {/* Screen Share (Pinned / Presentation Tile) - show to viewers only (not the presenter).
                1:1 layout handles screen share separately to avoid being covered by absoluteFill RTCViews. */}
            {isGroupUI && !activeScreenShare?.isLocal && !!activeScreenShare?.stream && typeof activeScreenShare.stream?.toURL === 'function' && (
                <View style={{
                    width: windowWidth,
                    alignSelf: 'center',
                    marginTop: 6,
                    marginBottom: 8,
                    borderRadius: 14,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(0,0,0,0.85)',
                }}>
                    <RTCView
                        key={`screenshare-${activeScreenShare?.isLocal ? 'local' : 'remote'}-${activeScreenShare?.userId}-${activeScreenShare?.stream?.id || 's'}`}
                        streamURL={activeScreenShare.stream.toURL()}
                        objectFit="contain"
                        style={{
                            width: windowWidth,
                            height: Math.min(
                                windowHeight * 0.62,
                                windowWidth / (activeScreenShare?.aspectRatio || (16 / 9))
                            ),
                            backgroundColor: 'black',
                        }}
                        zOrder={20}
                        mirror={false}
                    />
                    <View style={{
                        position: 'absolute',
                        left: 10,
                        top: 10,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 14,
                    }}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>Screen share</Text>
                    </View>
                </View>
            )}

            {/*Upper Actions - Video/Audio Content*/}
            {isGroupUI ? (
                <GroupCallView 
                    participants={participantsList} 
                    localStream={localStream}
                    localMicStatus={micStatus}
                    localVideoStatus={videoStatus}
                    reactionsByUser={reactionsByUser}
                    callType={info?.type}
                />
            ) : (
                <>
                    {/* 1:1 Screen Share Layout (viewer only, not the presenter) */}
                    {(!isGroupUI && !activeScreenShare?.isLocal && !!activeScreenShare?.stream && typeof activeScreenShare.stream?.toURL === 'function') ? (
                        (() => {
                            const gridPadding = 12;
                            const gridGap = 10;
                            const tileWidth = (windowWidth - (gridPadding * 2) - gridGap) / 2;
                            const tileHeight = tileWidth * 1.35;

                            const remoteDisplayName = (() => {
                                const full = `${firstName || ''} ${lastName || ''}`.trim();
                                return (full || name || 'Unknown').trim() || 'Unknown';
                            })();

                            const titleBase = remoteDisplayName;
                            const title = (titleBase.endsWith('s') ? `${titleBase}' Screen` : `${titleBase}'s Screen`);

                            const aspect = activeScreenShare?.aspectRatio || (16 / 9);
                            const shareHeight = Math.min(windowHeight * 0.62, windowWidth / aspect);

                            const hasRemoteVideoTrack = !!remoteStream && (remoteStream.getVideoTracks?.()?.length || 0) > 0;
                            const canRenderRemote = !remoteVideoMuted && hasRemoteVideoTrack && typeof remoteStream?.toURL === 'function';

                            return (
                                <View style={{ flex: 1 }}>
                                    {/* Presentation tile */}
                                    <View style={{
                                        width: windowWidth,
                                        alignSelf: 'center',
                                        marginTop: 6,
                                        marginBottom: 12,
                                        borderRadius: 14,
                                        overflow: 'hidden',
                                        backgroundColor: 'rgba(0,0,0,0.85)',
                                    }}>
                                <RTCView
                                            key={`screenshare-1to1-${activeScreenShare?.isLocal ? 'local' : 'remote'}-${activeScreenShare?.userId}-${activeScreenShare?.stream?.id || 's'}`}
                                            streamURL={activeScreenShare.stream.toURL()}
                                            objectFit="contain"
                                            style={{
                                                width: windowWidth,
                                                height: shareHeight,
                                                backgroundColor: 'black',
                                            }}
                                            zOrder={20}
                                            mirror={false}
                                        />
                                        <View style={{
                                            position: 'absolute',
                                            left: 10,
                                            top: 10,
                                            backgroundColor: 'rgba(0,0,0,0.35)',
                                            paddingHorizontal: 10,
                                            paddingVertical: 6,
                                            borderRadius: 14,
                                        }}>
                                            <Text style={{ color: 'white', fontWeight: '700' }}>{title}</Text>
                                        </View>
                                        {/* Viewer-only tile; presenter sees a small status pill near controls instead */}
                                    </View>

                                    {/* Below: remote camera tile (group-like size) */}
                                    <View style={{ paddingHorizontal: gridPadding }}>
                                        <View style={{
                                            width: tileWidth,
                                            height: tileHeight,
                                            borderRadius: 16,
                                            overflow: 'hidden',
                                            backgroundColor: 'rgb(25,25,25)',
                                        }}>
                                            {canRenderRemote ? (
                                                <RTCView
                                                    key={`remote-tile-${remoteStream.id}-${remoteStreamTracksCount}`}
                                                    streamURL={remoteStream.toURL()}
                                    objectFit="cover"
                                    style={StyleSheet.absoluteFill}
                                    zOrder={0}
                                    mirror={false}
                                />
                                            ) : (
                                                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                                                    <Avatar.Text
                                                        size={56}
                                                        label={(remoteDisplayName || 'U').slice(0, 1).toUpperCase()}
                                                        style={{ backgroundColor: 'rgb(60,60,60)' }}
                                                    />
                                                    <Text style={{ color: 'white', marginTop: 8, fontWeight: '700' }} numberOfLines={1}>
                                                        {remoteDisplayName}
                                                    </Text>
                                                    <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                                                        {remoteVideoMuted ? 'Video is off' : 'Connecting…'}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={{
                                                position: 'absolute',
                                                left: 8,
                                                bottom: 8,
                                                backgroundColor: 'rgba(0,0,0,0.35)',
                                                paddingHorizontal: 8,
                                                paddingVertical: 4,
                                                borderRadius: 12,
                                            }}>
                                                <Text style={{ color: 'white', fontWeight: '700' }} numberOfLines={1}>
                                                    {remoteDisplayName}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })()
                    ) : null}

                    {/* 1:1 Reaction (top-center, below pillTop) */}
                    {!!latestReactionEmoji && (
                        <View style={{
                            position: 'absolute',
                            top: insets.top + 10 + 44 + 10,
                            alignSelf: 'center',
                            zIndex: 250,
                            elevation: 250,
                            backgroundColor: 'rgba(0,0,0,0.25)',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 18,
                        }}>
                            <Text style={{ fontSize: 30 }}>{latestReactionEmoji}</Text>
                        </View>
                    )}

                    {/* If screen share is active in 1:1:
                        - viewers: we already rendered the viewer-specific layout above, so skip default 1:1 UI
                        - presenter: keep the normal 1:1 UI (do NOT go black) */}
                    {(!activeScreenShare?.stream || activeScreenShare?.isLocal || isGroupUI) ? (info?.type === 'video' ? (
                        <>
                            {/* existing 1:1 video UI stays as-is below */}
                            {/* ✅ Full Screen Video - Swaps between local and remote based on streamsSwapped state */}
                            {!streamsSwapped ? (
                                <>
                                    {/* Remote video full screen OR fallback */}
                                    {(() => {
                                        const hasRemoteVideoTrack = !!remoteStream && (remoteStream.getVideoTracks?.()?.length || 0) > 0;
                                        const canRenderRemote = !remoteVideoMuted && hasRemoteVideoTrack && typeof remoteStream?.toURL === 'function';

                                        if (canRenderRemote) {
                            return (
                                <RTCView
                                                    key={`remote-${remoteStream.id}-${remoteStreamTracksCount}`}
                                                    streamURL={remoteStream.toURL()}
                                    objectFit="cover"
                                    style={StyleSheet.absoluteFill}
                                    zOrder={0}
                                    mirror={false}
                                />
                            );
                        }

                                        const statusText = remoteVideoMuted ? 'Video is off' : 'Connecting…';
                            return (
                                <View style={[
                                    StyleSheet.absoluteFill, 
                                    { 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        backgroundColor: '#111',
                                        zIndex: 2,
                                        elevation: 2,
                                    }
                                ]}>
                                    <Avatar.Image size={100} source={{ uri: pic || 'https://via.placeholder.com/100' }} />
                                                <Text style={{ color: 'white', marginTop: 12, fontSize: 16 }}>
                                                    {firstName && lastName 
                                                        ? `${firstName} ${lastName}`
                                                        : name}
                                                </Text>
                                                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4, fontSize: 14 }}>{statusText}</Text>
                                </View>
                            );
                    })()}
                                </>
                            ) : (
                                <>
                                    {/* Local video full screen */}
                                    {localStream && (
                                        <>
                                            {video ? (
                                                <RTCView
                                                    streamURL={localStream.toURL()}
                                                    objectFit="cover"
                                                    style={StyleSheet.absoluteFill}
                                                    zOrder={0}
                                                    mirror={true}
                                                />
                                            ) : (
                                                <View style={[
                                                    StyleSheet.absoluteFill, 
                                                    { 
                                                        justifyContent: 'center', 
                                                        alignItems: 'center', 
                                                        backgroundColor: 'rgba(255,255,255,0.5)',
                                                        zIndex: 2,
                                                        elevation: 2,
                                                    }
                                                ]}>
                                                    <Feather name="video-off" size={48} color="#444" />
                                                </View>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                    {/* ✅ Remote mic muted notice at top */}
                            {remoteMicMuted && (
                    <View style={{
                        position: 'absolute',
                        top: insets.top + 10,
                        alignSelf: 'center',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                                    zIndex: 100,
                                    elevation: 100,
                                }}>
                                    <Text style={{ color: 'white', fontSize: 14 }}>
                                        {firstName && lastName 
                                            ? `${firstName} ${lastName} is muted`
                                            : (info?.name || name || 'User') + ' is muted'}
                                    </Text>
                    </View>
                    )}

                            {/* ✅ Small Preview - Swaps between local and remote based on streamsSwapped state */}
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                onPress={() => setStreamsSwapped(!streamsSwapped)}
                                style={{
                        position: 'absolute',
                                    top: insets.top + 10 + 44 + 20,
                        right: 20,
                        width: windowWidth * 0.3,
                        height: windowWidth * 0.45,
                        backgroundColor: '#000',
                        borderRadius: 10,
                        overflow: 'hidden',
                        zIndex: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                                }}
                            >
                                {!streamsSwapped ? (
                                    <>
                                        {/* Local video small preview */}
                        {video ? (
                        <RTCView
                                                streamURL={localStream?.toURL()}
                            objectFit="cover"
                            style={{ width: '100%', height: '100%' }}
                                                mirror={true}
                        />
                        ) : (
                        <View style={{
                            ...StyleSheet.absoluteFillObject,
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Feather name="video-off" size={28} color="#444" />
                        </View>
                        )}

                        {video && !mic && (
                        <View style={{
                            position: 'absolute',
                            bottom: 6,
                            alignSelf: 'center',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: 4,
                            borderRadius: 20,
                        }}>
                            <Feather name="mic-off" size={20} color="white" />
                        </View>
                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Remote video small preview */}
                                        {(() => {
                                            const hasRemoteVideoTrack = !!remoteStream && (remoteStream.getVideoTracks?.()?.length || 0) > 0;
                                            const canRenderRemote = !remoteVideoMuted && hasRemoteVideoTrack && typeof remoteStream?.toURL === 'function';
                                            if (canRenderRemote) {
                                                return (
                                                    <RTCView
                                                        key={`remote-small-${remoteStream.id}-${remoteStreamTracksCount}`}
                                                        streamURL={remoteStream.toURL()}
                                                        objectFit="cover"
                                                        style={{ width: '100%', height: '100%' }}
                                                        mirror={false}
                                                    />
                                                );
                                            }
                                            const statusText = remoteVideoMuted ? 'Video off' : 'Connecting…';
                                            return (
                                                <View style={{
                                                    ...StyleSheet.absoluteFillObject,
                                                    backgroundColor: '#111',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    <Avatar.Image size={60} source={{ uri: pic || 'https://via.placeholder.com/100' }} />
                                                    <Text style={{ color: 'white', marginTop: 8, fontSize: 12 }}>
                                                        {firstName && lastName 
                                                            ? `${firstName} ${lastName}`
                                                            : name}
                                                    </Text>
                                                    <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 2, fontSize: 11 }}>
                                                        {statusText}
                                                    </Text>
                    </View>
                                            );
                                        })()}
                                    </>
                    )}
                            </TouchableOpacity>
                </>
                ) : (
                    <>
                            {/* Audio call fallback (1:1) */}
                        <View style={{ ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(46,49,61)' }}>
                            <Avatar.Image size={100} source={{ uri: pic || 'https://via.placeholder.com/100' }} />
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 20 }}>{name}</Text>
                            <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>Audio Call</Text>
                        </View>
                        </>
                    )) : null}
                    </>
            )}

            {/* Call Controls */}
            <View style={[styles.controlsWrapper, { paddingBottom: insets.bottom + 10 }]}>
                {/* Row above call controls: left = "Screen is being shared" (presenter-only), right = flip camera */}
                {info?.type === 'video' && (
                    <View style={{
                        width: windowWidth * 0.85,
                        alignSelf: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 15,
                    }}>
                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                            {!!activeScreenShare?.isLocal && (
                                <TouchableOpacity
                                    onPress={handleStopShareScreen}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: 'black',
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>Screen is being shared</Text>
                                    <MaterialIcons name="stop" size={16} color="#ff3b30" />
                    </TouchableOpacity>
                )}
                        </View>
                        <View style={{ width: 46, alignItems: 'flex-end' }}>
                            <TouchableOpacity onPress={flipCamera}>
                                <Avatar.Icon 
                                    size={46} 
                                    style={styles.circle} 
                                    icon={() => (
                                        <Ionicons name="camera-reverse-outline" size={26} color="black" />
                                    )} 
                                />
                </TouchableOpacity>
                        </View>
                    </View>
                )}
                <View style={styles.pillBottom}>
                
                {info?.type === 'video' && (
                <TouchableOpacity onPress={toggleVideo}>
                    <Avatar.Icon
                    size={44}
                    style={video ? styles.circle : styles.circle_disabled}
                    icon={() =>
                        video ? (
                        <Ionicons name="videocam-outline" size={24} color="black" />
                        ) : (
                        <Feather name="video-off" size={20} color="white" />
                        )
                    }
                    />
                </TouchableOpacity>
                )}
                <TouchableOpacity onPress={toggleAudio}>
                    <Avatar.Icon
                    size={44}
                    style={mic ? styles.circle : styles.circle_disabled}
                    icon={() =>
                        mic ? (
                        <Feather name="mic" size={20} color="black" />
                        ) : (
                        <Feather name="mic-off" size={20} color="white" />
                        )
                    }
                    />
                </TouchableOpacity>

                {/* {info?.type === 'video' && (
                    <TouchableOpacity onPress={flipCamera}>
                    <Avatar.Icon size={44} style={styles.circle} icon={() => (
                        <Ionicons name="camera-reverse-outline" size={24} color="black" />
                    )} />
                    </TouchableOpacity>
                )} */}
                <MenuView
                    title="Audio Output"
                    onPressAction={({ nativeEvent }) => {
                        setAudioRoute(nativeEvent.event);
                    }}
                    actions={[
                        availableRoutes.earpiece && {
                        id: 'earpiece',
                        title: 'Phone',
                        state: selectedRoute === 'earpiece' ? 'on' : 'off',
                        },
                        availableRoutes.speaker && {
                        id: 'speaker',
                        title: 'Speaker',
                        state: selectedRoute === 'speaker' ? 'on' : 'off',
                        },
                        availableRoutes.bluetooth && {
                        id: 'bluetooth',
                        title: 'Bluetooth',
                        state: selectedRoute === 'bluetooth' ? 'on' : 'off',
                        },
                        availableRoutes.wired && {
                        id: 'wired',
                        title: 'Headphones',
                        state: selectedRoute === 'wired' ? 'on' : 'off',
                        },
                    ].filter(Boolean)}
                >
                    <TouchableOpacity>
                        <Avatar.Icon
                        size={44}
                        style={styles.circle}
                        icon={() => <Feather name="volume-2" size={22} color="black" />}
                        />
                    </TouchableOpacity>
                </MenuView>

                <TouchableOpacity onPress={() => setEmojiPicker(true)}>
                    <Avatar.Icon
                    size={44}
                    style={styles.circle}
                    icon={() =>
                        <MaterialCommunityIcons name="emoticon-plus" size={24} color="black" />
                    }
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleMenuDots}>
                    <Avatar.Icon 
                        size={44} 
                        style={styles.circle} 
                        icon={() => (
                            <Entypo name="dots-three-horizontal" size={24} color="black" />
                        )} 
                    />
                </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Sheet Modal for Three Dots Menu */}
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                containerStyle={{zIndex: 10, elevation: 10}}
                backgroundStyle={{backgroundColor: colorScheme === 'light' ? 'rgb(240,240,240)' : 'rgb(51,54,67)'}}
                handleIndicatorStyle={{backgroundColor: colorScheme === 'light' ? 'black' : 'white'}}
            >
                <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 20 }}>
                    {!showAddMembers ? (
                        <>
                            <TouchableOpacity style={styles.menuOption} onPress={handleSendMessage}>
                                <View style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 20,
                                    backgroundColor: colorScheme === 'light' ? 'rgb(233,238,237)' : 'rgb(79,85,113)',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Ionicons name="chatbubble-outline" size={26} color={colorScheme === 'light' ? 'rgb(182,186,185)' : 'white'} />
                                </View>
                                <Text style={{...styles.option, color: colorScheme === 'dark' ? 'white' : 'black'}}>Send Message</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuOption}
                                onPress={() => {
                                    // Single active screen share per call.
                                    if (activeScreenShare?.stream && !activeScreenShare?.isLocal) {
                                        Alert.alert(
                                            'Screen Sharing Unavailable',
                                            'Someone else is already sharing their screen. Ask them to stop, then you can share.'
                                        );
                                        return;
                                    }
                                    if (activeScreenShare?.isLocal) {
                                        handleStopShareScreen();
                                    } else {
                                        handleShareScreen();
                                    }
                                }}
                                disabled={isStartingScreenShare}
                            >
                                <View style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 20,
                                    backgroundColor: colorScheme === 'light' ? 'rgb(233,238,237)' : 'rgb(79,85,113)',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <MaterialIcons name="screen-share" size={26} color={colorScheme === 'light' ? 'rgb(182,186,185)' : 'white'} />
                                </View>
                                <Text style={{...styles.option, color: colorScheme === 'dark' ? 'white' : 'black'}}>
                                    {activeScreenShare?.stream && !activeScreenShare?.isLocal
                                        ? 'Share Screen'
                                        : (activeScreenShare?.isLocal
                                            ? 'Stop Screen Share'
                                            : (isStartingScreenShare ? 'Starting…' : 'Share Screen'))}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuOption} onPress={handleAddMembers}>
                                <View style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 20,
                                    backgroundColor: colorScheme === 'light' ? 'rgb(233,238,237)' : 'rgb(79,85,113)',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Ionicons name="person-add-outline" size={26} color={colorScheme === 'light' ? 'rgb(182,186,185)' : 'white'} />
                                </View>
                                <Text style={{...styles.option, color: colorScheme === 'dark' ? 'white' : 'black'}}>Add Members</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuOption} onPress={handleCopyLink}>
                                <View style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 20,
                                    backgroundColor: colorScheme === 'light' ? 'rgb(233,238,237)' : 'rgb(79,85,113)',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Ionicons name="copy-outline" size={26} color={colorScheme === 'light' ? 'rgb(182,186,185)' : 'white'} />
                                </View>
                                <Text style={{...styles.option, color: colorScheme === 'dark' ? 'white' : 'black'}}>Copy Link</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuOption} onPress={handleShareLink}>
                                <View style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 20,
                                    backgroundColor: colorScheme === 'light' ? 'rgb(233,238,237)' : 'rgb(79,85,113)',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Ionicons name="share-outline" size={26} color={colorScheme === 'light' ? 'rgb(182,186,185)' : 'white'} />
                                </View>
                                <Text style={{...styles.option, color: colorScheme === 'dark' ? 'white' : 'black'}}>Share Link</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* Add Members View */}
                            <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 25 }}>
                                <Text style={{ fontSize: 22, fontWeight: 'bold', color: colorScheme === 'dark' ? 'white' : 'black' }}>Add Members</Text>
                            </View>

                            <TextInput
                                style={{
                                    height: 40,
                                    borderRadius: 8,
                                    backgroundColor: colorScheme === 'light' ? 'rgb(228,229,231)' : '#1c1c1c',
                                    paddingHorizontal: 15,
                                    marginBottom: 15,
                                    color: colorScheme === 'light' ? 'black' : 'white',
                                }}
                                placeholder="Search contacts"
                                placeholderTextColor={colorScheme === 'light' ? 'rgb(120,134,142)' : 'rgba(255,255,255,0.5)'}
                                onChangeText={(text) => setSearchText(text)}
                                value={searchText}
                            />

                            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                                {contacts
                                    .filter(contact => 
                                        contact.isRegistered && 
                                        // Exclude current user by ID
                                        contact.server_info?.id !== user?.data?.id &&
                                        // Exclude current user by phone number (if they have their own number saved)
                                        contact.server_info?.phone !== user?.data?.phone &&
                                        (!searchText || contact.item?.name?.toLowerCase().includes(searchText.toLowerCase()))
                                    )
                                    .map((contact, index) => {
                                        const contactIdStr = contact?.server_info?.id?.toString?.() ?? String(contact?.server_info?.id);
                                        const isInCall = !!contactIdStr && inCallIdSet.has(contactIdStr);
                                        const disabledRow = isAddingMembersToCall || isInCall;
                                        return (
                                            <Pressable
                                                key={index}
                                                style={styles.contactItemAdd}
                                                disabled={disabledRow}
                                                onPress={() => {
                                                    if (disabledRow) return;
                                                    addSingleToCall(contact);
                                                }}
                                            >
                                                <View style={styles.contactItemContent}>
                                                    <View style={{ height: 50, width: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: 'rgb(146,146,143)' }}>
                                                        <Image style={{ width: '100%', height: '100%', resizeMode: 'cover' }} source={{ uri: contact.server_info?.avatar }} />
                                                    </View>
                                                    <View style={{ flexDirection: 'column', marginHorizontal: 20, justifyContent: 'space-evenly', flex: 1, overflow: 'hidden' }}>
                                                        <Text style={{ color: colorScheme === 'light' ? 'black' : 'white', fontWeight: 'bold', fontSize: 15 }} numberOfLines={1}>
                                                            {contact.item?.name}
                                                        </Text>
                                                        <Text style={{ color: 'grey', fontSize: 13 }} numberOfLines={1}>
                                                            {contact.server_info?.bio || ''}
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            if (disabledRow) return;
                                                            addSingleToCall(contact);
                                                        }}
                                                        style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                                                        disabled={disabledRow}
                                                    >
                                                        {isInCall ? (
                                                            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, fontStyle: 'italic' }}>
                                                                In Call
                                                            </Text>
                                                        ) : (
                                                            <Text style={{ color: isAddingMembersToCall ? 'grey' : 'rgb(251,138,57)', fontSize: 14, fontWeight: '500' }}>
                                                                {isAddingMembersToCall ? 'Adding…' : '+ Add'}
                                                            </Text>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                            </ScrollView>
                        </>
                    )}
                </BottomSheetView>
            </BottomSheetModal>

            {/* Emoji Picker */}
            <EmojiPicker 
                open={emojiPicker} 
                onClose={() => setEmojiPicker(false)} 
                onEmojiSelected={(emoji) => {
                    console.log('📱 Emoji selected:', emoji.emoji);
                    setEmojiPicker(false);
                    // Broadcast to everyone (and show locally) for 30s.
                    sendReaction(emoji.emoji);
                }}
                enableSearchBar
                enableRecentlyUsed
                theme={colorScheme === 'light' ? {} : {
                    backdrop: '#16161888',
                    knob: '#766dfc',
                    container: '#282829',
                    header: '#fff',
                    skinToneContainer: '#1c1c1e',
                    category: {
                        icon: '#fff',
                        iconActive: '#766dfc',
                        container: '#1c1c1e',
                        containerActive: '#766dfc',
                    },
                    search: {
                        text: '#fff',
                        placeholder: '#ffffff2c',
                        icon: '#fff',
                        background: '#00000011',
                    }
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header:{
        marginVertical:20,
        width:'100%',
        paddingHorizontal:20,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    container:{
        height:windowWidth*0.4,
        width:windowWidth*0.25,
        borderRadius:10,
        overflow:'hidden',
        justifyContent:'flex-end',
        alignItems:'center'
    },
    circle:{
        backgroundColor:'rgba(255,255,255,0.6)',
    },
    circle_disabled:{
        backgroundColor:'rgb(246,137,68)'
    },
    decline:{
        backgroundColor:'rgb(222,39,81)'
    },
    box:{
        flexDirection:'row',
        borderTopLeftRadius:10,
        borderBottomLeftRadius:10,
        padding:10,
        marginVertical:20,
        backgroundColor:'rgba(255,255,255,0.3)',
        alignSelf:'flex-end',

    },
    pillTop: {
        width: '92%',
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        alignSelf: 'center',
        elevation: 4,
        zIndex: 4,
        marginTop: 10,
        marginBottom: 14,
    },
    pillBottom: {
        width: '85%',
        borderRadius: 30,
        paddingHorizontal: 14,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignSelf: 'center',
        elevation: 4,
        zIndex: 4,
    },
    controlsWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 6,
        alignItems: 'center',
    },
    video:{
        position:'absolute',
        width:'100%',
        height:'100%',
        elevation:2,
        zIndex:2,
        flex:1
    },
    localVideo:{
        width:'100%',
        height:'100%',
        position:'absolute',
        elevation:3,
        zIndex:3,
        alignItems:'center',
        justifyContent:'flex-end'
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    option: {
        marginLeft: 15,
        fontSize: 16,
        fontWeight: '500',
    },
    contactItemAdd: {
        marginVertical: 8,
        width: '100%',
    },
    contactItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    participantContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(70,70,70,0.3)', // Greyish background like 1:1 calls
    },
    videoOffFallback: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(70,70,70,0.3)', // Greyish background like 1:1 calls
    },
    participantNameFallback: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '700',
        color: 'white',
        maxWidth: '90%',
        textAlign: 'center',
    },
    participantStatusText: {
        marginTop: 6,
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.75)',
        maxWidth: '90%',
        textAlign: 'center',
    },
    participantOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    muteIndicator: {
        marginRight: 6,
    },
    participantNameOverlay: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
})

export default VideoCall

