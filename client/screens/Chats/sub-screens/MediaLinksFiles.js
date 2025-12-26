import React,{useState, useEffect, useRef, useCallback} from 'react';
import {SafeAreaView,Text, StyleSheet,View,Dimensions,FlatList, TouchableOpacity, StatusBar, Image, Pressable, ImageBackground, SectionList, Linking} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useChannelSet } from '../../../context/channel';
import { ActivityIndicator, Avatar} from 'react-native-paper';
import {useSelector} from 'react-redux';
import Video from 'react-native-video';
import * as FileSystem from 'expo-file-system';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useVideoPlayer, VideoView } from 'expo-video';
import FileViewer from "react-native-file-viewer";
import dayjs from 'dayjs';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

const windowWidth = Dimensions.get('window').width;

const STATUSBAR_HEIGHT = StatusBar.currentHeight;



const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);

const ShowMedia = () => {

  const [mediaGroups, setMediaGroups] = useState({});
  let {channel} = useChannelSet();
  let user = useSelector(state=>state.user.value)
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 50; // Number of media files to fetch per request

  const fetchMedia = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      
      const reply = await fetch(`http://216.126.78.3:8500/api/fetch/media?chat_member_id=${channel?.chat_member.id}&channel_id=${channel?.id}&limit=${LIMIT}&offset=${offset}`,{
        headers:{
          'Content-type':'application/json',
          'Authorization':`Bearer ${user.token}`
        }
      });
      const response = await reply.json();

      if (response.success) {
        setMediaGroups((prev) => ({ ...prev, ...response.groupedMedia }));
        setOffset(50);
      }

      if (response.count < LIMIT) {
        setHasMore(false); // If fewer than LIMIT items are returned, no more to load
      }

    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Optional loading indicator at the end of the list
  const renderFooter = () => {
    if (!loading) return null;
    <ActivityIndicator animating={true} color={'rgb(170,170,170)'} style={{marginVertical:40}}/>
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={Object.keys(mediaGroups)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.section}>
            {/* Section Header */}
            <Text style={styles.headerText}>{item}</Text>
            <FlatList
            data={mediaGroups[item]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MediaItem item={item}/>
            )}
            />
          </View>
        )}
        ListFooterComponent={renderFooter}
        onEndReached={fetchMedia}
      />
    </View>
  )
};

