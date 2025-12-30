import React,{useState, useEffect, useCallback} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Dimensions,useColorScheme, FlatList,TouchableOpacity,Modal, StatusBar, Alert, Platform, UIManager, LayoutAnimation} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Feather from '@expo/vector-icons/Feather'; 
import { useFocusEffect } from '@react-navigation/native';
import { useChannelSet } from '../../context/channel';
import {ChatDisplay } from './ChatDisplay';
import { useDispatch, useSelector } from 'react-redux';

import {OverlayNewBroadcast, OverlayNewContact } from './sub-screens/Overlays';

//Protect Hidden Chats Section
import RNBiometrics from "react-native-simple-biometrics";
import { useRTC } from '../../context/rtc';


const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;
const STATUSBAR_HEIGHT = StatusBar.currentHeight;
let windowHeight = Dimensions.get('window').height;



const OverlayMenu = ({onClose,navigation, setAction}) => {

  let colorScheme = useColorScheme();

  return (
    <View style={styles.overlay}>
      <View style={{...styles.menu, backgroundColor:colorScheme=='light'?'white':'rgb(39,41,48)'}}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={30} color={colorScheme=='light'?'black':'white'} />
        </TouchableOpacity>

        {/* Add your menu options as TouchableOpacity components */}
        <TouchableOpacity style={styles.menuOption} onPress={()=>setAction(1)}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <MaterialIcons name="perm-contact-cal" size={26} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>New Contact</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.menuOption} onPress={()=>setAction(2)}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <MaterialCommunityIcons name="broadcast" size={26} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Broadcast Message</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.menuOption}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <AntDesign name="scan1" size={26} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Scan User</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.menuOption}>
          <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
            <MaterialIcons name="attach-money" size={26} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
          </View>
          <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Send Money</Text>
        </TouchableOpacity> */}
        
        {/* ... add more options */}
      </View>
    </View>
  );
}

