import React,{useEffect, useState, useRef, useCallback} from 'react';
import {Text,StyleSheet,ScrollView,View,Image,Dimensions, useColorScheme, Pressable, Modal, SafeAreaView, TouchableOpacity} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; 
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';



const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const imageWidth = windowWidth * 0.3;

const OverlayMenu = ({onClose,navigation}) => {

  let colorScheme = useColorScheme();

  return (
    <View style={styles.overlay}>
      <View style={{...styles.menu, backgroundColor:colorScheme=='light'?'white':'rgb(39,41,48)'}}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={30} color={colorScheme=='light'?'black':'white'} />
        </TouchableOpacity>
        {/* Add your menu options as TouchableOpacity components */}
        <TouchableOpacity style={styles.menuOption}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <Ionicons name="eye-outline" size={28} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Interests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuOption}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <MaterialCommunityIcons name="archive-outline" size={28} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Archive</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuOption}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <Ionicons name="bookmarks-outline" size={24} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Saved Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuOption}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <Ionicons name="people-outline" size={24} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuOption}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <EvilIcons name="gear" size={26} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Settings and Privacy</Text>
        </TouchableOpacity>
        
        {/* ... add more options */}
      </View>
    </View>
  );
}

const FlixDisplay = (props) => {

    let {i, handlePresentModalForwardPress, handlePresentModalCommentPress, activeFlixId, navigation} = props;
    let colorScheme = useColorScheme();
    let video_ref = useRef();
    const player = useVideoPlayer(i.url, (player) => {
      player.play();
      player.loop = true
    });
    let [playing_status, setPlayingStatus] = useState(true);
    let [liked, setLiked] = useState(false);
    let [saved, setSaved] = useState(false);
    const [textShown, setTextShown] = useState(false); //To show ur remaining Text
    const [lengthMore,setLengthMore] = useState(false); //to show the "Read more & Less Line"
    const toggleNumberOfLines = () => { //To toggle the show text or hide it
        setTextShown(!textShown);
    }

    useEffect(()=>{
      
    },[activeFlixId ])


    const onTextLayout = useCallback(e =>{
      setLengthMore(e.nativeEvent.lines.length >2); //to check the text is more than 4 lines or not
    },[]);

    
    function onPress(){
      if(player.playing){
        console.log('Paused');
        setPlayingStatus(false);
        player.pause();
      }
      else{
        console.log('Played');
        setPlayingStatus(true);
        player.play();
      }
    }
    
    return(

      <View style={styles.container}>
        <VideoView
          ref={video_ref}
          player={player}
          style={[StyleSheet.absoluteFill, styles.video]}
          contentFit={'cover'}
          nativeControls = {false}
        />

    
        <Pressable onPress={onPress} style={styles.bottomTab}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style = {[StyleSheet.absoluteFill, styles.gradient]}
          >
            {/** Note absoluteFill use karkey yeh seperate full screen component hai */}
          </LinearGradient>
          {/**To safely write all headers and footers */}
          <SafeAreaView style={{flex:1}}>

            <TouchableOpacity style={styles.backButton} onPress={(event)=>{navigation.pop();event.stopPropagation();}}>
              <Ionicons name="chevron-back" size={30} color={'white'} />
            </TouchableOpacity>

            {!playing_status &&
              <Ionicons name="play-outline" size={30} color="white" style={{position:'absolute', alignSelf:'center', top:windowHeight/2}}/>
            }

            <View style={styles.footer}>

              <View style={[styles.leftColumn]}>

                <View style={styles.userInfo}>

                  <TouchableOpacity style={{overflow:'hidden', height: windowWidth/14 , width: windowWidth/14, borderRadius: windowWidth/28}}>
                    <Image source={{uri:i.user.avatar}} resizeMode='cover' style={{height:'100%', width:'100%'}}/>
                  </TouchableOpacity>

                  <TouchableOpacity style={{marginHorizontal:20}}>
                    <Text style={{fontWeight:'bold', color:'white', fontSize:14, color:'white'}}>{i.user.username}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{paddingVertical:6, paddingHorizontal:15, borderWidth:0.5, borderColor:'white', borderRadius:5}}>
                    <Text style={{color:'white', fontWeight:'bold', fontSize:13}}>Follow</Text>
                  </TouchableOpacity>  

                </View>

                <Pressable style={styles.textContainer} onPress={(e)=>{toggleNumberOfLines();e.stopPropagation();}}>
                  <Text
                    onTextLayout={onTextLayout}
                    numberOfLines={textShown ? undefined : 2}
                    style={{ lineHeight: 21, color:'white' }}>
                      {i.caption}
                  </Text>

                  {
                      lengthMore ? <Text
                      style={{ lineHeight: 21, marginTop: 10, color:'rgb(230,230,230)' }}>{textShown ? '' :'Read more...' }</Text>
                      :null
                  }
                </Pressable>

              </View>

              <View style={styles.rightColumn}>
                <TouchableOpacity style={{marginVertical:10, alignItems:'center'}} onPress={()=>setLiked(!liked)}>
                  {liked ? 
                  <Ionicons name="heart" size={30} color="red" />
                  :
                  <Ionicons name="heart-outline" size={30} color='white'/>
                  }
                  
                  <Text style={{marginTop:8, color:'white', fontWeight:'bold', fontSize:14}}>1.2k</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{marginVertical:10, alignItems:'center'}} onPress={(e)=>{e.stopPropagation();handlePresentModalCommentPress();}}>
                  <Ionicons name="chatbubble-outline" size={28} color='white'/>
                  <Text style={{marginTop:8, color:'white', fontWeight:'bold', fontSize:14}}>30</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{marginVertical:10, alignItems:'center'}} onPress={(e)=>{e.stopPropagation();handlePresentModalForwardPress();}}>
                  <Ionicons style={{transform:[{rotate:'-45deg'}], marginBottom:5}} name="send-outline" size={27} color='white' />
                  <Text style={{marginTop:8, color:'white', fontWeight:'bold', fontSize:14}}>200</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{marginTop:15, marginBottom:20, alignItems:'center'}} onPress={()=>setSaved(!saved)}>
                  {saved ?
                  <Ionicons name="bookmarks" size={28} color={colorScheme=='light'?"black":'white'} />
                  :
                  <Ionicons name="bookmarks-outline" size={28} color={colorScheme=='light'?"black":'white'} />
                  }
                  
                </TouchableOpacity>
              </View>
              
            </View>
          </SafeAreaView>
        </Pressable>

      
      </View>
        
    )
}
const styles = StyleSheet.create({ 
  container:{
    height: windowHeight
  },
  video:{

  },
  bottomTab:{
    flex:1
  },
  gradient:{
    top:'50%'
  },
  footer:{
    position:'absolute',
    width:'100%',
    padding:20,
    bottom:20,
    flexDirection:'row',
    alignItems:'flex-end'
  },
  leftColumn:{
    flex:1,
    paddingHorizontal:10,
    marginBottom:20,
    maxHeight: windowHeight*0.8
  },
  userInfo:{
    flexDirection:'row',
    alignItems:'center'
  },
  textContainer: {
    marginTop: 20,
  },
  backButton:{
    position:'absolute',
    top:50,
    left:20
  }
})
export default FlixDisplay