const MediaItem = ({item}) => {


  const videoSource = item.type?.includes('video')?item.file_path:'';
  const [status, setStatus] = useState('rendered');
  const [localFilePath, setLocalFilePath] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const ref = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.pause();
  });

  useEffect(()=>{
    (
      async function(){
        await checkIfFileExists();
      }
    )();
    
  },[]);

  async function checkIfFileExists(){

    //Check if file is somehow present to directly show
    let url = item.file_path;
    const split_url = url.split('/');
    let ext = split_url[split_url.length-1];
    
    const fileInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}${ext}`);
    if (fileInfo.exists) {
      setLocalFilePath(fileInfo.uri);
      setStatus('downloaded');
    }
  }

  async function downloadFile(){

    setStatus('downloading');
    let url = item.file_path;
    const split_url = url.split('/');
    let ext = split_url[split_url.length-1];

    try{
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.documentDirectory+ext,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      setLocalFilePath(uri);
      setStatus('downloaded');
      return uri

    }catch(err){
      console.error('Error downloading file:', err);
      setStatus('rendered')
    }finally {
      
    }

  }

  async function openFile(){
    if(localFilePath){
      await FileViewer.open(localFilePath)
    } else {
      let uri = await downloadFile();
      await FileViewer.open(uri)
    }
    
  }

  return (
    <>
    {item.type?.includes('image')?
      <>
        {(status=='rendered' || status=='downloaded') &&
          <Pressable onPress={openFile}>
            <Image 
              source={{uri:item.file_path}}
              style={{aspectRatio:1,width:windowWidth/4}}
            />
          </Pressable>
        }
        {status=='downloading' &&
          <ImageBackground 
            source={{uri:item.file_path}} 
            style={{width:windowWidth/4, justifyContent:'center',alignItems:'center', backgroundColor:'white',aspectRatio:1}}
            imageStyle={{opacity:0.4}}
          >
            <CircularProgress value={parseInt(downloadProgress*100)} maxValue={100} radius={20}/>
          </ImageBackground> 
        }
      </>
    :
      <>
        {(status=='rendered' || status=='downloaded') &&
          <Pressable onPress={openFile}>
            <Video 
              source={{uri:item.file_path}} 
              style={{width:windowWidth/4, justifyContent:'center',alignItems:'center',borderRadius:13, backgroundColor:'white',aspectRatio:1}}
              resizeMode='cover'
              muted
            />
            <Ionicons name='videocam' color='white' size={18} style={{position:'absolute', bottom:5, left:5}}/>
          </Pressable>
        }
        {status=='downloading' &&
          <VideoView 
          ref={ref}
          player={player}
          style={{width:windowWidth/4, justifyContent:'center',alignItems:'center', opacity:0.4,aspectRatio:1}}
          resizeMode='cover'
          >
            <CircularProgress value={parseInt(downloadProgress*100)} maxValue={100} radius={20}/>
          </VideoView> 
        }
      </>
    }
    </>
          
  );
};

const ShowLinks = () => {

  const [mediaSections, setMediaSections] = useState([]);
  let {channel} = useChannelSet();
  let user = useSelector(state=>state.user.value)
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 50; // Number of media files to fetch per request

  const fetchLinks = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      
      const reply = await fetch(`http://216.126.78.3:8500/api/fetch/links?chat_member_id=${channel?.chat_member.id}&channel_id=${channel?.id}&limit=${LIMIT}&offset=${offset}`,{
        headers:{
          'Content-type':'application/json',
          'Authorization':`Bearer ${user.token}`
        }
      });
      const response = await reply.json();
      const newSections = [];

      console.log(response,'..parth..\n\n');
      // Map grouped media into SectionList format
      for (const [month, media] of Object.entries(response.groupedLinks)) {
        console.log(month,media,'...ek vari...\n\n')
        newSections.push({
          title: month, // Month name like 'October 2024'
          data: media,  // Media files for that month
        });
      }

      setMediaSections([...mediaSections, ...newSections]); // Append new sections
      setOffset(offset + LIMIT);

      if (response.count < LIMIT) {
        setHasMore(false); // If fewer than LIMIT items are returned, no more to load
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);


  //Rendering section header
  const renderSectionHeader = ({ section: { title } }) => (
    <View style={{backgroundColor:'rgba(30,30,30,1)'}}>
      <Text style={{color:'white', margin:10, fontSize:17, fontWeight:'bold'}}>{title}</Text>
    </View>
  );

  // Optional loading indicator at the end of the list
  const renderFooter = () => {
    if (!loading) return null;
    <ActivityIndicator animating={true} color={'rgb(170,170,170)'} style={{marginVertical:40}}/>
  };

  return (
    <View style={{ flex: 1}}>
      <SectionList
        sections={mediaSections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLinkItem}
        renderSectionHeader={renderSectionHeader}
        onEndReached={fetchLinks} // Fetch more media when reaching the end
        onEndReachedThreshold={0.5} // Adjust for when to load more
        ListFooterComponent={renderFooter} // Loading indicator
      />
    </View>
  )
};

