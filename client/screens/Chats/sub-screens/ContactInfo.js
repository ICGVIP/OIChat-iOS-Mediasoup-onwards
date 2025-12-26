import React,{useState, useEffect, useRef, useCallback} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Image,Dimensions, TextInput, useColorScheme,Modal, TouchableOpacity, StatusBar, Alert, Platform, Pressable, Keyboard} from 'react-native';
import { Avatar, Button, TextInput as PaperInput} from 'react-native-paper';
import ImageModal from 'react-native-image-modal'
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Foundation from '@expo/vector-icons/Foundation';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { useChannelSet } from '../../../context/channel';
import { useRTC } from '../../../context/rtc';
import Video from 'react-native-video';
import { ContactItem } from './NewChat';
import { MenuView } from '@react-native-menu/menu';
import * as ImagePicker from 'expo-image-picker';


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

const randomGenerator = ()=>{
    return (
      Math.random().toString(36).slice(2, 7) +
      Math.random().toString(36).slice(2, 7) +
      Math.random().toString(36).slice(2, 7)
    );
}

const AlreadyExistsContactItem = ({item}) => {

    let user = useSelector(state=>state.user.value);

    return (
        <View style={styles.contactItem}>
            <View style={styles.selected_disabled}>
                <View style={{height:50,width:50,borderRadius:25,overflow:'hidden'}}>
                    <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.server_info?.avatar}}></Image>
                </View>
                <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                    <Text style={{...styles.name_disabled, color:'grey'}}>{user.data.phone==item.server_info?.phone?`${item.item.name} (Myself)`:item.item.name}</Text>
                    <Text style={{color:'grey'}}>{'Already in the group'}</Text>
                </View>
            </View>
        </View>
    )
}

function getFileExtension(fileUrl) {
    // Split the URL string by '/' to get the file name
    const parts = fileUrl.split('/');
    const fileName = parts[parts.length - 1];
  
    // Split the file name by '.' to get the file name and extension
    const fileNameParts = fileName.split('.');
    
    // If the file name has multiple parts, return the last part as the extension
    if (fileNameParts.length > 1) {
      return fileNameParts[fileNameParts.length - 1];
    } else {
      // If the file name doesn't have an extension, return an empty string
      return '';
    }
  }
  

