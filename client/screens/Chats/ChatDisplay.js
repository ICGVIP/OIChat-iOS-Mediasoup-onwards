import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState, useRef, useCallback } from 'react'
import {View,Text, StyleSheet,useColorScheme, Image, Animated, Alert, Platform, Pressable, TouchableOpacity, UIManager, LayoutAnimation, ActionSheetIOS} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { useChannelSet } from '../../context/channel';
import { useSelector } from 'react-redux';
import { MenuView } from '@react-native-menu/menu';
import { Swipeable, RectButton } from 'react-native-gesture-handler';

//Android's case for implementing LayoutAnimation when a new message is added to the view
if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

function convertToLocaleTime(datetimeString) {
    const datetime = new Date(datetimeString);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000); // Date object for yesterday
  
    if (datetime < yesterday) {
        if((Date.now() - datetime) > 24 * 60 * 60 * 1000) return datetime.toLocaleDateString();
        return 'yesterday';
    } else {
        return datetime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true});
    }
}


export const ChatDisplay = ({item}) => {

    let data = item.item;
    if(!data) return <></>;

    let colorScheme = useColorScheme();
    let [displayName, setDisplayName] = useState('')
    let {setChannel, channel, socket, setChats, chats,hidden_chats,setHiddenChats,archived_chats,setArchivedChats,setAsk,ask} = useChannelSet();
    let user = useSelector(state=>state.user.value);
    let {contacts} = useSelector(state=>state.contacts.value)
    let [chat_hidden,setHidden] = useState(data.chat_member?.hidden);
    let [muted,setMuted] = useState(data.chat_member?.mute);
    const swipeableRef = useRef(null);
    let [unread_count,setUnreadCount] = useState(data.chat_member?.unread_count);
    let [unread_mark,setUnreadMark] = useState(data.chat_member?.unread_mark);

    useEffect(()=>{
        setUnreadCount(data.chat_member?.unread_count);
        setUnreadMark(data.chat_member?.unread_mark);
        setMuted(data.chat_member?.mute);

        if(data.lastMessage?.system){
            const match = data.lastMessage?.text?.match(/^added (\+\d+)$/);
            if (match) {
                let phoneNumber = match[1]; // Extract the phone number from the message
                
                // Check if the phone number is in the contacts
                let sender = data.lastMessage.sender_user;
                let sender_found;
                let added_found;

                if(sender?.id==user.data?.id) {
                    sender = 'You';
                    sender_found=true;
                } 
                if(phoneNumber==user.data?.phone){
                    phoneNumber = 'You';
                    added_found=true;
                }
                if(!sender_found||!added_found){
                    for (let i of contacts){
                        if((i.server_info?.id==sender?.id) && !sender_found){
                            sender_found=true;
                            sender = i.item.name;
                        }
                        if((i.server_info?.phone==phoneNumber)&&!added_found){
                            added_found=true;
                            phoneNumber = i.item.name
                        }
                    }
                    if(!sender_found) sender = sender?.phone
                }

                let text = `${sender} added ${phoneNumber}`

                if(data.label=='archived'){
                    setArchivedChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text}}
                            }
                            return i
                        })
                    )
                } else if(data.chat_member?.hidden){

                    setHiddenChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text}}
                            }
                            return i
                    }));

                } else {

                    setChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text}}
                            }
                            return i
                    }));
                }
            }

            let pattern = /^\+?\d+\s+has\s+been\s+removed$/;
            if (pattern.test(data.lastMessage.text)) {

                const phoneNumber = data.lastMessage.text.split(" has been removed")[0].trim();
                let content;
                if(phoneNumber==user.data?.phone){
                    content = 'You were removed';
                }
                else{
                    for (let i of contacts){
                        if(i.server_info?.phone==phoneNumber){
                            content=i.item.name+' was removed'
                        }
                    }
                }
                if(data.label=='archived'){
                    setArchivedChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                        })
                    )
                } else if(data.chat_member.hidden){

                    setHiddenChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                    }));

                } else {

                    setChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                    }));
                }
            }
            let pattern2 = /^\+?\d+\s+exited\s+the\s+group$/;
            if (pattern2.test(data.lastMessage.text)) {

                const phoneNumber = data.lastMessage.text.split(" exited the group")[0].trim();
                let content;
                if(phoneNumber==user.data?.phone){
                    content = 'You exited the group';
                }
                else{
                    for (let i of contacts){
                        if(i.server_info?.phone==phoneNumber){
                            content=i.item.name+' exited the group'
                        }
                    }
                }
                if(data.label=='archived'){
                    setArchivedChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                        })
                    )
                } else if(data.chat_member.hidden){

                    setHiddenChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                    }));

                } else {

                    setChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                    }));
                }
            }
            let pattern3 = /^\+?\d+\s+is\s+now\s+an\s+admin$/;
            if (pattern3.test(data.lastMessage.text)) {

                const phoneNumber = data.lastMessage.text.split(" is now an admin")[0].trim();
                let content;
                if(phoneNumber==user.data?.phone){
                    content = 'You are now an admin';
                }
                else{
                    for (let i of contacts){
                        if(i.server_info?.phone==phoneNumber){
                            content=i.item.name+' is now an admin'
                        }
                    }
                }
                if(data.label=='archived'){
                    setArchivedChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                        })
                    )
                } else if(data.chat_member.hidden){

                    setHiddenChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                    }));

                } else {

                    setChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                    }));
                }
            }
            let pattern4 = /^\+?\d+\s+is\s+no\s+longer\s+an\s+admin$/;
            if (pattern4.test(data.lastMessage.text)) {

                const phoneNumber = data.lastMessage.text.split(" is no longer an admin")[0].trim();
                let content;
                if(phoneNumber==user.data?.phone){
                    content = 'You are no longer an admin';
                }
                else{
                    for (let i of contacts){
                        if(i.server_info?.phone==phoneNumber){
                            content=i.item.name+' is no longer an admin'
                        }
                    }
                }
                if(data.label=='archived'){
                    setArchivedChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                        })
                    )
                } else if(data.chat_member.hidden){

                    setHiddenChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                    }));

                } else {

                    setChats(prev=>
                        prev.map(i=>{
                            if(i.id==data.id){
                                return {...i, lastMessage:{...i.lastMessage,text:content}}
                            }
                            return i
                    }));
                }
            }
        }
    },[data.chat_member, data.lastMessage, data])
    
    useEffect(()=>{

        let name='';
        if(data.isSelfChat){
            name = `${user.data?.name || 'Myself'} (Myself)`;
        } else if(data.isGroupChat){
            name = data.name;
        } else {
            name = data.otherUsers?.user?.phone || '';

            if(!(!contacts||contacts.length==0)) {
                for (let i of contacts){
                    if(!i.isRegistered) continue;
                    
                    if(i.server_info?.id==data.otherUsers?.user_id){
                        name = (i.item?.firstName?i.item.firstName:'') + (i.item?.lastName?i.item.lastName:'')
                    }
                }
            }
        }

        setDisplayName(name)
        
    },[contacts, channel]);


    async function toggle_mute(){
        if(!data.chat_member?.id) return;
        let reply = await fetch(`http://216.126.78.3:8500/api/toggle/mute/${data.chat_member.id}`,{
            headers:{
                'Content-type':'application/json',
                'Authorization':`Bearer ${user.token}`
            }
        });
        let response = await reply.json();
        setMuted(response.data);
        
        //Imp to call these here if we stay on this screen
        if(data.label=='archived'){
            setArchivedChats(prev=>
                prev.map(i=>{
                    if(i.id==data.id){
                        return {...i, chat_member:{...i.chat_member,mute:response.data}}
                    }
                    return i
                })
            )
        } else if(data.chat_member?.hidden){

            setHiddenChats(prev=>
                prev.map(i=>{
                    if(i.id==data.id){
                        return {...i, chat_member:{...i.chat_member,mute:response.data}}
                    }
                    return i
            }));

        } else {

            setChats(prev=>
                prev.map(i=>{
                    if(i.id==data.id){
                        return {...i, chat_member:{...i.chat_member,mute:response.data}}
                    }
                    return i
            }));
        }
        
    }

    async function deleteChat(){

        swipeableRef.current.close();  

        if(!data.chat_member?.id) return;

        try{
            let reply = await fetch(`http://216.126.78.3:8500/api/delete/chat/${data.chat_member.id}`,{
            headers:{
                'Content-type':'application/json',
                'Authorization':`Bearer ${user.token}`
            }
            })
            let response = await reply.json();

            if(response.success){

                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                
                if(data.chat_member?.hidden){
                    //Removing from their collection
                    setHiddenChats(prev=>
                        prev.filter(i=>i.chat_member?.id!=data.chat_member?.id)
                    )
                    setChats(prev=>[...prev,{...data,chat_member:response.data}])
                } else if(data.chat_member?.label=='archived'){
                    //Removing from their collection
                    setArchivedChats(prev=>
                        prev.filter(i=>i.chat_member?.id!=data.chat_member?.id)
                    )
                    setChats(prev=>[...prev,{...data,chat_member:response.data}])
                } else {
                    setChats(prev=>
                        prev.map(i=>{
                            if(i.chat_member?.id==data.chat_member?.id){
                                return {...i,chat_member:response.data}
                            }
                            return i
                        })
                    )
                }
            }
        }catch(err){
            console.log(err,'..Error in deleting chat ##');
        }
        
  
    }

    async function toggle_hide(){
        if(!data.chat_member?.id) return;

        let reply = await fetch(`http://216.126.78.3:8500/api/toggle/hidden/${data.chat_member.id}`,{
                                    headers:{
                                        'Content-type':'application/json',
                                        'Authorization':`Bearer ${user.token}`
                                    }
                                });
        let response = await reply.json();


        setHidden(response.status)
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        if(response.status){

            if(data.chat_member?.label=='archived'){
                let arr_archived = archived_chats.filter(i=>i.id!=data.id);
                if(arr_archived){
                    setArchivedChats(arr_archived);
                }
                else {
                    setArchivedChats([])
                }
            }
            else {
                let arr = chats.filter(i=>i.id!=response.data.id);
                if(arr){
                    setChats(arr);
                }
                else{
                    setChats([])
                }
            }
            setHiddenChats([response.data,...hidden_chats]);
        }
        else{
            let arr = hidden_chats.filter(i=>i.id!=response.data.id);
            if(arr){
                setHiddenChats(arr);
            }
            else {
                setHiddenChats([])
            }
            setChats([response.data,...chats])
        }
    };

    async function toggle_unread_mark(){
        if(!data.chat_member?.id) return;
        let reply = await fetch(`http://216.126.78.3:8500/api/toggle/unread_mark/${data.chat_member.id}`,{
                                    headers:{
                                        'Content-type':'application/json',
                                        'Authorization':`Bearer ${user.token}`
                                    }
                                });
        let response = await reply.json();
        setUnreadMark(response.data)
    }

    async function toggle_archive(){
        if(!data.chat_member?.id) return;

        let reply = await fetch(`http://216.126.78.3:8500/api/toggle/archive/${data.chat_member.id}`,{
            headers:{
                'Content-type':'application/json',
                'Authorization':`Bearer ${user.token}`
            }
        });
        let response = await reply.json();

        if(response.success){
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

            if(response.status){

                if(data.chat_member?.hidden){
                    let arr = hidden_chats.filter(i=>i.id!=data.id);
                    if(arr){
                        setHiddenChats(arr);
                    }
                    else {
                        setHiddenChats([])
                    }
                } else{
                    let chats_new = chats.filter(i=>i.id!=data.id);
                    if(chats_new){
                        setChats(chats_new)
                    }
                    else{
                        setChats([])
                    }
                
                }
                
                // setArchivedChats([response.data,...archived_chats]);
                setArchivedChats(originalChats=>{
                    let newChats = [...originalChats,response.data]
                    newChats.sort((a,b)=>{
                        //Directly compare the timestamp
                        return b.lastMessage?.createdAt.localeCompare(a.lastMessage?.createdAt);
                    });
                    console.log(newChats,'...yeh lei...\n\n')
                    return newChats;
                })
            }
            else{

                let arr = archived_chats.filter(i=>i.id!=response.data.id);
                if(arr){
                    setArchivedChats(arr);
                }
                else {
                    setArchivedChats([])
                }
                setChats([response.data,...chats])
            }
        }
        
    }



    //Swipeable actions
    let renderLeftActions = progress => (
        <View style={{width:192, height:'100%', flexDirection: 'row', alignSelf:'center'}}>
            {unread_mark?
            renderLeftAction('Read', '#497AFC', 192, progress)
            :
            renderLeftAction('Unread', '#497AFC', 192, progress)}
        </View>
    );
    let renderLeftAction = (text, color, x, progress) => {
        const trans = progress.interpolate({
          inputRange: [0,1],
          outputRange: [x, 0],
        });
        const pressHandler = async () => {
            await toggle_unread_mark();
            swipeableRef.current.close();
        };
        return (
          <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }]}}>
            <RectButton
              style={[styles.leftAction, { backgroundColor: color }]}
              onPress={pressHandler}>
                  <View style={{alignSelf:'center'}}>
                    {text=='Unread' ?
                    <MaterialIcons name="mark-chat-unread" size={28} color="white" />
                    :
                    <MaterialIcons name="chat-bubble-outline" size={28} color="white" />
                    }
                    
                    <Text style={{color:'white', fontWeight:'400', fontSize:16, marginVertical:5}}>{text}</Text>
                  </View>
            </RectButton>
          </Animated.View>
        );
    };
    let renderRightAction = (text, color, x, progress) => {
        const trans = progress.interpolate({
          inputRange: [0,1],
          outputRange: [x, 0],
        });
        const pressHandler = async () => {
          if(text=='Delete'){
            Alert.alert('Delete Chat', 'Are you sure you want to delete this chat ?', [
                {text:'Cancel', onPress:()=>console.log('cancelled')},
                {text:'Yes', onPress:deleteChat, style:'destructive'}
            ])
            return;
          }
          else if(text=='Hide'||text=='Unhide'){
            await toggle_hide();
            return;
          }

        };
        return (
          <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
            <RectButton
              style={[styles.rightAction, { backgroundColor: color }]}
              onPress={pressHandler}>
              {text=='Hide' ?
                <Ionicons name="eye-off-outline" size={24} color="white" />
              :
              <>
                {text=='Unhide' ?
                    <Ionicons name="eye-outline" size={24} color="white" />
                :
                    <Ionicons name="trash-outline" size={24} color="white" />
                }
              </>
                
              }
              <Text style={{color:'white', fontWeight:'400', fontSize:16, marginVertical:5}}>{text}</Text>
            </RectButton>
          </Animated.View>
        );
    };
    let renderRightActions = progress => (
        <View style={{width:192, height:'100%', flexDirection: 'row', alignSelf:'center'}}>
            {chat_hidden ?
                renderRightAction('Unhide', 'rgb(50,53,54)', 128, progress)
            :
                renderRightAction('Hide', 'rgb(50,53,54)', 128, progress)
            }  
            
            {renderRightAction('Delete', '#dd2c00', 64, progress)}
        </View>
    );

    async function longPress({nativeEvent}){

        let {event} = nativeEvent;

        switch(event){
            case "delete":
                await deleteChat();
                break;
            case "mute_toggle":
                await toggle_mute();
                break;
            case "hide_toggle":
                await toggle_hide();
                break;
            case "archive":
                await toggle_archive()
            case "unhide":
                // await unhideChat();

        }
    }

    function handleLongPress() {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', muted ? 'Unmute Chat' : 'Mute Chat', chat_hidden ? 'Unhide Chat' : 'Hide Chat', data.chat_member?.label === 'archived' ? 'Unarchive Chat' : 'Archive Chat', 'Delete Chat'],
                    destructiveButtonIndex: 4,
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        toggle_mute();
                    } else if (buttonIndex === 2) {
                        toggle_hide();
                    } else if (buttonIndex === 3) {
                        toggle_archive();
                    } else if (buttonIndex === 4) {
                        deleteChat();
                    }
                }
            );
        } else {
            Alert.alert(
                'Chat Options',
                '',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: muted ? 'Unmute Chat' : 'Mute Chat', onPress: toggle_mute },
                    { text: chat_hidden ? 'Unhide Chat' : 'Hide Chat', onPress: toggle_hide },
                    { text: data.chat_member?.label === 'archived' ? 'Unarchive Chat' : 'Archive Chat', onPress: toggle_archive },
                    { text: 'Delete Chat', style: 'destructive', onPress: deleteChat },
                ]
            );
        }
    }
    
    if(!data.chat_member || data.chat_member.is_deleted){
        return <></>
    }
    
    if(!(data.lastMessage?.text)) {
        if(!(data.lastMessage?.isAttachment)){
            return <></>
        }
    } 

    return(
        <>
                {}
                {colorScheme=='light'?
                    <Swipeable containerStyle={styles.container} renderLeftActions={renderLeftActions} renderRightActions={renderRightActions} ref={swipeableRef}>
                                <TouchableOpacity 
                                    style={styles.child_container} 
                                    onPress={()=>{setChannel(data);setUnreadCount(0)}} 
                                    onLongPress={handleLongPress}
                                    activeOpacity={0.7}
                                > 
                                    <View style={styles.pp}>
                                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:data.isGroupChat?data.avatar:(!data.isSelfChat?(data.otherUsers?.user?.avatar || user.data?.image):user.data?.image)}}></Image>
                                    </View>

                                    <View style={styles.message}>
                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:17,fontWeight:'bold',color:'black'}}>{displayName}</Text>
                                        
                                        {data.lastMessage?.isAttachment ?

                                            <View style={{flexDirection:'row',alignItems:'center'}}> 
                                                {data.lastMessage?.type?.includes('image') &&
                                                    <>
                                                        <MaterialIcons style={{marginHorizontal:2.5}} name="photo-camera" size={20} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'}/>
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Photo')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('video')&&
                                                    <>
                                                        <FontAwesome style={{marginHorizontal:4}} name="video-camera" size={18} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Video')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('audio')&&
                                                    <>
                                                        <FontAwesome style={{marginHorizontal:4}} name="microphone" size={18} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Audio')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('location')&&
                                                    <>
                                                        <Entypo style={{marginHorizontal:4}} name="location-pin" size={18} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Location')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('contact')&&
                                                    <>
                                                        <FontAwesome style={{marginHorizontal:4}} name="user" size={18} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Contact')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('file')&&
                                                    <>
                                                        <FontAwesome style={{marginHorizontal:2.5}} name="file" size={16} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('File')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('link')&&
                                                    <>
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text}
                                                        </Text>
                                                    </>
                                                }
                                                
                                            </View>

                                            :
                                            <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)'}}>
                                                {data.lastMessage?.text}
                                            </Text>

                                        }
                                    </View>
                                    <View style={styles.time}>
                                        <Text style={{color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgba(0,0,0,0.6)'):'rgb(251,138,57)',fontSize:11}}>{data.lastMessage?.createdAt?convertToLocaleTime(data.lastMessage?.createdAt):''}</Text>
                                            {
                                                muted ? 
                                                    <FontAwesome5 name="volume-mute" size={17} color="rgb(251,138,57)" />
                                                :
                                                <>
                                                    {(unread_count>0 &&!data.isSelfChat)?
                                                        <View style={{height:20,width:20,borderRadius:10,backgroundColor:'rgb(251,138,57)',justifyContent:'center',alignItems:'center'}}>
                                                            <Text style={{color:'white'}}>{unread_count}</Text>          
                                                        </View>
                                                    :
                                                    <>
                                                    {unread_mark?<Octicons name="dot-fill" size={24} color='rgb(251,138,57)' />:null}
                                                    </>
                                                    }
                                                </>
                                            }
                                    </View>
                                </TouchableOpacity>
                    </Swipeable>
                :
                <LinearGradient colors={['rgb(39,42,55)','rgb(12,16,30)']} style={styles.gradient} >
                    
                    <Swipeable  containerStyle={styles.container_dark} renderLeftActions={renderLeftActions} renderRightActions={renderRightActions}  ref={swipeableRef}>
                            <LinearGradient colors={['rgb(39,42,55)','rgb(12,16,30)']} style={{borderRadius:50, width:'100%'}}>
                                <TouchableOpacity style={{...styles.child_container, backgroundColor:'transparent'}} onPress={()=>{console.log('Press hua ');setChannel(data);setUnreadCount(0)}} onLongPress={handleLongPress} activeOpacity={0.7}>
                                    <View style={styles.pp}>
                                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:data.isGroupChat?data.avatar:(!data.isSelfChat?(data.otherUsers?.user?.avatar || user.data?.image):user.data?.image)}}></Image>
                                    </View>
                                    <View style={styles.message}>
                                        <Text style={{fontSize:17,fontWeight:'bold',color:'white'}} numberOfLines={1} ellipsizeMode="tail" >
                                            {displayName}
                                        </Text>

                                        {data.lastMessage?.isAttachment ?

                                            <View style={{flexDirection:'row',alignItems:'center'}}> 

                                                {data.lastMessage?.type?.includes('image')&& 
                                                    <>
                                                        <MaterialIcons style={{marginHorizontal:2.5}} name="photo-camera" size={20} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'}/>
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Photo')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('video')&& 
                                                    <>
                                                        <FontAwesome style={{marginHorizontal:4}} name="video-camera" size={18} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Video')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('audio')&& 
                                                    <>
                                                        <FontAwesome style={{marginHorizontal:4}} name="microphone" size={18} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Audio')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('location')&& 
                                                    <>
                                                        <Entypo style={{marginHorizontal:4}} name="location-pin" size={18} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Location')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('contact')&& 
                                                    <>
                                                        <FontAwesome style={{marginHorizontal:4}} name="user" size={18} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('Contact')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('file')&&
                                                    <>
                                                        <FontAwesome style={{marginHorizontal:2.5}} name="file" size={16} color={unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'} />
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text ? (data.lastMessage?.text):('File')}
                                                        </Text>
                                                    </>
                                                }
                                                {data.lastMessage?.type?.includes('link')&&
                                                    <>
                                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:15,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'}}>
                                                            {data.lastMessage?.text}
                                                        </Text>
                                                    </>
                                                }
                                                
                                            </View>

                                            :
                                            <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:14,color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)'}}>
                                                {data.lastMessage?.text}
                                            </Text>
                                           
                                        }

                                    </View>
                                    <View style={styles.time}>
                                        <Text style={{color:unread_count<=0?(unread_mark?'rgb(251,138,57)':'rgb(220,220,220)'):'rgb(251,138,57)',fontSize:11}}>{data.lastMessage.createdAt?convertToLocaleTime(data.lastMessage?.createdAt):''}</Text>
                                            {
                                                muted ? 
                                                    <FontAwesome5 name="volume-mute" size={17} color="rgb(251,138,57)" />
                                                :
                                                <>
                                                    {(unread_count>0&&!data.isSelfChat) ?
                                                        <View style={{height:20,width:20,borderRadius:10,backgroundColor:'rgb(251,138,57)',justifyContent:'center',alignItems:'center'}}>
                                                            <Text style={{color:'white'}}>{unread_count}</Text>          
                                                        </View>
                                                    :
                                                    <>
                                                    {unread_mark?<Octicons name="dot-fill" size={24} color='rgb(251,138,57)' />:null}
                                                    </>
                                                    }
                                                </>
                                            }
                                    </View>
                                </TouchableOpacity>        
                            </LinearGradient>
                    </Swipeable>
                </LinearGradient>
                    
                
                }

            
        </>
    )
}

const styles = StyleSheet.create({

    container:{
        flexDirection:'row',
        backgroundColor:'rgb(218,218,218)',
        borderRadius:50,
        marginHorizontal:5,
        marginVertical:8,

    },
    child_container:{
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'rgb(218,218,218)',
        paddingVertical:16,
        paddingHorizontal:20,
        borderRadius:50,
        width:'100%',
    }, 
    container_dark:{
        flexDirection:'row',
        borderRadius:50,
        width:'100%'
    },
    gradient:{
        flexDirection:'row',
        justifyContent:'space-between',
        borderRadius:50,
        marginHorizontal:5,
        marginVertical:8,
        overflow:'hidden'
    },
    message:{
        width:'50%',
        paddingVertical:3,
        justifyContent:'space-between'
    },
    time:{
        width:'28%',
        alignItems:'center',
        justifyContent:'space-between',
    },
    pp:{
        width:50,
        height:50,
        borderRadius:25,
        overflow:'hidden',
    },
    leftAction: {
        flex: 1,
        backgroundColor: '#497AFC',
        justifyContent: 'center',
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        backgroundColor:'rgb(92,192,75)'
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'transparent',
        padding: 10,
    }
})

