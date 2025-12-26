import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { SafeAreaView, Text, View, StyleSheet, useColorScheme, ImageBackground, Alert,Animated,Dimensions, TouchableOpacity, Linking, StatusBar, Image, Platform, ScrollView, Vibration, LayoutAnimation, UIManager, Modal, TouchableWithoutFeedback, Pressable} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useChannelSet } from '../../../context/channel';
import EmojiPicker from "rn-emoji-keyboard";
import { useSelector } from 'react-redux';
import {GiftedChat, Bubble, MessageText, Time} from 'react-native-gifted-chat';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import dayjs from 'dayjs';
import * as ContextMenu from 'zeego/context-menu';
import * as Clipboard from 'expo-clipboard';
import { BubbleContent } from './ChatScreenUtilities';
import { Avatar } from 'react-native-paper';

const LIMIT = 100; //Limit of messages in 1 batch

//Android's case for implementing LayoutAnimation when a new message is added to the view
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const MAPS_API_KEY = 'AIzaSyC6QKw4WDUc9kcNDRa8_YpBHBX20PriyH8';



const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);

//Utility functions for RenderBubble

function isSameUser(currentMessage, diffMessage) {
  return !!(diffMessage &&
      diffMessage.user &&
      currentMessage.user &&
      diffMessage.user._id === currentMessage.user._id);
}

export function isSameDay(currentMessage, diffMessage) {
  if (!diffMessage || !diffMessage.createdAt) {
      return false;
  }
  const currentCreatedAt = dayjs(currentMessage.createdAt);
  const diffCreatedAt = dayjs(diffMessage.createdAt);
  if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
      return false;
  }
  return currentCreatedAt.isSame(diffCreatedAt, 'day');
}

function styledBubbleToNext(props) {
  const { currentMessage, nextMessage, position, containerToNextStyle } = props;
  if (currentMessage &&
      nextMessage &&
      position &&
      isSameUser(currentMessage, nextMessage) &&
      isSameDay(currentMessage, nextMessage)) {
      return [
          styles[position].containerToNext,
          containerToNextStyle && containerToNextStyle[position],
      ];
  }
  return null;
}

function styledBubbleToPrevious(props) {
  const { currentMessage, previousMessage, position, containerToPreviousStyle } = props;
  if (currentMessage &&
      previousMessage &&
      position &&
      isSameUser(currentMessage, previousMessage) &&
      isSameDay(currentMessage, previousMessage)) {
      return [
          styles[position].containerToPrevious,
          containerToPreviousStyle && containerToPreviousStyle[position],
      ];
  }
  return null;
}

//To render ticks
function renderMyTicks(props) {

  let app_user = useSelector(state=>state.user.value);
  let colorScheme = useColorScheme();
  let [status,setStatus] = useState();

  const { currentMessage, nextMessage, user, seen, channel } = props;

  useEffect(()=>{

    if(seen.length>=1){
      let seen_status = false;

      for (let a of seen){
        if(a.last_seen_message >= currentMessage._id) {
          seen_status=true;
        } else {
          seen_status = false;
          break
        }
      }

      setStatus(seen_status)
    } else {
      if(seen.last_seen_message>=currentMessage._id) setStatus(true)
    }

  },[])

  if(currentMessage?.user?._id!=app_user.data.id) return <></>
  const isSameDayMessage = nextMessage && isSameDay(currentMessage, nextMessage);
  let tickRender = nextMessage && nextMessage.user && currentMessage.user && nextMessage.user._id==currentMessage.user._id 
  let showAvatar = !tickRender || !isSameDayMessage

  if(showAvatar) {
    return (
      <>
        {
          channel?.isGroupChat ? 
            <View style={{marginVertical:5, flexDirection:'row', alignItems:'center'}}>
              { status ? 
                <Ionicons name="checkmark-done" size={24} color={'rgb(114,213,180)'} style={{marginRight:5, fontWeight:'bolder'}} />
                :
                <Ionicons name="checkmark" size={24} color={'rgb(114,213,180)'} style={{marginRight:5, fontWeight:'bolder'}} />
              }
              <Text style={{color:colorScheme=='light'?(status ? 'rgb(114,213,180)':'rgb(114,213,180)'):(status ? 'rgb(114,213,180)':'rgb(114,213,180)'), fontWeight:'bold'}}>
                {status ? 'Seen':'Delivered'}
              </Text>
            </View>
          :
              <>
                {
                  (!(app_user.data.is_receipts_enabled) || !(channel?.otherUsers?.user?.additional_user_details?.is_receipts_enabled)) ?
                    <>
                    </>
                  :
                    <View style={{marginVertical:5, flexDirection:'row', alignItems:'center'}}>
                      { status ? 
                        <Ionicons name="checkmark-done" size={24} color={'rgb(114,213,180)'} style={{marginRight:5, fontWeight:'bolder'}} />
                        :
                        <Ionicons name="checkmark" size={24} color={'rgb(114,213,180)'} style={{marginRight:5, fontWeight:'bolder'}} />
                      }
                      <Text style={{color:colorScheme=='light'?(status ? 'rgb(114,213,180)':'rgb(114,213,180)'):(status ? 'rgb(114,213,180)':'rgb(114,213,180)'), fontWeight:'bold'}}>
                        {status ? 'Seen':'Delivered'}
                      </Text>
                    </View>
                }
              </>
            
        }
      </>
      
    );
  }
  return <></>
      

}


