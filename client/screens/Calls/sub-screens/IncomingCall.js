import React, {useState,useRef,useEffect} from 'react'
import {View,Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView,Dimensions,Animated} from 'react-native';
import { Avatar } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {RTCSessionDescription, RTCView, mediaDevices} from 'react-native-webrtc'
import { useRTC } from '../../../context/rtc';
import Video from 'react-native-video';
import { useSelector } from 'react-redux';
import InCallManager from 'react-native-incall-manager';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const topMargin = windowHeight*0.2;

export const IncomingCall = () => {
  const {
    setCall,
    setType,
    setInfo,
    endCall, 
    info,
    localStream,
    processAccept
  } = useRTC();

  const { contacts } = useSelector((state) => state.contacts.value);
  const [name, setName] = useState('OIChat User');
  const [pic, setPic] = useState('');

  useEffect(() => {
    InCallManager.startRingtone('_DEFAULT_');

    for (let i of contacts) {
      if (i.isRegistered && i.server_info.id === info.id) {
        setName(i.item.name);
        setPic(i.server_info.avatar);
      }
    }
  }, []);

  const handleEndCall = async () => {
    try {
        InCallManager.stopRingtone();
      // endCall() will handle server notification
      await endCall();
    } catch (err) {
      console.error('❌ Error in handleEndCall:', err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'rgb(46,49,61)' }}>
      {/* Show preview if video */}
      {info?.type === 'video' && localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          objectFit="cover"
          style={styles.video1}
        />
      )}

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerPill}>
          <Avatar.Image size={60} style={{ backgroundColor: 'white' }} source={{ uri: pic }} />
          <View style={{ marginHorizontal: 10 }}>
            <Text style={{ fontSize: 15, color: 'white', letterSpacing: 1, marginVertical: 5 }}>Mobile</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 19, fontWeight: 'bold', color: 'white' }}>{name}</Text>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginVertical: 20 }}>
          <Avatar.Icon size={50} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} icon={() => <Ionicons name={info.type === 'audio' ? "call-outline" : "videocam-outline"} size={24} color="white" />} />
          <Text style={{ fontWeight: 'bold', fontSize: 17, marginVertical: 10, color: 'white' }}>{info.type === 'audio' ? 'Audio' : 'Video'} Call</Text>
        </View>

        <View style={{ marginBottom: 30, width: '80%', alignSelf: 'center' }}>
          <View style={styles.options}>
            <TouchableOpacity><Avatar.Icon size={60} style={{ backgroundColor: 'white' }} icon={() => <Feather name="clock" size={30} color="black" />} /></TouchableOpacity>
            <TouchableOpacity><Avatar.Icon size={60} style={{ backgroundColor: 'white' }} icon={() => <MaterialCommunityIcons name="chat-outline" size={34} color="black" />} /></TouchableOpacity>
          </View>
          <View style={styles.options}>
            <TouchableOpacity onPress={processAccept}><Avatar.Icon size={60} style={{ backgroundColor: 'rgb(99, 197, 93)' }} icon={() => <MaterialIcons name="call" size={30} color="white" />} /></TouchableOpacity>
            <TouchableOpacity onPress={handleEndCall}><Avatar.Icon size={60} style={{ backgroundColor: 'rgb(208,56,81)' }} icon={() => <MaterialCommunityIcons name="phone-hangup" size={30} color="white" />} /></TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export const OutgoingCall = (props) => {

    let {type, video, mic, navigation} = props
    let {localStream, info, setCall, setType, endCall, toggleVideo: toggleVideoRTC, toggleAudio: toggleAudioRTC, videoStatus, micStatus, sendTransport, recvTransport} = useRTC();
    let {contacts} = useSelector(state=>state.contacts.value);
    let [name,setName] = useState('');
    const [pic, setPic] = useState(''); // Profile picture of the person being called
    const [isSpeakerOn, setIsSpeakerOn] = useState(false); // Default to earpiece (false)
    
    // Track video and mic state - sync with RTC context status
    const [videoEnabled, setVideoEnabled] = useState(info?.type === 'video');
    const [micEnabled, setMicEnabled] = useState(true);
    
    // Sync with RTC context status
    useEffect(() => {
        if (videoStatus !== undefined) {
            setVideoEnabled(videoStatus);
        }
    }, [videoStatus]);
    
    useEffect(() => {
        if (micStatus !== undefined) {
            setMicEnabled(micStatus);
        }
    }, [micStatus]);
    
    // Initialize state based on call type
    useEffect(() => {
        if (info?.type) {
            setVideoEnabled(info.type === 'video');
            setMicEnabled(true);
        }
    }, [info?.type]);

    // Debug logging for video stream
    useEffect(() => {
        console.log('🎥 OutgoingCall - Stream Debug:', {
            hasLocalStream: !!localStream,
            infoType: info?.type,
            isVideo: info?.type === 'video',
            shouldRender: info?.type === 'video' && localStream,
            streamURL: localStream ? (localStream.toURL ? localStream.toURL() : 'no toURL method') : 'no stream',
            videoTracks: localStream ? localStream.getVideoTracks().length : 0,
            audioTracks: localStream ? localStream.getAudioTracks().length : 0,
        });
    }, [localStream, info]);

    useEffect(()=>{

        for(let i of contacts){
            if(i.isRegistered){
                if(i.server_info.id==info.id){
                    console.log(i,'sniper...\n\n')
                    setName(i.item.name);
                    setPic(i.server_info.avatar || ''); // Get profile picture
                }
            }
        }

    },[info?.id, contacts])

    // Set default to earpiece (not speaker) when outgoing call starts
    useEffect(() => {
        if (info?.type) {
            // Default to earpiece for outgoing calls
            try {
                InCallManager.setForceSpeakerphoneOn(false);
                setIsSpeakerOn(false);
                console.log('🔇 Default set to earpiece for outgoing call');
            } catch (e) {
                console.warn('⚠️ Error setting default speaker mode:', e);
            }
        }
    }, [info?.type])

    useEffect(()=>{
        console.log('Transport connection states:', {
            sendTransportState: {
                connectionState: sendTransport.current?.connectionState,
                iceGatheringState: sendTransport.current?.iceGatheringState,
                direction: sendTransport.current?.direction,
            },
            recvTransportState: {
                connectionState: recvTransport.current?.connectionState,
                iceGatheringState: recvTransport.current?.iceGatheringState,
                direction: recvTransport.current?.direction,
            }
        });
    },[sendTransport.current?.connectionState, recvTransport.current?.connectionState])
    

    async function handleEndCall(){
        try {
            console.log('📴 OutgoingCall - handleEndCall called');
            
            // Call endCall which will properly stop all tracks and notify server
            await endCall();
        } catch (err) {
            console.error('❌ Error in handleEndCall:', err);
            // Force cleanup even if there's an error
            try {
                await endCall();
            } catch (e) {
                console.error('❌ Error in force cleanup:', e);
            }
        }
    }
    async function toggleSpeaker(){
        try {
            const newSpeakerState = !isSpeakerOn;
            InCallManager.setForceSpeakerphoneOn(newSpeakerState);
            setIsSpeakerOn(newSpeakerState);
            console.log(`🔊 Speaker ${newSpeakerState ? 'ON' : 'OFF'} (earpiece)`);
        } catch (e) {
            console.error('❌ Error toggling speaker:', e);
        }
    }
    async function toggleAudio(){
        try {
            if (toggleAudioRTC) {
                await toggleAudioRTC();
                // State will be updated via useEffect that syncs with micStatus from RTC context
            } else {
                // Fallback: just toggle local track if RTC function not available
                localStream?.getAudioTracks().forEach((track) => {
                    track.enabled = !track.enabled;
                });
                setMicEnabled(prev => !prev);
            }
        } catch (e) {
            console.error('❌ Error in toggleAudio:', e);
        }
    }
    
    async function toggleVideo(){
        try {
            if (toggleVideoRTC) {
                await toggleVideoRTC();
                // State will be updated via useEffect that syncs with videoStatus from RTC context
            } else {
                // Fallback: just toggle local track if RTC function not available
                localStream?.getVideoTracks().forEach((track) => {
                    track.enabled = !track.enabled;
                });
                setVideoEnabled(prev => !prev);
            }
        } catch (e) {
            console.error('❌ Error in toggleVideo:', e);
        }
    }
    
    async function flipCamera(){
        try {
            localStream?.getVideoTracks().forEach((track) => {
                track._switchCamera();
            });
        } catch (e) {
            console.error('❌ Error flipping camera:', e);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'rgb(46,49,61)' }}>

            {/* Render video or profile picture based on video state */}
            {(() => {
                // Determine if video is actually enabled (for video calls)
                const videoTrack = localStream?.getVideoTracks()[0];
                const isVideoActuallyEnabled = info?.type === 'video' && videoEnabled && videoTrack?.enabled;
                
                return info?.type === 'video' && localStream && (() => {
                
                // If video is disabled, show profile picture (WhatsApp style)
                if (!isVideoActuallyEnabled) {
                    return (
                        <View style={[styles.video1, {justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(46,49,61)'}]}>
                            <Avatar.Image 
                                size={120} 
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 }} 
                                source={{ uri: pic || 'https://via.placeholder.com/120' }} 
                            />
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{
                                    fontSize: 24,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    marginBottom: 8,
                                }}
                            >
                                {name || 'OIChat User'}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: 'rgba(255,255,255,0.7)',
                                }}
                            >
                                Calling...
                            </Text>
                        </View>
                    );
                }
                
                // Video is enabled - show RTCView
                // In react-native-webrtc, toURL() returns the stream ID which RTCView uses
                let streamURL = null;
                try {
                    if (typeof localStream.toURL === 'function') {
                        streamURL = localStream.toURL();
                    } else if (localStream.id) {
                        streamURL = localStream.id;
                    }
                } catch (e) {
                    console.error('❌ Error getting stream URL:', e);
                }
                
                // Ensure stream has active video tracks
                const videoTracks = localStream.getVideoTracks();
                const hasActiveVideo = videoTracks.length > 0 && videoTracks[0].readyState === 'live';
                
                if (streamURL && hasActiveVideo) {
                    return (
                <RTCView
                            key={`stream-${streamURL}`}
                            streamURL={streamURL}
                objectFit="cover"
                style={styles.video1}
                            zOrder={0}
                            mirror={true}
                        />
                    );
                } else {
                    // Fallback if video track exists but not ready - show profile picture
                    return (
                        <View style={[styles.video1, {justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(46,49,61)'}]}>
                            <Avatar.Image 
                                size={120} 
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 }} 
                                source={{ uri: pic || 'https://via.placeholder.com/120' }} 
                            />
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{
                                    fontSize: 24,
                                    fontWeight: 'bold',
                                    color: 'white',
                                    marginBottom: 8,
                                }}
                            >
                                {name || 'OIChat User'}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: 'rgba(255,255,255,0.7)',
                                }}
                            >
                                Calling...
                            </Text>
                        </View>
                    );
                }
                })();
            })()}
            
            {/* For audio calls, always show profile picture */}
            {info?.type === 'audio' && (
                <View style={[styles.video1, {justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(46,49,61)'}]}>
                    <Avatar.Image 
                        size={120} 
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 }} 
                        source={{ uri: pic || 'https://via.placeholder.com/120' }} 
                    />
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: 8,
                        }}
                    >
                        {name || 'OIChat User'}
                    </Text>
                    <Text
                        style={{
                            fontSize: 16,
                            color: 'rgba(255,255,255,0.7)',
                        }}
                    >
                        Calling...
                    </Text>
                </View>
            )}

            {/* Foreground UI — same for audio and video */}
            <SafeAreaView style={[StyleSheet.absoluteFill, {zIndex: 1, elevation: 1}]}>
                <View style={styles.header}>
                    <Feather name="chevron-left" size={32} color="white" />
                </View>

                {/* Only show callInfo (name and "Calling...") when video is enabled for video calls */}
                {/* For audio calls or when video is disabled, this is hidden since it's shown in the profile picture view */}
                {(() => {
                    const videoTrack = localStream?.getVideoTracks()[0];
                    const isVideoActuallyEnabled = info?.type === 'video' && videoEnabled && videoTrack?.enabled;
                    const shouldShowCallInfo = info?.type === 'video' && isVideoActuallyEnabled;
                    
                    if (!shouldShowCallInfo) return null;
                    
                    return (
                <View style={styles.callInfo}>
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                    fontSize: 25,
                    fontWeight: 'bold',
                    color: 'white',
                    letterSpacing: 1,
                    }}
                >
                    {name}
                </Text>
                <Text
                    style={{
                    fontSize: 18,
                    color: 'white',
                    letterSpacing: 1,
                    marginVertical: 15,
                    }}
                >
                    Calling...
                </Text>
                </View>
                    );
                })()}

                <View style={styles.pillBottom}>
                {info?.type === 'video' && (
                    <TouchableOpacity onPress={flipCamera}>
                    <Avatar.Icon
                        size={44}
                        style={styles.circle}
                        icon={() => (
                        <Ionicons name="camera-reverse-outline" size={24} color="black" />
                        )}
                    />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={toggleSpeaker}>
                    <Avatar.Icon
                    size={44}
                    style={isSpeakerOn ? styles.circle_active : styles.circle}
                    icon={() => (
                        <Feather 
                            name={isSpeakerOn ? "volume-2" : "volume-1"} 
                            size={22} 
                            color="black" 
                        />
                    )}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleVideo}>
                    <Avatar.Icon
                    size={44}
                    style={videoEnabled ? styles.circle : styles.circle_disabled}
                    icon={() =>
                        videoEnabled ? (
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
                    style={micEnabled ? styles.circle : styles.circle_disabled}
                    icon={() =>
                        micEnabled ? (
                        <Feather name="mic" size={20} color="black" />
                        ) : (
                        <Feather name="mic-off" size={20} color="white" />
                        )
                    }
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEndCall}>
                    <Avatar.Icon
                    size={44}
                    style={{ backgroundColor: 'rgb(208,56,81)' }}
                    icon={() => (
                        <MaterialCommunityIcons
                        name="phone-hangup"
                        size={20}
                        color="white"
                        />
                    )}
                    />
                </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
        
    )
}
// export const CallControlsCustom = () => {
    
