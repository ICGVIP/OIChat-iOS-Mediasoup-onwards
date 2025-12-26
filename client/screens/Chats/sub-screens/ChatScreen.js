import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, ImageBackground, LayoutAnimation, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, UIManager, useColorScheme, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { GiftedChat } from 'react-native-gifted-chat';
import { useSelector } from 'react-redux';
import EmojiPicker from "rn-emoji-keyboard";
import * as ContextMenu from 'zeego/context-menu';
import { useChannelSet } from '../../../context/channel';
import { useRTC } from '../../../context/rtc';
import ChatInput from './ChatInput';
import { BubbleContent } from './ChatScreenUtilities';

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

const randomGenerator = ()=>{
  return (
    Math.random().toString(36).slice(2, 7) +
    Math.random().toString(36).slice(2, 7) +
    Math.random().toString(36).slice(2, 7)
  );
}

function getTime(timestamp){
  const now = new Date();
    const inputTime = new Date(timestamp);
    const diffInMs = now - inputTime; // Difference in milliseconds
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    const options = { month: "long", day: "numeric" }; // For "11 January" format

    if (diffInSeconds < 60) {
        return "just now";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays === 1) {
        return "yesterday";
    } else if (diffInDays <= 30) {
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else {
        return inputTime.toLocaleDateString(undefined, options); // "11 January"
    }
}

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);

