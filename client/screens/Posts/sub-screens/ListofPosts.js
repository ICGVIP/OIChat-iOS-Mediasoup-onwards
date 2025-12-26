import React,{useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {Text,SafeAreaView,FlatList, StyleSheet,View,Image, ScrollView, TouchableOpacity, useColorScheme, StatusBar, Dimensions, KeyboardAvoidingView, TextInput, Platform} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'; 
import PostDisplay from './PostContent';
import { useSelector } from 'react-redux';

import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetTextInput,
  BottomSheetFooter
} from '@gorhom/bottom-sheet';


const windowWidth = Dimensions.get('window').width;
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);

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


export const ListofPosts = ({navigation, route}) => {

    let {idOfItem} = route.params;
    let colorScheme = useColorScheme();
    const ref = useRef();
    let user = useSelector(state=>state.user.value);
    // To be fetched from DB
    let [posts,setPosts] = useState([{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 672, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:500, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:430, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'},{id:111, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 679, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:502, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:433, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'}]);
    let [comments,setComments] = useState([{content:"❤️ you, Lucky", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'}, timestamp:'Jun 6, 2024'},{content:"I can't live a day without thinking how lucky I am 🥹", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'}, timestamp:'Jun 6, 2024'},{content:"You know the best day was when we danced all night...", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'},timestamp:'Jun 6, 2024'}, {content:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer", user:{id:1,name:'Banvir', username:'navi.sharma', image:'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj'}, timestamp:'Jun 6, 2024'}]);
    let [text,setText] = useState('');
    let [searchText, setSearchText] = useState('');
    //Get this from context
    let chats = [{id:1, avatar: 'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', name: 'Andrew Tate'}, {id:2, avatar: 'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png', name: 'Hamza'}, {id:3, avatar: 'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', name: 'Navi'}, {id:7, avatar: 'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', name: 'Andrew Tate'}, {id:5, avatar: 'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png', name: 'Hamza'}, {id:8, avatar: 'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', name: 'Navi'}, {id:1, avatar: 'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', name: 'Andrew Tate'}, {id:9, avatar: 'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png', name: 'Hamza'}, {id:3, avatar: 'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', name: 'Navi'}]
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

    
    useEffect(()=>{
      const indexToScroll = posts.findIndex(post => post.id==idOfItem);
      if(indexToScroll!=-1 && ref.current){
        ref.current.scrollToIndex({index:indexToScroll})
      }
    },[])

    return(
      <View style={{flex:1, backgroundColor:colorScheme=='light'?'white':'rgb(21,24,37)'}}>

          <MyStatusBar
              backgroundColor={colorScheme=='light'?'white':'rgb(21,24,37)'}
              barStyle={colorScheme=='dark'?'light-content':'dark-content'}
          ></MyStatusBar>

          <View style={styles.header}>
              <TouchableOpacity onPress={()=>navigation.pop()}><Ionicons name="chevron-back" size={24} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
              <Text style={{fontWeight:'bold', fontSize:17, color:colorScheme=='light'?'black':'white'}}>Posts</Text>
              <Ionicons name="chevron-back" size={24} color="transparent" />
          </View>

          <FlatList 
            ref={ref}
            data={posts}
            initialNumToRender={posts.length}
            renderItem={(item,index)=><PostDisplay i={item.item} key={index} navigation={navigation} handlePresentModalCommentPress={handlePresentModalCommentPress} handlePresentModalForwardPress={handlePresentModalForwardPress}/>}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 10));
              wait.then(() => {
                ref.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
            contentContainerStyle={{paddingBottom:20}}
          />

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