//     const call = useCall();
//     const { useMicrophoneState, useParticipants, useCallEndedBy } = useCallStateHooks();
//     const mic = useMicrophoneState().status;
//     const { useCameraState } = useCallStateHooks();
//     const video = useCameraState().status;
    
  
//     async function handleEndCall(){
//         await call?.leave();
//     }
//     async function toggleAudio(){
//         await call?.microphone.toggle();
//     }
//     async function toggleVideo(){
//         await call?.camera.toggle();
//     }
//     async function flipCamera(){
//         await call?.camera.flip();
//     }
  
//     return (
//         <View style={styles.pillBottom}>
//             <TouchableOpacity onPress={flipCamera}><Avatar.Icon size={44} style={styles.circle} icon={()=><Ionicons name="camera-reverse-outline" size={24} color="black" />} /></TouchableOpacity>
//             <TouchableOpacity><Avatar.Icon size={44} style={styles.circle} icon={()=><Feather name="volume-2" size={22} color="black" />} /></TouchableOpacity>
//             <TouchableOpacity onPress={toggleVideo}><Avatar.Icon size={44} style={video!='disabled'?styles.circle:styles.circle_disabled} icon={()=>{return video!='disabled' ? <Ionicons name="videocam-outline" size={24} color="black" />:<Feather name="video-off" size={20} color="white" />}} /></TouchableOpacity>
//             <TouchableOpacity onPress={toggleAudio}><Avatar.Icon size={44} style={mic!='disabled'?styles.circle:styles.circle_disabled} icon={()=>{return mic!='disabled'?<Feather name="mic" size={20} color="black" />:<Feather name="mic-off" size={20} color="white" />}} /></TouchableOpacity>
//             <TouchableOpacity onPress={handleEndCall}><Avatar.Icon size={44} style={styles.decline} icon={()=><MaterialIcons name="call-end" size={24} color="white" />} /></TouchableOpacity>
//         </View>
//     )
// }
// export const CustomizedCallTopView = (props) => {

