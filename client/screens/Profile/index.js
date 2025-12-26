import React,{useState} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Image,Dimensions,Alert,useColorScheme,ImageBackground, TouchableOpacity, StatusBar} from 'react-native';
import { Button, TextInput,  Menu } from 'react-native-paper';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {logout} from '../../slices/user';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);
const Profile = ({navigation}) => {
  let user = useSelector(state=>state.user.value);
  let dispatch = useDispatch();
  let colorScheme=useColorScheme();

  async function handleLogout(){

    Alert.alert('Log Out', 'Are you sure you want to log out ?', [
      {text:'No', style:'destructive'},
      {text:'Yes', onPress:async()=>{dispatch(logout())}}
    ])
    
    // Don't navigate here - let NavigationWrapper handle it after state change
    // The navigator will switch automatically when user.data becomes null
    
  }

  return (
    <>
    <MyStatusBar
      backgroundColor={colorScheme=='light'?'rgb(233,233,233)':'rgb(56,59,62)'}
      barStyle={colorScheme=='dark'?'light-content':'dark-content'}
    ></MyStatusBar>

      <SafeAreaView style={{flex:1, backgroundColor:colorScheme=='light'?'white':'black'}}>
        <View style={{...styles.linearGradient,backgroundColor:colorScheme=='light'?'rgb(233,233,233)':'rgb(56,59,62)'}}>
          <View style={styles.nav}>
            <Text style={{fontSize:18,fontWeight:'bold',color:colorScheme=='light'?'black':'white', alignSelf:'center'}}>Settings</Text>
            <TouchableOpacity onPress={(handleLogout)}><MaterialIcons name="power-settings-new" size={27} color={colorScheme=='light'?'black':'white'}/></TouchableOpacity>
          </View>
          <View style={styles.main}>
            <View style={styles.pp}>
              <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:user.data?.image}}></Image>
            </View>
            <Text style={{fontWeight:'bold',marginVertical:15,fontSize:25, color:colorScheme=='light'?'black':'white'}}>{user.data?.firstName+" "+user.data?.lastName}</Text>
            {user.data.bio?
              <Text style={{color:colorScheme=='light'?'black':'white',paddingHorizontal:15}}>{user.data.bio}</Text>
            :
              <Text style={{color:colorScheme=='light'?'black':'white',paddingHorizontal:15,fontStyle:'italic'}}>OIChat is a different experience!</Text>
            }
            
            <Button icon={()=><AntDesign name="eye" size={24} color={'black'} />} mode="contained" onPress={()=>navigation.navigate('Edit Profile')} style={styles.button} textColor='black'>
                Profile Settings
            </Button>
          </View>
          
        </View>

        <ScrollView style={{...styles.settings}} contentContainerStyle={{paddingBottom:100}}>  

          <View style={styles.chat}>
            <Text style={{fontSize:30,fontWeight:'bold',color:colorScheme=='light'?'black':'white'}}>Chat</Text>
            <Text style={{color:colorScheme=='light'?'black':'white',marginTop:10}}>All your chat related subsettings can be found in this section</Text>
          </View>
          <View style={{paddingHorizontal:20,width:'100%',flexDirection:'row',justifyContent:'space-evenly',marginVertical:15,borderBottomColor:'white',borderBottomWidth:0.3,paddingBottom:30,borderBottomLeftRadius:30,borderBottomRightRadius:30}}>
            <TouchableOpacity style={{flexDirection:'column',alignItems:'center'}} onPress={()=>navigation.navigate('Chat Settings General')}>
              <MaterialIcons name="settings" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>General</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flexDirection:'column',alignItems:'center'}}>
              <Entypo name="bell" size={22} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Notifications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{flexDirection:'column',alignItems:'center'}}>
              <FontAwesome5 name="shield-alt" size={22} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flexDirection:'column',alignItems:'center'}}>
              <MaterialIcons name="backup" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Storage</Text>
            </TouchableOpacity>     
          </View>

          <View style={styles.chat}>
            <Text style={{fontSize:30,fontWeight:'bold',color:colorScheme=='light'?'black':'white'}}>Calling</Text>
            <Text style={{color:colorScheme=='light'?'black':'white',marginTop:10}}>All your calls related subsettings can be found in this section</Text>
          </View>
          <View style={{paddingHorizontal:20,width:'100%',flexDirection:'row',justifyContent:'space-evenly',marginVertical:15,borderBottomColor:'white',borderBottomWidth:0.3,paddingBottom:30,borderBottomLeftRadius:30,borderBottomRightRadius:30}}>
            <View style={{flexDirection:'column',alignItems:'center'}}>
              <MaterialIcons name="settings" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>General</Text>
            </View>
            <View style={{flexDirection:'column',alignItems:'center'}}>
              <Entypo name="bell" size={22} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Notifications</Text>
            </View>
            
            <View style={{flexDirection:'column',alignItems:'center'}}>
              <FontAwesome5 name="shield-alt" size={22} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Privacy</Text>
            </View>
            <View style={{flexDirection:'column',alignItems:'center'}}>
              <MaterialIcons name="backup" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Storage</Text>
            </View>     
          </View>

          <View style={styles.chat}>
            <Text style={{fontSize:30,fontWeight:'bold',color:colorScheme=='light'?'black':'white'}}>Discover</Text>
            <Text style={{color:colorScheme=='light'?'black':'white',marginTop:10}}>All your discover/social section related subsettings can be found in this section</Text>
          </View>
          <View style={{paddingHorizontal:20,width:'100%',flexDirection:'row',justifyContent:'space-evenly',marginVertical:15,borderBottomColor:'white',borderBottomWidth:0.3,paddingBottom:30,borderBottomLeftRadius:30,borderBottomRightRadius:30}}>
            <View style={{flexDirection:'column',alignItems:'center'}}>
              <MaterialIcons name="settings" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>General</Text>
            </View>
            <View style={{flexDirection:'column',alignItems:'center'}}>
              <Entypo name="bell" size={22} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Notifications</Text>
            </View>
            
            <View style={{flexDirection:'column',alignItems:'center'}}>
              <FontAwesome5 name="shield-alt" size={22} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Privacy</Text>
            </View>
            <View style={{flexDirection:'column',alignItems:'center'}}>
              <MaterialIcons name="backup" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Storage</Text>
            </View>     
          </View>

          <View style={styles.chat}>
            <Text style={{fontSize:30,fontWeight:'bold',color:colorScheme=='light'?'black':'white'}}>Wallet</Text>
            <Text style={{color:colorScheme=='light'?'black':'white',marginTop:10}}>All your money + crypto related subsettings can be found in this section</Text>
          </View>
          <View style={{paddingHorizontal:20,width:'100%',flexDirection:'row',justifyContent:'space-evenly',marginVertical:15,borderBottomColor:'white',borderBottomWidth:0.3,paddingBottom:30,borderBottomLeftRadius:30,borderBottomRightRadius:30}}>
            <View style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <MaterialIcons name="settings" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>General</Text>
            </View>
            <View style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <FontAwesome5 name="shield-alt" size={22} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Privacy</Text>
            </View>
            <View style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <MaterialIcons name="backup" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Transactions</Text>
            </View>
            <View style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <FontAwesome name="credit-card-alt" size={22} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Payments</Text>
            </View>
          </View>

          <View style={styles.chat}>
            <Text style={{fontSize:30,fontWeight:'bold',color:colorScheme=='light'?'black':'white'}}>Help & Support</Text>
          </View>
          <View style={{paddingHorizontal:20,width:'100%',flexDirection:'row',justifyContent:'space-evenly',marginVertical:15,borderBottomColor:'white',borderBottomWidth:0.3,paddingBottom:30,borderBottomLeftRadius:30,borderBottomRightRadius:30}}>
            <TouchableOpacity style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}} onPress={()=>navigation.navigate('Contact Us')}>
              <FontAwesome5 name="headset" size={24} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Contact Us</Text>
            </TouchableOpacity>
            <View style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <MaterialCommunityIcons name="account-question" size={24} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>FAQs</Text>
            </View>
            <View style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <FontAwesome5 name="headset" size={24} color="transparent" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7, color:'transparent'}}>Contact Us</Text>
            </View>
            <View style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <MaterialCommunityIcons name="account-question" size={24} color="transparent" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7, color:'transparent'}}>FAQs</Text>
            </View>
            
          </View>

          <View style={styles.chat}>
            <Text style={{fontSize:30,fontWeight:'bold',color:colorScheme=='light'?'black':'white'}}>Account</Text>
          </View>
          <View style={{paddingHorizontal:20,width:'100%',flexDirection:'row',justifyContent:'space-evenly',marginVertical:15,borderBottomColor:'white',borderBottomWidth:0.3,paddingBottom:30,borderBottomLeftRadius:30,borderBottomRightRadius:30}}>
            <TouchableOpacity onPress={()=>navigation.navigate('Account Settings')} style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <MaterialIcons name="settings" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>General</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>navigation.navigate('Security Settings')}  style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <Ionicons name="key-sharp" size={26} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7}}>Security</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>navigation.navigate('Deactivate')} style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <MaterialIcons name="no-accounts" size={24} color="orange" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7, color:colorScheme=='light'?'black':'white'}}>Deactivate</Text>
            </TouchableOpacity>
            <View style={{flexDirection:'column',alignItems:'center', alignSelf:'center'}}>
              <MaterialCommunityIcons name="account-question" size={24} color="transparent" />
              <Text style={{color:colorScheme=='light'?'black':'white',marginVertical:7, color:'transparent'}}>FAQs</Text>
            </View>
            
          </View>

        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles=StyleSheet.create({
  linearGradient:{
    width:'100%',
    borderBottomLeftRadius:30,
    borderBottomRightRadius:30,
    paddingVertical:10,
    backgroundColor:'white'
},
statusBar:{
  height: STATUSBAR_HEIGHT,
},
nav:{
  flexDirection:'row',
  width:'100%',
  paddingHorizontal:15,
  justifyContent:'space-between'
},
name:{
  marginVertical:30,
  paddingLeft:20,
  width:'50%'
},
main:{
  width:'100%',
  alignItems:'center'
},
pp:{
  width:120,
  height:120,
  borderRadius:60,
  overflow:'hidden',
  marginTop:10
},
title:{
  fontSize:30,
  fontWeight:'bold',
},
settings:{
  marginVertical:20
},
chat:{
paddingHorizontal:20,
marginVertical:15
},
button:{
  elevation:5,
  backgroundColor: 'orange',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOpacity: 1,
    shadowRadius: 4,
  marginVertical:20
},
icon:{
  elevation:5,
  backgroundColor: 'black',
    shadowColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 1,
    shadowRadius: 4,
    borderRadius:400,
    flexDirection:'column',
    alignItems:'center',
    padding:10,
    height:80,
    width:80
}
})

export default Profile 