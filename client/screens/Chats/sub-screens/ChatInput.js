import React, { useEffect, useRef, useState, useMemo} from 'react';
import { StyleSheet, View, Keyboard, TextInput, Platform, TouchableOpacity,Text, Modal, ImageBackground, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Image, useColorScheme, SafeAreaView, Pressable, Animated, StatusBar, Dimensions} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import uuid from 'react-native-uuid';
import { Avatar, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
    useAudioRecorder,
    useAudioPlayer,
    useAudioPlayerStatus,
    setAudioModeAsync,
    requestRecordingPermissionsAsync,
    getRecordingPermissionsAsync,
    AudioQuality,
} from 'expo-audio';
import Geolocation from '@react-native-community/geolocation';

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
        borderTopColor: 'rgb(235,235,235)',
        backgroundColor: 'rgb(255,255,255)',
        left: 0,
        right: 0,
        paddingTop:7,
        flexDirection:'row',
        alignItems:'center',
    },
    primary: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    accessory: {
        height: 44,
    },
    text_input:{
        borderRadius:10,
        backgroundColor:'rgb(240,240,240)',
        marginHorizontal:20,
        padding:8,
        maxHeight:60,
        flexGrow:1,
        flexShrink:1
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        elevation:10,
        zIndex:8,
    },
    menu: {
        backgroundColor: 'rgb(39,41,48)',
        width: '100%',
        borderRadius: 10,
        zIndex:20,
        paddingBottom:30,
        height:'100%',
        justifyContent:'center',
        position: 'relative',
    },
    closeButton:{
        position:'absolute',
        left:20,
        zIndex:15,
        elevation:15
    },
    messageContainer:{
        position:'absolute',
        bottom:30,
        marginHorizontal:20,
        zIndex:15,
        elevation:15,
        width:'90%',
       
    },
    contactItem:{
        marginVertical:10,
    },
    item:{
        flexDirection:'row',
        width:'100%',
        paddingVertical:10,
        paddingHorizontal:20,
        borderRadius:20,
        alignItems:'center',
    },
    name:{
        fontWeight:'bold',
        fontSize:15,
        color:'black',
        marginVertical:5
    },
    name_dark:{
        fontWeight:'bold',
        fontSize:15,
        color:'white',
        marginVertical:5
    },
    bio:{
        color:'grey'
    },
});

//For formatting the duration of recordings
function formatMilliseconds(milliseconds) {
    // Convert milliseconds to seconds
    const totalSeconds = Math.floor(milliseconds / 1000);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // Pad minutes and seconds with leading zeros if necessary
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine them into the desired format
    return `${paddedMinutes}:${paddedSeconds}`;
}

// For formatting seconds directly (for playerStatus.currentTime and duration)
function formatSeconds(seconds) {
    const totalSeconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // Pad minutes and seconds with leading zeros if necessary
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine them into the desired format
    return `${paddedMinutes}:${paddedSeconds}`;
}

function getFileExtension(fileUrl) {
    // Split the URL string by '/' to get the file name
    const parts = fileUrl.split('/');
    const fileName = parts[parts.length - 1];
  
    // Split the file name by '.' to get the file name and extension
    const fileNameParts = fileName.split('.');
    
    // If the file name has multiple parts, return the last part as the extension
    if (fileNameParts.length > 1) {
      return fileNameParts[fileNameParts.length - 1];
    } else {
      // If the file name doesn't have an extension, return an empty string
      return '';
    }
}

