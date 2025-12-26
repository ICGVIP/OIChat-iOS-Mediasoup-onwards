import { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView,StatusBar, useColorScheme, Image, Dimensions,Linking } from 'react-native';
import { useSelector } from 'react-redux';
import {Appearance} from 'react-native';
const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.85;
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);


export default function App({navigation}) {
  
  const colorScheme = useColorScheme();

 
  function handleURLPP(){
    Linking.openURL('https://oichat.com/privacy')
  }
  function handleURLLicense(){
    Linking.openURL('https://oichat.com/license')
  }

  return (
    <SafeAreaView style={colorScheme=='light'?styles.container:styles.container_dark}>
      {/* <TouchableOpacity onPress={()=>navigation.navigate('Demo')}><Text>Home</Text></TouchableOpacity> */}
      {/* <TouchableOpacity onPress={()=>navigation.navigate('Screen1')}><Text>Slide1</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>navigation.navigate('Screen2')}><Text>Slide2</Text></TouchableOpacity> */}
      <View style={styles.image}>
        <Image resizeMode="contain" source={colorScheme=='light'?{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/OI.png'}:{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/oifire.png'}} style={{width:imageWidth,height:imageWidth}}></Image>
      </View>
      <View style={{width:'100%', height:'20%', alignItems:'center'}}>
        <TouchableOpacity style={styles.button1} onPress={()=>navigation.navigate('Login')}>
            <Text style={styles.login}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button2} onPress={()=>navigation.navigate('SignUp')}>
            <Text style={styles.sign}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.view}>
        <Text style={colorScheme=='light'?{color:'black'}:{color:'white'}}>By continuing, you agree to our <Text onPress={handleURLPP} style={styles.important}>Privacy Policy</Text> and <Text onPress={handleURLLicense} style={styles.important}>License Agreement</Text></Text>
      </View>
      
    </SafeAreaView>
  );
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
    backgroundColor:'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image:{
    height:'65%',
    alignItems:'center',
    justifyContent:'center',
    
  },
  button1: {
    width:'70%',
    marginVertical:'2%',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical:8,
    paddingHorizontal:20,
    borderWidth:1,
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
  
  view:{
    width:'90%', 
    alignItems:'center',
    paddingBottom:40,
    
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  }
});