const OverlayEditGroup = ({onClose}) => {
    let colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);
    let [loading,setLoading] = useState(false);
    let {setChannel, socket, setChats, chats, channel, ask, setAsk} = useChannelSet();
    let [image, setImage] = useState({uri:channel?.avatar});
    let [name, setName] = useState(channel?.name);
    let [bio, setBio] = useState(channel?.bio);
    let dispatch = useDispatch();

    useEffect(()=>{

    },[])

    async function press_action({nativeEvent}){

        let {event} = nativeEvent;

        switch(event){
            case "take_photo":
                await takePhoto(true);
                break;
            case "upload_photo":
                await takePhoto(false);
                break;
            case "remove_photo":
                removePhoto();
                break;
        }
    }

    const takePhoto = async (fromCamera) => {
        let result;
        if (fromCamera) {
          const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
          if (!permissionResult.granted) {
            alert('Permission to access the camera is required!');
            return;
          }
    
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          result.assets[0].fileName = `${new Date().getTime()}.${getFileExtension(result.assets[0].uri)}`;
    
        } else {
          const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permissionResult.granted) {
            alert('Permission to access the camera roll is required!');
            return;
          }
    
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
        }
    
        console.log(result);
    
        if (!result.canceled) {
          setImage(result.assets[0]);
        }

    };

    const removePhoto = ()=>{
        setImage({uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/group.png'})
    }

    async function handleSubmit(){

        try {
          if(image.uri=='https://oichat.s3.us-east-2.amazonaws.com/assets/group.png') {
            let reply = await fetch(`http://216.126.78.3:8500/api/update/group_info/json/${channel?.id}`,{
              method:'POST',
              headers:{
                'Content-type':'application/json',
                'Authorization':`Bearer ${user.token}`
              },
              body: JSON.stringify({image,name,bio})
            })
            
            let response = await reply.json();
            console.log(response,'update info .....\n\n')
            //Jonsi bhi chat hai woh update karde
            setChannel(response.data) 
            setAsk(!ask)
            setLoading(false)
          }
          else {
            let form = new FormData();
            if(image){
              form.append('file',{uri:image.uri,type:image.mimeType,name:image.fileName? image.fileName : `${new Date().getTime()}.${getFileExtension(image.uri)}`});
            }
            form.append('name',name);
            form.append('bio',bio);

            setLoading(true);
            
            let reply = await fetch(`http://216.126.78.3:8500/api/update/group_info/file/${channel?.id}`,{
              method:'POST',
              headers:{
                'Authorization':`Bearer ${user.token}`
              },
              body:form
            })
            let response = await reply.json()
            console.log(response,'update info.....\n\n')
            //Jonsi bhi chat hai woh update karde
            setChannel(response.data)
            setAsk(!ask) 
            setLoading(false)
          }
          onClose();
        }
       
        catch(err){
          console.log(err,'error....\n\n')
            setLoading(false)
        }
    }

    return (
        <View style={styles.overlay}>
            <View style={{...styles.menu_options_edit,backgroundColor:colorScheme=='light'?'rgb(241,238,246)':'rgb(39,41,48)'}}>
                <SafeAreaView>
                    <Pressable onPress={()=>Keyboard.dismiss()}>
                        <View style={{paddingHorizontal:15, marginVertical:10,}}>
                            <TouchableOpacity disabled={loading} onPress={onClose}><Feather name="x" size={30} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                        </View>
                        <Avatar.Image source={{uri:image.uri}} style={{marginVertical:10, alignSelf:'center'}} size={100}/>
                        <MenuView
                            onPressAction={press_action}
                            isAnchoredToRight={true}
                            actions={[
                                {
                                    id: 'take_photo',
                                    title: 'Take Photo',
                                    image: Platform.select({
                                        ios: 'camera',
                                        android: 'camera',
                                    }),
                                
                                },
                                {
                                    id: 'upload_photo',
                                    title: 'Upload Photo',
                                    image: Platform.select({
                                        ios: 'photo',
                                        android: 'photo',
                                    }),
                                
                                },
                                {
                                    id: 'remove_photo',
                                    title: 'Remove Photo',
                                    attributes:{
                                        destructive:true
                                    },
                                    image: Platform.select({
                                        ios: 'trash',
                                        android: 'visibility_off',
                                    }),
                                
                                }
                            ]}
                            style={{width:'100%'}}
                        >
                            <Text style={{alignSelf:'center', color:'rgb(20,130,199)', fontSize:17, marginVertical:10}}>Edit Photo</Text>
                        </MenuView>
                        
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center', paddingHorizontal:10, marginTop:30}}>
                            <Text style={{color:'white',fontSize:17,width:'30%'}}>Name</Text>
                            <TextInput style={colorScheme=='light'?{...styles.searchInputInfo}:{...styles.searchInput_darkInfo}} placeholder={channel?.name} onChangeText={(text)=>setName(text)}/>
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center', paddingHorizontal:10, marginTop:30}}>
                            <Text style={{color:'white',fontSize:17,width:'30%'}}>Bio</Text>
                            <TextInput multiline={true} style={colorScheme=='light'?{...styles.searchInputInfo}:{...styles.searchInput_darkInfo}} placeholder={channel?.bio} onChangeText={(text)=>setBio(text)} maxLength={130} minHeight={120}/>
                        </View>

                        <Button mode="contained" style={{width:100, alignSelf:'center', marginTop:30}} disabled={loading} compact={true} onPress={handleSubmit} buttonColor='rgb(20,130,199)' textColor='white'>
                            Done
                        </Button>
                    </Pressable>
                    

                </SafeAreaView>
                
            </View>
        </View>
    )
}

const OverlayShowOptions = ({onClose, user_to_show, navigation}) => {
    let colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);
    let [loading,setLoading] = useState(false);
    let {setChannel, socket, setChats, chats, channel} = useChannelSet();
    let {contacts} = useSelector(state=>state.contacts.value);
    let [name, setDisplayName] = useState('');
    let [groupAdmins, setGroupAdmins] = useState();

    useEffect(()=>{
        let a = new Map(channel?.groupAdmins.map(i=>[i.id,true]));
        setGroupAdmins(a);
    },[channel]);

    useEffect(()=>{
        getName()
    },[contacts])

    function getName(){
        let name=user_to_show.phone;
        
        if(!(!contacts||contacts.length==0)) {
            for (let i of contacts){
                if(!i.isRegistered) continue;
                
                if(i.server_info.id==user_to_show.id){
                    name = (i.item?.firstName?i.item.firstName:'') + " " + (i.item?.lastName?i.item.lastName:'')
                }
            }
        }

        setDisplayName(name)
    }

    async function makeAdmin(){
        setLoading(true)

        try{
            let reply = await fetch(`http://216.126.78.3:8500/api/make/admin?id=${channel?.id}&user_id=${user_to_show.id}`,{
                headers:{
                    'Content-type':'application/json',
                    'Authorization':`Bearer ${user.token}`
                }
            });
            let response = await reply.json();
            navigation.pop();
            navigation.pop();
            setChannel(null);
            setChannel(response.data);
            socket.emit('New admins', {chat:{...response.data},creator:response.data.chat_member});
            socket.emit('Admin added message',{message:response.message, chat:{...response.data}, chat_member:response.data.chat_member})
        }catch(err){
            console.log('Error in removing from group...\n\n',err);
        }

        setLoading(false)
    }

    async function removeAdmin(){
        setLoading(true)

        try{
            let reply = await fetch(`http://216.126.78.3:8500/api/remove/admin?id=${channel?.id}&user_id=${user_to_show.id}`,{
                headers:{
                    'Content-type':'application/json',
                    'Authorization':`Bearer ${user.token}`
                }
            });
            let response = await reply.json();
            navigation.pop();
            navigation.pop();
            setChannel(null);
            setChannel(response.data);
            socket.emit('New admins', {chat:{...response.data},creator:response.data.chat_member});
            socket.emit('Admins edited message',{message:response.message, chat:{...response.data}, chat_member:response.data.chat_member})
        }catch(err){
            console.log('Error in removing from group...\n\n',err);
        }

        setLoading(false)
    }

    async function removeFromGroup(){
        setLoading(true)

        try{
            let reply = await fetch(`http://216.126.78.3:8500/api/group/remove?id=${channel?.id}&user_id=${user_to_show.id}`,{
                headers:{
                    'Content-type':'application/json',
                    'Authorization':`Bearer ${user.token}`
                }
            });
            let response = await reply.json();
            navigation.pop();
            navigation.pop();
            setChannel(null);
            setChannel(response.data);
            socket.emit('Remove group members', {chat:{...response.data},creator:response.data.chat_member});
            socket.emit('Group removal messages',{message:response.message, chat:{...response.data}, chat_member:response.data.chat_member})
        }catch(err){
            console.log('Error in removing from group...\n\n',err);
        }

        setLoading(false)
    }

    return (
        <View style={styles.overlay}>
            <View style={{...styles.menu_options,backgroundColor:colorScheme=='light'?'rgb(241,238,246)':'rgb(39,41,48)'}}>

                <SafeAreaView>
                    <View style={{paddingHorizontal:15, marginVertical:10,}}>
                        <TouchableOpacity disabled={loading} onPress={()=>onClose()}><Feather name="x" size={30} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                    </View>
                    <Avatar.Image source={{uri:user_to_show.avatar}} style={{marginVertical:10, alignSelf:'center'}} size={100}/>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{marginVertical:10, alignSelf:'center', fontSize:20, color:colorScheme=='light'?'black':'white', fontWeight:'bold'}}>{name}</Text>

                    <View style={{paddingHorizontal:20, marginVertical:25}}>
                        <TouchableOpacity style={styles.menuOption} onPress={()=>{}}>
                            <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                                <Feather name="info" size={26} color={colorScheme=='light'?'rgb(182,186,185)':'white'}/>
                            </View>
                            <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>See user's info</Text>
                        </TouchableOpacity>

                        {groupAdmins?.has(parseInt(user.data.id))&&!channel?.chat_member.group_ousted &&
                            <>
                                {groupAdmins?.has(parseInt(user_to_show.id)) ?
                                    <TouchableOpacity style={styles.menuOption} onPress={removeAdmin}>
                                        <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                                            <MaterialCommunityIcons name="shield-remove" size={26} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
                                        </View>
                                        <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Remove Group Admin</Text>
                                    </TouchableOpacity>
                                :
                                    <TouchableOpacity style={styles.menuOption} onPress={makeAdmin}>
                                        <View style={{height:40,width:40,borderRadius:20,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                                            <MaterialIcons name="admin-panel-settings" size={26} color={colorScheme=='light'?'rgb(182,186,185)':'white'} />
                                        </View>
                                        <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Make Group Admin</Text>
                                    </TouchableOpacity>
                                }
                                

                                <TouchableOpacity style={styles.menuOption} onPress={removeFromGroup}>
                                    <View style={{height:windowWidth/11,width:windowWidth/11,borderRadius:windowWidth/5.5,backgroundColor:colorScheme=='light'?'rgb(233,238,237)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
                                        <Ionicons name="person-remove-outline" size={26} color="red" />
                                    </View>
                                    <Text style={{...styles.option, color:'red'}}>Remove from Group</Text>
                                </TouchableOpacity>
                            </>
                        }
                        
                    </View>
                    

                </SafeAreaView>
                
            </View>
        </View>
    )
}

const OverlayAddParticipants = ({onClose,navigation}) => {

    let colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);
    let [loading,setLoading] = useState(false);
    let [text, setText] = useState('');
    let [selected, setSelected] = useState([]);
    let {setChannel, socket, setChats, chats, channel} = useChannelSet();
    let {contacts} = useSelector(state=>state.contacts.value);
    let [groupMembers, setGroupMembers] = useState();

    useEffect(()=>{
        let groupMembers = new Map(channel?.otherUsers.map(msg => [msg.user_id, true]));
        setGroupMembers(groupMembers)
    },[])

    async function handleSubmit(){
        setLoading(true)
        try{
            let selectedUserIds = selected.map(i=>i.server_info.id);
            let reply = await fetch(`http://216.126.78.3:8500/api/group/add/${channel?.id}`,{
                    method:'POST',
                    headers:{
                        'Content-type':'application/json',
                        'Authorization':`Bearer ${user.token}`
                    },
                    body: JSON.stringify({selected:selectedUserIds})
                }
            );
            let response = await reply.json();
            console.log(response.messages.length,'...sdsdf..\n\n')
            navigation.pop();
            navigation.pop();
            setChannel();
            setChannel(response.data);
            socket.emit('Add new group members', {chat:{...response.data},creator:response.data.chat_member, additions:selectedUserIds});
            socket.emit('Group addition messages',{messages:response.messages, chat:{...response.data}, chat_member:response.data.chat_member, additions:selectedUserIds})
        }catch(err){
            console.log(err,'..Error in submutting contacts...\n\n')
        }
        setLoading(false)
        
    }
    
    return (
      <View style={styles.overlay}>
        <View style={{...styles.menu,backgroundColor:colorScheme=='light'?'rgb(241,238,246)':'rgb(39,41,48)'}}>

            <SafeAreaView>

                <View style={styles.header}>
                    <TouchableOpacity disabled={loading} onPress={()=>{setSelected([]);onClose();}}><Feather name="x" size={30} color={'rgb(20,130,199)'} /></TouchableOpacity>
                    <View style={styles.text}>
                        <Text style={styles.newchat}>Add Participants</Text>
                    </View>
                    <Button disabled={loading} mode="contained" onPress={handleSubmit} buttonColor='rgb(20,130,199)' textColor='white' labelStyle={{fontWeight:'bold',fontSize:17}}>
                        Add
                    </Button>
                </View>
                
                <TextInput style={colorScheme=='light'?styles.searchInput:styles.searchInput_dark} placeholder="Search contacts" onChangeText={setText}/>
                <ScrollView style={styles.contactsScroll} contentContainerStyle={{justifyContent:'flex-start',paddingBottom:70}}>
                    {!text&&contacts.map((i,index)=>
                        {
                            if(!groupMembers?.has(i.server_info?.id)) return <ContactItem item={i} key={index} selected={selected} setSelected={setSelected}/>
                            return <AlreadyExistsContactItem item={i} key={index}/>
                        }
                    )}
                    {text&&
                    (contacts.filter(contact=>{console.log(contact);return contact.item.name?.toLowerCase().includes(text.toLowerCase())})).map((i,index)=>
                    <ContactItem item={i} key={index} selected={selected} setSelected={setSelected}/>)}
                </ScrollView>

            </SafeAreaView>
            
        </View>
      </View>
    );
}


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
const ContactInfo = ({navigation,route}) => {

  let [commonChannels,setCommonChannels] = useState([]);
  let [initialMedia, setInitialMedia] = useState([]);
  let [displayName, setDisplayName] = useState('');
  let user = useSelector(state=>state.user.value);
  let {contacts} = useSelector(state=>state.contacts.value);
  let colorScheme=useColorScheme();
  const containerView = useRef();
  let {channel, setChannel, socket} = useChannelSet();
  let [groupMembers,setGroupMembers] = useState([]);
  let [groupAdmins, setGroupAdmins] = useState();
  let [members,setMembers] = useState([]);
  let [callMembers,setCallMembers] = useState([]);
  let [muted,setMuted] = useState(channel?.chat_member.mute);
  let [isMenuVisible, setIsMenuVisible] = useState(false);
  let [type, setType] = useState('');
  let [user_to_show, setUserToShow] = useState();
  let {blockedUsers, setBlockedUsers} = useChannelSet();
  let [loading, setLoading] = useState();
  let [blockedUsersMap, setBlockedUsersMap] = useState(new Map());

    useEffect(()=>{

        let name='';
        if(channel?.isSelfChat){
            name = `${user.data.firstName+" "+user.data.lastName} (Myself)`;
        } else if(channel?.isGroupChat){
            name = channel?.name;
        } else {
            name = channel?.otherUsers.user.phone;

            if(!(!contacts||contacts.length==0)) {
                for (let i of contacts){
                    if(!i.isRegistered) continue;
                    
                    if(i.server_info.id==channel?.otherUsers.user_id){
                        name = (i.item?.firstName?i.item.firstName:'') + (i.item?.lastName?i.item.lastName:'')
                    }
                }
            }
        }

        setDisplayName(name)
    
    },[contacts]);
  
    //To fetch 3 media files. After improving messages, this would change to get 3 from backend in a special function
    useEffect(()=>{
        if(!channel) return;
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
                let groupAdmins = new Map(channel?.groupAdmins.map(i => [i.id, true]));
                setGroupAdmins(groupAdmins);
            }
        )();

    },[channel]);
    

    useEffect(()=>{

        (
            async function(){

                if(!channel?.isGroupChat) {
                    let reply = await fetch(`http://216.126.78.3:8500/api/common_channels/${channel?.otherUsers.user_id}`,{
                        headers:{
                            'Authorization':`Bearer ${user.token}`
                        }
                    });
                    let response = await reply.json();
                    setCommonChannels(response.data);
                } else {

                    let registeredContacts = contacts.filter(i=>i.isRegistered);

                    let displayMembers = channel?.otherUsers.map(i=>{
                        
                        let found = false;
                        for (let a of registeredContacts){
                            if(a.server_info.phone==i.user.phone){
                                found = true;
                                return {...i.user, name:a.item.name}
                            } 
                        }
                        if(!found){
                            return {name:i.user.name, phone:i.user.phone, id: i.user.id, avatar:i.user.avatar}
                        }
                    });
                    setGroupMembers(displayMembers);

                }

                
                
            }
        )();
    },[members]);

    useEffect(()=>{
       setBlockedUsersMap(new Map(blockedUsers.map(i=>[i.id,true])))
    },[blockedUsers.length])

  
  async function toggleMute(){

    let reply = await fetch(`http://216.126.78.3:8500/api/toggle/mute/${channel?.chat_member.id}`,{
            headers:{
                'Content-type':'application/json',
                'Authorization':`Bearer ${user.token}`
            }
        });
    let response = await reply.json();
    setMuted(response.data);

    //No need to call setChats here as index.js se call hoga hi

  }
  
  const deleteChat = async ()=>{

    Alert.alert('Delete Chat', 'Are you sure you want to delete this chat ?', [
      {text:'Cancel', onPress:()=>console.log('cancelled')},
      {text:'Yes', onPress: async ()=>{await channel?.hide(null,true), navigation.navigate('Home')}, style:'destructive'}
    ])
    
  }

  const exitGroup = async ()=>{
    Alert.alert('Exit Group', 'Are you sure you want to exit this group ?', [
        {text:'Cancel', onPress:()=>console.log('cancelled')},
        {   text:'Yes', 
            onPress: async ()=>{

                let reply = await fetch(`http://216.126.78.3:8500/api/exit/group?channel=${channel?.id}`,{
                    headers:{
                        'Content-type':'application/json',
                        'Authorization':`Bearer ${user.token}`
                    }
                });
                let response = await reply.json();
                navigation.pop();
                navigation.pop();
                setChannel(null);
                socket.emit('Exited Group', {chat:{...response.data},creator:response.data.chat_member});
                socket.emit('Group exit message',{message:response.data.message, chat:{...response.data}, chat_member:response.data.chat_member})
            }
        }
      ])
  }

  async function blockUser(id){
    Alert.alert('Block User','Do you want to block this user ?',[
        {text:'No', destructive:true},
        {text:'Yes', onPress: async () => {
            setLoading(true);
            let reply = await fetch(`http://216.126.78.3:8500/api/block_user/${id}`,{
                headers:{
                    'Content-type':'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });
            let response = await reply.json();
            setBlockedUsers(prev=>([response.blocked_user,...prev]));
            navigation.pop();
            navigation.pop();
            setChannel(null);
            setChannel(response.data);
        }}
    ]);

    setLoading(false)
  }

  async function UnblockUser(id){
    Alert.alert('Unblock User','Do you want to unblock this user ?',[
        {text:'No', destructive:true},
        {text:'Yes', onPress: async () => {
            setLoading(true);

            let reply = await fetch(`http://216.126.78.3:8500/api/unblock_user/${id}`,{
                headers:{
                    'Content-type':'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });
            let response = await reply.json();
            setBlockedUsers(prev=>prev.filter(i=>i.id!=id));
            navigation.pop();
            navigation.pop();
            setChannel(null);
            setChannel(response.data);
        }}
    ]);

    setLoading(false)
  }

  const reportConversation = () => {
      return Alert.alert('Report', `Do you want to report ${channel?.isGroupChat?channel?.name:displayName} ? You may also ${channel?.isGroupChat?'exit the group':'block this user'} to stop receiving further messages`,[
        {text:'No', style:'destructive'},
        {text:'Yes', onPress:
          async()=>{
            
          }
        }
      ])
  }

  const navigateToThisChannel = (channel) => {
    navigation.pop();
    navigation.pop();
    setChannel(channel);
    return navigation.navigate('Chat Screen')
  }

  const { startCall } = useRTC();

  const createCall = useCallback(async (type) => {
    if (!channel) {
      console.log('Error: Channel is null');
      return;
    }

    if (channel.isGroupChat) {
      console.log('Error: Cannot call group chats');
      return;
    }

    const partnerId = channel?.otherUsers?.user_id;
    if (!partnerId) {
      console.log('Error: No partner ID found');
      return;
    }

    try {
      let reply = await fetch('http://216.126.78.3:8500/api/create_call', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ to: partnerId, type })
      });
      let response = await reply.json();

      if (response.success) {
        await startCall(partnerId, type);
        setType('Outgoing');
      } else {
        console.log('Error in creating a call...\n\n');
      }
    } catch (err) {
      console.log('Error in starting a call: ', err);
    }
  }, [channel, user, startCall]);
  
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
            {channel?.isGroupChat ? 
            <>
                {channel?.chat_member?.group_ousted ? <TouchableOpacity onPress={()=>{setType('edit_group');setIsMenuVisible(true)}}><Text style={{color:'white',fontSize:17}}>Edit</Text></TouchableOpacity> : <></>}
            </>
            :
            <></>
            }
          </View>
          <ScrollView ref={containerView}>
            
            {channel.chat_member.group_ousted?
            <View style={{width:'100%',alignItems:'center',backgroundColor:'rgb(20,20,20)', padding:10, marginVertical:15}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons name="warning-outline" size={24} color="grey" style={{marginRight:15}}/>
                    <Text style={{color:'grey', fontStyle:'italic'}}>You are no longer a participant in this group</Text>
                </View>
                
            </View>
            :
            <></>
            }
            {channel.chat_member.blocked_chat?
            <View style={{width:'100%',alignItems:'center',backgroundColor:'rgb(20,20,20)', padding:10, marginVertical:15}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons name="warning-outline" size={24} color="grey" style={{marginRight:15}}/>
                    <Text style={{color:'grey', fontStyle:'italic'}}>You have blocked this user</Text>
                </View>
            </View>
            :
            <></>
            }
            

            <View style={styles.main}>
                <View style={styles.pp}>
                {!channel?.isGroupChat ?
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
                            uri: channel?.otherUsers?.user.avatar
                        }}
                    />
                    :
                    <></>
                }

                {channel?.isGroupChat ?
                    <ImageModal
                        resizeMode="cover"
                        modalImageResizeMode='contain'
                        swipeToDismiss
                        imageBackgroundColor="#000000"
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius:60
                        }}
                        source={{
                            uri: channel?.avatar
                        }}
                    /> : <></>
                }

            </View>
            <Text style={{fontWeight:'bold',fontSize:25,color:'white', margin:20, textAlign:"center"}}>{displayName}</Text>
            <Text style={{color:'white'}}>{!(channel?.isGroupChat)? channel?.otherUsers?.user.phone :`${channel?.otherUsers.length+(channel?.chat_member.group_ousted?0:1)} Participants`}</Text>

            <View style={styles.cta}>
                {!channel?.chat_member.group_ousted&&!channel?.chat_member.blocked_chat&&<TouchableOpacity style={styles.button} onPress={()=>createCall('video')}><Ionicons name="videocam-outline" size={22} color="white"/></TouchableOpacity>}
                {!channel?.chat_member.group_ousted&&!channel?.chat_member.blocked_chat&&<TouchableOpacity style={styles.button} onPress={()=>createCall('audio')}><Ionicons name="call-outline" size={22} color="white"/></TouchableOpacity>}
                {/* {!channel?.chat_member.group_ousted&&!channel?.chat_member.blocked_chat&&<TouchableOpacity style={styles.button}><FontAwesome name="dollar" size={22} color="white" /></TouchableOpacity>} */}
                <TouchableOpacity style={styles.button}><Entypo name="magnifying-glass" size={22} color="white" /></TouchableOpacity>
            </View>

            <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)"}}>
                <Text style={{color:'grey'}}>
                    {channel?.isGroupChat ? 
                        channel?.bio
                    :
                        channel?.otherUsers?.user.bio ? channel?.otherUsers?.user.bio: `~${channel?.otherUsers?.user.name}` }
                </Text>
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

            <TouchableOpacity style={styles.item} onPress={toggleMute}>
                <MaterialCommunityIcons name="bell-off-outline" size={22} color={colorScheme=='light'?'black':'white'} style={{marginRight:30}}/>
                <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                    <Text style={{color:colorScheme=='light'?'black':'white'}}>{muted ? 'Unmute Chat' : 'Mute Chat'}</Text>
                </View>
            </TouchableOpacity>
        
            {/* <TouchableOpacity style={styles.item}>
                <Foundation name="dollar-bill" size={23} color={colorScheme=='light'?'black':'white'} style={{marginRight:30}}/>
                <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                    <Text style={{color:colorScheme=='light'?'black':'white'}}>Transactions</Text>
                </View>
            </TouchableOpacity> */}
          
          <TouchableOpacity style={styles.item} onPress={()=>navigation.navigate('Imp Messages for a chat')}>
            <FontAwesome name="bookmark-o" size={23} color={colorScheme=='light'?'black':'white'} style={{marginRight:30}}/>
            <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                <Text style={{color:colorScheme=='light'?'black':'white'}}>Marked Messages</Text>
            </View>
          </TouchableOpacity>
          
        </View>

        {!(channel?.isGroupChat)?
            <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)",paddingHorizontal:5,marginHorizontal:20}}>
                <TouchableOpacity style={styles.item}>
                    <Ionicons name="people-outline" size={22} style={{marginRight:30}} color={colorScheme=='light'?'black':'white'} />
                    <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                        <Text style={{color:colorScheme=='light'?'black':'white'}}>{`Groups with ${displayName}`}</Text>
                    </View>
                </TouchableOpacity>
                
                {commonChannels.map((i,index)=>
                <TouchableOpacity key={index} style={{...styles.item,marginBottom:10,justifyContent:'space-between',paddingBottom:5,marginVertical:10}} onPress={()=>navigateToThisChannel(i)}>
                    <Avatar.Image size={35} source={{uri:i.avatar}} style={{marginRight:30}}/>
                    <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)'}}>
                        <Text style={{color:colorScheme=='light'?'black':'white',fontWeight:'bold',marginBottom:5}}>{i.name}</Text>
                        <Text style={{color:colorScheme=='light'?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.5)'}}>{`${i.bio}`}</Text>
                    </View>
                    <View style={{}}>
                        <Entypo name="chevron-right" size={18} color={colorScheme=='light'?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.5)'} />
                    </View>
                </TouchableOpacity>)}
                
            </View>
        :
            <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)",paddingHorizontal:5,marginHorizontal:20}}>
                <View style={styles.item}>
                    <Ionicons name="people-outline" size={22} style={{marginRight:30}} color={colorScheme=='light'?'black':'white'} />
                    <View style={{flex:1,flexDirection:'row',borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5,justifyContent:"space-between"}}>
                        <Text style={{color:colorScheme=='light'?'black':'white'}}>{`Group Members`}</Text>
                        <Text style={{color:colorScheme=='light'?'black':'white'}}>{channel?.otherUsers.length+(channel?.chat_member.group_ousted?0:1)}</Text>
                    </View>
                    
                </View>

                {
                    groupAdmins?.has(parseInt(user.data.id))&&!channel?.chat_member.group_ousted&&
                    <TouchableOpacity style={{...styles.item,marginBottom:10}} onPress={()=>{setType('add_participants');setIsMenuVisible(true)}}>
                        <AntDesign name="plus-circle" size={22} style={{marginRight:30}} color='green' />
                        <View style={{flex:1}}>
                            <Text style={{color:'green'}}>{`Add participants`}</Text>
                        </View>
                    </TouchableOpacity>
                }
                
                {!channel?.chat_member?.group_ousted &&
                    <TouchableOpacity style={{...styles.item,marginBottom:10,justifyContent:'space-between',paddingBottom:5,marginVertical:10}}>
                        <Avatar.Image size={35} source={{uri:user.data.image}} style={{marginRight:30}}/>
                        <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)'}}>
                            <Text style={{color:colorScheme=='light'?'black':'white',fontWeight:'bold',marginBottom:5}}>{user.data.firstName+" "+user.data.lastName}</Text>
                            <Text style={{color:colorScheme=='light'?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.5)'}}></Text>
                        </View>
                        {groupAdmins?.has(parseInt(user.data.id)) && <Text style={{color:colorScheme=='light'?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.5)',fontWeight:'bold',marginRight:5}}>admin</Text>}
                    </TouchableOpacity>
                }

                {groupMembers.map((i,index)=>
                <TouchableOpacity key={index} style={{...styles.item,marginBottom:10,justifyContent:'space-between',paddingBottom:5,marginVertical:10, alignItems:'center'}} onPress={()=>{setType('options');setIsMenuVisible(true); setUserToShow(i)}}>
                    
                    <Avatar.Image size={35} source={{uri:i?.avatar}} style={{marginRight:30}}/>
                    <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)'}}>
                        <Text style={{color:colorScheme=='light'?'black':'white',fontWeight:'bold',marginBottom:5}}>{i?.name}</Text>
                        <Text style={{color:colorScheme=='light'?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.5)'}}>{i?.bio}</Text>
                    </View>
                    {groupAdmins?.has(parseInt(i.id)) && <Text style={{color:colorScheme=='light'?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.5)',fontWeight:'bold',marginRight:5}}>admin</Text>}
                    <Entypo name="chevron-right" size={18} color={colorScheme=='light'?'rgba(0,0,0,0.5)':'rgba(255,255,255,0.5)'} />

                </TouchableOpacity>)}
                
            </View>
        }
       

        {!channel?.isGroupChat?
            <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)",paddingHorizontal:5,marginHorizontal:20}}>
                <View style={styles.item}>
                    <AntDesign style={{marginRight:30}} name="contacts" size={22} color={colorScheme=='light'?'black':'white'} />
                    <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                        <Text style={{color:colorScheme=='light'?'black':'white'}}>Share Contact</Text>
                    </View>
                </View>
                <TouchableOpacity style={{...styles.item,marginBottom:10}}>
                    <AntDesign style={{marginRight:30}} name="export" size={22} color={colorScheme=='light'?'black':'white'} />
                    <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                        <Text style={{color:colorScheme=='light'?'black':'white'}}>Export Chat</Text>
                    </View>
                </TouchableOpacity>
            </View>
            :
            <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)",paddingHorizontal:5,marginHorizontal:20}}>
                <TouchableOpacity style={{...styles.item,marginBottom:10}}>
                    <AntDesign style={{marginRight:30}} name="export" size={22} color={colorScheme=='light'?'black':'white'} />
                    <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                        <Text style={{color:colorScheme=='light'?'black':'white'}}>Export Chat</Text>
                    </View>
                </TouchableOpacity>
            </View>
        }
        

        <View style={{...styles.descPill, backgroundColor:colorScheme=='light'?'white':"rgb(47,51,64)",paddingHorizontal:5,marginHorizontal:20}}>
         
          
          <TouchableOpacity style={styles.item} onPress={deleteChat}>
            <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                <Text style={{color:'rgb(250,90,91)'}}>Delete Chat</Text>
            </View>
          </TouchableOpacity>
            {!channel?.isGroupChat?
            <>
                {!blockedUsersMap.has(channel.otherUsers.user_id) ? 
                <TouchableOpacity style={styles.item} onPress={()=>blockUser(channel.otherUsers.user_id)} disabled={loading}>
                    <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                        <Text style={{color:'rgb(250,90,91)'}}>Block User</Text>
                    </View>
                </TouchableOpacity>
                :
                <TouchableOpacity style={styles.item} onPress={()=>UnblockUser(channel.otherUsers.user_id)} disabled={loading}>
                    <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                        <Text style={{color:'rgb(250,90,91)'}}>Unblock User</Text>
                    </View>
                </TouchableOpacity>
                }
            </>
            
            :
            <>
                {!channel?.chat_member.group_ousted && 
                    <TouchableOpacity style={styles.item} onPress={exitGroup}>
                        <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                            <Text style={{color:'rgb(250,90,91)'}}>Exit Group</Text>
                        </View>
                    </TouchableOpacity>
                }
            </>
            }
          
          <TouchableOpacity style={{...styles.item,marginBottom:10}} onPress={reportConversation}>
            <View style={{flex:1,borderBottomWidth: 1,borderBottomColor:colorScheme=='light'?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.2)',paddingBottom:5}}>
                <Text style={{color:'rgb(250,90,91)'}}>Report {channel?.isGroupChat?'Group':'User'}</Text>
            </View>
          </TouchableOpacity>

        </View>

            </ScrollView>
        </SafeAreaView>

        <Modal animationType='slide' visible={isMenuVisible} transparent={true}>
            {type=='add_participants' && <OverlayAddParticipants onClose={()=>setIsMenuVisible(false)} navigation={navigation}/>}
            {type=='options' && <OverlayShowOptions onClose={()=>{setIsMenuVisible(false); setType(''); setUserToShow()}} user_to_show={user_to_show} navigation={navigation}/>}
            {type=='edit_group' && <OverlayEditGroup onClose={()=>{setIsMenuVisible(false); setType('')}}/>}
        </Modal>
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
        zIndex:10,
    },
    menu: {
      width: '100%',
      paddingHorizontal: 20,
      borderRadius: 10,
      zIndex:20,
      height:'100%',
      paddingVertical:10,
      
    },
    closeButton: {
      flexDirection:'row',
      paddingVertical: 10,
      alignItems: 'center', 
      justifyContent: 'center'

    },
    header:{
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal:7.5,
        marginVertical:10,
        alignItems:'center'
    },
    newchat:{
        fontSize:19,
        fontWeight:'bold',
        color:'rgb(20,130,199)',
    },
    searchInput:{
        height: 40,
        borderRadius:8,
        backgroundColor: 'rgb(220,220,220)',
        paddingHorizontal: 15,
        marginBottom: 10,
        width:'95%',
        color:'rgb(120,134,142)',
        margin:15, 
        color:'black'
    },
    searchInput_dark:{
        height: 40,
        borderRadius:8,
        backgroundColor: 'rgb(63,68,81)',
        paddingHorizontal: 15,
        marginBottom: 10,
        width:'95%',
        color:'white',
        margin:15
    },
    menu_options: {
        width: '100%',
        paddingHorizontal: 20,
        borderRadius: 10,
        zIndex:20,
        height:'60%',
        paddingVertical:10,
    },
    menu_options_edit: {
        width: '100%',
        paddingHorizontal: 20,
        borderRadius: 10,
        zIndex:20,
        height:'100%',
        paddingVertical:10,
    },
    menuOption: {
        padding:15,
        flexDirection:'row',
        alignItems:'center'
    },
    option:{
        fontSize:19,
        marginHorizontal:20
    },
    searchInputInfo:{
        height: 40,
        borderRadius:8,
        backgroundColor: 'rgb(220,220,220)',
        padding: 5,
        flex:1,
        color:'black'
    },
    searchInput_darkInfo:{
        height: 40,
        borderRadius:8,
        backgroundColor: 'rgb(63,68,81)',
        padding:5,
        flex:1,
        color:'white',
    },
    contactItem:{
        flexDirection:'row',
        flex:1,    
        marginVertical:10
    },
    name_disabled:{
        fontWeight:'bold',
        fontSize:15,
        marginVertical:5
    },
    selected_disabled:{
        flexDirection:'row',
        width:'100%',
        paddingVertical:10,
        paddingHorizontal:20,
        borderRadius:20,
        alignItems:'center'
    }
})

export default ContactInfo 