import { SafeAreaView, Text, View, StyleSheet, Image, useColorScheme, StatusBar, Dimensions} from 'react-native'
import React, { useState, useEffect } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const scaleFontSize = (size) => (size * windowWidth) / 390;

// export default function Screen1({navigation}) {

//     let colorScheme = useColorScheme();


//     return (
//       <SafeAreaView style={colorScheme=='light'?styles.container:styles.container_dark}>
//         <View style={styles.image}>
//             <Image resizeMode="contain" source={require('../assets/Mask.png')} style={{}}></Image>
//         </View>
//         <View style={styles.text}>
//             <Text style={colorScheme=='light'?styles.heading:styles.heading_dark}>Money Transfer</Text>
//             <Text style={colorScheme=='light'?{color:'black',paddingHorizontal:40}:{color:'white',paddingHorizontal:40}}>Send money hassle-free. Our secure transfer feature lets you instantly share funds. Convenient and quick!</Text>
//             <View style={{paddingHorizontal:30,marginVertical:30,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
//                 <MaterialIcons name="wb-sunny" size={32} color="rgb(252,145,65)" style={{marginHorizontal:15}}/>
//                 <MaterialIcons name="stop-circle" size={24} color="rgb(252,145,65)" style={{marginHorizontal:15}}/>
//                 <MaterialIcons name="stop-circle" size={24} color="rgb(252,145,65)" style={{marginHorizontal:15}}/>
//             </View>
//             <Button icon={()=><AntDesign name="arrowright" size={24} color="white" />} mode="contained" onPress={() => navigation.navigate('Easy Chat')} buttonColor='rgb(252,145,65)' textColor={colorScheme=='light'?'black':'white'}style={{width:'60%'}}>
//                 Continue
//             </Button>
//         </View>
//       </SafeAreaView>
//     )
  
// }

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);


export default function Screen1({navigation}) {

  return (
    <>
      <MyStatusBar
        backgroundColor={'rgb(253,243,210)'}
        barStyle={'dark-content'}
      />
  
        <LinearGradient colors={['rgb(253,243,210)','rgb(249,219,205)']} style={styles.container_gradient}>
          <Image source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/opening_chat.png'}} style={{width:windowWidth*0.96, height:windowHeight*0.6}} resizeMode='cover'/>
          <View style={{marginTop:-50}}>
            <Text style={{marginHorizontal:15, fontSize:scaleFontSize(32), fontWeight:'bold', alignSelf:'center', textAlign:'center'}}>Chat, video call and share with your loved ones</Text>
            <Button style={{margin:30, alignSelf:'flex-end'}} buttonColor='white' labelStyle={{fontWeight:'bold', fontSize:17}} textColor='black' mode='contained'  onPress={() => navigation.navigate('Easy Chat')}>Next</Button>
          </View>
         
        </LinearGradient>
     
    </>
  )

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'white',
      alignItems: 'center',
      justifyContent: 'center',
    },
    container_dark:{
      flex: 1,
      backgroundColor:'rgb(33,38,51)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image:{
      height:'20%',
      alignItems:'center',
      justifyContent:'flex-end',
      
    },
    text:{
        height:'40%',
        paddingVertical:30,
        justifyContent:'flex-start',
        alignItems:'center'
    },
    button1: {
      width:'70%',
      marginVertical:'2%',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingVertical:8,
      paddingHorizontal:20,
      borderWidth:'1px',
      borderColor:'rgb(233,88,36)',
      borderRadius:20,
      
    },
    important:{
      color:'rgb(233,88,36)'
    },
    button2: {
      width:'70%',
      marginVertical:'2%',
      alignItems: 'center',
      backgroundColor: 'rgb(233,88,36)',
      paddingVertical:8,
      paddingHorizontal:20,
      color:'white',
      borderRadius:20,
    },
    login:{
      fontSize:20,
      fontWeight:'bold',
      color:'rgb(233,88,36)'
    },
    sign:{
      fontSize:20,
      fontWeight:'bold',
      color:'white'
    },
    heading:{
        fontSize:25,
        color:'black',
        fontWeight:'bold',
        marginBottom:30
    },
    heading_dark:{
      fontSize:25,
        color:'white',
        fontWeight:'bold',
        marginBottom:30
    },
    container_gradient:{
      flex:1
    }
  });
