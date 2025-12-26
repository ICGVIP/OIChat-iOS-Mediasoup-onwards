
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { SafeAreaView, Text, View, StyleSheet, useColorScheme, ImageBackground, Alert,  Dimensions,TextInput, TouchableOpacity, Linking, StatusBar, Image, Platform, TouchableWithoutFeedback, Pressable, ScrollView, Modal} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import {GiftedChat, Bubble, MessageText, Time} from 'react-native-gifted-chat';
import Video from "react-native-video";
import uuid from 'react-native-uuid';
import { useVideoPlayer, VideoView } from 'expo-video';
import FileViewer from "react-native-file-viewer";
import { Avatar, Button } from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';
import { File, Directory } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { useSelector } from 'react-redux';
import { useChannelSet } from '../../../context/channel';

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const MAPS_API_KEY = 'AIzaSyC6QKw4WDUc9kcNDRa8_YpBHBX20PriyH8';


//Google Maps Integration
const prepareStaticMapUrl = (lat, long) => {
    let baseURL = 'https://maps.googleapis.com/maps/api/staticmap?';
    let url = new URL(baseURL);
    let params = url.searchParams;
    params.append('center', `${lat},${long}`);
    params.append('zoom', '15');
    params.append('size', '600x300');
    params.append('maptype', 'roadmap');
    params.append('key', MAPS_API_KEY);
    params.append('markers', `color:red|${lat},${long}`);
  
    return url.toString();
};
  