const OverlaySendContact = (props) => {

    let colorScheme = useColorScheme();
    let {contacts} = useSelector(state=>state.contacts.value);
    let user = useSelector(state=>state.user.value)

    return (
        <View style={styles.overlay}>
            <SafeAreaView style={{width: '100%', borderRadius: 10, zIndex:20,paddingBottom:30,height:'100%',backgroundColor:colorScheme=='light'?'white':'rgb(39,41,48)'}}>
                <View style={{flexDirection:'row', justifyContent:'space-between', margin:10}}>
                    <TouchableOpacity onPress={props.onClose}><AntDesign name="left" size={24} color="rgb(20,130,199)" /></TouchableOpacity>
                    <View style={{flex:1,flexDirection:'row',justifyContent:'center'}}>
                        <Text style={{fontSize:18,fontWeight:'bold',color:'rgb(20,130,199)'}} >Share Contact</Text>
                    </View>
                    <TouchableOpacity><AntDesign name="left" size={24} color="transparent" /></TouchableOpacity>
                </View>

                <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:20}}>

                    {contacts.map((i,index)=>
                        <View style={styles.contactItem} key={index}>
                            {i.item.phoneNumbers[0].digits!=user.data.phone &&
                                <View style={styles.item}>
                                    <View style={{height:50,width:50,borderRadius:25,overflow:'hidden'}}>
                                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:i.server_info?.avatar?i.server_info.avatar:'https://images.nightcafe.studio//assets/profile.png?tr=w-1600,c-at_max'}} />
                                    </View>
                                    <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                                        <Text numberOfLines={1} ellipsizeMode="tail" style={colorScheme=='light'?styles.name:styles.name_dark}>{user.data.phone==i.server_info?.phone?`${i.item.name} (Myself)`:i.item.name}</Text>
                                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bio}>
                                            {i.isRegistered ? i.server_info?.bio:'User not on OIChat'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={()=>props.onSend(i)}>
                                        <AntDesign name="right-circle" size={24} color={i.isRegistered?"rgb(247,138,68)":'red'} />
                                    </TouchableOpacity>
                            </View>
                            }
                        </View>
                    )}

                </ScrollView>
                
            </SafeAreaView>
        </View>
    )
}


const OverlayDocument = ({onClose, file, inputProps, onSend, text, setText}) => {

    const insets = useSafeAreaInsets();
    const bottom = insets.bottom;
    const { height: screenHeight } = Dimensions.get('window');
    // Calculate status bar height: on iOS with notch it's usually 44, without notch it's 20
    // If insets.top is 0, use screen height to determine (iPhone X and later have height >= 812)
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' 
      ? (insets.top || (screenHeight >= 812 ? 44 : 20)) 
      : (StatusBar.currentHeight || 0);

    return (
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS=='ios'?'padding':'height'}>
        <View style={styles.menu}>
            <TouchableOpacity style={{...styles.closeButton,top:STATUSBAR_HEIGHT+10}}  onPress={onClose}>
                <Avatar.Icon style={{backgroundColor:'rgb(241,171,71)'}} size={30} icon={()=><Entypo name="cross" size={30} color="white" />}/>
            </TouchableOpacity>

            <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()} style={{width:'100%'}}>
                {file.mimeType=='application/pdf'?
                    <WebView 
                        source={{uri:file.uri}} 
                        originWhitelist={['file://']}
                    />
                    :
                    <>
                        <MaterialCommunityIcons name="file" size={100} color="rgb(32,132,196)" style={{alignSelf:'center'}}/>
                        <Text style={{margin:30,color:'rgb(32,132,196)',alignSelf:'center',fontSize:20}}>{file.name}</Text>
                    </>
                    
                }
                
            </TouchableWithoutFeedback>
            

            <ScrollView style={{...styles.messageContainer,bottom:bottom+15}} contentContainerStyle={{ flexDirection:'row'}} keyboardShouldPersistTaps='handled'>
                <TextInput {...inputProps} style={styles.text_input} placeholder="Type Message..." multiline={true} onChangeText={e=>setText(e)}/>
                <TouchableOpacity onPress={onSend}><MaterialCommunityIcons name="send-circle" size={32} color={"rgb(241,171,71)"} /></TouchableOpacity>
            </ScrollView>

        </View>
      </KeyboardAvoidingView>
    );
}

