import React,{useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {Text,SafeAreaView,FlatList, StyleSheet,View,Image,TouchableOpacity, useColorScheme, StatusBar, Dimensions, ScrollView} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather'; 
import PostDisplay from './PostContent';
import { useSelector } from 'react-redux';

import { CustomImagePost, CustomImageFlix, CustomImageMemories } from './SocialProfile';
import { Avatar } from 'react-native-paper';


const windowWidth = Dimensions.get('window').width;
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);



export const Interests = ({navigation, route}) => {

    let colorScheme = useColorScheme();
    const ref = useRef();
    let user = useSelector(state=>state.user.value);
    let [type,setType] = useState('Posts');

    let [posts,setPosts] = useState([{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 672, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:500, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:430, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'},{id:111, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 679, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:502, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:433, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'}]);
    let [flix,setFlix] = useState([{id:1, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/1.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id:2, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'}, {id:3, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/3.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'}, {id:4, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/4.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'}]);
    let [memories,setMemories] = useState([{name:'Tate', stories:[{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', timestamp:'Jun 19, 7:30 pm'},{id: 102, type:'video', avatar:user.data.image, name:'virat.kohli', url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', thumbnail:'https://pbs.twimg.com/media/F8H6AwkWMAAd_41?format=jpg&name=large', timestamp:'Feb 19, 11:30 am'},{id:103, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am'}]}, {name:'Party', stories:[{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', timestamp:'Jun 19, 7:30 pm'},{id: 102, type:'video', avatar:user.data.image, name:'virat.kohli', url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', thumbnail:'https://pbs.twimg.com/media/F8H6AwkWMAAd_41?format=jpg&name=large', timestamp:'Feb 19, 11:30 am'},{id:103, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am'}]}]);
    
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
          <View style={{flexDirection:'row', alignItems:'center'}}>
              <Feather name="eye" size={22} color={colorScheme=='dark'?'white':'black'} />
              <Text style={{fontWeight:'bold', fontSize:17, color:colorScheme=='light'?'black':'white', marginLeft:10}}>Interests</Text>
          </View>
          <Ionicons name="chevron-back" size={24} color="transparent" />
        </View>

        <View style={{marginVertical:10, width:windowWidth,  paddingHorizontal:10, flexDirection:'row', justifyContent:'space-around', marginVertical:40}}>
          <TouchableOpacity onPress={()=>setType('Posts')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='Posts'?(colorScheme=='light'?'black':'white'):'transparent'}}>
            <Text style={{color:colorScheme=='light'?(type=='Posts'?'white':'rgb(150,150,150)'):(type=='Posts'?'black':'white'), fontSize:15, fontWeight:'bold'}}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{setType('Reels')}} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='Reels'?(colorScheme=='light'?'black':'white'):'transparent'}}>
            <Text style={{color:colorScheme=='light'?(type=='Reels'?'white':'rgb(150,150,150)'):(type=='Reels'?'black':'white'), fontSize:15, fontWeight:'bold'}}>Reels</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setType('Stories')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='Stories'?(colorScheme=='light'?'black':'white'):'transparent'}}>
            <Text style={{color:colorScheme=='light'?(type=='Stories'?'white':'rgb(150,150,150)'):(type=='Stories'?'black':'white'), fontSize:15, fontWeight:'bold'}}>Stories</Text>
          </TouchableOpacity>
        </View>

        {
          type == 'Posts' &&
          <FlatList 
            data={posts}
            renderItem={(item,index)=>{
              return <CustomImagePost data={item} key={index} navigation={navigation}/>
            }}
            numColumns={3}
            contentContainerStyle={{paddingBottom:20}}
          />
        }
        {
          type == 'Reels' &&
          <FlatList 
            data={flix}
            renderItem={(item,index)=>{
              return <CustomImageFlix data={item} key={index} navigation={navigation}/>
            }}
            numColumns={3}
            contentContainerStyle={{paddingBottom:20}}
          />
        }
        {type=='Stories' &&
          <ScrollView>
            {memories.map((i,index)=>
              <View key={index}>
                <Text style={{marginVertical:20, fontSize:22, fontWeight:'bold', marginLeft:20, color:colorScheme=='light'?'black':'white'}}>{i.name}</Text>
                <FlatList 
                style={{width:windowWidth}}
                data={i.stories}
                renderItem={(item,index)=><CustomImageMemories data={item} key={index} navigation={navigation} stories={i} randomCollection={false}/>}
                horizontal
                contentContainerStyle={{height:windowWidth/1.8, paddingHorizontal:20}}
                showsHorizontalScrollIndicator={false}
              />
              </View>
            )}
          </ScrollView>
        }
          
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