const RenderBubble = (props) => {

  const {currentMessage, nextMessage, position, containerStyle, wrapperStyle, navigation, markMessageImportant, setIsMenuVisible, giftedChatRef, setMsgInFocus} = props;

  let colorScheme = useColorScheme();
  const translateX = useRef(new Animated.Value(0)).current;
  let user = useSelector(state=>state.user.value);
  let [recent,setRecent] = useState([]);
  let {channel} = useChannelSet();

  const handlePanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const handlePanGestureStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationX > 30) {
        Vibration.vibrate(100);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setReplying(currentMessage)
      }
      // Reset the translation value
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const clampedTranslateX = translateX.interpolate({
    inputRange: [0, 30],
    outputRange: [0, 30],
    extrapolate: 'clamp',
  });
  

  return (

    <>
          <View style={[styles[position].container,containerStyle && containerStyle[position]]}>
            <PanGestureHandler
                  simultaneousHandlers={giftedChatRef}
                  activeOffsetX={[-30,30]}
                  onGestureEvent={handlePanGestureEvent}
                  onHandlerStateChange={handlePanGestureStateChange} 
            >
              <Animated.View style={[styles[position].wrapper,
                      styledBubbleToNext(props),
                      styledBubbleToPrevious(props),
                      wrapperStyle && wrapperStyle[position],
                      [{backgroundColor:colorScheme=='light'?(position=='left'?'rgb(253,241,196)':'rgb(250,226,206)'):(position=='left'?'rgb(247,202,131)':'rgb(227,167,139)'),
                      transform: [{ translateX: clampedTranslateX }], 
                      }  
                      ]]}>

              <ContextMenu.Root>
                <ContextMenu.Trigger asChild={true}>
                    <BubbleContent {...props} display={true} a={navigation} setIsMenuVisible={setIsMenuVisible} setMsgInFocus={setMsgInFocus}/> 
                </ContextMenu.Trigger>

                <ContextMenu.Content>
                
                <ContextMenu.Preview>
                  {() => 
                  <View style={{backgroundColor:colorScheme=='light'?(position=='left'?'rgb(253,241,196)':'rgb(250,226,206)'):(position=='left'?'rgb(247,202,131)':'rgb(227,167,139)')}}>
                    <BubbleContent {...props} a={navigation} display={false} setIsMenuVisible={()=>{}} setMsgInFocus={()=>{}}/>
                  </View>
                    
                  }
                </ContextMenu.Preview>

                
                {currentMessage.important ? 
                  <ContextMenu.Item key='Not_important' onSelect={()=>markMessageImportant(currentMessage,false)}>
                    <ContextMenu.ItemTitle>Not Important</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon 
                      ios={{
                        name:'star.slash'
                      }}
                      android={{}}
                    ></ContextMenu.ItemIcon>
                </ContextMenu.Item>
                :
                  <ContextMenu.Item key='Important' onSelect={()=>markMessageImportant(currentMessage,true)}>
                    <ContextMenu.ItemTitle>Important</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon 
                      ios={{
                        name:'star.bubble.fill'
                      }}
                      android={{}}
                    ></ContextMenu.ItemIcon>
                  </ContextMenu.Item>
                }

                {
                  currentMessage.text &&
                  <ContextMenu.Item key='Copy' onSelect = {()=>Clipboard.setStringAsync(currentMessage.text)}>
                    <ContextMenu.ItemTitle>Copy</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon 
                      ios={{
                        name:'doc.on.doc'
                      }}
                      android={{}}
                    ></ContextMenu.ItemIcon>
                  </ContextMenu.Item>
                }

                <ContextMenu.Item key='Forward' onSelect={()=>navigation.navigate('Forward Message',{message:currentMessage})}>
                  <ContextMenu.ItemTitle>Forward</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon 
                      ios={{
                        name:'arrowshape.zigzag.forward'
                      }}
                      android={{}}
                  ></ContextMenu.ItemIcon>
                </ContextMenu.Item>  
            
              </ContextMenu.Content>
              </ContextMenu.Root>
            </Animated.View>
          </PanGestureHandler>
          {renderMyTicks(props)}
        </View>
    </>
     
  )
  

}


