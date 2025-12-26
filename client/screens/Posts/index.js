import React,{useState, useCallback, useMemo, useRef} from 'react';
import {Text,SafeAreaView,ScrollView, Platform,StyleSheet,View, FlatList, Image,Dimensions, ImageBackground,TextInput, useColorScheme,TouchableOpacity,Modal,StatusBar} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CustomImagePost } from './sub-screens/SocialProfile';
import { CustomImageFlix } from './sub-screens/SocialProfile';

import Home from './Home';
import Friends from './sub-screens/Friends';
import Popular from './sub-screens/Popular';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Octicons from '@expo/vector-icons/Octicons';
import { MenuView } from '@react-native-menu/menu';

import { useDispatch, useSelector } from 'react-redux';
import {setPrivate,setPublic} from '../../slices/mode';

import { OverlaySettings } from './sub-screens/SettingsOverlay';
import { Avatar } from 'react-native-paper';

import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetTextInput,
  BottomSheetFooter
} from '@gorhom/bottom-sheet';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const imageWidth = windowWidth * 0.3;

const scaleFontSize = (size) => (size * windowWidth) / 390;

const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const RenderFooterComment = ({props,text,setText}) => {

  let colorScheme = useColorScheme();
  return (
    <BottomSheetFooter {...props}>
      <View style={{width:'100%', padding:10, paddingBottom:40, backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(51,54,67)',paddingHorizontal:20, borderTopWidth:0.5, borderTopColor:'grey', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
        <TouchableOpacity><Ionicons name="camera-outline" size={34} color="rgb(241,171,71)" /></TouchableOpacity>
        <BottomSheetTextInput style={{...styles.input, color:colorScheme=='light'?'black':'white'}} multiline numberOfLines={2} placeholder="Add a comment..."/>
        <TouchableOpacity><MaterialCommunityIcons name="send-circle" size={34} color={text?"rgb(241,171,71)":'grey'} /></TouchableOpacity>
      </View>
    </BottomSheetFooter>
  )
}
const RenderFooterForward = ({props}) => {

  let colorScheme = useColorScheme();
  return (
    <BottomSheetFooter {...props}>
      <View style={{width:'100%', padding:10, paddingBottom:30, backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(51,54,67)', borderTopWidth:0.5, borderTopColor:'grey'}}>

        <ScrollView
          horizontal
          style={{width:windowWidth}}
          contentContainerStyle={{paddingHorizontal:20}}
          showsHorizontalScrollIndicator={false}
        >

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='share-outline' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Share to</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='link-outline' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Copy Link</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <MaterialCommunityIcons name="progress-clock" size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Add to Story</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='logo-whatsapp' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Whatsapp</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='logo-instagram' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white',marginTop:10}}>Instagram</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <FontAwesome6 name="x-twitter" size={24} color={colorScheme=='light'?'black':'white'} />
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>X (Twitter)</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='chatbubble-outline' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Messages</Text>
          </View>
          
          

        </ScrollView>

      </View>
    </BottomSheetFooter>
  )
}

const RenderComment = (props) => {

  let {data} = props;
  let {item,index} = data;
  let colorScheme = useColorScheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={{marginVertical:20, width:'90%',alignSelf:'center', flexDirection:'row', alignItems:'flex-start'}}>
      <View style={styles.comment_avatar}>
        <Image style={{width:'100%',height:'100%'}} resizeMode='cover' source={{uri:item.user.image}}/>
      </View>

      <View style={{marginLeft:8, flex:1}}>
        <Text style={{fontWeight:'bold', color:colorScheme=='light'?'black':'white', fontSize:11.5}}>{item.user.username}</Text>
        <Text 
          style={{fontSize:13, color:colorScheme=='light'?'black':'white', marginTop:6}}
          numberOfLines={isExpanded ? null : 3}
        >
          {item.content}
        </Text>
        {item.content.length > 100 && (
          <TouchableOpacity onPress={()=>setIsExpanded(!isExpanded)}>
            <Text style={{ color: 'grey', marginTop: 5 }}>
              {isExpanded ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:15}}>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={{marginRight:15}}><Ionicons name="heart-outline" size={14} color={colorScheme=='light'?"black":'white'}/></TouchableOpacity>
            <TouchableOpacity><Ionicons name="chatbubble-outline" size={14} color={colorScheme=='light'?"black":'white'}/></TouchableOpacity>
          </View>
          <Text style={{fontSize:12,color:'grey', fontWeight:'bold'}}>{item.timestamp}</Text>
        </View>
      </View>
    </View>
  )
}

const RenderAvatarForward = ({item, ...rest}) => {

  let colorScheme = useColorScheme();
  let data = item.item

  return (
    <TouchableOpacity style={{alignItems:'center', marginHorizontal:20, marginVertical:15}}>
      <View style={{height:windowWidth/5,width:windowWidth/5,borderRadius:windowWidth/10,overflow:'hidden'}}>
        <Image source={{uri:data.avatar}} style={{height:'100%', width:'100%'}} resizeMode='cover'></Image>
      </View>
      <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10, fontWeight:'bold'}}>{data.name}</Text>
    </TouchableOpacity>
  )
}

const OverlayMenu = ({onClose,navigation, setAction}) => {

  let colorScheme = useColorScheme();

  return (
    <View style={styles.overlay}>
      <View style={{...styles.menu, backgroundColor:colorScheme=='light'?'white':'rgb(39,41,48)'}}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={30} color={colorScheme=='light'?'black':'white'} />
        </TouchableOpacity>
        {/* Add your menu options as TouchableOpacity components */}
        <TouchableOpacity style={styles.menuOption} onPress={()=>{navigation.navigate('Interests'); onClose();}}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <Ionicons name="eye-outline" size={28} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Interests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuOption} onPress={()=>{navigation.navigate('Archived'); onClose();}}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <MaterialCommunityIcons name="archive-outline" size={28} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Archive</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuOption} onPress={()=>{navigation.navigate('Saved'); onClose();}}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <Ionicons name="bookmarks-outline" size={24} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Saved Posts</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.menuOption}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <Ionicons name="people-outline" size={24} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Friends</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.menuOption} onPress={()=>setAction(1)}>
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
const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

