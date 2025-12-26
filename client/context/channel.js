import { createContext, useContext, useEffect, useState, useRef} from 'react';
import { Platform, AppState, UIManager, LayoutAnimation} from 'react-native'
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { BASE_URL } from '../services/baseURL';
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";


const ENDPOINT = 'http://216.126.78.3:8500/chats';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ChannelContext = createContext({
  channel: null,
  setChannel: () => {},
});




export function useChannelSet() {
  return useContext(ChannelContext);
}



export function ChannelProvider(props) {

  Notifications.setNotificationHandler({
    
  });

  let user = useSelector(state=>state.user.value);
  let [socket,setSocket] = useState(io(ENDPOINT));
  let [chats,setChats] = useState([]);
  let [hidden_chats,setHiddenChats] = useState([]);
  let [archived_chats, setArchivedChats] = useState([]);
  let [social_chats, setSocialChats] = useState([]);
  let [unknown_chats, setUnknownChats] = useState([]);
  let [channel_chats,setChannelChats]=useState([]);
  let [ask,setAsk] = useState(false);
  const [channel, setChannel] = useState(null);
  const [social_channel, setSocialChannel] = useState(null);
  const [chat_type, setChatType] = useState('personal');
  const [bchannel,setBChannel] = useState(null);
  let [impMessageRemove, setImpMessageRemoved] = useState();
  let [blockedUsers, setBlockedUsers] = useState([]);

  let [pathToChat,setPathToChat] = useState()
  //For handling notifications
  const [expoPushToken, setExpoPushToken] = useState();
  const [notification, setNotification] = useState();
  const notificationListener = useRef();
  const responseListener = useRef();
  const appState = useRef(AppState.currentState);


  useEffect(()=>{

    if(!channel){
      socket.off('message received');
      socket.off('edit this message');
      socket.off('message reacted to');
      socket.off('updated last seen');
      socket.off('message deleted');
      socket.off('updated poll vote');
      socket.off('switch chat screen mode');
      socket.off('OTV Image or Video Msg Updated');

    }
  },[channel])
  // For notifications
  useEffect(()=>{
    if(!user?.data) return;

    //Related to sockets
    socket.emit('setup',parseInt(user?.data?.id));
    socket.on('connected user to socket',()=>{
        console.log('channel ke andar wala connection...\n\n')
    });
    socket.on('new chat coming',(chat)=>{ 
      // console.log("setChats setChats 6")

      setChats(allChats=>{
        console.log(chat,'...new dual chat appended ', allChats.length)
        return [chat,...allChats]
      })

    });
    socket.on('new group chat coming',(chat)=>{
      const chatStatus = chat?.chat_member?.status;
      const chatId = chat?.id;
    
      console.log("Chat Status:", chatStatus);
      console.log("Chat ID:", chatId);
    
      switch (chatStatus) {
        case 'personal':
          console.log("Processing personal chat status");
          setChats((prevChats) => {
            // Remove the old chat (if any) and add the new one at the start
            let newChats = prevChats.filter((i) => i.id !== chat.id);
            return [chat, ...newChats]; // Add the chat at the beginning
          });
          break;
    
        case 'hidden':
          console.log("Processing hidden chat status");
          setHiddenChats((prevChats) => {
            // Filter and add the new chat at the start
            let newHiddenChats = prevChats.filter((i) => i.id !== chat.id);
            return [chat, ...newHiddenChats];
          });
          break;
    
        case 'archived':
          console.log("Processing archived chat status");
          setArchivedChats((prevChats) => {
            // Filter and add the new chat at the start
            let newArchivedChats = prevChats.filter((i) => i.id !== chat.id);
            return [chat, ...newArchivedChats];
          });
          break;
    
        case 'unknown':
          console.log("Processing unknown chat status");
          setUnknownChats((prevChats) => {
            // Filter and add the new chat at the start
            let newUnknownChats = prevChats.filter((i) => i.id !== chat.id);
            return [chat, ...newUnknownChats];
          });
          break;
    
        default:
          console.error("No matching chat status:", chatStatus);
      }


      if(channel?.id==chat.id){
        setChannel(prev=>({...prev,...chat}))
      }
      
    });
     
    socket.on('member removed, update', async(chat) => {
      if(chat.chat_member?.status=='hidden'){
        setHiddenChats(allChats=>{
          let newChats = allChats.filter(i=>i.id!=chat.id)
          return [chat, ...newChats]
        });
      } 
      else{
        if(chat.chat_member?.status=='archived'){
          setArchivedChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }else if(chat.chat_member?.status=='social'){
          setSocialChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }else if(chat.chat_member?.status=='unknown'){
          setUnknownChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }else if(chat.chat_member?.status=='channel'){ 
          setChannelChats(allChats=>{  
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats] 
          })
        }
        else{
          // console.log("setChats setChats 1")
          setChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }
      }

      if(channel?.id==chat.id){
        setChannel(prev=>({...prev,...chat}))
      }
    });

    socket.on('become channel admin',async(chat)=>{
      setChannelChats(allChats=>{  
        let newChats = allChats.filter(i=>i.id!=chat.id)
        return [chat, ...newChats] 
      });

      if(channel?.id==chat.id){
        setChannel(prev=>({...prev,...chat}))
      }
    })

    socket.on('member exited, update', async(chat) => {
      if(chat.chat_member?.status=='hidden'){
        setHiddenChats(allChats=>{
          let newChats = allChats.filter(i=>i.id!=chat.id)
          return [chat, ...newChats]
        });
      } 
      else{
        if(chat.chat_member?.status=='archived'){
          setArchivedChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }else if(chat.chat_member?.status=='social'){
          setSocialChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }else if(chat.chat_member?.status=='unknown'){
          setUnknownChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }else if(chat.chat_member?.status=='channel'){
          setChannelChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }
        else{
          // console.log("setChats setChats 2")

          setChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }
      }

      if(channel?.id==chat.id){
        setChannel(prev=>({...prev,...chat}))
      }
    })

    socket.on('admin added, update', async(chat) => {
      if(chat.chat_member?.status=='hidden'){
        setHiddenChats(allChats=>{
          let newChats = allChats.filter(i=>i.id!=chat.id)
          return [chat, ...newChats]
        });
      } 
      else{
        if(chat.chat_member?.status=='archived'){
          setArchivedChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }
        if(chat.chat_member?.status=='social'){
          setSocialChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }
        if(chat.chat_member?.status=='unknown'){
          setUnknownChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }
        if(chat.chat_member?.status=='channel'){
          setChannelChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }
        else{
          // console.log("setChats setChats 4")

          setChats(allChats=>{
            let newChats = allChats.filter(i=>i.id!=chat.id)
            return [chat, ...newChats]
          })
        }
      }

      if(channel?.id==chat.id){
        setChannel(prev=>({...prev,...chat}))
      }
    })

    socket.on('Last Message Change',async (message) => {

      let {id,text,isFile,sender,createdAt,additionalInfo,pollOptions,pollVotes,pollLength,allowMultipleAnswers} = message;

      // console.log(message.chat?.chat_member,user?.data.id,'...sandhua.,..\n\n')

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      if(message.chat?.chat_member?.status=='hidden'){

        setHiddenChats(allChats=>{
          let newChats = allChats.map(i=>{
              if(i?.id==message.chat.id){
                  i.lastMessage={chat_id:message.chat.id,id,text,isFile,sender,createdAt,additionalInfo,pollOptions,pollVotes,pollLength,allowMultipleAnswers};
                  i.chat_member=message.chat?.chat_member;
              }
              return i;
          });
          // newChats=newChats.filter(i=>i!=null&&i!={})
          newChats.sort((a,b)=>{
              //Directly compare the timestamp
              return b?.lastMessage?.createdAt?.localeCompare(a?.lastMessage?.createdAt);
          });

          return newChats;
        });
      }
      
      else {
          if(message.chat?.chat_member?.status=='archived'){
              setArchivedChats(allChats=>{
                  let newChats = allChats.map(i=>{
                      if(i?.id==message.chat.id){
                        i.lastMessage={chat_id:message.chat.id,id,text,isFile,sender,createdAt, additionalInfo,pollOptions,pollVotes,pollLength,allowMultipleAnswers}
                        i.chat_member=message.chat?.chat_member;
                      }
                      return i;
                  });
                  // newChats=newChats.filter(i=>i!=null&&i!={})
                  newChats.sort((a,b)=>{
                      //Directly compare the timestamp
                      return b?.lastMessage?.createdAt?.localeCompare(a?.lastMessage?.createdAt);
                  });
    
                  return newChats;
              })
          } 
          if(message.chat?.chat_member?.status=='social'){
              setSocialChats(allChats=>{
                  let newChats = allChats.map(i=>{
                      if(i?.id==message.chat.id){
                        i.lastMessage={chat_id:message.chat.id,id,text,isFile,sender,createdAt, additionalInfo,pollOptions,pollVotes,pollLength,allowMultipleAnswers}
                        i.chat_member=message.chat?.chat_member;
                      }
                      return i;
                  });
                  // newChats=newChats.filter(i=>i!=null&&i!={})
                  newChats.sort((a,b)=>{
                      //Directly compare the timestamp
                      return b?.lastMessage?.createdAt?.localeCompare(a?.lastMessage?.createdAt);
                  });
    
                  return newChats;
              })
          } 
          if(message.chat?.chat_member?.status=='unknown'){
              setUnknownChats(allChats=>{
                  let newChats = allChats.map(i=>{
                      if(i?.id==message.chat.id){
                        i.lastMessage={chat_id:message.chat.id,id,text,isFile,sender,createdAt, additionalInfo,pollOptions,pollVotes,pollLength,allowMultipleAnswers}
                        i.chat_member=message.chat?.chat_member;
                      }
                      return i;
                  });
                  // newChats=newChats.filter(i=>i!=null&&i!={})
                  newChats.sort((a,b)=>{
                      //Directly compare the timestamp
                      return b?.lastMessage?.createdAt?.localeCompare(a?.lastMessage?.createdAt);
                  });
    
                  return newChats;
              })
          } 
           // if(message.chat?.chat_member?.status=='channel'){
          //   setChannelChats(allChats=>{
          //       let newChats = allChats.map(i=>{
          //           if(i?.id==message.chat.id){
          //               i.lastMessage={chat_id:message.chat.id,id,text,isFile,sender,createdAt, additionalInfo,pollOptions,pollVotes,pollLength,allowMultipleAnswers}
          //               i.chat_member=message.chat?.chat_member;
          //           }
          //           return i;
          //       }); 
          //       // newChats=newChats.filter(i=>i!=null&&i!={})
          //       newChats.sort((a,b)=>{
          //           //Directly compare the timestamp
          //           return b.lastMessage.createdAt.localeCompare(a.lastMessage?.createdAt);
          //       });
  
          //       return newChats;
          //   })
          //  } 
          else{
          // console.log("setChats setChats 5")

              setChats(allChats=>{

                  let newChats = allChats.map(i=>{
                      if(i?.id==message.chat.id){
                        i.lastMessage={chat_id:message.chat.id,id,text,isFile,sender,createdAt, additionalInfo,pollOptions,pollVotes,pollLength,allowMultipleAnswers}
                        i.chat_member=message.chat?.chat_member;
                      }
                      return i;
                  });
                  // newChats=newChats.filter(i=>i!=null&&i!={})
                  newChats.sort((a,b)=>{
                      // Directly compare the timestamp
                      return b?.lastMessage?.createdAt?.localeCompare(a?.lastMessage?.createdAt);
                  });
    
                  return newChats;
              });
          }
          
      }
    })

    socket.on('switch chat mode', (newChatMode) => {
      if (!channel || channel?.id !== newChatMode.chat.id) {
        console.log("✅ Chat is different from current channel, proceeding with update...");
    
        const updatedChatId = newChatMode.chat.id;
        const newIsGhostMode = newChatMode.chat.isGhostMode;
        const chatStatus = newChatMode.chat.chat_member.status;
    
        const updateGhostModeOnly = (chatsStateSetter) => {
          chatsStateSetter(prevChats => {
            const chatExists = prevChats.find(chat => chat.id === updatedChatId);
            if (!chatExists) {
              console.log("🔍 Chat not found in current state, skipping update.");
              return prevChats;
            }
    
            return prevChats.map(chat => {
              if (chat.id === updatedChatId) {
                return {
                  ...chat,
                  isGhostMode: newIsGhostMode,
                };
              }
              return chat;
            });
          });
        };
    
        switch (chatStatus) {
          case 'personal':
            console.log("👤 Updating isGhostMode in personal chats");
            updateGhostModeOnly(setChats);
            break;
    
          case 'hidden':
            console.log("🙈 Updating isGhostMode in hidden chats");
            updateGhostModeOnly(setHiddenChats);
            break;
    
          case 'archived':
            console.log("📦 Updating isGhostMode in archived chats");
            updateGhostModeOnly(setArchivedChats);
            break;
    
          case 'unknown':
            console.log("❓ Updating isGhostMode in unknown chats");
            updateGhostModeOnly(setUnknownChats);
            break;
    
          default:
            console.error("🚨 No matching chat status:", chatStatus);
        }
    
        console.log("✅ Ghost mode update completed.");
      } else {
        console.log("⚠️ Channel matches the incoming chat, no update needed.");
      }
    });

    socket.on('updated admin controls', (chatData) => {
      console.log("chatData", chatData)
      console.log("chatData chatData.id == channel.id, user.data.id", chatData.id == channel.id, user.data.id)
      if(chatData.id == channel.id){
        // ! CHANNEL IS UPDATED BUT IT IS STILL TAKING PREVIOUS VALUES (DON'T KNOW WHY) only for the Admin who applied these changes rest for everyone this gets updated successfully
        setChannel((prevChannel) => ({
          ...prevChannel,
          isReviewMessages: chatData.isReviewMessages,
          isSlowMode: chatData.isSlowMode,
          slowModeNumberOfMsg: chatData.slowModeNumberOfMsg,
          slowModeDuration: chatData.slowModeDuration,
          allowMessagesFromNewUsers: chatData.allowMessagesFromNewUsers,
          allowHistoryViewToNewMembers: chatData.allowHistoryViewToNewMembers,
          isScreenShots: chatData.isScreenShots,
          newUserRequest: chatData.newUserRequest,
          isGroupExpiry: chatData.isGroupExpiry,
          groupExpiryDate: chatData.groupExpiryDate,
          joinThroughGroupLink: chatData.joinThroughGroupLink,
      }));
      }else{
        console.log("Updated chat admin controls  in else")
      }

      })
    
    // socket.on('switch chat mode', (newChatMode) => {
    //   // console.log("🛠️ Mode switch triggered:", JSON.stringify(newChatMode?.chat,null,2));
    
    //   if (!channel || channel?.id !== newChatMode.chat.id) {
    //     console.log("✅ Chat is different from current channel, proceeding with update...");
    
    //     const updatedChat = {
    //       ...newChatMode.chat,
    //       isGhostMode: newChatMode.chat.isGhostMode,
    //     };

    //     console.log("updatedChat :::::    ", updatedChat)

    //      // ***** helper function to sort chats *****
    //      const sortChatsByDate = (chatList) => {
    //       return [...chatList].sort((a, b) => {
    //         const dateA = a.lastMessage?.createdAt || a.createdAt;
    //         const dateB = b.lastMessage?.createdAt || b.createdAt;
        
    //         if (!dateA || !dateB) return 0; // fallback if both are missing
    //         return new Date(dateB) - new Date(dateA);
    //       });
    //     };
        
        
    
    //     const chatStatus = newChatMode.chat.chat_member.status;
    //     console.log("📌 Chat status:", chatStatus);
    //     console.log("🔄 Updating chat ID:", updatedChat.id);
    
    //     switch (chatStatus) {
    //       case 'personal':
    //         console.log("👤 Updating in personal chats");
          
    //         // 🔍 Validate incoming chat object
    //         // console.log("🛠️ Updated Chat:", updatedChat);
          
    //         setChats(prevChats => {
    //           const filtered = prevChats.filter(chat => chat.id !== updatedChat.id);
    //           const combined = [...filtered, updatedChat];
          
    //           // console.log("🧪 Combined list before sort:", combined);
          
    //           const sorted = sortChatsByDate(combined);
          
    //           // console.log("📤 Final sorted list:", sorted);
    //           return sorted;
    //         });
    //         break;
          

          
    
    //       case 'hidden':
    //         console.log("🙈 Updating in hidden chats");
    //         setHiddenChats((prevChats) => {
    //           const newHiddenChats = prevChats.filter((chat) => chat.id !== updatedChat.id);

    //           const chatsUpdated = sortChatsByDate([updatedChat, ...newHiddenChats])
    //           return chatsUpdated;
    //         });
    //         break;
    
    //       case 'archived':
    //         console.log("📦 Updating in archived chats");
    //         setArchivedChats((prevChats) => {
    //           const newArchivedChats = prevChats.filter((chat) => chat.id !== updatedChat.id);
    //           const chatsUpdated = sortChatsByDate([updatedChat, ...newArchivedChats])
    //           return chatsUpdated;

    //         });
    //         break;
    
    //       case 'unknown':
    //         console.log("❓ Updating in unknown chats");
    //         setUnknownChats((prevChats) => {
    //           const newUnknownChats = prevChats.filter((chat) => chat.id !== updatedChat.id);
    //           const chatsUpdated = sortChatsByDate([updatedChat, ...newUnknownChats])
    //           return chatsUpdated;
    //         });
    //         break;
    
    //       default:
    //         console.error("🚨 No matching chat status:", chatStatus);
    //     }
    
    //     console.log("✅ Chat mode update completed.");
    //     return;
    //   } else {
    //     console.log("⚠️ Channel matches the incoming chat, no update needed.");
    //   }
    // });
    
    //For handling push notifications
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
    });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
      
        const chat = response.notification.request.content.data.chat;
        let otherUsers = chat.otherUsers
        let chat_member = chat?.chat_member;

        if(otherUsers.length>1){
          setChannel(chat)
        }
        else{
          setChannel({...chat,otherUsers:otherUsers[0],chat_member})
        }
    });

    // AppState change listener
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        socket.emit('user-online',{userId:user.data.id})
      }

      if (nextAppState === 'background') {
        // console.log('App is in the background, showing user offline');
        socket.emit('user-disconnecting',{userId:user?.data?.id});
      }

      appState.current = nextAppState;
    };

    // Listen to app state changes
    AppState.addEventListener('change', handleAppStateChange);

    (
      async function getBlockedUsers(){

        try{

          let reply = await fetch(`${BASE_URL}/get/blocked_users`,{
            headers:{
              'Content-type':'application/json',
              'Authorization':`Bearer ${user.token}`
            }
          });
          let response = await reply.json();

          if(response?.success){
            setBlockedUsers(response?.data)
          }

        }catch(err){
          console.log(err,'Error in fetching blocked users...\n\n')
        }
        
      }
    )();


    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      
    };
    
  },[user])

  //Sockets for joining rooms
  useEffect(()=>{
    for (let i of chats){
      socket.emit('join room', i.id);
      socket.on('connected to rooms',({room})=>{});
    }
    for (let i of archived_chats){
      socket.emit('join room', i.id);
      socket.on('connected to rooms',({room})=>{});
    }
    for (let i of unknown_chats){
      socket.emit('join room', i.id);
      socket.on('connected to rooms',({room})=>{});
    }
    for (let i of social_chats){
      socket.emit('join room', i.id);
      socket.on('connected to rooms',({room})=>{});
    }
    for (let i of hidden_chats){
      socket.emit('join room', i.id);
      socket.on('connected to rooms',({room})=>{});
    }
    for (let i of channel_chats){
      socket.emit('join room', i.id);
      socket.on('connected to rooms',({room})=>{});
    }
  },[chats, archived_chats, hidden_chats])



  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status:existingStatus} =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });

    } else {
      alert("Must be using a physical device for Push notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token.data;
  }

  return (
    <ChannelContext.Provider
      value={{
        socket,
        setSocket,
        impMessageRemove, 
        setImpMessageRemoved,
        channel,
        setChannel,
        ask,
        social_channel, setSocialChannel,
        chat_type, setChatType,
        setAsk,
        bchannel,
        setBChannel,
        chats,
        setChats,
        hidden_chats,
        setHiddenChats,
        archived_chats,
        setArchivedChats,
        unknown_chats,
        setUnknownChats,
        social_chats,
        setSocialChats,
        channel_chats,
        setChannelChats,
        blockedUsers,
        setBlockedUsers,
        pathToChat,
        setPathToChat,
        expoPushToken,
        notification,
        responseListener
      }}
    >
      {props.children}
    </ChannelContext.Provider>
  );
}