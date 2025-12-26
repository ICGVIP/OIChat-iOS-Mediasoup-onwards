import React,{useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {Text,SafeAreaView,FlatList, StyleSheet,View,Image,TouchableOpacity, useColorScheme, StatusBar, Dimensions, KeyboardAvoidingView, TextInput, Platform} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; 
import PostDisplay from './PostContent';
import { useSelector } from 'react-redux';

import {
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { CustomImagePost, CustomImageFlix, CustomImageMemories } from './SocialProfile';


const windowWidth = Dimensions.get('window').width;
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);


const RenderComment = (props) => {

  let {data} = props;
  let {item,index} = data;
  let colorScheme = useColorScheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={{marginVertical:20, width:'90%',alignSelf:'center', flexDirection:'row', alignItems:'flex-start'}}>
      {console.log(item,'...gujarat...\n\n')}
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

export const Archived = ({navigation, route}) => {

    let colorScheme = useColorScheme();
    const ref = useRef();
    let user = useSelector(state=>state.user.value);
    // To be fetched from DB
    let [type, setType] = useState('Memories');
    let [posts,setPosts] = useState([{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 672, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:500, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:430, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'},{id:111, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 679, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:502, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:433, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'}]);
    let [flix,setFlix] = useState([{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 672, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:500, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:430, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'},{id:111, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 679, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:502, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:433, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'}]);
    let [memories,setMemories] = useState([{id: 101, type:'video', avatar:user.data.image, name:'virat.kohli', url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', thumbnail:'https://pbs.twimg.com/media/F8H6AwkWMAAd_41?format=jpg&name=large', timestamp:'Feb 19, 11:30 am'},{id:102, type:'image',avatar:user.data.image, name:'andrew.tate', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am'},{id:103, type:'image',avatar:user.data.image, name:'thomas.shelby', url: 'https://www.refinery29.com/images/8499977.jpg', timestamp:'Oct 9 2023, 11:30 am'},{id:104, type:'video', avatar:user.data.image, name:'virat.kohli', url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', thumbnail:'https://pbs.twimg.com/profile_images/1189494401359208448/AwbXHtpn_400x400.jpg', timestamp:'Feb 19, 11:30 am'}]);
    let [comments,setComments] = useState([{content:"miss you, Mish", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'}, timestamp:'Jun 6, 2024'},{content:"I can't live a day without thinking how lucky I am 🥹", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'}, timestamp:'Jun 6, 2024'},{content:"You know the best day was when we danced all night long...", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'},timestamp:'Jun 6, 2024'}, {content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'}, timestamp:'Jun 6, 2024'}]);
    let [text,setText] = useState('')
    // ref
    const bottomSheetModalRef = useRef(null);

    // variables
    const snapPoints = useMemo(() => ['60%', '85%'], []);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index) => {
      console.log('handleSheetChanges', index);
    }, []);
    
    useEffect(()=>{
      
    },[])

    return(
      <View style={{flex:1, backgroundColor:colorScheme=='light'?'white':'rgb(21,24,37)'}}>

          <MyStatusBar
              backgroundColor={colorScheme=='light'?'white':'rgb(21,24,37)'}
              barStyle={colorScheme=='dark'?'light-content':'dark-content'}
          ></MyStatusBar>

          <View style={styles.header}>
              <TouchableOpacity onPress={()=>navigation.pop()}><Ionicons name="chevron-back" size={24} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
              <Text style={{fontWeight:'bold', fontSize:17, color:colorScheme=='light'?'black':'white'}}>Archive</Text>
              <Ionicons name="chevron-back" size={24} color="transparent" />
          </View>

          <View style={{marginTop:30, marginHorizontal:15, flexDirection:'row', marginBottom:20}}>
            <TouchableOpacity onPress={()=>setType('Memories')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='Memories'?(colorScheme=='light'?'black':'white'):'transparent'}}>
                <Text style={{color:colorScheme=='light'?(type=='Memories'?'white':'rgb(150,150,150)'):(type=='Memories'?'black':'white'), fontSize:14, fontWeight:'bold'}}>Memories</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setType('Posts')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='Posts'?(colorScheme=='light'?'black':'white'):'transparent'}}>
              <Text style={{color:colorScheme=='light'?(type=='Posts'?'white':'rgb(150,150,150)'):(type=='Posts'?'black':'white'), fontSize:14, fontWeight:'bold'}}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setType('Flix')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='Flix'?(colorScheme=='light'?'black':'white'):'transparent'}}>
              <Text style={{color:colorScheme=='light'?(type=='Flix'?'white':'rgb(150,150,150)'):(type=='Flix'?'black':'white'), fontSize:14, fontWeight:'bold'}}>Flix</Text>
            </TouchableOpacity>
          </View>

          <FlatList 
            data={type=='Posts'?posts:(type=='Flix'?flix:memories)}
            renderItem={(item,index)=>{
              return type=='Posts'?<CustomImagePost data={item} key={index} navigation={navigation}/>:(type=='Flix'?<CustomImageFlix data={item} key={index} navigation={navigation}/>:<CustomImageMemories data={item} key={index} navigation={navigation} stories={memories} randomCollection={true}/>)
            }}
            numColumns={3}
            contentContainerStyle={{paddingBottom:20}}
          />

          

          {/* <FlatList 
            ref={ref}
            data={posts}
            initialNumToRender={posts.length}
            renderItem={(item,index)=><PostDisplay i={item.item} key={index} navigation={navigation} handlePresentModalPress={handlePresentModalPress}/>}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 10));
              wait.then(() => {
                ref.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
            contentContainerStyle={{paddingBottom:20}}
          />

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          containerStyle={{zIndex:10, elevation:10}}
          backgroundStyle={{backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(51,54,67)'}}
          handleIndicatorStyle={{backgroundColor:colorScheme=='light'?'black':'white'}}
          footerComponent={props => <RenderFooter props={props} text={text} setText={setText}/>}
        >
          
          <Text style={{alignSelf:'center', color:colorScheme=='light'?'black':'white', marginVertical:10, fontWeight:'bold', fontSize:15}}>Comments</Text>
          <BottomSheetFlatList 
            data={comments}
            keyExtractor={(i) => i}
            renderItem={(item,index) => <RenderComment data={item} key={index}/>}
          />

        </BottomSheetModal> */}

      </View>
    )
}
const styles = StyleSheet.create({
    statusBar:{
        height: STATUSBAR_HEIGHT,
    },
    header:{
        flexDirection:'row',
        width:'100%',
        paddingHorizontal:15,
        paddingVertical:10,
        alignItems:'center',
        justifyContent:'space-between',
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
    }
})