const renderLinkItem = ({item}) => {

  function openLink(url){
    try{
      Linking.openURL(url)
    }catch(err){
      console.log(err,'..Error in opneing link...\n\n')
    }
  }

  return (
    <Pressable onPress={()=>openLink(JSON.parse(item.additionalInfo).url)} style={{borderBottomColor:'rgb(60,60,60)', borderBottomWidth:0.5, width:windowWidth}}>
      <View style={{width:windowWidth*0.7, backgroundColor:'transparent', alignSelf:'center', flexDirection:'row', marginVertical:20}}>
        <View style={{width:60,height:60, borderRadius:30, padding:5, overflow:'hidden', backgroundColor:'white'}}>
          <Image style={{width:'100%', height:'100%'}} source={{uri:JSON.parse(item.additionalInfo).logo}} resizeMode='contain'/>
        </View>
        <View style={{flex:1, marginHorizontal:15, justifyContent:'space-between'}}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:14, color:'rgb(180,180,180)'}}>{item.additionalInfo?JSON.parse(item.additionalInfo).title:'Link'}</Text>
          <Text numberOfLines={2} ellipsizeMode="tail" style={{color:'grey', fontSize:12}}>{item.additionalInfo?JSON.parse(item.additionalInfo).description:''}</Text>
        </View>
        <Text style={{color:'grey', fontSize:12, marginLeft:10}}>{dayjs(item.createdAt).format('YYYY-MM-DD')}</Text>
      </View>
    </Pressable>
  )
}

const ShowFiles = () => {

  const [mediaSections, setMediaSections] = useState([]);
  let {channel} = useChannelSet();
  let user = useSelector(state=>state.user.value)
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 50; // Number of media files to fetch per request

  const fetchFiles = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      
      const reply = await fetch(`http://216.126.78.3:8500/api/fetch/files?chat_member_id=${channel?.chat_member.id}&channel_id=${channel?.id}&limit=${LIMIT}&offset=${offset}`,{
        headers:{
          'Content-type':'application/json',
          'Authorization':`Bearer ${user.token}`
        }
      });
      const response = await reply.json();
      const newSections = [];

      console.log(response,'..parth..\n\n');
      // Map grouped media into SectionList format
      for (const [month, media] of Object.entries(response.groupedFiles)) {
        console.log(month,media,'...ek vari...\n\n')
        newSections.push({
          title: month, // Month name like 'October 2024'
          data: media,  // Media files for that month
        });
      }

      setMediaSections([...mediaSections, ...newSections]); // Append new sections
      setOffset(offset + LIMIT);

      if (response.count < LIMIT) {
        setHasMore(false); // If fewer than LIMIT items are returned, no more to load
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);


  //Rendering section header
  const renderSectionHeader = ({ section: { title } }) => (
    <View style={{backgroundColor:'rgba(30,30,30,1)'}}>
      <Text style={{color:'white', margin:10, fontSize:17, fontWeight:'bold'}}>{title}</Text>
    </View>
  );

  // Optional loading indicator at the end of the list
  const renderFooter = () => {
    if (!loading) return null;
    <ActivityIndicator animating={true} color={'rgb(170,170,170)'} style={{marginVertical:40}}/>
  };

  return (
    <View style={{ flex: 1}}>
      <SectionList
        sections={mediaSections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFileItem}
        renderSectionHeader={renderSectionHeader}
        onEndReached={fetchFiles} // Fetch more media when reaching the end
        onEndReachedThreshold={0.5} // Adjust for when to load more
        ListFooterComponent={renderFooter} // Loading indicator
      />
    </View>
  )
};

