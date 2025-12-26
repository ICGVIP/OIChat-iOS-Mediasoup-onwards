import React, { useState, useEffect } from 'react'
import { Text, View, Image, StatusBar,SafeAreaView, StyleSheet, TouchableOpacity, Dimensions, FlatList, useColorScheme, ImageBackground } from 'react-native'
import { Avatar, Button } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ScrollView } from 'react-native-virtualized-view';

const Tab = createMaterialTopTabNavigator();

// import { createThumbnail } from "react-native-create-thumbnail";

const windowWidth = Dimensions.get('window').width;
const imageWidth = parseInt(windowWidth * 0.25);

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

export const CustomImageMemories = ({data,navigation, stories, randomCollection}) => {

  let {item,index} = data
  return(
    <TouchableOpacity style={styles.image_cover_memories} onPress={!randomCollection?()=>navigation.navigate('Stories List',{idOfStory:index, stories:stories?.stories}):()=>navigation.navigate('Solo Story Display',{idOfStory:index, stories:stories})}>
      {console.log(data,'...selfie...\n\n')}
      <ImageBackground source={{uri:item.type=='image'?item.url:item.thumbnail}} style={{height:'100%', width:'100%', borderRadius:20,resizeMode:'cover', flexDirection:'row', justifyContent:'flex-end', alignItems:'flex-end'}}>
        <MaterialCommunityIcons name="progress-clock" size={20} color={'white'} style={{marginBottom:5, marginRight:5}}/>
      </ImageBackground>
    </TouchableOpacity>
    
  )
}

export const CustomImageFlix = ({data,navigation}) => {

  let {item} = data
  return(
    <TouchableOpacity style={styles.image_cover_flix} onPress={()=>{navigation.navigate('Flix List', {scrollToId:data.index,idOfItem:item.id})}}>
      <ImageBackground source={{uri:'https://pbs.twimg.com/media/F8H6AwkWMAAd_41?format=jpg&name=large'}} style={{height:'100%', width:'100%', resizeMode:'cover', flexDirection:'row', justifyContent:'flex-end', alignItems:'flex-end'}}>
        <MaterialCommunityIcons name="video-vintage" size={20} color={'white'} style={{marginBottom:5, marginRight:5}}/>
      </ImageBackground>
    </TouchableOpacity>
    
  )
}

export const CustomImagePost = ({data,navigation}) => {

  let {item} = data
  return(
    <TouchableOpacity style={styles.image_cover} onPress={()=>navigation.navigate('Posts List',{scrollToId:data.index,idOfItem:item.id})}>
      <Image source={{uri:item.url}} style={{height:'100%', width:'100%', resizeMode:'cover'}}>
        
      </Image>
    </TouchableOpacity>
    
  )
}