export default function ImpMessages({navigation}){

    const colorScheme = useColorScheme();
    let {channel, setImpMessageRemoved} = useChannelSet();
    let [messages,setMessages] = useState([]);
    let user = useSelector(state=>state.user.value);
    let {contacts} = useSelector(state=>state.contacts.value);
    let [displayName, setDisplayName] = useState('');
    let [impMessages,setImpMessages] = useState([]);
    let [msgInFocus,setMsgInFocus] = useState();
    let [isMenuVisible,setIsMenuVisible] = useState(false);
    let [seen, setSeen] = useState([]);
    let [last_seen, setLastSeen] = useState();
    let [loading, setLoading] = useState(false);
    let [hasMore, setHasMore] = useState(true);
    let [offset, setOffset] = useState(0);
    let [online,setOnline] = useState(false);
    let giftedChatRef = useRef(null);

    //Fetch all messages
    useEffect(()=>{

      if(!channel?.id) return ;
      console.log('Fetching messages on load');
      (
          async function (){
              await fetchMessages();
              await fetch_last_seen();
          }
      )();

    },[]);


    //Message received

    useEffect(()=>{

      if(channel){
        //Check display names
        if(channel?.isSelfChat){
          setDisplayName(`${user.data.firstName+" "+user.data.lastName} (Myself)`);
        } else if(channel?.isGroupChat){
          setDisplayName(channel?.name)
        } else {
          setDisplayName(checkInContacts(channel?.otherUsers.user))
        }
      }
    },[channel]);

    //Fetching messages by pagination - 100 at a time (hard-coded at backend)
    async function fetchMessages(){

      if (!hasMore || loading) return;

      setLoading(true)
      try{
          let reply = await fetch(`http://216.126.78.3:8500/api/getmessages/important/${channel?.id}?limit=${LIMIT}&offset=${offset}`,{
          method:'GET',
          headers:{
            'Content-type':'application/json',
            'Authorization':`Bearer ${user.token}`
          }
          });

          let response = await reply.json();

          if(response.success){
            setHasMore(response.hasMore);

            if(response.data.length>0){
              //Check for system message Group Chat
              if(response.data[response.data.length-1].text=='Group created'){
                response.data[response.data.length-1].text=`Group created by ${checkInContacts(response.data[response.data.length-1].user)}`
              }
              setOffset(offset=>offset + LIMIT); // Increment offset for next page
              setSeen(channel?.otherUsers)
              setMessages(prev=>[...prev,...response.data])
              
            }
            
          }
          
      }catch(err){
          console.log(err,'Error in fetching messages...\n\n')
      }
      setLoading(false)
    }
  



    //Scrolling to a clicked message in replied part

    const scrollToMessage = (messageId) => {
      // Find the index of the message with the given ID
      const index = messages.findIndex(message => message._id === messageId);
      if (index !== 0) {
        // Access the FlatList's scrollToIndex method
        giftedChatRef.current?.scrollToIndex({ index:index-1, animated: true });
      } else{
        giftedChatRef.current?.scrollToIndex({ index, animated: true });
      }
    };

    async function fetch_last_seen(){

      let reply = await fetch(`http://216.126.78.3:8500/api/fetch/seen/${channel?.id}`,{
        headers:{
          'Content-type':'application/json',
          'Authorization':`Bearer ${user.token}`
        }
      });
      let response = await reply.json();
      
      if(response.success) {
        setSeen(prev=>response.data);
        if(response.data.length==1){
          setOnline(response.data[0].user.additional_user_details.is_online)
          setLastSeen(response.data[0].user.additional_user_details.last_seen)
        }
      }
    }

    const checkInContacts = useCallback((obj)=>{

      if (obj.id==user.data.id || obj._id==user.data.id) {
        return user.data.firstName+" "+user.data.lastName
      } else {
        let name = obj.phone;
        if(!(!contacts||contacts.length==0)) {
            for (let i of contacts){
                if(!i.isRegistered) continue;
                
                if(i.server_info.id==obj.id||i.server_info.id==obj._id){
                    name = (i.item?.firstName?i.item.firstName:'') + (i.item?.lastName?i.item.lastName:'')
                }
            }
        }
        return name
      }

    },[contacts,channel,user])

    //Flag a message as important
    const markMessageImportant = async(msg,status) => {
      try{
        let myMsg = {...msg, important:status};
        let editedMessages = messages.map(i=>{
          if(i._id==myMsg._id) return myMsg;
          return i;
        });
        setMessages(editedMessages);

        // setTriggerChange(prev=>!prev)
        
        //Call backend 
        if(status){
          let reply = await fetch(`http://216.126.78.3:8500/api/important/${myMsg._id}`,{
            method:'GET',
            headers:{
              'Content-type':'application/json',
              'Authorization':`Bearer ${user.token}`
            }
          });
          let response = await reply.json();
          console.log(response,'...imp...\n\n')
        }else {

            let new_messages = messages.filter(i=>i._id!=msg._id)
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(new_messages);

            let reply = await fetch(`http://216.126.78.3:8500/api/unimportant/${myMsg._id}`,{
                method:'GET',
                headers:{
                'Content-type':'application/json',
                'Authorization':`Bearer ${user.token}`
                }
            });
            let response = await reply.json();
            setImpMessageRemoved(msg._id);
          
        }
      }catch(err){
        console.log(err,'Error in importifying messages.....\n\n');
      }
    }

    
    return(
        <>

            <MyStatusBar
              backgroundColor={'rgb(46,53,78)'}
              barStyle={'light-content'}
            ></MyStatusBar>

              <View style={{flex:1}}>
             
                <View style={colorScheme=='light'?styles.header:styles.header_dark}> 
                  <ImageBackground style={styles.image} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/Header.png'}}>
                      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                          <View style={{flexDirection:'row',alignItems:'center',width:'65%'}}>
                              <TouchableOpacity onPress={()=>{navigation.pop();}} style={{marginHorizontal:10}}><Entypo name="chevron-left" size={34} color="white" /></TouchableOpacity>
                              <View style={{flexDirection:'row'}}>
                                  <View style={styles.pp}>
                                      <Image style={styles.image} source={{uri:channel?.isGroupChat?channel?.avatar:(!channel?.isSelfChat?(channel?.otherUsers?.user?.avatar):user.data.image)}}></Image>
                                  </View>
                                  <View style={{alignItems:'flex-start',justifyContent:'center',paddingHorizontal:15, width:'100%'}}>
                                      <Text numberOfLines={1} ellipsizeMode="tail" style={{color:'white',fontWeight:'bold',marginBottom:4}}>
                                          {displayName}
                                      </Text>
                                      <Text style={{color:'white'}}>
                                        Important Messages
                                      </Text>
                                  </View>
                              </View>
                          </View>
                          <View style={{flexDirection:'row', width:'35%'}}>
                              
                          </View>
                      </View> 
                  </ImageBackground>
                </View>
                <View style={{backgroundColor:colorScheme=='light'?'rgb(255,255,255)':'rgb(41,44,54)', flex:1}}>
                  <GiftedChat 
                    messageContainerRef={giftedChatRef}
                    messages={messages}
                    extraData={{impMessages}}
                    shouldUpdateMessage={(props,nextProps)=>((props.extraData.impMessages!=nextProps.extraData.impMessages) || seen.length!=0)}
                    user={{
                      _id:parseInt(user.data.id),
                      avatar:user.data.image,

                    }}
                    renderBubble={(props)=><RenderBubble {...props} scrollToMessage={scrollToMessage} navigation={navigation} markMessageImportant={markMessageImportant} setIsMenuVisible={setIsMenuVisible} giftedChatRef={giftedChatRef} setMsgInFocus={setMsgInFocus} channel={channel} seen={seen}/>}
                    renderInputToolbar={props=><></>}
                    renderFooter={()=><View style={{paddingVertical:25}}></View>}
                    renderUsernameOnMessage={channel?.isGroupChat?true:false}
                    renderChatFooter={props=><></>}
                    timeTextStyle={{
                      left:{
                        color:'rgb(100,100,100)',
                        fontSize:12
                      },
                      right:{
                        color:'rgb(100,100,100)',
                        fontSize:12
                      }
                    }}
                    listViewProps={{
                      onEndReachedThreshold: 0.3, // When the top of the content is within 3/10 of the visible length of the content
                      onEndReached:fetchMessages,
                    }}
                  
                  />
                </View>
               
              </View>

        </>
    )
}