const Public = ({navigation}) => {

  let [type,setType] = useState('Discover');
  let colorScheme = useColorScheme();
  let user = useSelector(state=>state.user.value);
  let [flix,setFlix] = useState([{id:1, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/1.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id:2, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'}, {id:3, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/3.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'}, {id:4, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/4.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'}]);
  let [posts,setPosts] = useState([{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 672, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:500, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:430, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'},{id:111, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 679, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:502, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:433, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'}]);

  return (
    <>
      <View style={{marginVertical:10, width:windowWidth, height:40, paddingHorizontal:10, flexDirection:'row'}}>
        <TouchableOpacity onPress={()=>setType('Discover')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='Discover'?(colorScheme=='light'?'black':'white'):'transparent'}}>
          <Text style={{color:colorScheme=='light'?(type=='Discover'?'white':'rgb(150,150,150)'):(type=='Discover'?'black':'white'), fontSize:14, fontWeight:'bold'}}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{setType('Reels')}} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='Reels'?(colorScheme=='light'?'black':'white'):'transparent'}}>
          <Text style={{color:colorScheme=='light'?(type=='Reels'?'white':'rgb(150,150,150)'):(type=='Reels'?'black':'white'), fontSize:14, fontWeight:'bold'}}>Reels</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setType('Feed')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='Feed'?(colorScheme=='light'?'black':'white'):'transparent'}}>
          <Text style={{color:colorScheme=='light'?(type=='Feed'?'white':'rgb(150,150,150)'):(type=='Feed'?'black':'white'), fontSize:14, fontWeight:'bold'}}>Feed</Text>
        </TouchableOpacity>
      </View>

      {type=='Discover' &&
        <FlatList 
          data={posts}
          renderItem={(item,index)=>
            <CustomImagePost data={item} key={index} navigation={navigation}/>
          }
          numColumns={3}
          contentContainerStyle={{paddingBottom:20, marginVertical:20}}
        />
      }
      {type=='Reels' &&
        <FlatList 
          data={flix}
          renderItem={(item,index)=>{
            return <CustomImageFlix data={item} key={index} navigation={navigation}/>
          }}
          numColumns={3}
          contentContainerStyle={{paddingBottom:20}}
        />
      }
      
    </>
  )
}

const Private = ({handlePresentModalCommentPress,handlePresentModalForwardPress, navigation}) => {
  
  let [section,setSection] = useState('Home');

  return (
    <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:100}}>
      {section=='Home' ?
        <Home handlePresentModalCommentPress={handlePresentModalCommentPress} handlePresentModalForwardPress={handlePresentModalForwardPress} navigation={navigation}/>
      :
        <>
          {section=='Friends' ?
          <Friends />
          :
          <Popular />
          }
        </>}     
    </ScrollView>
  )
}