const timeOfDelivery = (createdAt) => {

  const currentDate = new Date();
  const messageDate = new Date(createdAt);
  const timeDifference = currentDate - messageDate;
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

  if (timeDifference < oneDay) {
    // If the message was received within the last 24 hours, display time
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (timeDifference < 2 * oneDay) {
    // If the message was received yesterday, display 'Yesterday'
    return 'Yesterday';
  } else {
    // If more than 48 hours, display the date in dd/mm/yyyy format
    const day = messageDate.getDate().toString().padStart(2, '0');
    const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
    const year = messageDate.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);


const Chats = ({navigation}) => {

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  let [action, setAction] = useState(0);
  let colorScheme = useColorScheme();
  let user = useSelector(state=>state.user.value);
  let {mode} = useSelector(state=>state.mode.value);
  let dispatch = useDispatch();
  let [type, setType] = useState('personal');
  // let [filter,setFilter] = useState('DM');
  let {channel, setChannel, socket, chats, expoPushToken, archived_chats, setAsk, ask, setArchivedChats, setHiddenChats, setChats} = useChannelSet();
  let {localStream} = useRTC();

  const openMenu = () => {
    setIsMenuVisible(true);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
  };



  useEffect(()=>{
    // Expo (non-VoIP) push token registration stays here.
    // VoIP token registration/sync is handled at app-root (NavigationWrapper) so it also works if user never opens Chats.
    if(!user || !expoPushToken) return;

    (
      async function(){
        try {
          let reply = await fetch('http://216.126.78.3:8500/api/set/push_token',{
            method:'POST',
            headers:{
              'Content-type':'application/json',
              'Authorization':`Bearer ${user.token}`
            },
            body:JSON.stringify({token:expoPushToken})
          });
          try { await reply.json(); } catch {}
        } catch (e) {
          console.log('Error setting expo push token:', e?.message || e);
        }
      }
    )();

    return ()=>{
      setAction(0);
      setChannel(null);
    }
  },[user,expoPushToken])

  useEffect(()=>{
    if(channel){
      return navigation.navigate('Chat Screen')
    }
  },[channel])

  // Better for cases when user gets on this screen by swiping left instead of clicking on back arrow. This 
  // ensures when the screen is in focus, conte3xt is set to null still. useCall
  useFocusEffect(
    useCallback(()=>{
      setChannel(null);
      //  Ensure we fetch all the chats once again, incase socket shuts off and some chat has been added.
      setAsk(!ask)

    },[channel])
  )

  

  function openHiddenChats(){
    Alert.alert('Access Restricted', 'Want to access hidden chats ?', [
      {text:'No', style:'destructive'},
      {text:'Yes', onPress:goToHiddenChats}
    ])
  }

  async function goToHiddenChats(){

    const can = await RNBiometrics.canAuthenticate();
  
    if (can) {
      try {
        await RNBiometrics.requestBioAuth("prompt-title", "This is for accessing the Hidden Chats");
        navigation.navigate('Hidden Chats');
      } catch (error) {
        // Code to handle authentication failure
        console.log(err,'...biometrics...failure');
        Alert.alert('Auth Failed','Authentication failed. Check if you have it setup in your device and given persmission to OIChat')
      }
    }

  }

  return (
    
      <>

        <MyStatusBar
          backgroundColor={colorScheme=='light'?'rgb(252,252,252)':'rgb(33,38,52)'}
          barStyle={colorScheme=='light'?'dark-content':'light-content'}
        ></MyStatusBar>
        <SafeAreaView style={colorScheme=='light'?{flex:1,backgroundColor:'rgb(252,252,252)'}:{flex:1,backgroundColor:'rgb(33,38,52)'}}>

            <View style={styles.header}>
                  <TouchableOpacity style={{width:'30%', marginLeft:20}} onPress={openHiddenChats}>
                    <Text style={{color:'rgb(251,138,57)',fontSize:25,fontWeight:'bold'}}>
                      Chats
                    </Text>
                  </TouchableOpacity>

                  <View style={{flexDirection:'row',justifyContent:'space-between',width:'30%', marginRight:15, marginLeft:5}}>
                    <TouchableOpacity><Ionicons name="search-sharp" size={24} color={'transparent'}  /></TouchableOpacity>
                    <TouchableOpacity onPress={()=>navigation.navigate('New Chat')}><MaterialCommunityIcons name="chat-plus-outline" size={24} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                    <TouchableOpacity onPress={openMenu}><Entypo name="dots-three-horizontal" size={24} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                  </View>
            </View>
            
            {/* <View style={{marginVertical:10, width:windowWidth, padding:10, flexDirection:'row'}}> */}
            <View style={{width:'100%', paddingTop:20, paddingHorizontal:10, marginBottom:20}}>
              <ScrollView
                horizontal={true}  // This ensures horizontal scrolling
                contentContainerStyle={styles.scrollViewContent}
                showsHorizontalScrollIndicator={false} // To hide horizontal scroll indicator (optional)
              >
                <TouchableOpacity onPress={()=>setType('personal')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='personal'?(colorScheme=='light'?'black':'white'):'transparent'}}>
                  <Text style={{color:colorScheme=='light'?(type=='personal'?'white':'rgb(150,150,150)'):(type=='personal'?'black':'white'), fontSize:14, fontWeight:'bold'}}>Personal</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setType('social')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='social'?(colorScheme=='light'?'black':'white'):'transparent'}}>
                  <Text style={{color:colorScheme=='light'?(type=='social'?'white':'rgb(150,150,150)'):(type=='social'?'black':'white'), fontSize:14, fontWeight:'bold'}}>Social</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setType('unknown')} style={{marginRight:7.5, borderRadius:40,padding:10, backgroundColor:type=='unknown'?(colorScheme=='light'?'black':'white'):'transparent'}}>
                  <Text style={{color:colorScheme=='light'?(type=='unknown'?'white':'rgb(150,150,150)'):(type=='unknown'?'black':'white'), fontSize:14, fontWeight:'bold'}}>Unknown</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setType('archived')} style={{marginRight:7.5, borderRadius:40,padding:10, flexDirection:'row', alignItems:'center', backgroundColor:type=='archived'?(colorScheme=='light'?'black':'white'):'transparent'}}>
                  <Ionicons name="archive-outline" size={18} color={colorScheme=='light'?(type=='archived'?'white':'black'):(type=='archived'?'black':'white')} />
                  <Text style={{color:colorScheme=='light'?(type=='archived'?'white':'rgb(150,150,150)'):(type=='archived'?'black':'white'), fontSize:14, marginLeft:8, fontWeight:'bold'}}>Archived</Text>
                </TouchableOpacity>
              </ScrollView>

            </View>
            

            {/* <ScrollView horizontal style={{width:windowWidth, backgroundColor:'red'}} contentContainerStyle={{padding:20}}> 
              <TouchableOpacity onPress={()=>setFilter('DM')} style={{marginRight:20}}>
                <Text style={{color:colorScheme=='light'?(filter=='DM'?'rgb(251,138,57)':'black'):(filter=='DM'?'rgb(251,138,57)':'white'), fontSize:13}}>DM</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setFilter('Work')} style={{marginRight:20}}>
                <Text style={{color:colorScheme=='light'?(filter=='Work'?'rgb(251,138,57)':'black'):(filter=='Work'?'rgb(251,138,57)':'white'), fontSize:13}}>Work</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setFilter('Product 1')} style={{marginRight:20}}>
                <Text style={{color:colorScheme=='light'?(filter=='Product 1'?'rgb(251,138,57)':'black'):(filter=='Product 1'?'rgb(251,138,57)':'white'), fontSize:13}}>Product 1</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setFilter('Product 2')} style={{marginRight:20}}>
                <Text style={{color:colorScheme=='light'?(filter=='Product 2'?'rgb(251,138,57)':'black'):(filter=='Product 2'?'rgb(251,138,57)':'white'), fontSize:13, marginLeft:8}}>Product 2</Text>
              </TouchableOpacity>
            </ScrollView> */}

            {
              type=='personal' &&
              <>
                {chats.length>0 && chats[0]!=null&&
                <FlatList 
                  data={chats}
                  renderItem={(item,index)=>(<ChatDisplay key={`${item?.item?.id}-${index}`} item={item}/>)}
                  ListFooterComponent={()=><View style={{paddingBottom:90}}></View>}
                />  
              }
              </>
            }

            {
              type=='archived' &&
              <>
                {archived_chats.length>0 && archived_chats[0]!=null&&
                <FlatList 
                  data={archived_chats}
                  renderItem={(item,index)=>(<ChatDisplay key={`${item?.item?.id}-${index}`} item={item}/>)}
                  ListFooterComponent={()=><View style={{paddingBottom:90}}></View>}
                />  
              }
              </>
            }     
              
 
              {/** implement chats list here */}
              <Modal animationType='slide' visible={isMenuVisible} transparent={true}>

                {action==0 && <OverlayMenu onClose={closeMenu} setAction={setAction}/>}
                {action==1 && <OverlayNewContact onClose={closeMenu} setAction={setAction}/>}
                {action==2 && <OverlayNewBroadcast onClose={closeMenu} setAction={setAction} navigation={navigation}/>}
              </Modal>
            
        </SafeAreaView>
        
      </>

   
  )
}
const styles = StyleSheet.create({
  scrollViewContent: {
    flexDirection: 'row',  // Ensure the tabs are laid out horizontally
  },
  image:{
    width:imageWidth,
    alignItems:'center',
    justifyContent:'center',
    
  },
  linearGradient:{
    width:'100%',
    flex:1,
    paddingVertical:10
  },
  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginVertical:10
  },
  input: {
    backgroundColor:'rgb(235,234,234)',
    borderRadius:30
  },
  input_dark:{
    backgroundColor:'rgb(50,50,50)',
    borderRadius:30
  },
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
    backgroundColor: 'rgb(39,41,48)',
    width: '100%',
    paddingHorizontal: 20,
    borderRadius: 10,
    zIndex:20,
    paddingVertical:10,
    paddingBottom:30
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingBottom: 10,
    marginTop:10
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

})
export default Chats