const styles = StyleSheet.create({
    header:{
        flexDirection:'row',
        backgroundColor:'white',
        height:130,
        width:'100%'
    },
    header_dark:{
        flexDirection:'row',
        backgroundColor:'rgb(41,44,56)',
        height:130,
        width:'100%'
    },
    image:{
        width:'100%',
        height:'100%',
        resizeMode:'cover',
        paddingTop:Platform.OS=='ios'?0:10
    },
    pp:{
        width:50,
        height:50,
        borderRadius:25,
        overflow:'hidden'
    },
    statusBar:{
        height: STATUSBAR_HEIGHT,
    },
    left:{
      container: {
          flex: 1,
          alignItems: 'flex-start',
      },
      wrapper: {
          borderRadius: 15,
          backgroundColor: '#f0f0f0',
          marginRight: 60,
          minHeight: 20,
          justifyContent: 'flex-end',
      },
      containerToNext: {
          borderBottomLeftRadius: 3,
      },
      containerToPrevious: {
          borderTopLeftRadius: 3,
      },
      bottom: {
          flexDirection: 'row',
          justifyContent: 'flex-start',
      },
  },
  right:{
      container: {
          flex: 1,
          alignItems: 'flex-end',
      },
      wrapper: {
          borderRadius: 15,
          backgroundColor: '#0084ff',
          marginLeft: 60,
          minHeight: 20,
          justifyContent: 'flex-end',
      },
      containerToNext: {
          borderBottomRightRadius: 3,
      },
      containerToPrevious: {
          borderTopRightRadius: 3,
      },
      bottom: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
      },
  },
  content: StyleSheet.create({
    tick: {
        fontSize: 10,
        backgroundColor: 'transparent',
        color: 'rgb(255,255,255)',
    },
    tickView: {
        flexDirection: 'row',
        marginRight: 10,
    },
    username: {
        top: 2,
        left: 0,
        fontSize: 12,
        backgroundColor: 'transparent',
        color: '#0D0D74',
        fontWeight:'bold'
    },
    usernameView: {
        flexDirection: 'row',
        marginHorizontal: 10,
    },
  }),
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
     zIndex:200,
     height:'50%',
     paddingVertical:10
   },
   closeButton: {
    alignSelf: 'flex-end',
    paddingBottom: 10,
  }
})