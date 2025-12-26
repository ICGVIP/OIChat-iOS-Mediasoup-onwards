import React,{useState, useEffect, useRef, useCallback} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Image,Dimensions,useColorScheme,ImageBackground, TouchableOpacity, StatusBar, Alert} from 'react-native';
import { Avatar } from 'react-native-paper';
import ImageModal from 'react-native-image-modal'
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Foundation from '@expo/vector-icons/Foundation';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { useChannelSet } from '../../../context/channel';
import Video from 'react-native-video';
// Use Stream Video Client

import { MenuView } from '@react-native-menu/menu';


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

export const ContactCard = ({navigation,route}) => {

    let {contact} = route.params;

    return (
        <>
            <MyStatusBar
              backgroundColor={'rgb(0,10,41)'}
              barStyle={'light-content'}
            ></MyStatusBar>

            <LinearGradient style={{flex:1,width:'100%'}} colors={['rgb(1,11,42)','rgb(60,75,117)']}>
                <SafeAreaView style={{flex:1}}>
                    <View style={styles.nav}>
                        <TouchableOpacity onPress={()=>navigation.pop()}><AntDesign name="left" size={24} color="white" /></TouchableOpacity>
                        <Text style={{color:'white',fontSize:19}}>Contact Card</Text>
                        <TouchableOpacity onPress={()=>navigation.pop()}><Entypo name="dots-three-vertical" size={24} color="white" /></TouchableOpacity>
                    </View>

                    <View style={{marginVertical:20, width:150, height:150,borderRadius:750, overflow:'hidden', marginTop:40, alignSelf:'center'}}>
                        <Image source={{uri:contact.avatar}} style={{height:'100%', width:'100%'}} resizeMode='cover'/>
                    </View>

                    <Text style={{fontSize:19, fontWeight:'bold', color:'white', marginVertical:10, alignSelf:'center'}}>{contact.name}</Text>

                    <View style={styles.cta}>
                        <TouchableOpacity style={styles.button}><Ionicons name="videocam-outline" size={22} color="white"/></TouchableOpacity>
                        <TouchableOpacity style={styles.button}><Ionicons name="call-outline" size={22} color="white"/></TouchableOpacity>
                        <TouchableOpacity style={styles.button}><FontAwesome name="dollar" size={22} color="white" /></TouchableOpacity>
                    </View>

                    <View style={styles.number_info}>
                        <Text style={{color:'white'}}>mobile</Text>
                        <Text style={{color:'white', marginVertical:10, fontWeight:'bold', fontSize:16}}>{contact.phone}</Text>
                    </View>

                </SafeAreaView>
            </LinearGradient>
        </>
    )
}

