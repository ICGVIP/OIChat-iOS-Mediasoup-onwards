import React,{useState} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Image,Dimensions} from 'react-native';
import { Button, TextInput,  Menu } from 'react-native-paper';

import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo'; 
import FontAwesome from '@expo/vector-icons/FontAwesome';

import FriendList from './FriendList';
const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;

const Friends = () => {

  const [friends,setFriends] = useState([{avatar:'https://iv1.lisimg.com/image/25080089/740full-banvir.jpg',name:'Banvir Kaur'},{avatar:'https://pbs.twimg.com/profile_images/1664589364276461575/9dGp_mPS_400x400.jpg',name:'Tristan Tate'},{avatar:'https://coretrainingtips.com/wp-content/uploads/2022/03/chris-bumstead-training.jpeg',name:'Chris Bumstead'},{avatar:'https://hips.hearstapps.com/hmg-prod/images/tommy-shelby-cillian-murphy-peaky-blinders-1569234705.jpg?crop=0.552xw:0.368xh;0.378xw,0.0295xh&resize=1200:*',name:'Thomas Shelby'},{avatar:'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png',name:'Hamza Ahmed'},{avatar:'https://iv1.lisimg.com/image/25080089/740full-banvir.jpg',name:'Banvir Kaur'},{avatar:'https://pbs.twimg.com/profile_images/1664589364276461575/9dGp_mPS_400x400.jpg',name:'Tristan Tate'},{avatar:'https://coretrainingtips.com/wp-content/uploads/2022/03/chris-bumstead-training.jpeg',name:'Chris Bumstead'},{avatar:'https://hips.hearstapps.com/hmg-prod/images/tommy-shelby-cillian-murphy-peaky-blinders-1569234705.jpg?crop=0.552xw:0.368xh;0.378xw,0.0295xh&resize=1200:*',name:'Thomas Shelby'},{avatar:'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png',name:'Hamza Ahmed'}]);
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  
  return (
    <>
      <View style={{padding:20,backgroundColor:'white'}}>
        <TextInput 
          mode='outlined'
          outlineStyle={styles.input}
          placeholder='Search for users....'
          activeOutlineColor='rgb(100,100,100)'
          left={<TextInput.Icon icon={()=><Ionicons name="search" size={24} color='grey'/>}/>}
        ></TextInput>
      </View>
      <View style={styles.requests}>
        <View>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Text style={styles.label}>Friend Requests </Text>
            <Entypo name="dot-single" size={28} color="rgb(59,135,247)" />
          </View>
          <Text style={styles.request}>buy_re, yb23 and 7 more</Text>
        </View>
        <View>
          <Entypo name="chevron-right" size={26} color="rgb(200,199,205)" />
        </View>
      </View>
      <View style={{backgroundColor:'white'}}>
        {friends.map((i,index)=>
          <FriendList key={index} i={i}/>
        )}
      </View>
      

    </>
    
  )
}
const styles = StyleSheet.create({
  input: {
    backgroundColor:'rgb(235,234,234)',
    borderRadius:30
  },
  requests:{
    padding:20,
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'white'
  },
  label:{
    fontWeight:'bold',
    fontSize:15
  },
  request:{
    color:'rgb(170,170,170)'
  }
})
export default Friends