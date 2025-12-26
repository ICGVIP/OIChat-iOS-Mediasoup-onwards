import React,{useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {Text,SafeAreaView,FlatList, StyleSheet,View,Image,TouchableOpacity, useColorScheme, StatusBar, Dimensions, Platform} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome'; 
import PostDisplay from './PostContent';
import { useSelector } from 'react-redux';
import { MenuView } from '@react-native-menu/menu';
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

const CustomImageSavedPost = ({navigation, data}) => {

  let colorScheme = useColorScheme();
  const {item} = data;
  let user = useSelector(state=>state.user.value);
  return (
    <View style={{marginVertical:20}}>
      <TouchableOpacity style={{width:windowWidth*0.45, borderRadius:15, backgroundColor:'rgba(0,0,0,0.4)', padding:10, margin:10, flexDirection:'row', flexWrap:'wrap', alignItems:'center'}} onPress={()=>navigation.navigate('Posts List',{scrollToId:0,idOfItem:1})}>
        <View style={{width:windowWidth*0.19, borderRadius:15, height:windowWidth*0.19, overflow:'hidden', marginRight:7, marginVertical:10}}>
          <Image source={{uri:item.posts[0]?.url}} style={{width:'100%', height:'100%', borderRadius:15}}> 

          </Image>
        </View>
        <View style={{width:windowWidth*0.19, borderRadius:15, height:windowWidth*0.19, overflow:'hidden'}}>
          <Image source={{uri:item.posts[1]?.url}} style={{width:'100%', height:'100%', borderRadius:15}}> 

          </Image>
        </View>
        <View style={{width:windowWidth*0.19, borderRadius:15, height:windowWidth*0.19, overflow:'hidden', marginRight:7}}>
          <Image source={{uri:item.posts[2]?.url}} style={{width:'100%', height:'100%', borderRadius:15}}> 

          </Image>
        </View>
        <View style={{width:windowWidth*0.19, borderRadius:15, height:windowWidth*0.19, overflow:'hidden'}}>
          <Image source={{uri:item.posts[3]?.url}} style={{width:'100%', height:'100%', borderRadius:15}}> 

          </Image>
        </View>
      </TouchableOpacity>

      <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:windowWidth*0.45}}>
        <Text 
          style={{fontSize:14, color:'white', fontWeight:'bold', paddingLeft:10, width:windowWidth*0.3}}
          numberOfLines={1} 
          ellipsizeMode='tail'
        >
          {item.name}
        </Text>
        <Avatar.Image size={18} source={{uri:user.data.image}}/>
      </View>
      <Text style={{marginVertical:10, color:'grey', marginHorizontal:10}}>{item.posts.length} posts</Text>
    </View>
    
  )
}


export const Saved = ({navigation, route}) => {

    let colorScheme = useColorScheme();
    const ref = useRef();
    let user = useSelector(state=>state.user.value);
    // To be fetched from DB
    let [saved, setSaved] = useState([
      {name:'Beach Travel Vlogs', posts:[
          {id:1, url:'https://cdn.mos.cms.futurecdn.net/wtqqnkYDYi2ifsWZVW2MT4-1200-80.jpg', type:'image'},
          {id:2, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},
          {id:3, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},
          {id:4, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'}
        ]
      },
      {name:'James Bond 007', posts:[
          {id:1, url:'https://cdn.mos.cms.futurecdn.net/wtqqnkYDYi2ifsWZVW2MT4-1200-80.jpg', type:'image'},
          {id:2, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},
          {id:3, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},
          {id:4, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'}
        ]
      },
      {name:'Andrew Tate', posts:[
          {id:1, url:'https://cdn.mos.cms.futurecdn.net/wtqqnkYDYi2ifsWZVW2MT4-1200-80.jpg', type:'image'},
          {id:2, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},
          {id:3, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},
          {id:4, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'}
        ]
      },
      {name:'Himalayas', posts:[
          {id:1, url:'https://cdn.mos.cms.futurecdn.net/wtqqnkYDYi2ifsWZVW2MT4-1200-80.jpg', type:'image'},
          {id:2, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},
          {id:3, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},
          {id:4, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'}
        ]
      }
    ])
    
    useEffect(()=>{
      
    },[])

    function sortSavedPosts(){

    }

    return(
      <View style={{flex:1, backgroundColor:colorScheme=='light'?'white':'rgb(21,24,37)'}}>

          <MyStatusBar
              backgroundColor={colorScheme=='light'?'white':'rgb(21,24,37)'}
              barStyle={colorScheme=='dark'?'light-content':'dark-content'}
          ></MyStatusBar>

          <View style={styles.header}>
            <TouchableOpacity onPress={()=>navigation.pop()}><Ionicons name="chevron-back" size={24} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
            <Text style={{fontWeight:'bold', fontSize:17, color:colorScheme=='light'?'black':'white'}}>Saved</Text>
            <Ionicons name="chevron-back" size={24} color="transparent" />
          </View>

          <View style={{flexDirection:'row', justifyContent:'space-between', paddingHorizontal:20, alignItems:'center', marginVertical:30}}>
            <MenuView
              onPressAction={sortSavedPosts}
              actions={[
                {
                  id: 'update',
                  title: 'Last Updated',
                },
                {
                  id: 'alphabet',
                  title: 'Alphabetically (A-Z)', 
                }
              ]}
            >
              <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={{color:'white', fontWeight:'bold', fontSize:14}}>Last Updated</Text>
                <Ionicons name="filter-sharp" size={20} color="white" style={{marginHorizontal:15}}/>
            </TouchableOpacity>
            </MenuView>

           

            <TouchableOpacity>
              <FontAwesome name="search" size={20} color={'white'} />
            </TouchableOpacity>
          </View>

          <FlatList 
            data={saved}
            renderItem={(item,index)=>{
              return <CustomImageSavedPost data={item} key={index} navigation={navigation}/>
            }}
            numColumns={2}
            contentContainerStyle={{paddingBottom:20}}
          />


          
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