//     let [open, setOpen] = useState(false)
//     return (
//         <View style={{position:'relative',top:windowHeight*0.7, marginTop:20, backgroundColor:'transparent', width:'100%', flexDirection:'row',justifyContent:'flex-end'}}>
//             {!open&&
//             <View style={{backgroundColor:'rgba(255,255,255,0.3)', borderTopLeftRadius:15,borderBottomLeftRadius:15, padding:10, alignItems:'center'}}>
//                 <TouchableOpacity onPress={()=>setOpen(!open)}><Ionicons name="ios-chevron-back-circle-outline" size={30} color="white"/></TouchableOpacity>
//             </View>}

//             {open &&
//             <View style={{backgroundColor:'rgba(255,255,255,0.3)', borderTopLeftRadius:15,borderBottomLeftRadius:15, padding:10, alignItems:'center', flexDirection:'row'}}>
//                 <TouchableOpacity onPress={()=>setOpen(!open)}><Ionicons name="ios-chevron-forward-circle-outline" size={30} color="white" style={{marginRight:30}} /></TouchableOpacity>
//                 <TouchableOpacity style={{marginHorizontal:10}}><Avatar.Icon size={48} style={styles.circle} icon={()=><Ionicons name="person-add-outline" size={26} color="black" />} /></TouchableOpacity>
//                 <TouchableOpacity style={{marginHorizontal:10}}><Avatar.Icon size={44} style={styles.circle} icon={()=><ScreenShareButton/>} /></TouchableOpacity>
//                 <TouchableOpacity style={{marginHorizontal:10}}><Avatar.Icon size={48} style={styles.circle} icon={()=><Ionicons name="chatbox-outline" size={26} color="black" />} /></TouchableOpacity>
//             </View>}
            