const goToGoogleMaps = (lat, long) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
  
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URI: ${url}`);
      }
    });
};

function renderTime(props,setIsMenuVisible, setMsgInFocus) {

    const { width, height } = Dimensions.get('window');
    let colorScheme = useColorScheme();
    let user=useSelector(state=>state.user.value)

    if (props.currentMessage && props.currentMessage.createdAt) {
        const { containerStyle, wrapperStyle, textStyle, ...timeProps } = props;
        if (props.renderTime) {
            return props.renderTime(timeProps);
        }
        return (<View style={{flexDirection:'row',alignItems:'center', justifyContent:'space-between', height: 25}}>
                  {(props.currentMessage?.reactions) && props.position=='right' && 
                    <TouchableOpacity onPress={()=>{setIsMenuVisible(true);setMsgInFocus(props.currentMessage)}} style={{backgroundColor:colorScheme=='dark'?'rgb(73,73,72)':'rgb(220,220,220)', borderRadius:10,padding:2.5, marginLeft:8, marginBottom:5, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                      <Text style={{fontSize:Math.min(width,height)*0.03}}>{props.currentMessage.reactions?.length&&props.currentMessage.reactions[0].reaction}</Text>
                      <Avatar.Image size={15} source={{uri:props.currentMessage.reactions ? (props.currentMessage.reactions[0].user.image||props.currentMessage.reactions[0].user.avatar) : ''}} style={{marginLeft:8}}/>
                  </TouchableOpacity>
                  }
                  <View style={{flexDirection:'row', alignItems:'center', flexShrink:1, justifyContent:props.position=='right'?'flex-end':'flex-start', marginRight:5}}>
                    {props.currentMessage.important && props.position=='right' && <Ionicons name="star" size={11} color={props.timeTextStyle['right'].color} style={{marginHorizontal:5}}/>}
                    {(props.currentMessage.edited && props.position=='right') ? <Text style={{marginLeft:5, marginRight:4, fontSize:11, fontWeight:'bold', color:props.timeTextStyle['right'].color}}>edited</Text>:<></>}
                    <Time {...timeProps}/>
                    {(props.currentMessage.edited && props.position=='left') ? <Text style={{marginLeft:4, marginRight:5, fontSize:11, fontWeight:'bold', color:props.timeTextStyle['right'].color}}>edited</Text>:<></>}
                    {(props.currentMessage.important && props.position=='left') ? <Ionicons name="star" size={10} color={props.timeTextStyle['right'].color} style={{marginHorizontal:5}}/>:<></>}
                  </View>
                  {props.currentMessage?.reactions&&props.position=='left' && 
                  <TouchableOpacity onPress={()=>{setIsMenuVisible(true);setMsgInFocus(props.currentMessage)}} style={{backgroundColor:colorScheme=='dark'?'rgb(73,73,72)':'rgb(220,220,220)', borderRadius:10,padding:2.5, marginRight:8, marginBottom:5, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <Avatar.Image size={15} source={{uri:props.currentMessage.reactions ? (props.currentMessage.reactions[0].user.image||props.currentMessage.reactions[0].user.avatar) : ''}} style={{marginRight:8}}/>
                    <Text style={{fontSize:Math.min(width,height)*0.03}}>{props.currentMessage.reactions?.length&&props.currentMessage.reactions[0].reaction}</Text>
                  </TouchableOpacity>}
                </View>);
    }
    return <></>;
}
  
function renderUsername(props) {
    const { currentMessage, user, renderUsername } = props;
    if (props.renderUsernameOnMessage && currentMessage) {
        if (user && currentMessage.user._id === user._id) {
            return <></>;
        }
        if (renderUsername) {
            return renderUsername(currentMessage.user);
        }
        return (<View style={styles.content.usernameView}>
        <Text style={[styles.content.username, props.usernameStyle, {fontSize:13}]}>
        {currentMessage.user.name}
        </Text>
    </View>);
    }
    return <></>;
}


export const BubbleContent = (props) => {

    const {currentMessage, position, bottomContainerStyle, scrollToMessage, a, display, bgStyle, setIsMenuVisible, setMsgInFocus} = props;
    const videoSource = currentMessage.type=='video'?currentMessage.file_path:'';
    const { width, height } = Dimensions.get('window');
  
    let colorScheme = useColorScheme();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [localFilePath, setLocalFilePath] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);
    // let [isMenuVisible,setIsMenuVisible] = useState(false);
    const ref = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const player = useVideoPlayer(videoSource, (player) => {
      player.loop = true;
      player.pause();
    });
  
    useEffect(()=>{
      (
        async function(){
          if(currentMessage.file_path) {
            if(currentMessage.file_path.includes('file')){
              setIsDownloaded(true);
              setLocalFilePath(currentMessage.file_path);
              return;
            }
            await checkIfFileExists();
          }
        }
      )();
      
    },[]);
  
    async function checkIfFileExists(){
  
      //Check if file is somehow present to directly show
      let url = currentMessage.file_path;
      const split_url = url.split('/');
      let ext = split_url[split_url.length-1];
      
      try {
        // Try new API first, fallback to legacy if not available
        let documentDir = Directory.documentDirectory;
        if (!documentDir) {
          documentDir = FileSystemLegacy.documentDirectory;
        }
        if (!documentDir) {
          console.error('Document directory not available');
          await downloadFile();
          return;
        }
        
        const filePath = `${documentDir}${ext}`;
        console.log('Checking file at path:', filePath);
        
        // Use legacy API for file existence check as new File API might not have exists() method
        const fileInfo = await FileSystemLegacy.getInfoAsync(filePath);
        
        console.log('File check result:', { 
          filePath, 
          exists: fileInfo.exists, 
          uri: fileInfo.uri
        });
        
        if (fileInfo.exists) {
          setLocalFilePath(fileInfo.uri);
          setIsDownloaded(true);
        } else {
          console.log('File does not exist, starting download...');
          //If not, start download
          await downloadFile();
        }
      } catch (error) {
        console.error('Error checking file existence:', error);
        // If check fails, try downloading
        await downloadFile();
      }
      
      
    }
  
    async function downloadFile(){
  
      setIsDownloading(true);
      let url = currentMessage.file_path;
      const split_url = url.split('/');
      let ext = split_url[split_url.length-1];
      
      // Decode URL-encoded filename (handles %20, %2520, etc.)
      try {
        ext = decodeURIComponent(ext);
        // If still encoded, try decoding again
        if (ext.includes('%')) {
          ext = decodeURIComponent(ext);
        }
      } catch (e) {
        console.log('Filename decode error, using original:', e);
      }
 
      try{
        // Try new API first, fallback to legacy if not available
        let documentDir = Directory.documentDirectory;
        
        if (!documentDir) {
          // Fallback to legacy API for document directory
          documentDir = FileSystemLegacy.documentDirectory;
        }
        
        if (!documentDir) {
          throw new Error('Document directory not available');
        }
        
        // Remove leading slash from ext if present, and ensure proper path joining
        const cleanExt = ext.startsWith('/') ? ext.substring(1) : ext;
        // Ensure documentDir doesn't have trailing slash and cleanExt doesn't have leading slash
        const documentDirClean = documentDir.endsWith('/') ? documentDir.slice(0, -1) : documentDir;
        const filePath = `${documentDirClean}/${cleanExt}`;
        
        console.log('Downloading to:', filePath, 'from:', url, 'documentDir:', documentDir);
        
        const downloadResumable = FileSystemLegacy.createDownloadResumable(
          url,
          filePath,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            setDownloadProgress(progress);
          }
        );
  
        const { uri } = await downloadResumable.downloadAsync();
  
        setLocalFilePath(uri);
        setIsDownloaded(true);
  
      }catch(err){
        console.error('Error downloading file:', err);
      }finally {
        setIsDownloading(false)
      }
  
    }
  
    async function openFile(){
      await FileViewer.open(localFilePath)
    }

    function openLink(url){
      try{
        Linking.openURL(url)
      }catch(err){
        console.log(err,'..Error in opneing link...\n\n')
      }
    }
  
    let mapApi; 
    if(currentMessage.type=='location') {
      mapApi = prepareStaticMapUrl(currentMessage.additionalInfo.latitude, currentMessage.additionalInfo.longitude);
    }
    
  
    return (
  
      <> 
        <TouchableWithoutFeedback {...props.touchableProps}>
          <View style={{bgStyle, minWidth:(currentMessage.reactions)?(currentMessage.edited ? 180:(currentMessage.important?100 : 100)):(currentMessage.edited?130:'auto'), width:(currentMessage.type=='image'||currentMessage.type=='video' )? 222:'auto'}}>
            
            {renderUsername(props)}
            {
              currentMessage.forwarded ?
              <View style={{...styles.content.usernameView, marginTop:5, marginBottom:3, flexDirection:'row', alignItems:'enter'}}> 
                <Entypo name="forward" size={12} color={props.timeTextStyle['right'].color} style={{marginRight:3}}/>
                <Text style={{fontStyle:'italic',color:props.timeTextStyle['right'].color}}>Forwarded</Text>
              </View>
              :
              <></>
            }
            {currentMessage.replyTo?.id &&
              <TouchableOpacity delayLongPress={350} onPress={display ? ()=>scrollToMessage(currentMessage.replyTo.id):()=>{}} onLongPress={()=>{}}>
                <View style={{minWidth:(currentMessage.type=='image'||currentMessage.type=='video')?200:250, margin:6, borderRadius:13, flexDirection:'row', alignItems:'center',backgroundColor:colorScheme=='light'?(position=='right'?'rgba(245, 245, 245,0.4)':'rgba(245, 245, 245,0.4)'):'rgb(54,59,75)', padding:8, width:'95%'}}>
                  <View style={{height:'80%', marginLeft:5,width: 2, backgroundColor:colorScheme=='light'?'rgb(215,215,215)':'rgb(74,77,98)',alignSelf:'center'}}></View>
                  <View style={{flexDirection: 'column', height:'100%',justifyContent:'flex-start', maxWidth:220}}>
                      <Text style={{color: 'rgb(241,171,71)', paddingLeft: 10, paddingTop: 5, fontWeight:'bold'}}>{currentMessage.replyTo.user.firstName+" "}</Text>
                      <Text style={{color: colorScheme=='light'?'rgb(135,135,135)':'rgb(190,190,190)', paddingLeft: 10, paddingTop: 5, flexShrink:1}}
                        numberOfLines={2}
                        ellipsizeMode='tail'
                      >
                        {currentMessage.replyTo.text ? currentMessage.replyTo.text 
                        :
                          <>
                            {currentMessage.replyTo.file && currentMessage.replyTo.file.name}
                            {currentMessage.replyTo.image && currentMessage.replyTo.image.name} 
                            {currentMessage.replyTo.file_path && JSON.parse(currentMessage.replyTo.additionalInfo)?.name}
                            {currentMessage.replyTo.contact && `${currentMessage.replyTo.contact.name} - Contact`}
                            {currentMessage.replyTo.additionalInfo ? (JSON.parse(currentMessage.replyTo.additionalInfo)?.type.includes('contact') ? `${JSON.parse(currentMessage.replyTo.additionalInfo)?.name}} - Contact`:''):''}
                            {currentMessage.replyTo.type=='location' && 'Shared location'}
                            {currentMessage.replyTo.additionalInfo ? (JSON.parse(currentMessage.replyTo.additionalInfo)?.type.includes('location') ? `Shared location`:''):''}
                          </>
                        }
                      </Text>
                  </View>
                </View>
              </TouchableOpacity>
            }
            
            {currentMessage.type=='image' &&
              <>       
                {isDownloading && 
                  <TouchableWithoutFeedback >             
                    <ImageBackground 
                      source={{uri:localFilePath}} 
                      style={{width:200, margin:11, justifyContent:'center',alignItems:'center',borderRadius:13, backgroundColor:'white',aspectRatio:3/4}}
                      imageStyle={{opacity:0.4}}
                    >
                      <CircularProgress value={parseInt(downloadProgress*100)} maxValue={100} radius={20}/>
                    </ImageBackground> 
                  </TouchableWithoutFeedback>
                }
                {isDownloaded && 
                  <TouchableWithoutFeedback delayLongPress={150} onPress={display ? openFile : ()=>{}}  onLongPress={()=>{}}>
                    <Image
                      source={{uri:localFilePath}} 
                      style={{width:200, margin:11,borderRadius:13, backgroundColor:'white',aspectRatio:3/4}}

                    />
                  </TouchableWithoutFeedback>
                }
              </>
            }

            {currentMessage.type=='video' &&
              <>
                {isDownloading && 
                  <View>             
                    <VideoView 
                      ref={ref}
                      player={player}
                      style={{width:200, margin:11, justifyContent:'center',alignItems:'center',opacity:0.4,aspectRatio:3/4, borderRadius:13}}
                      resizeMode='cover'
                    >
                      <CircularProgress value={parseInt(downloadProgress*100)} maxValue={100} radius={20}/>
                    </VideoView> 
                  </View>
                }
                {isDownloaded && 
                  <Pressable onPress={display ? openFile : ()=>{}} style={{position:'relative'}}  onLongPress={()=>{}}>
                    <VideoView 
                      ref={ref}
                      player={player}
                      style={{width:200, margin:11,aspectRatio:3/4, backgroundColor:'white', borderRadius:13, opacity:0.9}}
                      contentFit='cover'
                      nativeControls={false}
                    />
                    <FontAwesome6 style={{position:'absolute', top:'50%', left:100}} name="play" size={24} color="white" />
                  </Pressable>
                }
              </>
            }

            {currentMessage.type=='audio' &&
              <>
                {isDownloading &&
                  <TouchableWithoutFeedback>
                    <View style={{width:250, margin:6, borderRadius:13, flexDirection:'row', alignItems:'center',padding:8}}>
                      <CircularProgress value={parseInt(downloadProgress*100)} maxValue={100} radius={20}/>
                      <Text 
                        style={{marginHorizontal:10, fontWeight:'bold', fontSize:16, flexShrink:1}}
                        numberOfLines={1}
                        ellipsizeMode="clip"
                      >
                        {currentMessage.additionalInfo.name}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                }
                {
                  isDownloaded &&
                  <TouchableWithoutFeedback onPress={display ? openFile : ()=>{}}  onLongPress={()=>{}}>
                    <View style={{width:250, margin:6, borderRadius:13,backgroundColor:'transparent', padding:5}}>
                      <ImageBackground source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/recorder.png'}} resizeMode='contain' style={{width:'100%', aspectRatio:3.8}}/>
                    </View>
                  </TouchableWithoutFeedback>
                }
              </>
            }

            {
              currentMessage.type=='file' &&
              <>

                {isDownloading &&
                  <>
                    <TouchableWithoutFeedback>
                      <View style={{width:250, margin:6, borderRadius:13, flexDirection:'row', alignItems:'center',backgroundColor:colorScheme=='light'?(position=='right'?'rgb(225, 203, 185)':'rgb(228, 217, 177)'):(position=='left'?'rgb(221, 180, 106)':'rgb(201, 140, 112)'), padding:8}}>
                        <CircularProgress value={parseInt(downloadProgress*100)} maxValue={100} radius={20}/>
                        <Text 
                          style={{marginHorizontal:10, fontWeight:'bold', fontSize:16, flexShrink:1}}
                          numberOfLines={1}
                          ellipsizeMode="clip"
                        >
                          {currentMessage.additionalInfo.name}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </>
                }
                {isDownloaded &&
                  <TouchableWithoutFeedback onPress={display ? openFile : ()=>{}} onLongPress={()=>{}}>
                    <View style={{width:250, margin:6, borderRadius:13, flexDirection:'row', alignItems:'center',backgroundColor:colorScheme=='light'?(position=='right'?'rgb(225, 203, 185)':'rgb(228, 217, 177)'):(position=='left'?'rgb(221, 180, 106)':'rgb(201, 140, 112)'), padding:8}}>
                      <Avatar.Icon size={50} style={{backgroundColor:'rgb(240,240,240)'}} icon={()=><MaterialCommunityIcons name="file" size={40} color="black" style={{alignSelf:'center'}}/>}/>
                      <Text 
                        style={{marginHorizontal:10, fontWeight:'bold', fontSize:16, flexShrink:1}}
                        numberOfLines={1}
                        ellipsizeMode="clip"
                      >
                        {currentMessage.additionalInfo.name}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                }
              
              </>
            }

            {
              currentMessage.type=='location' &&
              <TouchableOpacity  onLongPress={()=>{}} onPress={display ? () => goToGoogleMaps(currentMessage.additionalInfo.latitude, currentMessage.additionalInfo.longitude) : ()=>{}}>
                <Image source={{ uri: mapApi }} resizeMode='cover' style={{ height: 133.33, width: 200, margin:11, borderRadius:13}} />
               </TouchableOpacity>
            }

            {currentMessage.type=='contact' &&
              <View style={{width:250, margin:11, overflow:'hidden'}}>

                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <View style={{height:50,width:50,borderRadius:25,overflow:'hidden'}}>
                    <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:currentMessage.additionalInfo.avatar}} />
                  </View>
                  <Text 
                    style={{fontSize:17,color:'black', marginLeft:10, fontWeight:'bold', flexShrink:1}}
                    numberOfLines={1} 
                    ellipsizeMode="clip"
                    >
                      {currentMessage.additionalInfo.name}
                  </Text>
                </View>

                <TouchableOpacity delayLongPress={350}  onLongPress={()=>{}} onPress={display ? ()=>a.navigate('Contact Card',{contact:currentMessage.additionalInfo}):()=>{}} style={{marginTop:20, borderRadius:30, width:'100%',backgroundColor:colorScheme=='light'?(position=='right'?'rgb(225, 203, 185)':'rgb(228, 217, 177)'):(position=='left'?'rgb(221, 180, 106)':'rgb(201, 140, 112)'), padding:5, alignItems:'center'}}>
                  <Text style={{fontSize:16, fontWeight:'bold'}}>View Contact</Text>
                </TouchableOpacity>
              </View>
            } 

            {currentMessage.type=='link' &&
              <TouchableWithoutFeedback onPress={()=>openLink(currentMessage.additionalInfo?.url)}>
                <View style={{minWidth:250, margin:6, borderRadius:13, flexDirection:'row', alignItems:'center',backgroundColor:colorScheme=='light'?(position=='right'?'rgb(225, 203, 185)':'rgb(228, 217, 177)'):(position=='left'?'rgb(221, 180, 106)':'rgb(201, 140, 112)'), padding:8}}>

                  <View style={{width:60,height:60, borderRadius:30, padding:5, overflow:'hidden', backgroundColor:'white'}}>
                    <Image style={{width:'100%', height:'100%'}} source={{uri:currentMessage.additionalInfo?.logo}} resizeMode='contain'/>
                  </View>
  
                  <View style={{flex:1, justifyContent:'space-between'}}>
                    <Text 
                      style={{marginHorizontal:10, fontWeight:'bold', fontSize:16, flexShrink:1, marginBottom:8, color:'rgb(30,30,30)'}}
                      numberOfLines={1}
                      ellipsizeMode="clip"
                    >
                      {currentMessage.additionalInfo.title}
                    </Text>
                    <Text 
                      style={{marginHorizontal:10, fontWeight:'bold', fontSize:12, flexShrink:1, color:'rgb(230,230,230)'}}
                      numberOfLines={1}
                      ellipsizeMode="clip"
                    >
                      {currentMessage.additionalInfo.description}
                    </Text>
                  </View>
                  
                </View>
            </TouchableWithoutFeedback>
            }
            
            {currentMessage.text ?

              <>
                {(currentMessage.replyTo?.text && currentMessage.isAttachment) ? 
                  <MessageText 
                    {...props} 
                    textStyle={{
                      left:{
                        color:'black',
                        width:200
                      },
                      right:{
                        color:'black',
                        width:200
                      }
                    }}
                  />
                :
                  <MessageText 
                  {...props} 
                  textStyle={{
                    left:{
                      color:'black',
                      fontStyle:'normal',
                      fontSize:17
                    },
                    right:{
                      color:'black',
                      fontStyle:'normal',
                      fontSize:17
                    }
                  }}
                />}
              </>
            :

            <></>

            }
            
            <View style={[
                styles[position].bottom,
                bottomContainerStyle && bottomContainerStyle[position],
                {paddingHorizontal:6, paddingBottom:6}
            ]}>
                {renderTime(props, setIsMenuVisible, setMsgInFocus)}
            </View>

          </View>
        </TouchableWithoutFeedback>
      </>
       
    )  
}
 
const ChatItem = (props) => {

  let {selected,setSelected,item} = props
  let user = useSelector(state=>state.user.value);
  let {contacts} = useSelector(state=>state.contacts.value);
  let [displayName, setDisplayName] = useState('');
  let colorScheme=useColorScheme();
  let [inSelection,setInSelection] = useState(false);

  useEffect(()=>{

    let name='';
    if(item.isSelfChat){
        name = `${user.data.firstName+" "+user.data.lastName} (Myself)`;
    } else if(item.isGroupChat){
        name = item.name;
    } else {
        name = item.otherUsers.user.phone;

        if(!(!contacts||contacts.length==0)) {
            for (let i of contacts){
                if(!i.isRegistered) continue;
                
                if(i.server_info.id==item.otherUsers.user_id){
                    name = (i.item?.firstName?i.item.firstName:'') + (i.item?.lastName?i.item.lastName:'')
                }
            }
        }
    }

    setDisplayName(name)
    
},[contacts]);

  async function handleSelection(){
      const existingObj = selected.find(i=>i.id==item.id);
      if (existingObj) {
          let arrayOfObjects = selected.filter(i => i.id !== item.id);
          setSelected(arrayOfObjects)
          setInSelection(false)
        } else {
          setSelected([...selected, item])
          setInSelection(true)
        }
  }
  return (
          
          <>
          {inSelection&&colorScheme=='light'&&!item.chat_member.blocked_chat&&
          <Pressable style={styles.chatItem} onPress={handleSelection}>
              <View style={styles.selected}>
                  <View style={{height:50,width:50,borderRadius:25,overflow:'hidden'}}>
                    <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.isGroupChat?item.avatar:(!item.isSelfChat?(item.otherUsers?.user?.avatar):user.data.image)}}></Image>
                  </View>
                  <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                      <Text style={colorScheme=='light'?styles.name:styles.name_dark}>{displayName}</Text>
                      <Text style={{color:'grey', fontStyle:'italic'}}>{item.isGroupChat?item.bio:(item.isSelfChat?user.data.bio:item.otherUsers?.user?.bio)}</Text>
                  </View>
                  {inSelection?
                  <AntDesign name="check-circle" size={24} color="rgb(20,130,199)" />
                  :
                  <></>}
              </View>
          </Pressable>}
          {inSelection&&colorScheme=='dark'&&!item.chat_member.blocked_chat&&
          <Pressable style={styles.chatItem} onPress={handleSelection}>
              <View style={styles.selected_dark}>
                  <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                  <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.isGroupChat?item.avatar:(!item.isSelfChat?(item.otherUsers?.user?.avatar):user.data.image)}}></Image>
                  </View>
                  <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                      <Text style={colorScheme=='light'?styles.name:styles.name_dark}>{displayName}</Text>
                      <Text style={{color:'grey', fontStyle:'italic'}}>{item.isGroupChat?item.bio:(item.isSelfChat?user.data.bio:item.otherUsers?.user?.bio)}</Text>
                  </View>
                  {inSelection?
                  <AntDesign name="check-circle" size={24} color="rgb(20,130,199)" />
                  :
                  <></>}
              </View>
          </Pressable>}

          {!inSelection&&
          
            <>
              {item.chat_member.blocked_chat ? 
              <View style={styles.chatItem}>
                <View style={styles.normal}>
                    <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.isGroupChat?item.avatar:(!item.isSelfChat?(item.otherUsers?.user?.avatar):user.data.image)}}></Image>
                    </View>
                    <View style={{marginHorizontal:20,height:'100%',justifyContent:'space-between',width:'60%',overflow:'hidden'}}>
                        <Text style={{fontWeight:'bold', fontSize:15, marginVertical:5, color:'grey'}}>{displayName}</Text>
                        <Text style={{color:'grey', fontStyle:'italic'}}>You have blocked this user</Text>
                    </View>
                </View>
              </View>
              :
              <Pressable style={styles.chatItem} onPress={handleSelection}>
                <View style={styles.normal}>
                    <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.isGroupChat?item.avatar:(!item.isSelfChat?(item.otherUsers?.user?.avatar):user.data.image)}}></Image>
                    </View>
                    <View style={{marginHorizontal:20,height:'100%',justifyContent:'space-between',width:'60%',overflow:'hidden'}}>
                        <Text style={colorScheme=='light'?styles.name:styles.name_dark}>{displayName}</Text>
                        <Text style={{color:'grey', fontStyle:'italic'}}>{item.isGroupChat?item.bio:(item.isSelfChat?user.data.bio:item.otherUsers?.user?.bio)}</Text>
                    </View>
                    {inSelection?
                    <AntDesign name="check-circle" size={24} color="rgb(20,130,199)" />
                    :
                    <></>}
                </View>
              </Pressable>
              }
            </>
          }
          
          </>
  )
}


export const ForwardMessage = ({route,navigation}) => {

  let colorScheme = useColorScheme();
  let user = useSelector(state=>state.user.value);
  let [selected,setSelected] = useState([]);
  let [forwarding,setForwarding] = useState(false);
  let [searchText, setSearchText] = useState();
  let {setChannel, channel, socket, setChats, chats, hidden_chats, setHiddenChats, setAsk,ask, archived_chats, setArchivedChats} = useChannelSet();
  let screenWidth = Dimensions.get('window').width;
  let {message} = route.params;

  const forwardMessage = useCallback(async () => {
    try{

      setForwarding(true);
      const promises = selected.map(async (chat)=>{

        let forwarded_message = {
          _id:uuid.v4(),
          text:message.text,
          createdAt:Date.parse(new Date()),
          isAttachment:message.isAttachment,
          chat_id:chat.id,
          user:{
            _id:parseInt(user.data.id),
            avatar:user.data.image,
            phone:user.data.phone,
            name:user.data.firstName+" "+user.data.lastName
          },
          forwarded:true,
          system:false,
          type: message.type
        }

        if(!(message.type=='contact'||message.type=='location'||message.type=='text')){

          if(message.file_path?.startsWith('https://')) {

            forwarded_message={...forwarded_message, file_path:message.file_path, additionalInfo:message.additionalInfo};

            let reply = await fetch('http://216.126.78.3:8500/api/forward/message/attachment',{
              method:'POST',
              headers:{
                  'Content-type':'application/json',
                  'Authorization':`Bearer ${user.token}`
              },
              body:JSON.stringify({...forwarded_message})
            });
            let response = await reply.json();
            socket.emit('new message',response.data)
          } 
          else {
            let form = new FormData();
  
            form.append('text',forwarded_message.text);
            form.append('chat_id',chat.id);
            form.append('isAttachment',forwarded_message.isAttachment);
            form.append('createdAt',forwarded_message.createdAt);
            form.append('forwarded',true);
            form.append('type',message.type);

            if(message.file_path){
              form.append('file',{uri:message.file_path,type:message.additionalInfo.mimeType||message.additionalInfo.type,name:message.additionalInfo.fileName||message.additionalInfo.name});
            }
  
            let reply = await fetch('http://216.126.78.3:8500/api/new/message/attachment',{
              method:'POST',
              headers:{
                  'Authorization':`Bearer ${user.token}`
              },
              body:form
            });
            let response = await reply.json();

            console.log(response,'...stitch....\n\n')
            socket.emit('new message',response.data)
          }
        }
        else {
  
          if(message.type=='contact'||message.type=='location'){
            forwarded_message={...forwarded_message, additionalInfo:message.additionalInfo}
          }
          
          console.log(forwarded_message,'...295...\n\n',message)

          let reply = await fetch('http://216.126.78.3:8500/api/new/message',{
              method:'POST',
              headers:{
                  'Content-type':'application/json',
                  'Authorization':`Bearer ${user.token}`
              },
              body:JSON.stringify({...forwarded_message})
          });
          let response = await reply.json();
          socket.emit('new message',response.data)
        }
      });

      await Promise.all(promises);
      setAsk(!ask);
      setForwarding(false);
      navigation.pop();
    }catch(err){
        setForwarding(false);
        console.log(err,'Error in sending messages.....\n\n')
    }
  },[message,selected,ask])

  return (
      <SafeAreaView style={colorScheme=='light'?styles.container:styles.container_dark}>
        <View style={styles.header_forward}>
            <Pressable onPress={()=>{setSelected([]);setForwarding(false);navigation.pop();}}><AntDesign name="left" size={24} color="rgb(20,130,199)" /></Pressable>
            <View style={styles.text}>
                <Text style={styles.newchat}>Forward Message</Text>
            </View>
            
        </View>
        <View style={{alignItems:'center'}}>
            <TextInput style={colorScheme=='light'?styles.searchInput:styles.searchInput_dark} placeholder="Search chats" onChangeText={(text)=>setSearchText(text)}/>
            <ScrollView style={{width:'100%', height:'100%'}} contentContainerStyle={{justifyContent:'flex-start',paddingBottom:70}}>

                {/**Send to chats */}
                {message?.chat_id && chats.length>0 ? 
                  <>
                    {!searchText&&chats.filter(i=>
                      i && i.id!=message.chat_id).map((i,index)=>
                        <ChatItem item={i} key={index} selected={selected} setSelected={setSelected}/>  
                      )
                    }
                  </>
                :
                  <>
                    {message?.chat?.id && chats.length>0 ? 
                      <>
                        {!searchText&&chats.filter(i=>
                          i&&i.id!=message.chat.id).map((i,index)=>
                            <ChatItem item={i} key={index} selected={selected} setSelected={setSelected}/>  
                          )
                        }
                      </>
                      :
                      <></>
                    }
                  </>
                }
                
                
                <View style={{paddingVertical:40}}>

                </View>
            </ScrollView>
        
        </View>
        <Button disabled={forwarding} mode="contained" onPress={forwardMessage} buttonColor='rgb(20,130,199)' textColor='white' style={{position:'absolute',bottom:40,width:150,left:(screenWidth-150)/2}} labelStyle={{fontWeight:'bold',fontSize:17}}>
            Forward
        </Button>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'white',
    padding:10
  },
  container_dark:{
    flex:1,
    backgroundColor:'rgb(33,38,51)',
    padding:10
  },
  header:{
      flexDirection:'row',
      backgroundColor:'white',
      height:130,
      width:'100%'
  },
  header_dark:{
      flexDirection:'row',
      backgroundColor:'rgb(41,44,56)',
      height:130,
      width:'100%'
  },
  header_forward:{
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:15,
    marginVertical:10

  },
  searchInput:{
    height: 40,
    borderRadius:8,
    backgroundColor: 'rgb(228,229,231)',
    paddingHorizontal: 15,
    marginBottom: 10,
    width:'90%',
    color:'rgb(120,134,142)',
    margin:15
  },
  searchInput_dark:{
      height: 40,
      borderRadius:8,
      backgroundColor: 'rgb(63,68,81)',
      paddingHorizontal: 15,
      marginBottom: 10,
      width:'90%',
      color:'white',
      margin:15
  },
  text:{
    flex:1,
    flexDirection:'row',
    justifyContent:'center'
  },
  newchat:{
      fontSize:17,
      fontWeight:'bold',
      color:'rgb(20,130,199)',
  },
  image:{
      width:'100%',
      height:'100%',
      resizeMode:'cover',
      paddingTop:Platform.OS=='ios'?0:10
  },
  pp:{
      width:50,
      height:50,
      borderRadius:25,
      overflow:'hidden'
  },
  statusBar:{
      height: STATUSBAR_HEIGHT,
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
  selected:{
    flexDirection:'row',
    backgroundColor:'rgb(200,201,203)',
    width:'100%',
    paddingVertical:10,
    paddingHorizontal:20,
    borderRadius:20,
    alignItems:'center'
  },
  selected_dark:{
      flexDirection:'row',
      backgroundColor:'rgb(30,30,30)',
      width:'100%',
      paddingVertical:10,
      paddingHorizontal:20,
      borderRadius:20,
      alignItems:'center'
  },
  normal:{
    flexDirection:'row',
    width:'100%',
    paddingVertical:10,
    paddingHorizontal:20,
    alignItems:'center'
  },
  chatItem:{
    flexDirection:'row',
    flex:1,    
    marginVertical:10
  },
  left:{
    container: {
        flex: 1,
        alignItems: 'flex-start',
    },
    wrapper: {
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        marginRight: 60,
        minHeight: 20,
        justifyContent: 'flex-end',
    },
    containerToNext: {
        borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
        borderTopLeftRadius: 3,
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
},
right:{
    container: {
        flex: 1,
        alignItems: 'flex-end',
    },
    wrapper: {
        borderRadius: 15,
        backgroundColor: '#0084ff',
        marginLeft: 60,
        minHeight: 20,
        justifyContent: 'flex-end',
    },
    containerToNext: {
        borderBottomRightRadius: 3,
    },
    containerToPrevious: {
        borderTopRightRadius: 3,
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
},
content: StyleSheet.create({
  tick: {
      fontSize: 10,
      backgroundColor: 'transparent',
      color: 'rgb(255,255,255)',
  },
  tickView: {
      flexDirection: 'row',
      marginRight: 10,
  },
  username: {
      top: 2,
      left: 0,
      fontSize: 12,
      backgroundColor: 'transparent',
      color: '#0D0D74',
      fontWeight:'bold'
  },
  usernameView: {
      flexDirection: 'row',
      marginHorizontal: 10,
  },
}),
reactionStyleLeft:{
  height:22,
  width:22,
  borderRadius:11,
  position:'absolute', 
  top:-4,
  right:-15,
  alignItems:'center',
  justifyContent:'center',
  zIndex:10
},
reactionStyleRight:{
  height:22,
  width:22,
  borderRadius:11,
  position:'absolute', 
  top:-4,
  left:-15,
  alignItems:'center',
  justifyContent:'center',
  zIndex:10
},
overlay: {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  elevation:10,
  zIndex:100,
},
 menu: {
   width: '100%',
   paddingHorizontal: 20,
   borderRadius: 10,
   zIndex:200,
   height:'50%',
   paddingVertical:10
 },
 closeButton: {
  alignSelf: 'flex-end',
  paddingBottom: 10,
}
})