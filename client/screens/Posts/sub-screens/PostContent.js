import React,{useEffect, useState, useRef, useCallback} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Image,Dimensions, useColorScheme, Pressable, Modal} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; 
import { useVideoPlayer, VideoView } from 'expo-video';

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

const PostDisplay = (props) => {

    let {i, handlePresentModalForwardPress, handlePresentModalCommentPress} = props;
    const [visible, setVisible] = useState(false);
    let [width,setWidth] = useState('100%');
    let [height,setHeight] = useState(windowHeight*0.5);
    let colorScheme = useColorScheme();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const ref = useRef();
    let [liked,setLiked] = useState(false)
    let [saved, setSaved] = useState(false)
    const player = useVideoPlayer(i.url, (player) => {
      player.play();
      player.muted = true;
    });
    let [comments,setComments] = useState([{content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer", user:{id:1,name:'Banvir',image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', timestamp:'Jun 6, 2024'}},{content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer", user:{id:1,name:'Banvir',image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', timestamp:'Jun 6, 2024'}},{content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer", user:{id:1,name:'Banvir',image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', timestamp:'Jun 6, 2024'}},{content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer", user:{id:1,name:'Banvir',image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', timestamp:'Jun 6, 2024'}}]);

    
    return(

      <View style={colorScheme=='light'?styles.post:styles.post_dark}>
        {i.type=='image' &&
          <Pressable style={{overflow:'hidden', width,height}}>
            <Image source={{uri:i.url}} style={{width:'100%', height:'100%', resizeMode:'cover'}}/>
          </Pressable>
        }

        {i.type=='video' &&

          <Pressable>
            <VideoView
              ref={ref}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              style={{width:'100%', aspectRatio:i.width/i.height}}
              nativeControls
            />
          </Pressable>
          
        }
        
        <View style={styles.info}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Pressable style={styles.displayPicture}>
              <Image style={styles.image} source={{uri:i.avatar}}></Image>
            </Pressable>
            <View style={{height:65, justifyContent:'center'}}>
                <Text style={colorScheme=='light'?styles.name:styles.name_dark}>{i.name}</Text>
                <Text style={colorScheme=='light'?{color:'rgb(167,170,177)'}:{color:'rgb(140,144,155)'}}>{i.timestamp}</Text>
            </View> 
          </View>

          <View style={{width:windowWidth/9,height:windowWidth/9, overflow:'hidden'}}>
            <Image style={{width:'100%', height:'100%', resizeMode:'contain'}} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/OI.png'}}/>
          </View>
                      
        </View>

        <View style={{...styles.info, marginTop:20, marginLeft:15}}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Pressable style={{marginRight:30}} onPress={()=>setLiked(!liked)}>
              {liked ? 
              <Ionicons name="heart" size={24} color="red" />
              :
              <Ionicons name="heart-outline" size={24} color={colorScheme=='light'?"black":'white'}/>}
              
              <Text style={{marginTop:5, fontWeight:'bold',color:colorScheme=='light'?'black':'white'}}>1.2k</Text>
            </Pressable>
            <Pressable style={{marginRight:33}} onPress={handlePresentModalCommentPress}>
              <Ionicons name="chatbubble-outline" size={24} color={colorScheme=='light'?"black":'white'} />
              <Text style={{marginTop:5, fontWeight:'bold', color:colorScheme=='light'?'black':'white'}}>350</Text>
            </Pressable>
            <Pressable style={{marginRight:30}} onPress={handlePresentModalForwardPress}>
              <Ionicons style={{transform:[{rotate:'-45deg'}], marginBottom:5}} name="send-outline" size={24} color={colorScheme=='light'?"black":'white'} />
              <Text style={{marginTop:5, fontWeight:'bold', color:'transparent'}}>1.2k</Text>
            </Pressable>
          </View>

          <Pressable style={{marginRight:20}} onPress={()=>setSaved(!saved)}>
            {saved ? 
            <Ionicons name="bookmarks" size={24} color={colorScheme=='light'?"black":'white'} />
            :
            <Ionicons name="bookmarks-outline" size={23} color={colorScheme=='light'?"black":'white'} />
            }
            
          </Pressable>
                      
        </View>
                
        <Text style={{marginTop:15, paddingHorizontal:15, color:colorScheme=='light'?'black':'white'}}>
          {i.caption}
        </Text>

        <Modal animationType='slide' visible={isMenuVisible} transparent={true}>
            <OverlayMenu onClose={()=>setIsMenuVisible(false)}/>
        </Modal>
        
      </View>
        
    )
}
const styles = StyleSheet.create({ 
  image:{
    height:'100%',
    width:'100%',
    resizeMode:'cover'
  },
  post:{
    marginBottom:20,
    paddingVertical:15,
    width:'100%',
    alignItems:'center',
  },
  post_dark:{
    marginBottom:20,
    paddingVertical:15,
    width:'100%',
    alignItems:'center',
  },
  info:{
    width:'100%',
    paddingHorizontal:20,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
  },
  displayPicture:{
    height:65,
    width:65,
    overflow:'hidden',
    borderRadius:32.5,
    marginRight:10,
    marginTop:-20
  },
  name:{
    fontWeight:'bold',
    fontSize:16,
    color:'black'
  },
  name_dark:{
    fontWeight:'bold',
    fontSize:16,
    color:'white'
  },
  remaining:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    marginHorizontal:8,
    height:40
  },
  timestamp:{
    color:'rgb()'
  },
  picture:{
    overflow:'hidden',
    marginVertical:15
  },
  buttons:{
    flexDirection:'row',
    width:'85%'
  },
  button:{
    marginHorizontal:5,
    fontWeight:'bold'
  },
  reaction:{
    width:'50%',
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center'
  },
  share:{
    width:'50%',
    flexDirection:'row',
    justifyContent:'flex-end',
    alignItems:'center'
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
    maxHeight:'55%',
    paddingVertical:10,
    paddingBottom:40
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingBottom: 10,
    marginTop:10
  },
 
})
export default PostDisplay