//         </View>
//     )
// }

// export const CustomizedCallContent = (props) => {

//     return (

//             <CallContent CallControls={CallControlsCustom} CallTopView={CustomizedCallTopView} ParticipantLabel={()=><></>} ParticipantNetworkQualityIndicator={()=><></>}/>   

//     )
// }
  

// export const CallControlsOutgoing = () => {

//     const call = useCall();
//     const { useMicrophoneState} = useCallStateHooks();
//     const mic = useMicrophoneState().status;
//     const { useCameraState } = useCallStateHooks();
//     const video = useCameraState().status;
    
//     async function toggleAudio(){
//         await call?.microphone.toggle();
//     }
//     async function toggleVideo(){
//         await call?.camera.toggle();
//     }
//     async function flipCamera(){
//         await call?.camera.flip();
//     }
  
//     return (
//         <View style={styles.pillOutgoing}>
//             <TouchableOpacity onPress={flipCamera}><Avatar.Icon size={44} style={styles.circle} icon={()=><Ionicons name="camera-reverse-outline" size={24} color="black" />} /></TouchableOpacity>
//             <TouchableOpacity><Avatar.Icon size={44} style={styles.circle} icon={()=><Feather name="volume-2" size={22} color="black" />} /></TouchableOpacity>
//             <TouchableOpacity onPress={toggleVideo}><Avatar.Icon size={44} style={video!='disabled'?styles.circle:styles.circle_disabled} icon={()=>{return video!='disabled' ? <Ionicons name="videocam-outline" size={24} color="black" />:<Feather name="video-off" size={20} color="white" />}} /></TouchableOpacity>
//             <TouchableOpacity onPress={toggleAudio}><Avatar.Icon size={44} style={mic!='disabled'?styles.circle:styles.circle_disabled} icon={()=>{return mic!='disabled'?<Feather name="mic" size={20} color="black" />:<Feather name="mic-off" size={20} color="white" />}} /></TouchableOpacity>
//             <HangUpCallButton />
//         </View>
//     )
// }