const OverlayMedia = ({onClose,media, inputProps, onSend, setText, dimensions, setDimensions, setMedia}) => {

    
    const insets = useSafeAreaInsets();
    const bottom = insets.bottom;
    const { height: screenHeight } = Dimensions.get('window');
    // Calculate status bar height: on iOS with notch it's usually 44, without notch it's 20
    // If insets.top is 0, use screen height to determine (iPhone X and later have height >= 812)
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' 
      ? (insets.top || (screenHeight >= 812 ? 44 : 20)) 
      : (StatusBar.currentHeight || 0);
    const ref = useRef();
    const player = useVideoPlayer(media.uri, (player) => {
        player.play();
    });

    useEffect(()=>{
        (
            async function(){
                if(media.type!='video'){
                    await Image.getSize(media.uri,(w,h)=>{setDimensions({width:w,height:h});setMedia({...media, dimensions:{width:w,height:h}})});
                    
                }
                
            }
        )();
        
    },[])
    return (
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" backgroundColor="rgb(39,41,48)" />
        <KeyboardAvoidingView 
          style={{flex: 1, width: '100%', height: '100%'}} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {console.log(STATUSBAR_HEIGHT,'STATUSBAR_HEIGHT')}
        <View style={[styles.menu, {paddingVertical: STATUSBAR_HEIGHT+20}]}>
            <TouchableOpacity 
              style={{
                position: 'absolute',
                top: STATUSBAR_HEIGHT + 10,
                left: 20,
                zIndex: 15,
                elevation: 15,
              }} 
              onPress={onClose}
            >
              <Avatar.Icon 
                style={{backgroundColor:'rgb(241,171,71)'}} 
                size={30} 
                icon={()=><Entypo name="cross" size={30} color="white" />}
              />
            </TouchableOpacity>
            
            <Pressable 
              onPress={()=>Keyboard.dismiss()} 
              style={{
                flex: 1, 
                width:'100%', 
                marginTop: STATUSBAR_HEIGHT + 50,
                marginBottom: 100
              }}
            >
                {media.type=='image' ?
                    <ImageBackground 
                        source={{uri:media.uri}} 
                  style={{
                    width:'100%', 
                    height:'100%', 
                    alignSelf:'center'
                  }} 
                        resizeMode='contain' 
                    />
                :
                    <VideoView
                        ref={ref} 
                        player={player}
                        allowsFullscreen
                        allowsPictureInPicture
                  contentFit='contain'
                        style={{width:'100%', height:'100%'}}
                    />
              }
            </Pressable>
            
            <View style={{
              position: 'absolute',
              bottom: bottom + 15,
              left: 0,
              right: 0,
              paddingHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'transparent'
            }}>
              <TextInput 
                {...inputProps} 
                style={[styles.text_input, {flex: 1, marginRight: 10}]} 
                placeholder="Type Message..." 
                multiline={true} 
                onChangeText={e=>setText(e)}
              />
              <TouchableOpacity onPress={onSend}>
                <MaterialCommunityIcons name="send-circle" size={32} color={"rgb(241,171,71)"} />
              </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
      </View>
    );
}