export function SocialProfile({navigation}) {

    let user = useSelector(state=>state.user.value);
    let [filter,setFilter] = useState('Posts');
    let [posts,setPosts] = useState([{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 672, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:500, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:430, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'},{id:111, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', width:572, height:1024, timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id: 679, type:'image', avatar:user.data.image, name:'virat.kohli', url:'https://cdn.vox-cdn.com/thumbor/DdqL-TtT9Bgiu9eZAnMOZdb8_18=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23966471/Screen_Shot_2022_08_23_at_4.22.21_PM.png', timestamp:'Feb 19, 11:30 am',caption:'Planning of a million ways to conquer this world'},{id:502, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am',caption:'Those days man....miss those days. But, no problem! We will find something'},{id:433, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://i.natgeofe.com/k/9acd2bad-fb0e-43a8-935d-ec0aefc60c2f/monarch-butterfly-grass_3x2.jpg',timestamp:'Aug 10 2023, 08:30 pm',caption:'One year from now, he will come ❤️'}]);
    let [flix,setFlix] = useState([{id:1, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/1.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{id:2, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'}, {id:3, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/3.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'}, {id:4, user:{avatar:user.data.image, name:'virat.kohli'}, url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/4.mp4', timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'}]);
    let [memories,setMemories] = useState([{name:'Tate', stories:[{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', timestamp:'Jun 19, 7:30 pm'},{id: 102, type:'video', avatar:user.data.image, name:'virat.kohli', url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', thumbnail:'https://pbs.twimg.com/media/F8H6AwkWMAAd_41?format=jpg&name=large', timestamp:'Feb 19, 11:30 am'},{id:103, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am'}]}, {name:'Party', stories:[{id:101, type:'image',avatar:user.data.image, name:'virat.kohli', url:'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', timestamp:'Jun 19, 7:30 pm'},{id: 102, type:'video', avatar:user.data.image, name:'virat.kohli', url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', thumbnail:'https://pbs.twimg.com/media/F8H6AwkWMAAd_41?format=jpg&name=large', timestamp:'Feb 19, 11:30 am'},{id:103, type:'image',avatar:user.data.image, name:'virat.kohli', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am'}]}]);
    let [images, setImages] = useState([]);
    const [visible, setIsVisible] = useState(true);
    let [index,setIndex] = useState(0);
    let colorScheme = useColorScheme();

    useEffect(()=>{
      setIsVisible(true)
    },[index]);

    return (
      <>    
        <MyStatusBar
              backgroundColor={colorScheme=='light'?'white':'rgb(21,24,37)'}
              barStyle={colorScheme=='dark'?'light-content':'dark-content'}
        />

        <View style={{flex:1, backgroundColor:colorScheme=='light'?'white':'rgb(21,24,37)'}}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons name="chevron-back" size={24} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
            </View>

            <View style={{flexDirection:'row', alignItems:'center', width:'100%'}}>
              <TouchableOpacity style={{flex:1}} onPress={()=>navigation.navigate('Follow List',{type:'Followers'})}>
                <Text style={{alignSelf:'center', marginBottom:10, fontWeight:'bold', fontSize:16, color:colorScheme=='light'?'black':'white'}}>1k</Text>
                <Text style={{alignSelf:'center',  color:colorScheme=='light'?'black':'white'}}>Followers</Text>
              </TouchableOpacity>

              <View style={styles.outerPP}>
                <View style={styles.pp}>
                    <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:user.data?.image}}></Image>
                </View>
              </View>

              <TouchableOpacity style={{flex:1}} onPress={()=>navigation.navigate('Follow List',{type:'Following'})}>
                <Text style={{alignSelf:'center', marginBottom:10, fontWeight:'bold', fontSize:16,  color:colorScheme=='light'?'black':'white'}}>342</Text>
                <Text style={{alignSelf:'center',  color:colorScheme=='light'?'black':'white'}}>Following</Text>
              </TouchableOpacity>

            </View>

            <Text style={{...styles.name,  color:colorScheme=='light'?'black':'white'}}>{user.data?.name}</Text>
            <Text style={{marginTop:6, fontSize:16, color:'grey', alignSelf:'center'}}>@virat.kohli</Text>
            <Text style={{...styles.bio,  color:colorScheme=='light'?'black':'white'}}>{user.data?.bio} I like dancing in the rain and travelling all around the world.</Text>

            <View style={{width:'100%', flexDirection:'row', alignItems:'center', marginTop:15, marginBottom:20, justifyContent:'space-evenly'}}>
              <Button mode="elevated" onPress={() => console.log('Pressed')} textColor='white' buttonColor='rgb(20,51,241)'>
                Follow
              </Button>
              <Button mode="elevated" onPress={() => console.log('Pressed')} textColor='black' buttonColor='white'>
                Message
              </Button>
            </View>

            <View style={{width:'100%', padding:5, backgroundColor:colorScheme=='light'?'rgb(23,34,61)':'black', flexDirection:'row', alignItems:'center'}}>
              <TouchableOpacity style={{alignItems:'center', marginVertical:3, flex:1}} onPress={()=>setFilter('Posts')}>
                <MaterialCommunityIcons name="grid" size={22} color={filter=='Posts'?'rgb(236,143,76)':'white'} />
                <Text style={{color:'white', fontSize:10, color:filter=='Posts'?'rgb(236,143,76)':'white'}}>Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{alignItems:'center', marginVertical:3, flex:1}} onPress={()=>setFilter('Flix')}>
                <MaterialCommunityIcons name="video-vintage" size={24} color={filter=='Flix'?'rgb(236,143,76)':'white'} />
                <Text style={{color:'white', fontSize:10, color:filter=='Flix'?'rgb(236,143,76)':'white'}}>Flix</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{alignItems:'center', marginVertical:3, flex:1}} onPress={()=>setFilter('Memories')}>
              <MaterialCommunityIcons name="progress-clock" size={24} color={filter=='Memories'?'rgb(236,143,76)':'white'} />
                <Text style={{color:'white', fontSize:10, color:filter=='Memories'?'rgb(236,143,76)':'white'}}>Memories</Text>
              </TouchableOpacity>
            </View>
            
            {
              filter=='Posts'||filter=='Flix' ?
                <FlatList 
                  data={filter=='Posts'?posts:flix}
                  renderItem={(item,index)=>{
                    return filter=='Posts'?<CustomImagePost data={item} key={index} navigation={navigation}/>:<CustomImageFlix data={item} key={index} navigation={navigation}/>
                  }}
                  numColumns={3}
                  contentContainerStyle={{paddingBottom:20}}
                />
              :
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
      </>
    )

}

const styles = StyleSheet.create({
    header:{
        flexDirection:'row',
        width:'100%',
        paddingHorizontal:15,
        paddingVertical:10
    },
    pp:{
      width:imageWidth-6,
      height:imageWidth-6,
      borderRadius:(imageWidth-6)*0.5,
      overflow:'hidden',
      backgroundColor:'white',
      alignSelf:'center'
    },
    outerPP:{
      height:imageWidth,
      width:imageWidth,
      borderRadius:imageWidth*0.5,
      backgroundColor:'rgb(236,143,76)',
      justifyContent:'center',
      alignItems:'center',
      alignSelf:'center'
    },
    name:{
      marginTop:10,
      fontSize:20,
      fontWeight:'bold',
      alignSelf:'center'
    },
    bio:{
      marginTop:20,
      fontSize:15,
      alignSelf:'center',
      paddingHorizontal:25,
      textAlign:'center'
    },
    image_cover:{
      width:windowWidth/3,
      height:windowWidth/3, 

    },
    image_cover_flix:{
      width:windowWidth/3,
      height:windowWidth/2, 

    },
    image_cover_memories:{
      marginVertical:10,
      width:windowWidth/3.2,
      height:windowWidth/2, 
      borderRadius:20,
      overflow:'hidden',
      marginHorizontal: windowWidth*0.009
    }
})
export default SocialProfile