// export const OutgoingPanel = () => {
//     const call = useCall();

//     return <OutgoingCall OutgoingCallControls={CallControlsOutgoing} CallTopView={()=><View style={{marginVertical:50}}></View>}/>
// };

// export const IncomingCallControls = () => {
//   const call = useCall();

//   return (
//         <View style={{width:'100%',alignItems:'center'}}>
//             <View style={styles.set}>
//                 <TouchableOpacity style={{alignItems:'center'}}><Avatar.Icon size={80} style={styles.circle} icon={()=><Feather name="clock" size={30} color="black" />}/><Text style={{color:'white',fontWeight:'bold'}}>set reminder</Text></TouchableOpacity>
//                 <TouchableOpacity style={{alignItems:'center'}}><Avatar.Icon size={80} style={styles.circle} icon={()=><Ionicons name="chatbubble-outline" size={30} color="black" />}/><Text style={{color:'white',fontWeight:'bold'}}>send message</Text></TouchableOpacity>
//             </View>
//             <View style={{...styles.set,paddingHorizontal:5}}>
//                 {/* <TouchableOpacity style={{alignItems:'center'}}><Avatar.Icon size={80} style={styles.accept} icon={()=><MaterialIcons name="call" size={30} color="white" />}/><Text style={{color:'rgba(0,0,0,0)',fontWeight:'bold'}}>set reminder</Text></TouchableOpacity> */}
//                 <AcceptCallButton />
//                 <RejectCallButton />
//             </View>
//         </View>
//   )
// }
// export const IncomingCall = () => {
//     // let [cameraPos,setCameraPos] = useState('front');
//     // let [audio,setAudio] = useState(true);
//     // let [video,setVideo] = useState(true);
//     // let [mic,setMic] = useState(true);
//     // const [isMenuOpen, setMenuOpen] = useState(false);
//     // const pan = useRef(new Animated.ValueXY()).current;
//     // const panResponder = useRef(
//     // PanResponder.create({
//     //   onMoveShouldSetPanResponder: () => true,
//     //   onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}],{useNativeDriver: false}),
//     //   onPanResponderRelease: () => {
//     //     pan.extractOffset();
//     //   },
//     // }),
//     // ).current;
//     return(
//         <DefaultIncomingCall IncomingCallControls={IncomingCallControls} CallTopView={()=><View style={{marginVertical:40}}/>} />
//         // <ImageBackground resizeMode='cover' style={{height:'100%',width:'100%',backgroundColor:'black'}} imageStyle={{opacity:0.5}} source={{uri:visibleMembers[0]?.user.image}}>
//         //     {console.log('...\n\n',visibleMembers,'...gal...\n\n')}
//         //     <SafeAreaView style={{flex:1,width:'100%',justifyContent:'space-between',alignItems:'center',paddingBottom:70,backgroundColor:'rgba(0,0,0,0.5)'}}>
//         //         <View style={styles.header}>
//         //             {visibleMembers.map(i=>
//         //                 <Avatar.Image size={120} source={{uri:i.user.image}}></Avatar.Image>
//         //             )}
                    
