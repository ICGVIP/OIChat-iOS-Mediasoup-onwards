import React,{useState, useCallback, useMemo, useRef} from 'react';
import {Text,TouchableOpacity,ScrollView, StyleSheet,View,Image,Dimensions, useColorScheme} from 'react-native';
import { Button, TextInput,  Menu } from 'react-native-paper';
import { useSelector } from 'react-redux';
import PostDisplay from './sub-screens/PostContent';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;



const Home = ({handlePresentModalCommentPress, handlePresentModalForwardPress, navigation}) => {

    let [memories,setMemories] = useState([{id: 101, type:'video', avatar:'https://youthscape.ams3.cdn.digitaloceanspaces.com/images/16723620780107.remini-enhanced.jpg', name:'virat.kohli', url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', timestamp:'Feb 19, 11:30 am'},{id:102, type:'image',avatar:'https://iv1.lisimg.com/image/25080089/740full-banvir.jpg', name:'andrew.tate', url: 'https://i.guim.co.uk/img/media/59c1b14b1677cc33e27967cf6b11c8fd99a93761/0_102_1080_648/master/1080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=41356e05bb3a48148afcbbccc71519f4', timestamp:'Oct 9 2023, 11:30 am'},{id:103, type:'image',avatar:'https://pbs.twimg.com/profile_images/1664589364276461575/9dGp_mPS_400x400.jpg', name:'thomas.shelby', url: 'https://www.refinery29.com/images/8499977.jpg', timestamp:'Oct 9 2023, 11:30 am'},{id:104, type:'video', avatar:'https://coretrainingtips.com/wp-content/uploads/2022/03/chris-bumstead-training.jpeg', name:'virat.kohli', url:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos/2.mp4', thumbnail:'https://pbs.twimg.com/profile_images/1189494401359208448/AwbXHtpn_400x400.jpg', timestamp:'Feb 19, 11:30 am'}]);
    const [stories,setStories] = useState([{name:'Banvir'},{name:'Tristan'},{avatar:'',name:'CBum'},{avatar:'https://hips.hearstapps.com/hmg-prod/images/tommy-shelby-cillian-murphy-peaky-blinders-1569234705.jpg?crop=0.552xw:0.368xh;0.378xw,0.0295xh&resize=1200:*',name:'Thomas'},{avatar:'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png',name:'Hamza'}])
    const [posts,setPosts] = useState([{type:'image',url:'https://hips.hearstapps.com/hmg-prod/images/tommy-shelby-cillian-murphy-peaky-blinders-1569234705.jpg?crop=0.552xw:0.368xh;0.378xw,0.0295xh&resize=1200:*',name:'Lucky',avatar:'https://hips.hearstapps.com/hmg-prod/images/tommy-shelby-cillian-murphy-peaky-blinders-1569234705.jpg?crop=0.552xw:0.368xh;0.378xw,0.0295xh&resize=1200:*',timestamp:'Jun 19, 7:30 pm',caption:'The first duty of a warrior is to protect the pride and honour of his country....'},{url:'https://oichat.s3.us-east-2.amazonaws.com/v14025g50000cpk7h3nog65nabo8dau0.mp4',type:'video', name:'Thomas Shelby',avatar:'https://hips.hearstapps.com/hmg-prod/images/tommy-shelby-cillian-murphy-peaky-blinders-1569234705.jpg?crop=0.552xw:0.368xh;0.378xw,0.0295xh&resize=1200:*',timestamp:'Feb 07, 11:30 pm',caption:'Planning of a million ways to conquer this world', width:576, height: 1024},{type:'image', url:'https://netstorage-tuko.akamaized.net/images/d3710c0d7d6f29b4.jpg?imwidth=900',name:'Tristan Tate',avatar:'https://pbs.twimg.com/profile_images/1664589364276461575/9dGp_mPS_400x400.jpg',timestamp:'Jun 9, 7:30 am',caption:'Is daldal mein nahi fasna, isko apni aag se sukhakar mitti bana dena hai....'}]);
    let colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);

    return(
        <View style={{alignItems:'center'}}>
            <ScrollView horizontal style={colorScheme=='light'?styles.stories:styles.stories_dark} showsHorizontalScrollIndicator={false}>
                <View style={{alignItems:'flex-end', marginHorizontal:20}}>
                    <View style={styles.addStory}>
                        <Image style={styles.image} src={user.data.image}></Image>
                    </View>
                    <Text style={{color:'rgb(251,138,57)'}}>New Story +</Text> 
                </View>
                {memories.map((i,index)=>
                    <TouchableOpacity style={{height:100,width:100,alignItems:'center',marginHorizontal:2.5}} key={index} onPress={()=>navigation.navigate('Solo Story Display',{idOfStory:index, stories:memories})}>
                        <View style={styles.story}>
                            <Image style={styles.image} src={i.avatar}></Image>
                        </View>
                        <Text style={colorScheme=='light'?{color:'black'}:{color:'white'}}>{i.name}</Text> 
                    </TouchableOpacity>
                )}
                
            </ScrollView>

            {posts.map((i,index)=>
            <PostDisplay i={i} key={index} handlePresentModalCommentPress={handlePresentModalCommentPress} handlePresentModalForwardPress={handlePresentModalForwardPress}/>
            )}
        </View>  
    )
}
const styles = StyleSheet.create({
  stories:{
    paddingTop:10,
    paddingLeft:20,
    height:140,
  },
  stories_dark:{
    paddingTop:10,
    paddingLeft:20,
    height:120,
  },
  addStory:{
    height:80,
    width:80,
    borderRadius:40,
    borderColor:'rgb(37,117,221)',
    borderWidth:2,
    marginVertical:5,
    overflow:'hidden'
  },
  story:{
    height:80,
    width:80,
    borderRadius:40,
    borderColor:'rgb(180,95,226)',
    borderWidth:3,
    marginVertical:5,
    overflow:'hidden'
  },
  image:{
    height:'100%',
    width:'100%',
    resizeMode:'cover'
  },
  post:{
    marginVertical:20,
    paddingVertical:15
  },
  info:{
    paddingHorizontal:15,
    flexDirection:'row',
    alignItems:'center'
  },
  displayPicture:{
    height:50,
    width:50,
    overflow:'hidden',
    borderRadius:25
  },
  name:{
    fontWeight:'bold',
    fontSize:15
  },
  remaining:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    marginHorizontal:8,
    height:40
  },
  timestamp:{
    color:'rgb(190,190,190)'
  },
  picture:{
    width:windowWidth,
    height:windowWidth,
    overflow:'hidden',
  },
  buttons:{
    flexDirection:'row',
    justifyContent:'flex-start',
    marginTop:15
  },
  button:{
    marginHorizontal:5,
    fontWeight:'bold'
  }
})
export default Home