const OverlayReactions = ({onClose, removeReaction, setMsgInFocus, msgInFocus}) => {

  let colorScheme = useColorScheme();
  let user = useSelector(state=>state.user.value);

  return (
    <View style={styles.overlay}>
      <View style={{...styles.menu, backgroundColor:colorScheme=='dark'?'rgb(41,44,54)':'rgb(241,241,241)'}}>
        
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Entypo name="cross" size={34} color={colorScheme=='dark'?'white':'black'} />
        </TouchableOpacity>

        <View style={{alignSelf:'center'}}>
          <Text style={{fontWeight:'bold', fontSize:19, color:colorScheme=='light'?'black':'white'}}>Reactions</Text>
        </View>

        <ScrollView style={{flex:1}} contentContainerStyle={{paddingVertical:10, marginTop:20}}>
          {msgInFocus?.reactions?.map((i,index)=>{
            return (
              <Pressable onPress={i.user.id==user.data.id?removeReaction:()=>{}} key={index} style={{width:'100%',flexDirection:'row',alignItems:'center',justifyContent:'space-between', paddingHorizontal:20, marginBottom:25, height:40}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <View style={{width:40,height:40,borderRadius:20,overflow:'hidden', marginRight:10}}>
                    <Image style={{width:'100%',height:'100%'}} resizeMode='cover' source={{uri:i.user.avatar?i.user.avatar:i.user.image}}/>
                  </View>
                  {/* <Avatar.Image source={{uri:i.user.avatar}} size={38} style={{marginRight:10}}/> */}
                  <View style={{justifyContent:'space-between', height:40}}>
                    <Text style={{color:colorScheme=='dark'?'white':'black'}}>{i.user.name}</Text>
                    <Text style={{color:i.user.id==user.data.id?'grey':'transparent',fontStyle:'italic'}}>{'Tap to unreact'}</Text>
                  </View>
                </View>

                <Text>{i.reaction}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
        
      </View>
    </View>
  )
}


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


function RenderChatFooter(props) {

  const {replying,setReplying,checkInContacts, inputToolbarHeight, ...rest} = props;
  let colorScheme = useColorScheme();
  let user = useSelector(state=>state.user.value)
  const toolbarHeight = inputToolbarHeight || 70; // Default to 70 if not provided

  console.log('RenderChatFooter called - replying:', replying, 'props:', Object.keys(props));
  if(!replying) return <View {...props} style={{padding:10}}></View>
  return (
    <View style={{height: 100 + toolbarHeight, flexDirection: 'row', backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(72,77,102)', alignItems:'flex-start', paddingTop: 10}}>
      <View style={{height: 80, marginLeft:5, marginTop: 5, width: 2, backgroundColor:colorScheme=='light'?'rgb(215,215,215)':'rgb(107,110,121)'}}></View>
        <View style={{flexDirection: 'column', height: 80, justifyContent:'flex-start', maxWidth:'70%', paddingTop: 5}}>
           {console.log(replying,'...deal...\n')}
          <Text style={{color: 'rgb(241,171,71)', paddingLeft: 10, paddingBottom: 4, fontWeight:'bold', fontSize: 14}} numberOfLines={1} ellipsizeMode='tail'>
               {
                checkInContacts(replying.user)
               }
          </Text>

          <Text style={{color: colorScheme=='light'?'rgb(135,135,135)':'rgb(190,190,190)', paddingLeft: 10, flexShrink:1, fontSize: 13}}
              numberOfLines={2}
              ellipsizeMode='tail'
          >
            {replying.text ? replying.text
              :
            <>
              {replying.type=='file' && replying.additionalInfo.name}
              {replying.type=='audio' && 'Voice Message'}
              {replying.type=='image' && replying.additionalInfo.name}
              {replying.type=='video' && replying.additionalInfo.name}
              {replying.type=='contact' && `${replying.type=='contact'? replying.additionalInfo.name:'Error what is it ?'} - Contact`}
              {replying.type=='location' && 'Shared location'}
            </>
            }

          </Text>
        </View>
        <View style={{flex: 1, height: 80, justifyContent: 'flex-start', alignItems:'flex-end', paddingRight: 10, paddingTop: 5}}>
          <TouchableOpacity onPress={()=>{LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);setReplying()}}>
          <MaterialIcons name="cancel" size={24} color={colorScheme=='light'?'rgb(171,171,171)':'rgb(107,111,131)'} />
          </TouchableOpacity>
        </View>
    </View>
  )

}

const RenderBubble = (props) => {

  const {currentMessage, nextMessage, position, containerStyle, wrapperStyle, setReplying, navigation, setEditMessage,markMessageImportant, deleteMessage, addReaction, setEmojiPicker, setMsgToReact, setIsMenuVisible, giftedChatRef, setMsgInFocus, seen} = props;
  const { width, height } = Dimensions.get('window');

  let colorScheme = useColorScheme();
  const translateX = useRef(new Animated.Value(0)).current;
  let user = useSelector(state=>state.user.value);
  let [recent,setRecent] = useState([]);
  let {channel} = useChannelSet();
  // let isLastMessage = nextMessage && !nextMessage._id

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
          <View style={[styles[position].container,containerStyle && containerStyle[position], {flex:0}]}>
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

                {/* <ContextMenu.Auxiliary
                  width={200}
                  height={50}
                  alignmentHorizontal={position=='left'?'previewLeading':'previewTrailing'}
                  anchorPosition={true}
                  >
                    {({dismissMenu})=>
                    <View style={{borderRadius:20, flexDirection:'row', width:'100%', height:'100%', backgroundColor:colorScheme=='dark'?'rgb(53,53,52)':'rgb(250,250,250)', alignItems:'center', justifyContent:'space-evenly'}}>
                      <TouchableOpacity onPress={()=>{addReaction(currentMessage,'👍');dismissMenu();}}><Text style={{textAlign:'center', fontSize:Math.min(width,height)*0.065}}>👍</Text></TouchableOpacity>
                      <TouchableOpacity onPress={()=>{addReaction(currentMessage,'❤️');dismissMenu();}}><Text style={{textAlign:'center', fontSize:Math.min(width,height)*0.065}}>❤️</Text></TouchableOpacity>
                      <TouchableOpacity onPress={()=>{addReaction(currentMessage,'😂');dismissMenu();}}><Text style={{textAlign:'center', fontSize:Math.min(width,height)*0.065}}>😂</Text></TouchableOpacity>
                      <TouchableOpacity onPress={()=>{addReaction(currentMessage,'😲');dismissMenu();}}><Text style={{textAlign:'center', fontSize:Math.min(width,height)*0.065}}>😲</Text></TouchableOpacity>
                      <TouchableOpacity onPress={()=>{setMsgToReact(currentMessage);setEmojiPicker(true);dismissMenu();}}>
                        <AntDesign name="pluscircle" size={24} color="rgb(180,180,180)" />
                      </TouchableOpacity>
                    </View>}
                  
                </ContextMenu.Auxiliary>
                 */}
                
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

                <ContextMenu.Item key='Reply' onSelect={()=>{LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);setReplying(currentMessage)}}>
                  <ContextMenu.ItemTitle>Reply</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon 
                    ios={{
                      name:'arrowshape.turn.up.left'
                    }}
                    android={{}}
                  ></ContextMenu.ItemIcon>
                </ContextMenu.Item>

                <ContextMenu.Item key='Forward' onSelect={()=>navigation.navigate('Forward Message',{message:currentMessage})}>
                  <ContextMenu.ItemTitle>Forward</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon 
                      ios={{
                        name:'arrowshape.zigzag.forward'
                      }}
                      android={{}}
                  ></ContextMenu.ItemIcon>
                </ContextMenu.Item>
                
                {dayjs().diff(currentMessage.createdAt,'minute')<15 && currentMessage.user._id==user.data.id  &&
                <>
                  {!currentMessage.isAttachment &&
                    <ContextMenu.Item key='Edit' onSelect={()=>setEditMessage({state:true,message:currentMessage})}>
                      <ContextMenu.ItemTitle>Edit</ContextMenu.ItemTitle>
                      <ContextMenu.ItemIcon 
                      ios={{
                        name:'pencil.circle'
                      }}
                      android={{}}
                      ></ContextMenu.ItemIcon>
                    </ContextMenu.Item>
                  }
                  
                  {!(channel?.isSelfChat) &&
                    <ContextMenu.Item key='DeleteAll' destructive={true} onSelect={()=>deleteMessage(currentMessage,'all')}>
                      <ContextMenu.ItemTitle>Delete For All</ContextMenu.ItemTitle>
                      <ContextMenu.ItemIcon 
                      ios={{
                        name:'trash'
                      }}
                      android={{}}
                      ></ContextMenu.ItemIcon>
                    </ContextMenu.Item>
                  }
                  
                </>
                }
              <ContextMenu.Item key='DeleteMe' destructive={true} onSelect={()=>deleteMessage(currentMessage,'me')}>
                  <ContextMenu.ItemTitle>Delete For Me</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon 
                  ios={{
                    name:'trash'
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

export const CustomInput= ({props, onSend, setEditMessage, editMessage,updateSend}) => {

  let {channel} = useChannelSet();
  let colorScheme = useColorScheme();
  let {containerStyle} = props;

  return(
    <>

      {channel?.chat_member?.group_ousted ?
        <View style={[{...styles.container, flexDirection:'column', borderTopColor:colorScheme=='dark'? 'rgb(20,23,44)' : 'rgb(235,235,235)' ,backgroundColor:colorScheme=='dark'?'rgb(39,42,43)':'rgb(245,245,245))'}, {position:'absolute'}]}>
          <Text style={{color:'grey'}}>You are no longer a participant in this group</Text>
        </View>
      :
      <>
        {channel?.chat_member?.blocked_chat ?
          <View style={[{...styles.container, flexDirection:'column', borderTopColor:colorScheme=='dark'? 'rgb(20,23,44)' : 'rgb(235,235,235)' ,backgroundColor:colorScheme=='dark'?'rgb(39,42,43)':'rgb(245,245,245))'}, {position:'absolute'}]}>
            <Text style={{color:'grey'}}>You have blocked this user</Text>
          </View>
        :
        <ChatInput {...props} onSend={onSend} setEditMessage={setEditMessage} editMessage={editMessage} updateSend={updateSend}/>
        }
      </>

      }
      
    </>
  )
}

export const RenderSystemMessage = (props) => {
  let colorScheme = useColorScheme();
  return (
    <View style={{margin:'auto'}}>
      <Text style={{color: colorScheme=='light'?'rgb(135,135,135)':'rgb(190,190,190)', marginVertical:15, flexShrink:1, fontSize: 13}}>{props.currentMessage.text}</Text>
    </View>
  )
}


export default function ChatScreen({navigation}){

    const colorScheme = useColorScheme();
    let {channel,setChannel, ask, setAsk, socket, impMessageRemove, setImpMessageRemoved} = useChannelSet();
    let [messages,setMessages] = useState([]);
    let user = useSelector(state=>state.user.value);
    let {contacts} = useSelector(state=>state.contacts.value);
    let [displayName, setDisplayName] = useState('');
    let [replying,setReplying] = useState();
    let [editMessage,setEditMessage] = useState({state:false,message:null});
    let [impMessages,setImpMessages] = useState([]);
    let [emojiPicker,setEmojiPicker] = useState(false);
    let [msgToReact,setMsgToReact] = useState();
    let [msgInFocus,setMsgInFocus] = useState();
    let [isMenuVisible,setIsMenuVisible] = useState(false);
    let [seen, setSeen] = useState([]);
    let [last_seen, setLastSeen] = useState();
    let [loading, setLoading] = useState(false);
    let [hasMore, setHasMore] = useState(true);
    let [offset, setOffset] = useState(0);
    let [online,setOnline] = useState(false);
    let giftedChatRef = useRef(null);
    const insets = useSafeAreaInsets();

    //Since chat screen opened, read all messages
    useFocusEffect(
      useCallback(()=>{

        console.log('Screen focused, calling useFocusEffect');
        if (messages.length>=1) update_last_message_seen();
        //Call uodate_last_seen here
        // Return a cleanup function that sets read count to 0
        return () => {
          console.log('Cleaning up on focus loss.');
          (
            async function(){
              await read_count_0();
            }
          )();
        };

      },[messages.length])
    )

    //Fetch all messages
    useEffect(()=>{

      if(!channel?.id) return ;
      console.log('Fetching messages on load...u');
      fetchMessages();

    },[channel]);

    //Change the messages array if a message was unimportanted 
    useEffect(()=>{
      if(impMessageRemove){

        let editedMessages = messages.map(i=>{
          if(i._id==impMessageRemove) return {...i, important:false};
          return i;
        });
        setMessages(editedMessages);
        let msgNow = impMessages?.filter(i=>i.important)
        setImpMessages(msgNow);

        setImpMessageRemoved()
      }
    },[impMessageRemove]);

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
      

      socket.on('message received',async (message)=>{

        console.log('socket mila toh sahi...message ka...\n\n')
        if(!channel||(channel?.id!=message.chat.id)){
          //notification given
        }
        
        else {
          console.log('andar bhi aa gaya...\n\n')
          let myMsg = {
            ...message,
            _id:message.id,
            received:false,
            user:{_id:message.sender.id,name:message.sender.name,avatar:message.sender.avatar, phone:message.sender.phone}
          }

          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setMessages((prevMessages)=>{
            if(prevMessages[0]?._id!=myMsg._id){
              return GiftedChat.append(prevMessages,[myMsg])
            }
            return prevMessages
          });

        }

      });


      socket.on('edit this message',async (message)=>{

        console.log(message,'...edited message socket mein...\n\n')
        if(!channel||(channel?.id!=message.chat.id)){

          //notification given

        } else {

            let myMsg = {
              ...message,
              _id:message.id,
              user:{_id:message.sender.id,name:message.sender.name,avatar:message.sender.avatar, phone:message.sender.phone},
            }        

            //Have UI update itself
            // let newMessages = [...impMessages,message];
            // setImpMessages(newMessages)
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages((prevMessages)=>{
              let newMessages = prevMessages?.map(i=>{
                if(i._id==message.id) return myMsg;
                return i
              })
              return GiftedChat.append(undefined, newMessages)
            });


        }
        if(message.chat.latest_message==message.id) setAsk(!ask)
      });

      socket.on('message reacted to', async (message)=>{

        console.log('message reacted to socket ...\n\n')
        if(!channel||(channel?.id!=message.chat.id)){

          //notification given

        } else {

            let myMsg = {
              ...message,
              user:{_id:message.sender.id,name:message.sender.name,avatar:message.sender.avatar, phone:message.sender.phone},
            }
            setImpMessages(prevImpMessages=>{
              return [...prevImpMessages,myMsg]
            })
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages((prevMessages)=>{
              let newMessages = prevMessages?.map(i=>{
                if(i._id==message._id) return myMsg;
                return i
              })

              return GiftedChat.append(undefined, newMessages)
            });

          }
      });

      socket.on('message deleted',async (message)=>{

        console.log('message deleted socket mein')
        if(!channel||(channel?.id!=message.chat.id)){

          //notification not to be given here !!!!

        } else {

            console.log('aaye...message deleted mein \n\n')
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages((prevMessages)=>{
              let newMessages = prevMessages?.filter(i=>{
                if(i._id==message.id) return false;
                return true
              })
              return GiftedChat.append(undefined, newMessages)
            });
      
            
        }
        if(message.was_changed) setAsk(!ask)
      })

      socket.on('user-status-update', (data) => {
        console.log('hjbh...\n\n')
        const { userId, is_online, last_seen } = data;
        if(!channel?.isGroupChat){
          if(userId==channel?.otherUsers.user_id){
            setOnline(is_online)
            setLastSeen(last_seen)
          }
        }
      });


      socket.on('updated last seen',async (props)=>{
        console.log('updated last seen socket mein...\n')

        await fetch_last_seen();

        setImpMessages(old=>[...old,{seen:true}]);
        setMessages(prev=>{
          let app = prev.map(i=>({...i, text:i.text+' '}))
          return GiftedChat.append(undefined,app)
        });
        
        
      })


    },[channel]);

    //Fetching messages by pagination - 100 at a time (hard-coded at backend)
    const fetchMessages = async () => {

      if ((!hasMore || loading)) return;

      setLoading(true)
      try{
          let reply = await fetch(`http://216.126.78.3:8500/api/getmessages/${channel?.id}?limit=${LIMIT}&offset=${offset}`,{
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
              setSeen(channel?.otherUsers);

              console.log(response.data.length)
              //Correcting some system messages
              let corrected_system_messages = response.data.map(i=>{

                if(i.system){
                  const match = i.text.match(/^added (\+\d+)$/);
                  if (match) {
                    let phoneNumber = match[1]; // Extract the phone number from the message
                    
                    // Check if the phone number is in the contacts
                    let sender = i.user;
                    let sender_found;
                    let added_found;

                    if(sender.id==user.data.id) {
                        sender = 'You';
                        sender_found=true;
                    } 
                    if(phoneNumber==user.data.phone){
                        phoneNumber = 'You';
                        added_found=true;
                    }
                    if(!sender_found||!added_found){
                        for (let i of contacts){
                            if((i.server_info?.id==sender.id) && !sender_found){
                                sender_found=true;
                                sender = i.item.name;
                            }
                            if((i.server_info?.phone==phoneNumber)&&!added_found){
                                added_found=true;
                                phoneNumber = i.item.name
                            }
                        }
                        if(!sender_found) sender = sender.phone
                    }
                    let text = `${sender} added ${phoneNumber}`
                    i.text=text
                  }
                  
                  let pattern = /^\+?\d+\s+has\s+been\s+removed$/;
                  if (pattern.test(i.text)) {
                    const phoneNumber = i.text.split(" has been removed")[0].trim();
                    
                    // Check if the phone number is in the contacts 
                    if(phoneNumber==user.data.phone){
                        i.text='You were removed'
                    }
                    else{
                      for (let c of contacts){
                          if(c.server_info?.phone==phoneNumber){
                            i.text=`${c.item.name} was removed`;
                            break;
                          }
                      }
                    }
                  }
                  let pattern2 = /^\+?\d+\s+exited\s+the\s+group$/;
                  if (pattern2.test(i.text)) {
                    const phoneNumber = i.text.split(" exited the group")[0].trim();
                    
                    // Check if the phone number is in the contacts 
                    if(phoneNumber==user.data.phone){
                        i.text='You exited the group'
                    }
                    else{
                      for (let c of contacts){
                          if(c.server_info?.phone==phoneNumber){
                            i.text=`${c.item.name} exited the group`;
                            break;
                          }
                      }
                    }
                  }
                  let pattern3 = /^\+?\d+\s+is\s+now\s+an\s+admin$/;
                  if (pattern3.test(i.text)) {
                    const phoneNumber = i.text.split(" is now an admin")[0].trim();
                    
                    // Check if the phone number is in the contacts 
                    if(phoneNumber==user.data.phone){
                        i.text='You are now an admin'
                    }
                    else{
                      for (let c of contacts){
                          if(c.server_info?.phone==phoneNumber){
                            i.text=`${c.item.name} is now an admin`;
                            break;
                          }
                      }
                    }
                  }
                  let pattern4 = /^\+?\d+\s+is\s+no\s+longer\s+an\s+admin$/;
                  if (pattern4.test(i.text)) {
                    const phoneNumber = i.text.split(" is no longer an admin")[0].trim();
                    
                    // Check if the phone number is in the contacts 
                    if(phoneNumber==user.data.phone){
                        i.text='You are no longer an admin'
                    }
                    else{
                      for (let c of contacts){
                          if(c.server_info?.phone==phoneNumber){
                            i.text=`${c.item.name} is no longer an admin`;
                            break;
                          }
                      }
                    }
                  }
                }
                return i;
              });

              setMessages(prev=>[...prev,...corrected_system_messages])
              
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

    async function update_last_message_seen(){ 

      if(messages.length<1) return;

      let reply = await fetch(`http://216.126.78.3:8500/api/update/seen/`,{
        method:'POST',
        headers:{
          'Content-type':'application/json',
          'Authorization':`Bearer ${user.token}`
        },
        body:JSON.stringify({message:messages[0]})
      });
      let response = await reply.json();
      
      // Emit socket info for last seen change
      socket.emit('Last Seen Change',channel);
    }

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

    async function read_count_0(){
      try{

        let reply = await fetch(`http://216.126.78.3:8500/api/read/messages/${channel?.chat_member?.id}`, {
              method:'GET',
              headers:{
                'Content-type':'application/json',
                'Authorization':`Bearer ${user.token}`
              }
            });
      }catch(err){
        console.log(err,'Error in setting read count to 0.....\n\n')
      }
    }


    const checkInContacts = useCallback((obj)=>{

      if (obj?.id==user.data.id || obj?._id==user.data.id) {
        return `${user.data.firstName+" "+user.data.lastName} (Myself)`
      } else {
        let name = obj?.phone;
        if(!(!contacts||contacts.length==0)) {
            for (let i of contacts){
                if(!i.isRegistered) continue;
                
                if(i.server_info.id==obj?.id||i.server_info.id==obj?._id){
                    name = (i.item?.firstName?i.item.firstName:'') + (i.item?.lastName?i.item.lastName:'')
                }
            }
        }
        return name
      }

    },[contacts,channel,user])

    //Sending a message
    const onSend = useCallback(async (msg) =>{

      try{

        let myMsg = {
          ...msg,
          chat_id:channel?.id,
          createdAt: Date.parse(msg.createdAt),
          forwarded:false       
        }

        if(replying) {
          myMsg = {
            ...myMsg,
            replyTo:{
              ...replying,
              id:replying._id,
              user:{
                _id:replying.user._id,
                name:replying.user.name
              }
            }
          }
        }

        //To smoothen out adding a new message to the view using RN's module LayoutAnimation
        

        if(msg.file_path){
          let form = new FormData();

          form.append('text',myMsg.text);
          form.append('chat_id',myMsg.chat_id);
          form.append('isAttachment',myMsg.isAttachment);
          form.append('createdAt',myMsg.createdAt);
          form.append('type',myMsg.type);
          form.append('forwarded',false);

          if(replying) form.append('replying',replying._id)
          else{
            form.append('replying',null)
          }
          myMsg.additionalInfo.name = myMsg.additionalInfo.fileName||myMsg.additionalInfo.name;
          console.log({uri:myMsg.file_path,type:myMsg.additionalInfo.mimeType,name:`${myMsg.additionalInfo.fileName||myMsg.additionalInfo.name}-${new Date().getTime()}`},'...facts spit...\n\n')
          form.append('file',{uri:myMsg.file_path,type:myMsg.additionalInfo.mimeType,name:myMsg.additionalInfo.fileName||myMsg.additionalInfo.name});

          let reply = await fetch('http://216.126.78.3:8500/api/new/message/attachment',{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`
            },
            body:form
          });
          let response = await reply.json();
          
          setReplying();

          if(response.success){
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages((prevMessages)=>GiftedChat.append(prevMessages, [{...myMsg,_id:response.data.id}]))
            if(!channel?.isSelfChat) socket.emit('new message',response.data)
          } else {
            return Alert.alert('There was an error sending this file, try again or contact support')
          }
          

        }
        else {
          
          if(replying) myMsg={...myMsg, replyTo:replying._id};

          let url = 'http://216.126.78.3:8500/api/new/message'
          let reply = await fetch(url,{
              method:'POST',
              headers:{
                  'Content-type':'application/json',
                  'Authorization':`Bearer ${user.token}`
              },
              body:JSON.stringify({...myMsg})
          });
          let response = await reply.json();

          if(replying) myMsg={...myMsg, replyTo:{
            ...replying,
            id:replying._id,
            user:{
              _id:replying.user._id,
              name:replying.user.name
            }
          }};
          // Set replying back to none....
          setReplying();

          if(response.success){
            let {additionalInfo, type, isAttachment} = response.data
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages((prevMessages)=>GiftedChat.append(prevMessages, [{...myMsg,_id:response.data.id, additionalInfo, type, isAttachment}]))
            if(!channel?.isSelfChat) socket.emit('new message',response.data)
          } else {
            return Alert.alert('There was an error sending this message, try again or contact support')
          }
          
        }
        setAsk(!ask);
      }catch(err){
          console.log(err,'Error in sending messages.....\n\n')
      }
  
    },[channel, replying]) ;

    //Edit a message
    const updateSend = async (msg)=>{

      try{

        let myMsg = {...msg};
        if(replying){
          myMsg = {
            ...myMsg,
            replyTo:{
              ...replying,
              id:replying._id,
              user:{
                _id:replying.user._id,
                name:replying.user.name
              }
            }
          }
        }

        let editedMessages = messages.map(i=>{
          
          if(i._id==myMsg._id) {return myMsg}
          return i;
        });

        setMessages(editedMessages)
        setEditMessage({message:null,state:false})

        //Call backend 
        let reply = await fetch(`http://216.126.78.3:8500/api/edit/${myMsg._id}`,{
          method:'POST',
          headers:{
            'Content-type':'application/json',
            'Authorization':`Bearer ${user.token}`
          },
          body:JSON.stringify(myMsg)
        });
        let response = await reply.json();

        console.log(response.data,'...dont be shy...\n\n')
        //Generate Socket info to the other end
        socket.emit('Edited Message',response.data);
        setReplying();
        setAsk(!ask);

      }catch(err){
        console.log(err,'Error in editing messages.....\n\n');
      }
    }

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
          let reply = await fetch(`http://216.126.78.3:8500/api/unimportant/${myMsg._id}`,{
            method:'GET',
            headers:{
              'Content-type':'application/json',
              'Authorization':`Bearer ${user.token}`
            }
          });
          let response = await reply.json();
          console.log(response,'...unimp...\n\n')
        }
      }catch(err){
        console.log(err,'Error in importifying messages.....\n\n');
      }
    }

    //Delete messages
    const deleteMessage =  useCallback(async (msg,audience)=>{
      
      if(audience=='me'){
        let new_messages = messages.filter(i=>i._id!=msg._id)
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(new_messages);
        
        // Make API call
        let reply = await fetch(`http://216.126.78.3:8500/api/delete/me/${msg._id}`,{
          headers:{
            'Authorization':`Bearer ${user.token}`
          }
        });
        let response = await reply.json();
        

      }else{

        let new_messages = messages.filter(i=>i._id!=msg._id)
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(new_messages);
        
        
        let reply = await fetch(`http://216.126.78.3:8500/api/delete/all/${msg._id}`,{
          method:'POST',
          headers:{
            'Content-type':'application/json',
            'Authorization':`Bearer ${user.token}`
          },
          body:JSON.stringify(msg)
        });
        let response = await reply.json();

        //Generate Socket Response to edit on the other side too
        socket.emit('Delete message for all',response.data)
        
      }
      setAsk(!ask)
    },[messages,channel])

    //Add Reactions to a message
    let addReaction = useCallback(async (msg,reaction) => {

      if(msg.reactions){
        let reactions = msg.reactions.filter(i=>{
          if(i.user.id==user.data.id) return false;
          return true;
        })
        reactions = [...reactions,{reaction, user:{name:user.data.firstName+" "+user.data.lastName,id:user.data.id,phone:user.data.phone,image:user.data.image}}]
        msg = {...msg, text:msg.text+" ",reactions};
      }
      else msg = {...msg, reactions:[{reaction, user:{name:user.data.firstName+" "+user.data.lastName,id:user.data.id,phone:user.data.phone,image:user.data.image}}], text:msg.text+" "};

      let editedMessages = messages.map(i=>{
        if(i._id==msg._id) return msg;
        return i;
      });


      //Have UI update itself
      let newMessages = [...impMessages,msg]
      setImpMessages(newMessages)
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages(editedMessages);
      setMsgToReact(null)
      
      // Make API Call
      let reply = await fetch(`http://216.126.78.3:8500/api/add/reaction/${msg._id}`,{
                    method:'POST',
                    headers:{
                      'Content-type':'application/json',
                      'Authorization':`Bearer ${user.token}`
                    },
                    body:JSON.stringify(msg)
                  });
      let response = await reply.json();

      console.log(response.data,'...love...\n\n')
      
      //socket send
      socket.emit('Message Reacted',response.data);


    },[messages,channel, msgToReact])

    const removeReaction = async () => {

      let msg;
      let reactions = msgInFocus.reactions.filter(a=>a.user.id!=user.data.id);

      if(reactions.length>=1) msg = {...msgInFocus, reactions, text:msgInFocus.text+" "};
      else msg = {...msgInFocus,text:msgInFocus.text+" ", reactions:null};

      let editedMessages = messages.map(i=>{
        if(i._id==msgInFocus._id) return msg;
        return i;
      })
      //Have UI update itself
      let newMessages = [msg];
      setImpMessages(newMessages)
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages(editedMessages);
      setIsMenuVisible(false);
      setMsgInFocus(null);
      
      // Make API Call
      let reply = await fetch(`http://216.126.78.3:8500/api/remove/reaction`,{
                    method:'POST',
                    headers:{
                      'Content-type':'application/json',
                      'Authorization':`Bearer ${user.token}`
                    },
                    body:JSON.stringify(msg)
                  });
      let response = await reply.json();
      
      // socket send
      socket.emit('Message Removed Reaction',response.data);
    }

    const { startCall, setType } = useRTC();

    const createCall = useCallback(async (type) => {
      if (!channel || channel.isGroupChat || channel.isSelfChat) {
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
    }, [channel, user, startCall, setType]);


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
                              <TouchableOpacity onPress={()=>{navigation.pop(); setChannel(null);}} style={{marginHorizontal:10}}><Entypo name="chevron-left" size={34} color="white" /></TouchableOpacity>
                              <TouchableOpacity style={{flexDirection:'row'}} onPress={channel?.isGroupChat?()=>navigation.navigate('Contact Info'):(!channel?.isSelfChat? ()=>navigation.navigate('Contact Info'):()=>navigation.navigate('Self Chat Info'))}>
                                  <View style={styles.pp}>
                                      <Image style={styles.image} source={{uri:channel?.isGroupChat?channel?.avatar:(!channel?.isSelfChat?(channel?.otherUsers?.user?.avatar):user.data.image)}}></Image>
                                  </View>
                                  <View style={{alignItems:'flex-start',justifyContent:'center',paddingHorizontal:10, width:'80%'}}>
                                      <Text numberOfLines={1} ellipsizeMode="tail" style={{color:'white',fontWeight:'bold',marginBottom:4}}>
                                          {displayName}
                                      </Text>
                                      <Text style={{color:'white'}}>

                                        {(channel?.isGroupChat||channel?.isSelfChat) ?
                                        'Tap to learn more'
                                        :
                                          <>
                                            {channel?.otherUsers?.user?.additional_user_details?.is_seen_enabled && user?.data?.is_seen_enabled ?
                                              <>
                                                {online ? 
                                                  'online'
                                                :
                                                  `last seen ${getTime(channel?.otherUsers?.user?.additional_user_details?.last_seen)}`
                                                }
                                              </>
                                              
                                            :
                                              ''
                                            }
                                          </>
                                        }
                                        
                                      </Text>
                                  </View>
                              </TouchableOpacity>
                          </View>
                          <View style={{flexDirection:'row', width:'35%'}}>
                              {!channel?.isSelfChat&&!channel?.chat_member?.group_ousted&&!channel?.chat_member?.blocked_chat&&<TouchableOpacity onPress={createCall.bind(null,'audio')}><Ionicons name="call-outline" size={30} color="rgb(251,138,57)" style={{marginHorizontal:30}}/></TouchableOpacity>}
                              {!channel?.isSelfChat&&!channel?.chat_member?.group_ousted&&!channel?.chat_member?.blocked_chat&&<TouchableOpacity onPress={createCall.bind(null,'video')}><Ionicons name="videocam-outline" size={30} color="rgb(251,138,57)" style={{marginRight:20}}/></TouchableOpacity>}
                          </View>
                      </View> 
                  </ImageBackground>
                </View>
                <View style={{backgroundColor:colorScheme=='light'?'rgb(255,255,255)':'rgb(41,44,54)', flex:1}}>
                  {channel ? 
                  <GiftedChat 
                  messageContainerRef={giftedChatRef}
                  showAvatarForEveryMessage={true}
                  messages={messages}
                  extraData={{impMessages}}
                  shouldUpdateMessage={(props,nextProps)=>((props.extraData.impMessages!=nextProps.extraData.impMessages) || seen.length!=0)}
                  user={{
                    _id:parseInt(user.data.id),
                    avatar:user.data.image,

                  }}
                  renderBubble={(props)=><RenderBubble {...props} setReplying={setReplying} replying={replying} scrollToMessage={scrollToMessage} navigation={navigation} setEditMessage={setEditMessage} markMessageImportant={markMessageImportant} deleteMessage={deleteMessage} addReaction={addReaction} setEmojiPicker={setEmojiPicker} setMsgToReact={setMsgToReact} setIsMenuVisible={setIsMenuVisible} giftedChatRef={giftedChatRef} setMsgInFocus={setMsgInFocus} seen={seen} channel={channel}/>}
                  renderInputToolbar={(props)=><CustomInput props={props} onSend={onSend} setEditMessage={setEditMessage} editMessage={editMessage} updateSend={updateSend}/>}
                  minInputToolbarHeight={editMessage.state?110:70}
                  renderUsernameOnMessage={channel?.isGroupChat?true:false}
                  renderSystemMessage={props=><RenderSystemMessage {...props}/>}
                  renderFooter={()=><View style={{paddingVertical:Platform.OS === 'ios' ? Math.max(insets.bottom, 15) : 15}}></View>}
                  renderChatFooter={props=><RenderChatFooter {...props} setReplying={setReplying} replying={replying} checkInContacts={checkInContacts} inputToolbarHeight={editMessage.state?110:70}/>}
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
                    keyboardShouldPersistTaps: 'handled',
                    keyboardDismissMode: 'interactive',
                  }}
                  keyboardShouldPersistTaps="handled"
                  keyboardAvoidingViewProps={{
                    keyboardVerticalOffset: Platform.OS === 'ios' ? (STATUSBAR_HEIGHT || 0) + (insets.top || 0) + 100 : 0,
                    behavior: Platform.OS === 'ios' ? 'padding' : undefined,
                  }}
                
                />
                  :
                  <></>
                  }
                  
                  <EmojiPicker 
                    open={emojiPicker} 
                    onClose={()=>{setEmojiPicker(false)}} onEmojiSelected={(emoji)=>{console.log(emoji); addReaction(msgToReact,emoji.emoji)}}
                    enableSearchBar
                    enableRecentlyUsed
                    theme={colorScheme=='light'?{}:{
                      backdrop: '#16161888',
                      knob: '#766dfc',
                      container: '#282829',
                      header: '#fff',
                      skinTonesContainer: '#252427',
                      category: {
                        icon: '#766dfc',
                        iconActive: '#fff',
                        container: '#252427',
                        containerActive: '#766dfc',
                      },
                      search:{
                        text:'#fff',
                        placeholder:'grey'
                      }
                    }}
                  />
                </View>
               
              </View>

              <Modal animationType='slide' visible={isMenuVisible} transparent={true}>
                <OverlayReactions onClose={()=>{setIsMenuVisible(false);setMsgInFocus(null);}} removeReaction={removeReaction} setMsgInFocus={setMsgInFocus} msgInFocus={msgInFocus}/>
              </Modal>
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
  },
  container:{
    borderTopWidth: 1,
    borderTopColor: 'rgb(235,235,235)',
    backgroundColor: 'rgb(255,255,255)',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop:7,
    flexDirection:'row',
    alignItems:'center',
    paddingBottom:15,
  }
})