//         //             {/* <View style={styles.message}>
//         //                 <Text style={{fontSize:14,color:'white'}}>Mobile</Text>
//         //                 <Text style={{fontSize:17,color:'white',fontWeight:'bold'}}>Lucky ❤️‍🔥</Text>
//         //             </View> */}
//         //         </View>

//         //         <View style={styles.message}>
//         //             <Text style={{fontSize:27,color:'white',fontWeight:'bold'}}>Lucky ❤️‍🔥</Text>
//         //         </View>

//         //     <View style={{width:'100%',alignItems:'center'}}>
//         //         <View style={styles.set}>
//         //             <TouchableOpacity style={{alignItems:'center'}}><Avatar.Icon size={80} style={styles.circle} icon={()=><Feather name="clock" size={30} color="black" />}/><Text style={{color:'white',fontWeight:'bold'}}>set reminder</Text></TouchableOpacity>
//         //             <TouchableOpacity style={{alignItems:'center'}}><Avatar.Icon size={80} style={styles.circle} icon={()=><Ionicons name="chatbubble-outline" size={30} color="black" />}/><Text style={{color:'white',fontWeight:'bold'}}>send message</Text></TouchableOpacity>
//         //         </View>
//         //         <View style={styles.set}>
//         //             <TouchableOpacity style={{alignItems:'center'}} onPress={handleCallAccept}><Avatar.Icon size={80} style={styles.accept} icon={()=><MaterialIcons name="call" size={30} color="white" />}/><Text style={{color:'rgba(0,0,0,0)',fontWeight:'bold'}}>set reminder</Text></TouchableOpacity>
//         //             <TouchableOpacity style={{alignItems:'center'}} onPress={handleCallEnd}><Avatar.Icon size={80} style={styles.decline} icon={()=><MaterialIcons name="call-end" size={30} color="white" />}/><Text style={{color:'rgba(0,0,0,0)',fontWeight:'bold'}}>set reminder</Text></TouchableOpacity>
//         //         </View>
//         //     </View>
//         //     </SafeAreaView>
//         // </ImageBackground>
//     )
// }

const styles = StyleSheet.create({
    header:{
        marginVertical:30,
        paddingHorizontal:15,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    callInfo:{
        justifyContent:'center',
        alignItems:'center',
        paddingHorizontal:25
    },
    circle:{
        backgroundColor:'rgba(255,255,255,0.6)',
    },
    circle_active:{
        backgroundColor:'white', // Full white when speaker is active
    },
    circle_disabled:{
        backgroundColor:'rgb(246,137,68)'
    },
    decline:{
        backgroundColor:'rgb(222,39,81)'
    },
    pillBottom:{
        width:windowWidth*0.8,
        borderRadius:30,
        paddingHorizontal:10,
        paddingVertical:20,
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'rgba(255,255,255,0.4)',
        alignSelf:'center',
        position:'absolute',
        bottom:50,
        zIndex:3,
        elevation:2
    },
    
    background:{
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        height: windowHeight,
        width: windowWidth
    },
    video:{
        position:'absolute',
        width:'100%',
        height:'100%',
        zIndex:2,
        elevation:2
    },
    options:{
        paddingHorizontal:40,
        justifyContent:'space-between',
        marginVertical:20,
        flexDirection:'row'
    },
    headerPill:{
        margin:30,
        padding:10,
        paddingHorizontal:15,
        flexDirection:'row',
        borderRadius:50,
        backgroundColor:'rgba(255,255,255,0.1)',
        
    },
    video1:{
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        elevation: 0,
    }
})

        