export default function ChatInput(props) {

    const [position, setPosition] = useState('absolute'); // Keep absolute for GiftedChat compatibility
    const [text,setText] = useState('');
    const [media, setMedia] = useState();
    let [dimensions,setDimensions] = useState();
    let [file,setFile] = useState();
    let colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);
    let [showOptions,setShowOptions] = useState(false);
    let [isMenuVisible,setMenuVisible] = useState(false);
    let [loading,setLoading] = useState(false);

    // ================= AUDIO (FIXED expo-audio) =================

    const recorderOptions = useMemo(() => ({
        extension: Platform.OS === 'ios' ? '.m4a' : '.mp4',
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        audioQuality: AudioQuality.HIGH,
    }), []);

    const recorder = useAudioRecorder(recorderOptions);
    const [liveDuration, setLiveDuration] = useState(0);
    const [recordingUri, setRecordingUri] = useState(null);
    const [recordings, setRecordings] = useState([]);
    const [recording, setRecording] = useState(false);
    const recordingIntervalRef = useRef(null);

    const player = useAudioPlayer(
    recordingUri ? { uri: recordingUri } : null,
    { updateInterval: 100 }
    );
    
    // Use useAudioPlayerStatus hook to get playback status (as per docs)
    const playerStatus = useAudioPlayerStatus(player);
    
    useEffect(() => {
      console.log('[AUDIO DEBUG] Player created/updated, recordingUri:', recordingUri);
      console.log('[AUDIO DEBUG] Player object:', player);
      console.log('[AUDIO DEBUG] Player status:', playerStatus);
    }, [player, recordingUri, playerStatus]);

    let [show, setShow] = useState(0);
    let [contact, setContact] = useState(false);
    const [permissionResponse, setPermissionResponse] = useState(null);
    const inputRef = useRef(null);
    const normalInputRef = useRef(null);
    const [shouldFocusNormalInput, setShouldFocusNormalInput] = useState(false);
    const keyboardHeight = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    
    const { containerStyle, onSend,editMessage,setEditMessage,updateSend,...rest } = props;

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        
        const keyboardWillShowListener = Keyboard.addListener(showEvent, (e) => {
            if (showOptions) {
                Animated.timing(keyboardHeight, {
                    toValue: e.endCoordinates.height,
                    duration: Platform.OS === 'ios' ? e.duration : 250,
                    useNativeDriver: false,
                }).start();
            }
        });
        const keyboardWillHideListener = Keyboard.addListener(hideEvent, () => {
            Animated.timing(keyboardHeight, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }).start();
        });
        return () => {
            keyboardWillShowListener?.remove();
            keyboardWillHideListener?.remove();
        };
    }, [showOptions]);

    // Check recording permissions on mount
    useEffect(() => {
        (async () => {
            const response = await getRecordingPermissionsAsync();
            setPermissionResponse(response);
        })();
    }, []);

    // Poll recorder status for duration updates (callbacks may not fire reliably)
    useEffect(() => {
        if (recording && recorder.isRecording) {
            console.log('[AUDIO DEBUG] Starting recording status polling');
            recordingIntervalRef.current = setInterval(() => {
                if (recorder.isRecording) {
                    // Try multiple ways to get duration
                    const duration = recorder.status?.durationMillis 
                        || recorder.currentStatus?.durationMillis
                        || recorder.durationMillis
                        || null;
                    
                    if (duration != null) {
                        console.log('[AUDIO DEBUG] Polled duration:', duration);
                        setLiveDuration(duration);
                    } else {
                        console.log('[AUDIO DEBUG] Recorder status:', {
                            status: recorder.status,
                            currentStatus: recorder.currentStatus,
                            isRecording: recorder.isRecording
                        });
                    }
                }
            }, 100); // Poll every 100ms
        } else {
            if (recordingIntervalRef.current) {
                console.log('[AUDIO DEBUG] Clearing recording status polling');
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
        }
        
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, [recording, recorder.isRecording, recorder]);

    // Use playerStatus from useAudioPlayerStatus hook (no polling needed)
    // playerStatus.currentTime and playerStatus.playing are automatically updated

    // No longer needed - useAudioPlayerStatus handles playback state automatically

    // Focus normal input when transitioning from showOptions
    useEffect(() => {
        if (shouldFocusNormalInput && !showOptions && normalInputRef.current) {
            // Small delay to ensure the normal input is rendered
            setTimeout(() => {
                normalInputRef.current?.focus();
                setShouldFocusNormalInput(false);
            }, 150);
        }
    }, [showOptions, shouldFocusNormalInput])

    function handleShowOptions(){
        Keyboard.dismiss();
        setTimeout(()=>{
            setShowOptions(true)
        },100)
    }

    //Audio Recording related functions
    async function startRecording() {
        try {
            console.log('[AUDIO DEBUG] ===== START RECORDING =====');
            const permission = await requestRecordingPermissionsAsync();
            console.log('[AUDIO DEBUG] Permission:', permission);
            if (!permission.granted) {
              console.log('[AUDIO DEBUG] Permission not granted');
              return;
            }
        
            await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
            console.log('[AUDIO DEBUG] Audio mode set');
        
            console.log('[AUDIO DEBUG] Preparing to record...');
            await recorder.prepareToRecordAsync();
            console.log('[AUDIO DEBUG] Prepared, starting record...');
            recorder.record();
            console.log('[AUDIO DEBUG] Recording started, recorder state:', {
              isRecording: recorder.isRecording,
              uri: recorder.uri
            });
        
            setLiveDuration(0);
            setRecording(true);
            console.log('[AUDIO DEBUG] Recording state set to true');
        } catch (err) {
            console.error('[AUDIO DEBUG] Failed to start recording', err);
        }
        
    }

    
    async function stopRecording() {
        try {
          console.log('[AUDIO DEBUG] ===== STOP RECORDING =====');
          console.log('[AUDIO DEBUG] Live duration before stop:', liveDuration);
          console.log('[AUDIO DEBUG] Recorder state before stop:', {
            isRecording: recorder.isRecording,
            uri: recorder.uri
          });
          await recorder.stop();
          console.log('[AUDIO DEBUG] Recorder stopped');
        
          // Reset audio mode for playback (allowsRecording: false, playsInSilentMode: true)
          await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
          console.log('[AUDIO DEBUG] Audio mode reset for playback');
      
          console.log('[AUDIO DEBUG] Recorder URI after stop:', recorder.uri);
          if (!recorder.uri) {
            console.log('[AUDIO DEBUG] No recorder URI, returning');
            return;
          }
      
          // Set recordingUri first so player can initialize
          setRecordingUri(recorder.uri);
          console.log('[AUDIO DEBUG] Recording URI set to:', recorder.uri);
      
          const recordingData = {
            file: recorder.uri,
            duration: liveDuration,
          };
          console.log('[AUDIO DEBUG] Recording data:', recordingData);
          setRecordings([recordingData]);
      
          setLiveDuration(0);
        setShow(1);
          setRecording(false);
          
          // Small delay to ensure player is initialized with new URI
          setTimeout(() => {
            console.log('[AUDIO DEBUG] Player should be ready now');
          }, 100);
          
          console.log('[AUDIO DEBUG] Recording stopped successfully');
        } catch (err) {
          console.error('[AUDIO DEBUG] Error stopping recording:', err);
        }
    }

    async function cancelRecording() {
        try {
          await recorder.stop();
        } catch {}
      
        try {
          await player?.stop();
        } catch {}
      
        // Clear recording interval
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        
        setShowOptions(false);
        setShow(0);
        setRecordings([]);
        setRecordingUri(null);
        setLiveDuration(0);
        setRecording(false);
        
        // Stop player if playing
        try {
          if (player && playerStatus?.playing) {
            player.pause();
          }
        } catch {}
    }
    //Document Picker 

    const pickDocument = async() => {
        let result = await DocumentPicker.getDocumentAsync();
        if(!result.canceled){
            if(result.assets[0].mimeType.includes('video')||result.assets[0].mimeType.includes('image')) {
                setMedia({...result.assets[0],type:result.assets[0].mimeType.includes('video')?'video':'image'});
            }
            else setFile({...result.assets[0], type:result.assets[0].mimeType});
            setMenuVisible(true);
        }
    }

    //Image Picker

    const pickMedia = async (fromCamera) => {
        let result;
        if (fromCamera) {
          const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
          if (!permissionResult.granted) {
            alert('Permission to access the camera is required!');
            return;
          }
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.6
          });

          result.assets[0].fileName = `${new Date().getTime()}.${getFileExtension(result.assets[0].uri)}`;
        } 
        else {

          const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permissionResult.granted) {
            alert('Permission to access the camera roll is required!');
            return;
          }
          
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.6,
            preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current
          });
          
        }

        
        if (!result.canceled) {
          setMedia(result.assets[0]);
          setMenuVisible(true)
        }

    };

    //Sending functions

    function sendLocation() {

        Geolocation.getCurrentPosition(info => {
            let msg={
                _id:uuid.v4(),
                text: 'This is my location',
                createdAt:new Date(),
                user:{
                    _id:parseInt(user.data.id),
                    avatar:user.data.image
                },
                type:'location', 
                isAttachment:true,
                system:false,
                additionalInfo: {
                    latitude:info.coords.latitude,
                    longitude:info.coords.longitude
                }
                
            };
            onSend(msg);
            setShowOptions(false);
            setText('');
        })
        
        
    }

    function overlaySend(){

        let msg = {}; 
        if(media){
            msg = {
                _id:uuid.v4(),
                createdAt: new Date(),
                user:{
                    _id:parseInt(user.data.id),
                    avatar:user.data.image
                },
                text:text?.trim(),
                type:media.mimeType.includes('image')?'image':'video',
                isAttachment:true,
                file_path:media.uri,
                system:false,
                additionalInfo:media
            }
        } else if (file){
            msg = {
                _id:uuid.v4(),
                createdAt: new Date(),
                user:{
                    _id:parseInt(user.data.id),
                    avatar:user.data.image
                },
                text:text?.trim(),
                type:'file',
                isAttachment:true,
                file_path:file.uri,
                system:false,
                additionalInfo:file
            }
        }

        onSend(msg)
        setMenuVisible(false);
        setShowOptions(false);
        setFile();
        setMedia();
        setText('')
    }

    function prepareToSend(editing){

        if(!editing){
            if(!(text.trim())) return;
            let msg={
                _id:uuid.v4(),
                text:text?.trim(),
                createdAt:new Date(),
                user:{
                    _id:parseInt(user.data.id),
                    avatar:user.data.image
                }, 
                type:'text',
                isAttachment:false,
                system:false,
                additionalInfo:null
            };

            onSend(msg);
            setText('')
        }else{
            if(!(text.trim())) return;
            let msg = {
                ...editMessage.message,
                text:text.trim(),
                edited:true
            }
            updateSend(msg);
            setText('')
        }
    }

    function sendAudio() {

        if (!recordings[0]) return;
      
        let msg = {
          _id: uuid.v4(),
            createdAt: new Date(),
          user: {
            _id: parseInt(user.data.id),
            avatar: user.data.image,
            },
          text: text?.trim(),
          type: 'audio',
          isAttachment: true,
          file_path: recordings[0].file,
          system: false,
          additionalInfo: {
            uri: recordings[0].file,
            name: `Recording-${Date.now()}.${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`,
            type: Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4',
            duration: recordings[0].duration,
          },
        };
      
        cancelRecording();
        onSend(msg);
    }

    function contactSend(i){
        let msg={
            _id:uuid.v4(),
            text:text?.trim(),
            createdAt:new Date(),
            user:{
                _id:parseInt(user.data.id),
                avatar:user.data.image,
                name:user.data.firstName+" "+user.data.lastName
            }, 
            type:'contact',
            isAttachment:true,
            system:false,
            additionalInfo:{
                name:i.item.name,
                avatar:i.server_info? i.server_info.avatar:'https://images.nightcafe.studio//assets/profile.png?tr=w-1600,c-at_max',
                phone:i.server_info? i.server_info.phone:i.item.phoneNumbers[0].digits
            }
            
        };
        onSend(msg);
        setMenuVisible(false);
        setShowOptions(false);
        setContact(false);
    }

    return (
        <View  style={[{...styles.container, flexDirection:'column', borderTopColor:colorScheme=='dark'? 'rgb(20,23,44)' : 'rgb(235,235,235)' ,backgroundColor:colorScheme=='dark'?'rgb(39,42,43)':'white', paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 15) : 15, position: 'absolute', bottom: 0}, containerStyle]}>

        {showOptions && (!media) && 

        <>
            <Animated.View style={{
                flexDirection:'row', 
                alignItems:'center', 
                paddingHorizontal:20, 
                paddingBottom:10,
                transform: [{ translateY: Animated.multiply(keyboardHeight, -1) }]
            }}>
                <TouchableOpacity onPress={()=>setShowOptions(false)}>
                    <AntDesign name="close-circle" size={24} color={colorScheme=='light'?"grey":'rgb(241,171,71)'} />
                </TouchableOpacity>
                <TextInput 
                    ref={inputRef}
                    {...props} 
                    style={{...styles.text_input,fontSize: 17, backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(59,62,63)', color:colorScheme=='light'?'black':'white'}} 
                    multiline={true} 
                    onChangeText={e=>setText(e)}
                    onFocus={() => {
                        // Hide options immediately when TextInput is focused
                        setShowOptions(false);
                        // Mark that we should focus the normal input after state update
                        setShouldFocusNormalInput(true);
                    }}
                    value={text}
                    enablesReturnKeyAutomatically={true}
                />
                <TouchableOpacity onPress={()=>prepareToSend(false)} disabled={!text}><MaterialCommunityIcons name="send-circle" size={32} color={text?"rgb(241,171,71)":'grey'} /></TouchableOpacity>
            </Animated.View>
            <View style={{backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(61,64,74)',paddingVertical:30,width:'100%', paddingHorizontal:30, marginTop:10, paddingBottom:15, height:'100%'}}>
                <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>
                    <TouchableOpacity style={{marginHorizontal:20, marginVertical:10, alignItems:'center'}} onPress={()=>pickMedia(false)}>
                        <Avatar.Icon style={{backgroundColor:colorScheme=='light'?'grey':'white'}} size={52} icon={()=><MaterialIcons name="photo" size={31} color={colorScheme=='light'?"white":'black'} />}/>
                        <Text style={{marginTop:4, color:colorScheme=='light'?'black':'white'}}>Media</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{marginHorizontal:20, marginVertical:10, alignItems:'center'}} onPress={()=>pickMedia(true)}>
                        <Avatar.Icon style={{backgroundColor:colorScheme=='light'?'grey':'white'}} size={52} icon={()=><MaterialIcons name="photo-camera" size={31} color={colorScheme=='light'?"white":'black'} />} />
                        <Text style={{marginTop:4, color:colorScheme=='light'?'black':'white'}}>Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{marginHorizontal:20, marginVertical:10, alignItems:'center'}} onPress={()=>pickDocument()}>
                        <Avatar.Icon style={{backgroundColor:colorScheme=='light'?'grey':'white'}} size={52} icon={()=><FontAwesome name="file" size={29} color={colorScheme=='light'?"white":'black'} />} />
                        <Text style={{marginTop:4, color:colorScheme=='light'?'black':'white'}}>Files</Text>
                    </TouchableOpacity>
                </View>

                <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>
                    <TouchableOpacity style={{marginHorizontal:20, marginVertical:10, alignItems:'center'}} onPress={sendLocation}>
                        <Avatar.Icon style={{backgroundColor:colorScheme=='light'?'grey':'white'}} size={52} icon={()=><Entypo name="location-pin" size={31} color={colorScheme=='light'?"white":'black'} />} />
                        <Text style={{marginTop:4, color:colorScheme=='light'?'black':'white'}}>Location</Text>
                    </TouchableOpacity> 
                    <TouchableOpacity style={{marginHorizontal:20, marginVertical:10, alignItems:'center'}} onPress={()=>{setShowOptions(false);startRecording()}}>
                        <Avatar.Icon style={{backgroundColor:colorScheme=='light'?'grey':'white'}} size={52} icon={()=><FontAwesome name="microphone" size={31} color={colorScheme=='light'?"white":'black'} />} />
                        <Text style={{marginTop:4, color:colorScheme=='light'?'black':'white'}}>Audio</Text>
                    </TouchableOpacity> 
                    <TouchableOpacity style={{marginHorizontal:20, marginVertical:10, alignItems:'center'}} onPress={()=>{setContact(true);setMenuVisible(true)}}>
                        <Avatar.Icon style={{backgroundColor:colorScheme=='light'?'grey':'white'}} size={52} icon={()=><FontAwesome name="user" size={31} color={colorScheme=='light'?"white":'black'} />} />
                        <Text style={{marginTop:4, color:colorScheme=='light'?'black':'white'}}>Contact</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
        }
        
        

        {!showOptions && (recording) &&   

            <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal:20,paddingBottom:15}}>
                <TouchableOpacity onPress={cancelRecording}>
                    <AntDesign name="close-circle" size={24} color={colorScheme=='light'?"rgb(171,171,171)":'rgb(107,111,131)'} />
                </TouchableOpacity>

                <View style={{...styles.text_input, width:"80%", backgroundColor:'transparent', flexDirection:'row', justifyContent:'space-between', overflow:'hidden', flex:1}}>
                    <Image source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/Records.png'}} style={{height:25, width:'40%'}} resizeMode='cover'/>
                    <Text style={{fontSize:17, color:'rgb(241,171,71)'}}>{formatMilliseconds(liveDuration)}</Text>
                    <Image source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/Records.png'}} style={{height:25, width:'40%'}} resizeMode='cover'/>
                </View>

                <TouchableOpacity onPress={stopRecording}>
                    <Ionicons name="checkmark-circle" size={27} color="rgb(241,171,71)" />
                </TouchableOpacity>
            </View>
        }

        {!showOptions && (!recording) && show==1 &&

            <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal:20,paddingBottom:15}}>
                <TouchableOpacity onPress={cancelRecording} style={{marginRight:8}}>
                    <AntDesign name="close-circle" size={24} color={colorScheme=='light'?"rgb(171,171,171)":'rgb(107,111,131)'} />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {
                        if (!player) {
                          console.log('[AUDIO DEBUG] Player is null');
                          return;
                        }
                        
                        // Set audio mode for playback
                        setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
                        
                        // Use playerStatus directly (all values in seconds)
                        if (!playerStatus?.playing) {
                          // If at the end or start, seek to beginning and play
                          const currentTime = playerStatus?.currentTime || 0;
                          const duration = playerStatus?.duration || 0;
                          if (currentTime >= duration || currentTime === 0 || playerStatus?.didJustFinish) {
                            player.seekTo(0);
                          }
                          player.play();
                        } else {
                          player.pause();
                                }
                      }} 
                    style={{marginLeft:8}}
                >
                    {playerStatus?.playing ?
                        <AntDesign name="pause-circle" size={24} color={colorScheme=='light'?"rgb(171,171,171)":'rgb(107,111,131)'} />
                    :
                        <AntDesign name="play-circle" size={24} color={colorScheme=='light'?"rgb(171,171,171)":'rgb(107,111,131)'} />
                    }
                    
                </TouchableOpacity>
                <View style={{...styles.text_input, backgroundColor:'transparent', flexDirection:'row', justifyContent:'space-between', alignItems:'center', flex:1}}>
                    <Image source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/Records.png'}} style={{height:25, width:'40%'}} resizeMode='cover'/>
                    <Text style={{fontSize:17, color:'rgb(241,171,71)'}}>
                      {formatSeconds(Math.max(0, (playerStatus?.duration || 0) - (playerStatus?.currentTime || 0)))}
                    </Text>
                    <Image source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/Records.png'}} style={{height:25, width:'40%'}} resizeMode='cover'/>
                </View>
                <TouchableOpacity onPress={sendAudio}><MaterialCommunityIcons name="send-circle" size={32} color="rgb(241,171,71)" /></TouchableOpacity>

            </View>
        }


        { !showOptions && (!recording) && (show==0) && (editMessage.state==false) &&

            <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal:20, marginBottom:15}}>
                <TouchableOpacity onPress={handleShowOptions}>
                    <AntDesign name="plus-circle" size={24} color="rgb(241,171,71)" />
                </TouchableOpacity>

                <TextInput 
                    ref={normalInputRef}
                    enablesReturnKeyAutomatically={true} 
                    multiline={true} 
                    numberOfLines={3} 
                    style={{...styles.text_input,fontSize: 17, backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(59,62,63)', color:colorScheme=='light'?'black':'white', width:text?'80%':'70%'}} 
                    onChangeText={e=>setText(e)} 
                    value={text}
                />
                {(!text) ? 

                <>
                    <TouchableOpacity style={{marginRight:8}} onPress={()=>pickMedia(true)}><Ionicons name="camera-outline" size={28} color="rgb(241,171,71)" /></TouchableOpacity>
                    <TouchableOpacity style={{marginLeft:8}} onPress={()=>{setShowOptions(false);startRecording()}}><MaterialCommunityIcons name="microphone-outline" size={28} color="rgb(241,171,71)" /></TouchableOpacity>
                </>
                    
                :
                <TouchableOpacity onPress={()=>prepareToSend(false)}><MaterialCommunityIcons name="send-circle" size={32} color={text?"rgb(241,171,71)":'grey'} /></TouchableOpacity>
                }
                
            </View>

        }
        {!showOptions && (!recording) && (show==0) && (editMessage.state==true) &&
            <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal:20, marginBottom:15, justifyContent:'space-evenly', width:'100%'}}>
                <TouchableOpacity onPress={()=>setEditMessage({state:false,message:null})}>
                    <AntDesign name="close-circle" size={24} color="rgb(241,171,71)" style={{alignSelf:'flex-start', marginRight:5}}/>
                </TouchableOpacity>

                <View style={{width:'80%'}}>
                    <View style={{width:'100%', height:25, flexGrow:1, flexShrink:1, backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(59,62,63)', borderTopRightRadius:13, borderTopLeftRadius:13, padding:3, flexDirection:'row', alignItems:'center'}}>
                        <Feather name="edit-2" size={12} style={{color:colorScheme=='light'?'black':'white', marginLeft:10}} />
                        <Text style={{marginHorizontal:5, color:colorScheme=='light'?'black':'white', fontWeight:'bold'}}>Edit Message</Text>
                    </View>
                    <TextInput 
                        enablesReturnKeyAutomatically={true} 
                        multiline={true} 
                        numberOfLines={2} 
                        style={{...styles.text_input,fontSize: 17, backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(59,62,63)', color:colorScheme=='light'?'black':'white', width:'100%', marginHorizontal:0, borderTopLeftRadius:0,borderTopRightRadius:0}} 
                        onChangeText={e=>setText(e)} 
                        value={text}
                    />
                </View>
                
                
                <TouchableOpacity onPress={()=>prepareToSend(true)}><MaterialCommunityIcons name="send-circle" size={32} color={text?"rgb(241,171,71)":'grey'} style={{alignSelf:'center', marginLeft:5}} /></TouchableOpacity>
            
            
            </View> 
        }


        <Modal animationType='slide' visible={isMenuVisible} transparent={true}>
            {media && <OverlayMedia onSend={overlaySend} inputProps={props} onClose={()=>{setMedia();setText();setMenuVisible(false);}} media={media} setText={setText} setMedia={setMedia} dimensions={dimensions} setDimensions={setDimensions}/>}
            {file && <OverlayDocument onSend={overlaySend} inputProps={props} onClose={()=>{setFile();setText();setMenuVisible(false)}} file={file} text={text} setText={setText} dimensions={dimensions} setDimensions={setDimensions}/>}
            {contact && <OverlaySendContact onSend={contactSend} inputProps={props} onClose={()=>{setMenuVisible(false);setContact(false)}} />}
        </Modal>
        
    </View>);
}
