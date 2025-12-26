import { SafeAreaView, Text, View, StyleSheet, Image, useColorScheme, StatusBar, Dimensions, ImageBackground} from 'react-native'
import React, { useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Octicons from '@expo/vector-icons/Octicons';
import { Avatar, Button } from 'react-native-paper';
import { useDispatch} from 'react-redux';
import {login} from '../slices/user'
import { LinearGradient } from 'expo-linear-gradient';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

const scaleFontSize = (size) => (size * windowWidth) / 390;

export default function Screen3({navigation}) {

  return (
    <>
      <MyStatusBar
        backgroundColor={'rgb(253,243,210)'}
        barStyle={'dark-content'}
      />

      <LinearGradient colors={['rgb(253,243,210)','rgb(249,219,205)']} style={styles.container_gradient}>
        <Image source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/dil_nu.png'}} style={{width:windowWidth*0.85, height:windowHeight*0.5, alignSelf:'center', marginTop:10}} resizeMode='contain'/>
        <Text style={{margin:15, fontSize:scaleFontSize(32), fontWeight:'bold', alignSelf:'center', textAlign:'center', marginVertical:30}}>Pay, transfer and manage funds</Text>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
            <ImageBackground style={{height:windowHeight/10,width:windowWidth*0.5}} imageStyle={{opacity:0.4}}  resizeMode='contain' source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/mglass.png'}}/>
            <Button style={{margin:30, alignSelf:'flex-end'}} labelStyle={{fontWeight:'bold', fontSize:17}} buttonColor='white' textColor='black' mode='contained' onPress={()=>navigation.navigate('Opening')}>Next</Button>
        </View>
        
      </LinearGradient>

    </>
  )

}




const styles = StyleSheet.create({
  container_gradient:{
    flex:1
  }
});
