import React,{useState} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Image,Dimensions} from 'react-native';
import { Button, TextInput,  Menu } from 'react-native-paper';

import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;

const Popular = () => {


  return (
    <View>
        
    </View>
  )
}
const styles = StyleSheet.create({
  image:{
    width:imageWidth,
    alignItems:'center',
    justifyContent:'center',
    
  },
  header:{
    backgroundColor:'white',
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:10,
    alignItems:'center'
  },
  tab:{
    flexDirection:'row',
    justifyContent:'center'
  },
  section:{
    width:'33%',
    borderBottomColor:'rgb(235,235,235)',
    borderBottomWidth:1,
    flexDirection:'row',
    justifyContent:'center',
    paddingBottom:10
  },
  selected:{
    width:'33%',
    borderBottomColor:'rgb(54,196,249)',
    color:'rgb(54,196,249)',
    borderBottomWidth:1,
    flexDirection:'row',
    justifyContent:'center',
    paddingBottom:10
  }
})
export default Popular