const Post = ({navigation}) => {

  let [section,setSection] = useState('Home');
  let mode = useSelector(state=>state.mode.value);
  let user = useSelector(state=>state.user.value);
  //Get this from context
  let chats = [{id:1, avatar: 'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', name: 'Andrew Tate'}, {id:2, avatar: 'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png', name: 'Hamza'}, {id:3, avatar: 'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', name: 'Navi'}, {id:7, avatar: 'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', name: 'Andrew Tate'}, {id:5, avatar: 'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png', name: 'Hamza'}, {id:8, avatar: 'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', name: 'Navi'}, {id:1, avatar: 'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', name: 'Andrew Tate'}, {id:9, avatar: 'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png', name: 'Hamza'}, {id:3, avatar: 'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', name: 'Navi'}]
  let dispatch = useDispatch();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const openMenu = () => {
    setIsMenuVisible(true);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
  };
  let colorScheme = useColorScheme();
  let [action, setAction] = useState(0);
  let [searchText, setSearchText] = useState('');
  let [text, setText] = useState();
  let [comments,setComments] = useState([{content:"miss you, Mish", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'}, timestamp:'Jun 6, 2024'},{content:"I can't live a day without thinking how lucky I am 🥹", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'}, timestamp:'Jun 6, 2024'},{content:"You know the best day was when we danced all night long ...", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'},timestamp:'Jun 6, 2024'}, {content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'}, timestamp:'Jun 6, 2024'}]);
  // ref
  const commentSheetModalRef = useRef(null);
  const forwardSheetModalRef = useRef(null);

  // variables
  const snapPointsComment = useMemo(() => ['60%','80%'], []);
  const snapPointsForward = useMemo(() => ['45%','80%'], []);

  // callbacks for comment
  const handlePresentModalCommentPress = useCallback(() => {
    commentSheetModalRef.current?.present();
  }, []);
  const handleCommentSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  // callbacks for forward
  const handlePresentModalForwardPress = useCallback(() => {
    forwardSheetModalRef.current?.present();
  }, []);
  const handleForwardSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  async function switchModes(){
    if(mode.mode=='private'){
      dispatch(setPublic())
    }
    else{
      dispatch(setPrivate())
    }
  }

  function createPost_Story({nativeEvent}){

    if(nativeEvent.event=='post'){
      console.log('User wants a new post')
    }
    else{
      console.log('User wnats a new story')
    }

  }
  return (

    <View style={{flex:1}}>

      <MyStatusBar
        backgroundColor={colorScheme=='light'?'white':'rgb(21,24,37)'}
        barStyle={colorScheme=='dark'?'light-content':'dark-content'}
      ></MyStatusBar>
 
        <View style={colorScheme=='light'?{flex:1,backgroundColor:'white'}:{flex:1,backgroundColor:'rgb(21,24,37)'}}>

            <View style={styles.header}>
              <>
                {mode.mode=='private'?
                <TouchableOpacity style={colorScheme=='light'?styles.pill:styles.pill_dark} onPress={switchModes}>
                  <Entypo name="lock" size={24} color="rgb(251,138,57)" />
                  <Text style={{color:'rgb(251,138,57)',fontWeight:'bold',fontSize:17,marginLeft:20}}>Private</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity style={colorScheme=='light'?styles.pill:styles.pill_dark} onPress={switchModes}>
                  <Entypo name="lock-open" size={24} color="rgb(251,138,57)" />
                  <Text style={{color:'rgb(251,138,57)',fontWeight:'bold',fontSize:17,marginLeft:20}}>Public</Text>
                </TouchableOpacity>
                }
              </>
              <View style={{width:'40%',alignItems:'center'}}>
                <View style={{flexDirection:'row',justifyContent:'flex-end',width:'100%', paddingRight:15}}>
                  <MenuView
                    onPressAction={createPost_Story}
                    actions={[
                      {
                        id: 'post',
                        title: 'New Post',
                        image: Platform.select({
                          ios: 'photo',
                          android: 'photo',
                        }),
                      },
                      {
                        id: 'story',
                        title: 'New Story',
                        image: Platform.select({
                          ios: 'plus.square.dashed',
                          android: 'ic_menu_delete',
                        }), 
                      },
                      {
                        id: 'clips',
                        title: 'New Clips',
                        image: Platform.select({
                          ios: 'video.badge.plus',
                          android: 'ic_menu_delete',
                        }), 
                      }
                    ]}
                  >
                    <LinearGradient colors={['rgb(253,219,199)','rgb(251,121,73)']} style={{...styles.gradient, marginRight:20}}>
                      <Entypo name="plus" size={20} color={colorScheme=='light'?'black':'white'} />
                    </LinearGradient>
                  </MenuView>
                  <TouchableOpacity style={{marginRight:20}} onPress={()=>{navigation.navigate('Search')}}><FontAwesome name="search" size={22} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                  <TouchableOpacity onPress={openMenu}><Entypo name="dots-three-horizontal" size={22} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                  
                </View>

                <View style={{marginTop:20,flexDirection:'row', width:'100%', justifyContent:'flex-end', paddingRight:15, alignItems:'center'}}>
                    <TouchableOpacity style={{marginRight:30}} onPress={()=>navigation.navigate('Notifications')}><MaterialCommunityIcons name="bell-badge-outline" size={28} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                    <TouchableOpacity onPress={()=>navigation.navigate('Social Profile')}><Avatar.Image source={{uri:user.data.image}} size={35}/></TouchableOpacity>
                </View>
              </View>
            </View>
            {
              mode.mode=='private' ? 
              
              <Private handlePresentModalCommentPress={handlePresentModalCommentPress} handlePresentModalForwardPress={handlePresentModalForwardPress} navigation={navigation}/>
              :
              <Public navigation={navigation}/>
            }

            <Modal animationType='slide' visible={isMenuVisible} transparent={true}>
              {action==0&&<OverlayMenu onClose={closeMenu} navigation={navigation} setAction={setAction}/>}
              {action==1&&<OverlaySettings onClose={closeMenu} navigation={navigation} setAction={setAction}/>}
              
            </Modal>
        </View>

        <BottomSheetModal
          ref={commentSheetModalRef}
          index={1}
          snapPoints={snapPointsComment}
          onChange={handleCommentSheetChanges}
          containerStyle={{zIndex:10, elevation:10}}
          backgroundStyle={{backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(51,54,67)'}}
          handleIndicatorStyle={{backgroundColor:colorScheme=='light'?'black':'white'}}
          footerComponent={props => <RenderFooterComment props={props} text={text} setText={setText}/>}
        >
          
          <Text style={{alignSelf:'center', color:colorScheme=='light'?'black':'white', marginVertical:10, fontWeight:'bold', fontSize:15}}>Comments</Text>
          <BottomSheetFlatList 
            data={comments}
            keyExtractor={(i) => i}
            renderItem={(item,index) => <RenderComment data={item} key={index}/>}
          />

        </BottomSheetModal>

        <BottomSheetModal
          ref={forwardSheetModalRef}
          snapPoints={snapPointsForward}
          onChange={handleForwardSheetChanges}
          containerStyle={{zIndex:10, elevation:10}}
          backgroundStyle={{backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(51,54,67)'}}
          handleIndicatorStyle={{backgroundColor:colorScheme=='light'?'black':'white'}}
          footerComponent={props => <RenderFooterForward props={props}/>}
        >
          <TextInput style={colorScheme=='light'?styles.searchInput:styles.searchInput_dark} placeholder="Search users" onChangeText={(text)=>setSearchText(text)}/>
          <BottomSheetFlatList 
            data={chats}
            numColumns={3}
            keyExtractor={(i) => i}
            contentContainerStyle={{alignItems:'center'}}
            renderItem={(item,index) => <RenderAvatarForward item={item} key={index}/>}
          />

        </BottomSheetModal>
    </View>
  )
};;;

// const Post = ({navigation}) => {

//   return (

//     <View style={{flex:1}}>

//       <MyStatusBar
//         backgroundColor={'rgb(223,190,177)'}
//         barStyle={'light-content'}
//       ></MyStatusBar>
 
//         <ScrollView style={{backgroundColor:'rgb(223,190,177)'}} contentContainerStyle={{paddingBottom:120}}>

//           <View style={styles.header}>
//             <Avatar.Icon style={{backgroundColor:'rgb(226,197,185)'}} icon={()=><Ionicons name="bookmark-outline" size={26} color="white" />}/>
//             <Avatar.Icon style={{backgroundColor:'transparent'}}
//               icon={()=>
//               <View style={{backgroundColor:'rgb(240,143,53)', paddingVertical:15, paddingHorizontal:5, borderRadius:200}}>
//                 <Ionicons name="heart" size={22} color="white" />
//                 <Text style={{color:'white', marginTop:10, fontWeight:'bold'}}>273</Text>
//               </View>}
//             />
//           </View>

//           <ImageBackground
//             source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/Bg.png'}}
//             style={{height:windowWidth*0.80, width:windowWidth*0.80, marginVertical:10, alignSelf:'center', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}
//           >
//             <Text style={{fontSize:58, color:'white', fontWeight:'bold', marginLeft:-20}}>Coming</Text>
//             <Text style={{fontSize:58, color:'black', fontWeight:'bold', marginRight:-20}}>Soon</Text>
//           </ImageBackground>

//           <View style={{flexDirection:'row', alignItems:'center',justifyContent:'center', marginTop:25}}>
//             <Avatar.Image source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/profile_images/IMG_6471.jpg'}}/>
//             <Avatar.Image style={{marginLeft:-10}} source={{uri:'https://hips.hearstapps.com/hmg-prod/images/tommy-shelby-cillian-murphy-peaky-blinders-1569234705.jpg?crop=0.552xw:0.368xh;0.378xw,0.0295xh&resize=1200:*'}}/>
//             <Avatar.Image style={{marginLeft:-10}} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/profile_images/IMG_0077.jpg'}}/>
//           </View>

//           <Text style={{fontWeight:'bold', color:'white', fontSize:scaleFontSize(30), paddingTop:20, paddingHorizontal:30, textAlign:'center'}}>
//             Discover what is happening in the world of OI
//           </Text>
          
//           <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
//             <Octicons name="dash" size={54} color="white" />
//             <Octicons name="dot-fill" size={24} color="rgba(255,255,255,0.4)" style={{marginHorizontal:20}}/>
//             <Octicons name="dot-fill" size={24} color="rgba(255,255,255,0.4)" />
//           </View>

//         </ScrollView>
     
//     </View>

//   )
// }


const styles = StyleSheet.create({
  image:{
    width:imageWidth,
    alignItems:'center',
    justifyContent:'center',
    
  },
  gradient:{
    height:25,
    width:25,
    borderRadius:12.5,
    alignItems:'center',
    justifyContent:'center'
  },
  pill:{
    borderColor:'rgb(251,138,57)',
    height:50,
    borderWidth:2,
    borderRadius:20,
    padding:10,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
  },
  pill_dark:{
    borderColor:'rgb(251,138,57)',
    height:50,
    borderWidth:2,
    borderRadius:20,
    padding:10,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
  },
  header:{
    marginVertical:10,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingHorizontal:20,

  },
  tab:{
    flexDirection:'row',
    justifyContent:'center',
    marginVertical:20
  },
  section:{
    width:'33%',
    borderBottomColor:'white',
    borderBottomWidth:1,
    flexDirection:'row',
    justifyContent:'center',
    paddingBottom:10
  },
  selected:{
    width:'33%',
    borderBottomColor:'rgb(60,248,248)',
    color:'rgb(60,248,248)',
    borderBottomWidth:1,
    flexDirection:'row',
    justifyContent:'center',
    paddingBottom:10
  },
  share:{
    flexDirection:'row',
    justifyContent:'center',
    marginVertical:20,
    alignItems:'center'
  },
  image:{
    width:40,
    height:40,
    borderRadius:20,
    overflow:'hidden'
  },
  picture:{
    resizeMode:'cover',
    height:'100%',
    width:'100%'
  },
  input:{
    width:'70%',
    backgroundColor:'rgb(47,43,91)',
    marginHorizontal:10,
    borderRadius:30,
    padding:10,
    color:'white'
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
 
  menuOption: {
    padding:15,
    flexDirection:'row',
    alignItems:'center'
  },
  option:{
    fontSize:19,
    marginHorizontal:20
  },
  statusBar:{
    height: STATUSBAR_HEIGHT,
  },
  comment_avatar:{
    height:windowWidth*0.08, 
    width:windowWidth*0.08,
    borderRadius:windowWidth*0.04,
    overflow:'hidden'
  },
  input:{
    borderWidth:0.5,
    borderColor:'grey',
    paddingVertical:7,
    paddingHorizontal:5,
    fontSize:14,
    width:'70%',
    borderRadius:20
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
}
})
export default Post