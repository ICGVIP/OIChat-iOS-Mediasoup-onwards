import React,{useState} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Image,Dimensions, ImageBackground,TextInput, useColorScheme,TouchableOpacity,Modal,StatusBar} from 'react-native';
import { adaptNavigationTheme, Avatar, Button,  Menu } from 'react-native-paper';

import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MenuView } from '@react-native-menu/menu';

import { useDispatch, useSelector } from 'react-redux';

import { Toast } from '../../../context/ToastContext';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;

const STATUSBAR_HEIGHT = StatusBar.currentHeight;



export  const OverlaySettings = ({onClose,setAction}) => {
  
    let colorScheme = useColorScheme();
    let [mobile,setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    
    const [show, setShow] = useState(false);
    let [text, setSearchText] = useState('');
    let dispatch = useDispatch();
    let {contacts} = useSelector(state=>state.contacts.value);
  
    
    return (
      <View style={styles.overlay}>
        <View style={{...styles.menu, backgroundColor:colorScheme=='light'?'white':'rgb(39,41,48)'}}>
          <View style={styles.overlayHeader}>
            <TouchableOpacity style={{position:'absolute',left:0}} onPress={()=>{setAction(0);onClose();}}><Entypo name="cross" size={30} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
            <Text style={{fontSize:21,textAlign:'center',color:colorScheme=='light'?'black':'white',fontWeight:'bold'}}>Settings and Privacy</Text>
          </View>
            
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center', marginTop:20, marginBottom:20}}>
            <TextInput style={colorScheme=='light'?styles.searchInput:styles.searchInput_dark} placeholder="Search..." placeholderTextColor='rgb(121,124,134)' onChangeText={(text)=>setSearchText(text)}/>
          </View>

        <ScrollView contentContainerStyle={{}} style={{height:'70%'}}>
            <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginVertical:20}}>
                <View style={{width:'25%'}}>
                    <View style={{height:60,width:60,borderRadius:30,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                        <Ionicons name='key-outline' size={30} color={colorScheme=='light'?'black':'white'}/>
                    </View>
                </View>

                <View style={{flexDirection:'column', width:'75%'}}>
                    <Text style={{fontWeight:'bold',color:colorScheme=='light'?'black':'white',fontSize:17, marginBottom:5}}>Account</Text>
                    <Text style={{color:'rgb(91,94,104)', fontSize:15}}>Privacy, security, personal details</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginVertical:20}}>
                <View style={{width:'25%'}}>
                    <View style={{height:60,width:60,borderRadius:30,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                        <AntDesign name="bells" size={24} color={colorScheme=='light'?'black':'white'} />
                    </View>
                </View>
                
                <View style={{flexDirection:'column', width:'75%'}}>
                    <Text style={{fontWeight:'bold',color:colorScheme=='light'?'black':'white',fontSize:17, marginBottom:5}}>Notifications</Text>
                    <Text style={{color:'rgb(91,94,104)', fontSize:15}}>Posts, Stories, Comments</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginVertical:20}}>
                <View style={{width:'25%'}}>
                    <View style={{height:60,width:60,borderRadius:30,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                        <MaterialIcons name="business-center" size={24} color={colorScheme=='light'?'black':'white'} />
                    </View>
                </View>
                <View style={{flexDirection:'column', width:'75%'}}>
                    <Text style={{fontWeight:'bold',color:colorScheme=='light'?'black':'white',fontSize:17, marginBottom:5}}>Business Tools</Text>
                    <Text style={{color:'rgb(91,94,104)', fontSize:15}}>Ads, Branded Content, Marketplace</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginVertical:20}}>
                <View style={{width:'25%'}}>
                    <View style={{height:60,width:60,borderRadius:30,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                        <Octicons name="blocked" size={24} color={colorScheme=='light'?'black':'white'} />
                    </View>
                </View>
                <View style={{flexDirection:'column', width:'75%'}}>
                    <Text style={{fontWeight:'bold',color:colorScheme=='light'?'black':'white',fontSize:17, marginBottom:5}}>Blocked and Restricted</Text>
                    <Text style={{color:'rgb(91,94,104)', fontSize:15}}>Blocked and restricted users</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginVertical:20}}>
                <View style={{width:'25%'}}>
                    <View style={{height:60,width:60,borderRadius:30,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                        <FontAwesome name="comments-o" size={24} color={colorScheme=='light'?'black':'white'} />
                    </View>
                </View>
                <View style={{flexDirection:'column', width:'75%'}}>
                    <Text style={{fontWeight:'bold',color:colorScheme=='light'?'black':'white',fontSize:17, marginBottom:5}}>Interactions</Text>
                    <Text style={{color:'rgb(91,94,104)', fontSize:15}}>Comments, Likes, Tags, Sharing</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginVertical:20}}>
                <View style={{width:'25%'}}>
                    <View style={{height:60,width:60,borderRadius:30,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                        <MaterialIcons name="history" size={26} color={colorScheme=='light'?'black':'white'} />
                    </View>
                </View>
                <View style={{flexDirection:'column', width:'75%'}}>
                    <Text style={{fontWeight:'bold',color:colorScheme=='light'?'black':'white',fontSize:17, marginBottom:5}}>Story Settings</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginVertical:20}}>
                <View style={{width:'25%'}}>
                    <View style={{height:60,width:60,borderRadius:30,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                        <FontAwesome name="photo" size={24} color={colorScheme=='light'?'black':'white'} />
                    </View>
                </View>
                <View style={{flexDirection:'column', width:'75%'}}>
                    <Text style={{fontWeight:'bold',color:colorScheme=='light'?'black':'white',fontSize:17, marginBottom:5}}>Posts and Video Settings</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginVertical:20}}>
                <View style={{width:'25%'}}>
                    <View style={{height:60,width:60,borderRadius:30,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                        <Octicons name="gear" size={24} color={colorScheme=='light'?'black':'white'} />
                    </View>
                </View>
                <View style={{flexDirection:'column', width:'75%'}}>
                    <Text style={{fontWeight:'bold',color:colorScheme=='light'?'black':'white',fontSize:17, marginBottom:5}}>Account Type and Tools</Text>
                </View>
            </TouchableOpacity>
                
            <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-evenly',alignItems:'center',marginVertical:20}}>
                <View style={{width:'25%'}}>
                    <View style={{height:60,width:60,borderRadius:30,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                        <Ionicons name="headset" size={24} color={colorScheme=='light'?'black':'white'} />
                    </View>
                </View>
                <View style={{flexDirection:'column', width:'75%'}}>
                    <Text style={{fontWeight:'bold',color:colorScheme=='light'?'black':'white',fontSize:17, marginBottom:5}}>Help and Support</Text>
                </View>
            </TouchableOpacity>
        </ScrollView>
          
            
        </View>
      </View>
    )
  }

const styles = StyleSheet.create({

    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      elevation:10,
      zIndex:100,
    },
    menu: {
      width: '100%',
      paddingHorizontal: 20,
      borderRadius: 10,
      zIndex:20,
      paddingTop:10,
      paddingBottom:30
    },
    closeButton: {
      alignSelf: 'flex-end',
      paddingBottom: 10,
    },
    menuOption: {
      padding:20,
      flexDirection:'row',
      alignItems:'center'
    },
    option:{
      fontSize:19,
      color:'white',
      marginHorizontal:20
    },
    statusBar: {
      height: STATUSBAR_HEIGHT,
    },
    overlayHeader: {
      flexDirection:'row',
      paddingVertical: 10,
      alignItems: 'center', 
      justifyContent: 'center'
    },
    input:{
      backgroundColor:'rgb(63,68,80)',
      paddingHorizontal:8,
      paddingVertical:10,
      color:'rgb(255,255,255)',
      fontSize:18,
      borderRadius:10
    },
    searchInput:{
      height: 40,
      borderRadius:8,
      backgroundColor: 'rgb(228,229,231)',
      paddingHorizontal: 15,
      marginBottom: 10,
      width:'90%',
      color:'rgb(120,134,142)',
      margin:15
    },
    searchInput_dark:{
      height: 40,
      borderRadius:8,
      backgroundColor: 'rgb(63,68,81)',
      paddingHorizontal: 15,
      marginBottom: 10,
      width:'90%',
      color:'white',
      margin:15,
      marginBottom:20
    },
    contactsScroll:{
      width:'100%',
  
    },
    contactItem:{
      flexDirection:'row',
      flex:1,    
      marginVertical:10
    },
    name:{
      fontWeight:'bold',
      fontSize:15,
      color:'black',
      marginVertical:5
    },
    name_dark:{
        fontWeight:'bold',
        fontSize:15,
        color:'white',
        marginVertical:5
    },
    bio:{
        color:'grey'
    },
    selected:{
      flexDirection:'row',
      backgroundColor:'rgb(200,201,203)',
      width:'100%',
      paddingVertical:10,
      paddingHorizontal:20,
      borderRadius:20,
      alignItems:'center'
    },
    selected_dark:{
      flexDirection:'row',
      backgroundColor:'rgb(30,30,30)',
      width:'100%',
      paddingVertical:10,
      paddingHorizontal:20,
      borderRadius:20,
      alignItems:'center'
    },
    normal:{
      flexDirection:'row',
      width:'100%',
      paddingVertical:10,
      paddingHorizontal:20,
      alignItems:'center'
    },
    notonoi:{
      color:'grey',
      fontStyle:'italic'
    },
    circularIcon:{
      height:60,
      width:60,
      borderRadius:30,
      overflow:'hidden'
    },
    closeIcon:{
      position: 'absolute',
      top: -8,
      right: 0,
    },
    menu_: {
      backgroundColor: 'rgb(39,41,48)',
      width: '100%',
      borderRadius: 10,
      zIndex:20,
      paddingTop:10,
      paddingBottom:30
    },
    header:{
        flexDirection:'row',
        backgroundColor:'white',
        height:90,
        width:'100%'
    },
    header_dark:{
        flexDirection:'row',
        backgroundColor:'rgb(41,44,56)',
        height:90,
        width:'100%'
    },
    image:{
        width:'100%',
        height:'100%',
        resizeMode:'cover',
        
    }
  
  })