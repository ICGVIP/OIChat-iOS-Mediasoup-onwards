import { SafeAreaView, Text, View, StatusBar, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, TextInput } from 'react-native';
import React, { useState } from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Display from './sub-portfolio/Display';
import HomeGraph from './sub-home/HomeGraph';
import Choice from './sub-trade/Choice';

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

export default function Trade({navigation}) {

  return(
    <>
        <MyStatusBar
              backgroundColor={'rgb(27,14,52)'}
              barStyle={'dark-content'}
        ></MyStatusBar>
        <LinearGradient colors={['rgb(27,14,52)','rgb(11,9,13)']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} onPress={()=>navigation.navigate('Money')}><AntDesign name="left" size={24} color='white' /><Text style={{color:'white',fontWeight:'bold',marginHorizontal:10,fontSize:19}}>Exit</Text></TouchableOpacity>
          </View>
          <ScrollView style={{marginBottom:120,paddingHorizontal:20}}>
            <View style={{flexDirection:'row',marginVertical:20}}>
              <View style={{height:50,width:50,borderRadius:10,backgroundColor:'rgb(142,87,227)',alignItems:'center',justifyContent:'center'}}>
                <Entypo name="plus" size={24} color="white" />
              </View>
              <View style={{flex:1,justifyContent:'space-between',marginHorizontal:15}}>
                <Text style={{fontWeight:'bold',color:'white'}}>Buy</Text>
                <Text style={{color:'white'}}>Buy crypto with funds</Text>
              </View>
            </View>
            <View style={{flexDirection:'row',marginVertical:20}}>
              <View style={{height:50,width:50,borderRadius:10,backgroundColor:'rgb(142,87,227)',alignItems:'center',justifyContent:'center'}}>
                <Entypo name="minus" size={24} color="white" />
              </View>
              <View style={{flex:1,justifyContent:'space-between',marginHorizontal:15}}>
                <Text style={{fontWeight:'bold',color:'white'}}>Sell</Text>
                <Text style={{color:'white'}}>Sell crypto with funds</Text>
              </View>
            </View>
            <View style={{flexDirection:'row',marginVertical:20}}>
              <View style={{height:50,width:50,borderRadius:10,backgroundColor:'rgb(142,87,227)',alignItems:'center',justifyContent:'center'}}>
                <Entypo name="swap" size={24} color="white" />
              </View>
              <View style={{flex:1,justifyContent:'space-between',marginHorizontal:15}}>
                <Text style={{fontWeight:'bold',color:'white'}}>Swap</Text>
                <Text style={{color:'white'}}>Convert one crypto to another</Text>
              </View>
            </View>
            <View style={{flexDirection:'row',marginVertical:20}}>
              <View style={{height:50,width:50,borderRadius:10,backgroundColor:'rgb(142,87,227)',alignItems:'center',justifyContent:'center'}}>
                <Feather name="send" size={24} color="white" />
              </View>
              <View style={{flex:1,justifyContent:'space-between',marginHorizontal:15}}>
                <Text style={{fontWeight:'bold',color:'white'}}>Send</Text>
                <Text style={{color:'white'}}>Send crypto to another wallet</Text>
              </View>
            </View>
            <View style={{flexDirection:'row',marginVertical:20}}>
              <View style={{height:50,width:50,borderRadius:10,backgroundColor:'rgb(142,87,227)',alignItems:'center',justifyContent:'center'}}>
                <Ionicons name="download" size={24} color="white" />
              </View>
              <View style={{flex:1,justifyContent:'space-between',marginHorizontal:15}}>
                <Text style={{fontWeight:'bold',color:'white'}}>Receive</Text>
                <Text style={{color:'white'}}>Recive crypto from another wallet</Text>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
    </>
   
  )
}

const styles = StyleSheet.create({
  statusBar: {
    height: StatusBar.currentHeight,
  },
  header:{
    flexDirection:'row',
    paddingHorizontal:20,
    justifyContent:'space-between',
    alignItems:'center',
    marginVertical:10
  },
  gradient:{
    flex:1,
  },
  pp:{
    width:120,
    height:120,
    borderRadius:20,
    overflow:'hidden',
    marginTop:10
  },
  card:{
    alignItems:'center',
    paddingVertical:40,
    borderRadius:30,
    overflow:'hidden'
  },
  buttons:{
    flexDirection:'row',
    justifyContent:'space-between'
  },
  orange:{
    backgroundColor:'rgb(142,87,227)',
    borderRadius:30,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    padding:10,
    marginHorizontal:10
  },
  selected:{
    backgroundColor:'rgb(48,31,13)',
    borderColor:'rgb(145,84,20)',
    borderWidth:1,
    borderRadius:20,
    padding:10
  },
  unselected:{
    backgroundColor:'rgb(20,20,20)',
    borderColor:'rgb(35,35,35)',
    borderWidth:1,
    borderRadius:20,
    padding:10
  },
  input:{
    color:'black',
    height:30,
    borderRadius:8,
    maxWidth:'82%',
    paddingStart:0,
    flexGrow:1,
    color:'rgb(139,145,153)',
    fontSize:17,
    justifyContent:'center',
    paddingTop:3
},
inputContainer:{
    height: 35,
    borderRadius:8,
    backgroundColor: 'rgb(30,32,32)',
    width:'90%',
    marginHorizontal:20,
    flexDirection:'row',
    flexWrap:'nowrap',
    justifyContent:'space-between',
    marginVertical:30,
} 
  
})