//Rendering File Item
const renderFileItem = ({item}) => {

  const [status, setStatus] = useState('rendered');
  const [localFilePath, setLocalFilePath] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  let {channel} = useChannelSet();
  let user = useSelector(state=>state.user.value);
  let [displayName, setDisplayName] = useState('');
  let {contacts} = useSelector(state=>state.contacts.value);
  //In case of audio files, show duration till we improve messages code
  let [duration, setDuration] = useState('');

  // Use expo-audio hook for audio playback (must be called unconditionally)
  const audioPlayer = useAudioPlayer(item.type?.includes('audio') ? { uri: item.file_path } : null);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  useEffect(()=>{
    (
      async function(){
        await checkIfFileExists();
      }
    )();
  },[]);

  useEffect(()=>{
    // Update duration from audio status (only for audio files)
    if (item.type?.includes('audio') && audioStatus.duration) {
      const durationInSeconds = audioStatus.duration;
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = Math.floor(durationInSeconds % 60);
      setDuration(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    } else if (!item.type?.includes('audio')) {
      setDuration(''); // Clear duration for non-audio items
    }
  }, [audioStatus.duration, item.type]);

  useEffect(()=>{

    let name=item.user.phone;
    if(channel?.isSelfChat){
        name = `${user.data.firstName+" "+user.data.lastName} (Myself)`;
    } else {
        if(!(!contacts||contacts.length==0)) {
          for (let i of contacts){
            if(!i.isRegistered) continue; 
            if(i.server_info.id==item.user.id){
              name = (i.item?.firstName?i.item.firstName:'') + (i.item?.lastName?i.item.lastName:'')
            }
          }
        }
    }

    setDisplayName(name)
    
  },[contacts]);


  async function checkIfFileExists(){

    //Check if file is somehow present to directly show
    let url = item.file_path;
    const split_url = url.split('/');
    let ext = split_url[split_url.length-1];
    
    const fileInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}${ext}`);
    if (fileInfo.exists) {
      setLocalFilePath(fileInfo.uri);
      setStatus('downloaded');
    }
  }

  async function downloadFile(){

    setStatus('downloading');
    let url = item.file_path;
    const split_url = url.split('/');
    let ext = split_url[split_url.length-1];

    try{
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.documentDirectory+ext,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      setLocalFilePath(uri);
      setStatus('downloaded');
      return uri

    }catch(err){
      console.error('Error downloading file:', err);
      setStatus('rendered')
    }finally {
      
    }

  }

  async function openFile(){
    if(localFilePath){
      await FileViewer.open(localFilePath)
    } else {
      let uri = await downloadFile();
      await FileViewer.open(uri)
    }
    
  }

  return (
    <>
      {item.type?.includes('audio') ? 
        <View style={{borderBottomColor:'rgb(60,60,60)', borderBottomWidth:0.5, width:windowWidth}}>
          {(status=='rendered' || status=='downloaded') &&
            <Pressable onPress={openFile} style={{width:windowWidth*0.7, backgroundColor:'transparent', alignSelf:'center', flexDirection:'row', marginVertical:20}}>
                <Avatar.Icon size={45} icon={()=><FontAwesome6 name="play" size={24} color="black" />} style={{backgroundColor:'white'}} />
                <View style={{flex:1, marginHorizontal:15, justifyContent:'space-between'}}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:14, color:'rgb(180,180,180)'}}>{displayName}</Text>
                  <Text style={{color:'grey', fontSize:12}}>{duration}</Text>
                </View>
                <MaterialIcons name="multitrack-audio" size={40} color="white" style={{marginLeft:10}}/>
            </Pressable>
          }
          {status=='downloading' &&
            <Pressable style={{width:windowWidth*0.7, flexDirection:'row', alignItems:'center',marginVertical:20, alignSelf:'center'}}>
              <CircularProgress value={parseInt(downloadProgress*100)} maxValue={100} radius={30}/>
              <View style={{flex:1, marginHorizontal:15, justifyContent:'space-between'}}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:14, color:'rgb(180,180,180)'}}>{displayName}</Text>
                <Text style={{color:'grey', fontSize:12}}>{duration}</Text>
              </View>
            </Pressable>
          }
        </View>
      :
        <View style={{borderBottomColor:'rgb(60,60,60)', borderBottomWidth:0.5, width:windowWidth}}>
          {(status=='rendered' || status=='downloaded') &&
            <Pressable onPress={openFile} style={{width:windowWidth*0.7, backgroundColor:'transparent', alignSelf:'center', flexDirection:'row', marginVertical:20}}>
                <Avatar.Icon size={45} icon={()=><MaterialCommunityIcons name="file" size={28} color="black" style={{alignSelf:'center'}}/>} style={{backgroundColor:'white'}} />
                <View style={{flex:1, marginHorizontal:15, justifyContent:'space-between'}}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:14, color:'rgb(180,180,180)'}}>{item.additionalInfo?JSON.parse(item.additionalInfo).name:'File'}</Text>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={{color:'grey', fontSize:12}}>{displayName}</Text>
                </View>
                <Text style={{color:'grey', fontSize:12, marginLeft:10}}>{dayjs(item.createdAt).format('YYYY-MM-DD')}</Text>
            </Pressable>
          }
          {status=='downloading' &&
            <Pressable style={{width:windowWidth*0.7, flexDirection:'row', alignItems:'center',marginVertical:20, alignSelf:'center'}}>
              <CircularProgress value={parseInt(downloadProgress*100)} maxValue={100} radius={30}/>
              <View style={{flex:1, marginHorizontal:15, justifyContent:'space-between'}}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:14, color:'rgb(180,180,180)'}}>{item.additionalInfo?JSON.parse(item.additionalInfo).name:'File'}</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" style={{color:'grey', fontSize:12}}>{displayName}</Text>
              </View>
              <Text style={{color:'grey', fontSize:12, marginLeft:10}}>{dayjs(item.createdAt).format('YYYY-MM-DD')}</Text>
            </Pressable>
          }
        </View>
      }
    
    </>
  )
}

export default function MediaLinksFiles({navigation,route}){

    let {initialNeed} = route.params;

    let {channel, setChannel} = useChannelSet();
    const [type, setType] =useState(initialNeed);
    

    useEffect(()=>{
        if(channel){
            //Load Resources from API
            async function loadResources(){

            }
            loadResources();
        }
    },[channel])
  
    
    return (
      <>
        <MyStatusBar
            backgroundColor={'rgb(0,0,0)'}
            barStyle={'light-content'}
        ></MyStatusBar>
  
        <LinearGradient style={{flex:1,width:'100%'}} colors={['rgb(1,11,42)','rgb(60,75,117)']}>
            <SafeAreaView style={{flex:1}}>
              <View style={styles.nav}>
                <TouchableOpacity onPress={()=>navigation.pop()}><AntDesign name="left" size={24} color="white" /></TouchableOpacity>
                  <View style={styles.navPill}>
                    <TouchableOpacity onPress={()=>setType('media')} style={{width:'33%', padding:10, alignItems:'center', borderTopLeftRadius:100, borderBottomLeftRadius:100, backgroundColor:type=='media'?'rgb(100,100,100)':'transparent'}}>
                      <Text style={{fontSize:15, color:'white'}}>Media</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>setType('links')} style={{width:'33%', padding:10, alignItems:'center', backgroundColor:type=='links'?'rgb(100,100,100)':'transparent'}}>
                      <Text style={{fontSize:15, color:'white'}}>Links</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>setType('files')} style={{width:'33%', alignItems:'center', padding:10, borderTopRightRadius:100, borderBottomRightRadius:100, backgroundColor:type=='files'?'rgb(100,100,100)':'transparent'}}>
                      <Text style={{fontSize:15, color:'white'}}>Files</Text>  
                    </TouchableOpacity>
                  </View>
                <TouchableOpacity onPress={()=>{}}><AntDesign name="left" size={24} color="transparent" /></TouchableOpacity>
              </View>

              {type=='media' &&
                <ShowMedia />
              }
              {type=='links' &&
                <ShowLinks />
              }
              {type=='files' &&
                <ShowFiles />
              }

            </SafeAreaView>
        </LinearGradient>
      </>
    )
}
  
const styles=StyleSheet.create({
  linearGradient:{
    width:'100%',
    height:'47.5%',
    paddingVertical:10,
  
  },
  statusBar:{
    height: STATUSBAR_HEIGHT,
  },
  nav:{
    backgroundColor:'rgba(0,0,0,0.5)',
    padding:15,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  navPill:{
    borderRadius:100,
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'rgb(30,30,30)',
    width:windowWidth*0.55
  },
  section: {
    marginVertical: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal:15,
    color:'white',
    marginBottom:15
  },
  image: {
    flexBasis:'25%',
    aspectRatio:1
  },
})
  