const SelfChatInfo = ({navigation,route}) => {

  let user = useSelector(state=>state.user.value);
  let [initialMedia, setInitialMedia] = useState([]);
  let colorScheme=useColorScheme();
  const containerView = useRef();
  let {channel, setChannel} = useChannelSet();
  let [muted,setMuted] = useState([]);

  
   
    //To fetch 3 media files. After improving messages, this would change to get 3 from backend in a special function
    useEffect(()=>{
      (
          async function (){
              const reply = await fetch(`http://216.126.78.3:8500/api/fetch/media?chat_member_id=${channel?.chat_member.id}&channel_id=${channel?.id}&limit=${5}&offset=${0}`,{
                  headers:{
                  'Content-type':'application/json',
                  'Authorization':`Bearer ${user.token}`
                  }
              });
              const response = await reply.json();

              if (response.success) {
                  if(response.count>0){

                      let items = [];
                      let num = 0;
                      let breaked = false

                      for (let i of Object.keys(response.groupedMedia)){
                          if (breaked) break;
                          for (let a of response.groupedMedia[i]){    
                              if(num==3) {
                                  breaked=true;
                                  break;
                              }                   
                              items.push(a);
                              num+=1;  
                          }
                      }
                      setInitialMedia(items)
                  }
              }

          }
      )();

  },[]);

  
  const deleteChat = async ()=>{

    Alert.alert('Delete Chat', 'Are you sure you want to delete this chat ?', [
      {text:'Cancel', onPress:()=>console.log('cancelled')},
      {text:'Yes', onPress: async ()=>{await channel?.hide(null,true), navigation.navigate('Home')}, style:'destructive'}
    ])
    
  }
  
  return (
    <>
    <MyStatusBar
              backgroundColor={'rgb(0,10,41)'}
              barStyle={'light-content'}
    ></MyStatusBar>

    <LinearGradient style={{flex:1,width:'100%'}} colors={['rgb(1,11,42)','rgb(60,75,117)']}>
      <SafeAreaView style={{flex:1}}>
          <View style={styles.nav}>
            <TouchableOpacity onPress={()=>navigation.pop()}><AntDesign name="left" size={24} color="white" /></TouchableOpacity>
          </View>
          <ScrollView ref={containerView}>
            
          <View style={styles.main}>
            <View style={styles.pp}>

                <ImageModal
                    resizeMode='cover'
                    modalImageResizeMode='contain'
                    swipeToDismiss
                    imageBackgroundColor="#000000"
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius:60
                    }}
                    source={{
                        uri: user.data?.image
                    }}
                />

            </View>
            <Text style={{fontWeight:'bold',marginTop:15,fontSize:25,color:'white'}}>{user.data.firstName} {user.data.lastName}</Text>
            <Text style={{marginTop:5,color:'white'}}>{user.data.phone}</Text>


            <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)"}}>
                <Text style={{color:colorScheme=='light'?'black':'white', fontWeight:'bold', marginBottom:10, fontSize:16}}>
                    Bio
                </Text>
                {user.data.bio ? 
                    <Text style={{color:colorScheme=='light'?'black':'white'}}>{user.data.bio}</Text>
                :
                    <Text style={{color:colorScheme=='light'?'grey':'rgb(200,200,200)', fontStyle:'italic'}}>{'Your bio looks empty...Tell us about yourself !!'}</Text>
                }
                
            </View>
          </View>


        <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)",paddingHorizontal:5,marginHorizontal:20}}>

          <TouchableOpacity style={{marginHorizontal:20, flex:1,marginBottom:20,marginTop:10}} onPress={()=>navigation.navigate('Media Links Files',{initialNeed:'media'})}>
            <View style={{flexDirection:'row',justifyContent:'space-between',flex:1}}>
                <Text style={{color:colorScheme=='light'?'black':'white'}}>Media Shared</Text>
                <Text style={{color:'green'}}>View All</Text>
            </View>
            
            {initialMedia.length>0 ? 
                <View style={{flexDirection:'row', width:'100%', marginVertical:15, alignItems:'center'}}>
                    {initialMedia.map((i,index)=>
                        <View key={index} style={styles.box}>
                            {i.type.includes('image')?
                                <Image source={{uri:i.file_path}} style={{height:'100%', width:'100%', borderRadius:windowWidth/30}}/>
                            :
                                <Video muted source={{uri:i.file_path}} style={{height:'100%', width:'100%', borderRadius:windowWidth/30}}/>
                            }
                        </View>
                    )}
                </View>
            :
                <Text style={{marginVertical:15, color:'grey', fontStyle:'italic'}}>No media sent in chat yet !</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={()=>navigation.navigate('Media Links Files',{initialNeed:'links'})}>
            <Entypo style={{marginRight:30}} name="link" size={22} color={colorScheme=='light'?'black':'white'} />
            <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                <Text style={{color:colorScheme=='light'?'black':'white'}}>Links Shared</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={()=>navigation.navigate('Media Links Files',{initialNeed:'files'})}>
            <AntDesign name="file1" size={22} color={colorScheme=='light'?'black':'white'} style={{marginRight:30}}/>
            <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                <Text style={{color:colorScheme=='light'?'black':'white'}}>Files Shared</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.item} onPress={()=>navigation.navigate('Imp Messages for a chat')}>
            <FontAwesome name="bookmark-o" size={23} color={colorScheme=='light'?'black':'white'} style={{marginRight:30}}/>
            <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                <Text style={{color:colorScheme=='light'?'black':'white'}}>Important Messages</Text>
            </View>
          </TouchableOpacity>
          

        </View>

        <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)",paddingHorizontal:5,marginHorizontal:20}}>
            <TouchableOpacity style={{...styles.item,marginBottom:10}}>
                <AntDesign style={{marginRight:30}} name="export" size={22} color={colorScheme=='light'?'black':'white'} />
                <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                    <Text style={{color:colorScheme=='light'?'black':'white'}}>Export Chat</Text>
                </View>
            </TouchableOpacity>
        </View>
        

        <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)",paddingHorizontal:5,marginHorizontal:20}}>
          
          <TouchableOpacity style={styles.item} onPress={deleteChat}>
            <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                <Text style={{color:'rgb(250,90,91)'}}>Delete Chat</Text>
            </View>
          </TouchableOpacity>

        </View>

     </ScrollView>
    </SafeAreaView>
    </LinearGradient>
    </>
  )
}

const styles=StyleSheet.create({
  linearGradient:{
    width:'100%',
    height:'47.5%',
    paddingVertical:10,

},
statusBar:{
  height: STATUSBAR_HEIGHT,
},
nav:{
  flexDirection:'row',
  width:'100%',
  paddingHorizontal:15,
  justifyContent:'space-between',
  marginBottom:5,
  marginTop:10,
  alignItems:'center'
},
name:{
  marginVertical:30,
  paddingLeft:20,
  width:'50%'
},
main:{
  width:'100%',
  alignItems:'center',
},
pp:{
  width:120,
  height:120,
  borderRadius:60,
  overflow:'hidden',
  marginTop:10
},
cta:{
    flexDirection:"row",
    justifyContent:'space-around',
    alignItems:'center',
    marginTop:20
},
button:{
    borderRadius:200,
    backgroundColor:'rgb(62,69,97)',
    padding:10,
    marginHorizontal:20
},
options:{
    marginHorizontal:5,
    borderRadius:10
},
descPill:{
    padding:20,
    borderRadius:20,
    marginTop:20,
    marginHorizontal:10,
    width:'90%'
},
item:{
    flexDirection:'row',
    marginHorizontal:20,
    alignItems:'center',
    marginBottom:20
},
box:{
  height:windowWidth/5.5,
  width:windowWidth/5.5,
  borderRadius:windowWidth/30,
  backgroundColor:'rgb(251,68,55)',
  marginRight:20,
  overflow:'hidden'
},
number_info:{
    borderRadius:10,
    backgroundColor:'rgb(62,69,97)',
    padding:10,
    width:'90%',
    alignSelf:'center',
    marginVertical:30
}
})

export default SelfChatInfo 