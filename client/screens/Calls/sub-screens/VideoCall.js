import React, {useState,useRef,useEffect, useCallback, useMemo} from 'react'
import {View,Text, StyleSheet, ImageBackground, TouchableOpacity,Dimensions, Alert, SafeAreaView, Animated, PanResponder, ActivityIndicator, Platform, useColorScheme, TextInput, ScrollView, Image, Pressable} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Avatar } from 'react-native-paper';
import {useSelector} from 'react-redux';
import {RTCView, mediaDevices} from 'react-native-webrtc'
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
        toggleVideoProducer // Function to pause/resume video producer
    } = useRTC();
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
    const screenHeight = Dimensions.get('window').height;
    // Calculate height to reach top edge of pillTop: insets.top + 10 (marginTop) + 44 (icon height) + some padding
    const snapPoints = useMemo(() => {
        const pillTopTopEdge = insets.top + 10 + 44 + 10; // Extra 10 for padding
        const addMembersSnapPoint = ((screenHeight - pillTopTopEdge) / screenHeight * 100).toFixed(0) + '%';
        return ['50%', addMembersSnapPoint];
    }, [insets.top, screenHeight]);
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [searchText, setSearchText] = useState('');
    // Track which contacts are being added - same structure as NewCall.js selected array
    const [addingMembers, setAddingMembers] = useState([]); // Array of {name, id, phone} objects
    const [emojiPicker, setEmojiPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState(null); // Store the selected emoji
      

    useEffect(() => {

        // Force speaker for video calls
        if (info?.type === 'video') {
            console.log('...We Here....\n\n');
            InCallManager.setForceSpeakerphoneOn(true);
        }

        // Prioritize name from info (set from VoIP push or incoming-call event)
        if (info?.name && info.name !== 'Unknown') {
            setName(info.name);
            // Try to extract firstName and lastName from info.name if available
            const nameParts = info.name.split(' ');
            if (nameParts.length >= 2) {
                setFirstName(nameParts[0]);
                setLastName(nameParts.slice(1).join(' '));
            }
        }

        // Also check contacts for additional info (avatar, etc.)
        if (Array.isArray(contacts)) {
            for (let i of contacts) {
                if (i.isRegistered && i.server_info.id === info.id) {
                    // Use name from info if available, otherwise use contact name
                    if (!info?.name || info.name === 'Unknown') {
                    setName(i.item.name);
                    }
                    setPic(i.server_info.avatar);
                    // Get firstName and lastName from contacts if not already set
                    if (!firstName && !lastName) {
                        setFirstName(i.item.firstName || '');
                        setLastName(i.item.lastName || '');
                    }
                }
            }
        }

        return () => {
            // Optional: stop tracks here again just in case
            // if (localStream) {
            //   localStream.getTracks().forEach(track => track.stop());
            // }
        };
    }, []);

    useEffect(() => {
        // Track status changes
        console.log('📊 [VideoCall] Status update:', { micStatus, remoteMicMuted, videoStatus });
    }, [micStatus, videoStatus, remoteStream, remoteMicMuted]);

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
        // PiP functionality - to be implemented
    };

    const handleMenuDots = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index) => {
        console.log('Bottom sheet index:', index);
    }, []);

    const handleSendMessage = () => {
        console.log('📱 Send Message pressed');
        bottomSheetModalRef.current?.dismiss();
    };

    const handleShareScreen = () => {
        console.log('📱 Share Screen pressed');
        bottomSheetModalRef.current?.dismiss();
    };

    const handleAddMembers = () => {
        console.log('📱 Add Members pressed');
        setShowAddMembers(true);
        // Expand bottom sheet to full height (index 1 = 90%)
        bottomSheetModalRef.current?.snapToIndex(1);
    };

    const handleAddContact = (contact) => {
        // Same logic as NewCall.js ContactItem handleSelection
        const existingObj = addingMembers.find(i => i.id === contact.server_info.id);
        if (existingObj) {
            // Remove from array if already selected
            setAddingMembers(prev => prev.filter(i => i.id !== contact.server_info.id));
        } else {
            // Add to array with same structure as NewCall.js: {name, id, phone}
            setAddingMembers(prev => [...prev, {
                name: contact.item.name,
                id: contact.server_info.id,
                phone: contact.server_info.phone
            }]);
        }
    };

    // Function to add members to call - similar to NewCall.js handleCall
    // Commented out for now, will be implemented later with rtc.js changes
    const addToCall = async () => {
        // Collect all IDs from addingMembers array (similar to selected in NewCall.js)
        const memberIds = addingMembers.map(member => member.id);
        
        // TODO: Implement actual add to call logic with rtc.js
        // This will likely involve:
        // 1. API call to add members to the call
        // 2. Update Mediasoup transports/producers/consumers
        // 3. Notify other participants
        
        console.log('📱 Adding members to call:', memberIds);
        console.log('📱 Member details:', addingMembers);
        
        // Example structure (commented out):
        /*
        try {
            let reply = await fetch('http://216.126.78.3:8500/api/add_to_call', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    callId: info?.callId, // Current call ID
                    memberIds: memberIds // Array of user IDs to add
                })
            });
            let response = await reply.json();
            
            if (response.success) {
                // Handle successful addition
                // Update RTC context, add transports, etc.
                setAddingMembers([]); // Clear selection
                setShowAddMembers(false);
                bottomSheetModalRef.current?.snapToIndex(0);
            } else {
                console.log('Error adding members to call...\n\n');
            }
        } catch (err) {
            console.log('Error adding members to call: ', err);
        }
        */
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

    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>

            {/*Upper Actions - Hangup and Minimize */}
            <View style={{...styles.pillTop, backgroundColor:'transparent'}}>
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

            {/*Upper Actions - Video/Audio Content*/}
            {info?.type === 'video' ? (
                <>
                    {/* ✅ Full Screen Video - Swaps between local and remote based on streamsSwapped state */}
                    {!streamsSwapped ? (
                        <>
                            {/* Remote video full screen OR avatar fallback */}
                            {!remoteVideoMuted && remoteStream && typeof remoteStream?.toURL === 'function' && (
                                <RTCView
                                    key={`remote-${remoteStream.id}-${remoteStreamTracksCount}`}
                                    streamURL={remoteStream.toURL()}
                                    objectFit="cover"
                                    style={StyleSheet.absoluteFill}
                                    zOrder={0}
                                    mirror={false}
                                />
                            )}
                            {/* Show fallback if remoteVideoMuted is true */}
                            {remoteVideoMuted && (
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
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4, fontSize: 14 }}>Video is off</Text>
                                </View>
                            )}
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
                                    {/* Emoji display at top center */}
                                    {selectedEmoji && (
                                        <View style={{
                                            position: 'absolute',
                                            top: insets.top + 20,
                                            alignSelf: 'center',
                                            zIndex: 200,
                                            elevation: 200,
                                        }}>
                                            <Avatar.Icon
                                                size={45}
                                                icon={() => <Text style={{ fontSize: 30 }}>{selectedEmoji}</Text>}
                                                style={{ backgroundColor: 'transparent' }}
                                            />
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
                            top: insets.top + 10 + 44 + 20, // insets.top + pillTop marginTop (10) + icon height (44) + gap (10)
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

                                {/* Emoji display at top center of small preview */}
                                {selectedEmoji && (
                                    <View style={{
                                        position: 'absolute',
                                        top: 8,
                                        alignSelf: 'center',
                                        zIndex: 200,
                                        elevation: 200,
                                    }}>
                                        <Avatar.Icon
                                            size={40}
                                            icon={() => <Text style={{ fontSize: 30 }}>{selectedEmoji}</Text>}
                                            style={{ backgroundColor: 'transparent' }}
                                        />
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
                                {!remoteVideoMuted && remoteStream && typeof remoteStream?.toURL === 'function' ? (
                                    <RTCView
                                        streamURL={remoteStream.toURL()}
                                        objectFit="cover"
                                        style={{ width: '100%', height: '100%' }}
                                        mirror={false}
                                    />
                                ) : (
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
                    </View>
                    )}
                            </>
                        )}
                    </TouchableOpacity>

                </>
                ) : (
                    <>
                        {/* Audio call fallback */}
                        <View style={{ ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(46,49,61)' }}>
                            <Avatar.Image size={100} source={{ uri: pic || 'https://via.placeholder.com/100' }} />
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 20 }}>{name}</Text>
                            <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>Audio Call</Text>
                        </View>
                    </>
            )}

            {/* Call Controls */}
            <View style={{ justifyContent: 'flex-end', paddingBottom: insets.bottom, flex: 1 }}>
                {/* Flip Camera Button - Above Call Controls */}
                {info?.type === 'video' && (
                    <View style={{ alignSelf: 'flex-end', marginRight: (windowWidth - windowWidth * 0.85) / 2, marginBottom: 15 }}>
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
                )}
                <View style={styles.pillBottom}>
                
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

                            <TouchableOpacity style={styles.menuOption} onPress={handleShareScreen}>
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
                                <Text style={{...styles.option, color: colorScheme === 'dark' ? 'white' : 'black'}}>Share Screen</Text>
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
                                        // Exclude call partner (the other person already in the call)
                                        contact.server_info?.id !== info?.id &&
                                        (!searchText || contact.item?.name?.toLowerCase().includes(searchText.toLowerCase()))
                                    )
                                    .map((contact, index) => {
                                        const isAdding = addingMembers.find(i => i.id === contact.server_info.id);
                                        return (
                                            <Pressable
                                                key={index}
                                                style={styles.contactItemAdd}
                                                onPress={() => handleAddContact(contact)}
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
                                                        onPress={() => handleAddContact(contact)}
                                                        style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                                                    >
                                                        <Text style={{ color: isAdding ? 'grey' : 'rgb(251,138,57)', fontSize: 14, fontWeight: '500' }}>
                                                            {isAdding ? 'Adding...' : '+ Add'}
                                                        </Text>
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
                    setSelectedEmoji(emoji.emoji);
                    setEmojiPicker(false);
                    // Auto-hide emoji after 3 seconds
                    setTimeout(() => {
                        setSelectedEmoji(null);
                    }, 3000);
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
        width: '85%',
        borderRadius: 30,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignSelf: 'center',
        elevation: 4,
        zIndex: 4,
        marginTop: 10,
    },
    pillBottom: {
        width: '85%',
        borderRadius: 30,
        paddingHorizontal: 10,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignSelf: 'center',
        elevation: 4,
        zIndex: 4,
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
})

export default VideoCall

