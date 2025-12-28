
import React, {useState, useEffect, useCallback, useRef} from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {useSelector, useDispatch} from 'react-redux';
import {StyleSheet, useColorScheme, Alert, Platform, AppState, Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// All Screens needed
import Opening from './Opening'
import Login from './Login'
import SignUp from './Signup';
import Otp from './Otp';
import EditProfile from './Profile/sub-screens/EditProfile';
import SocialProfile from './Posts/sub-screens/SocialProfile';
import Profile from './Profile/index';
import NewChat from './Chats/sub-screens/NewChat';
import Screen1 from './Screen1';
import Screen2 from './Screen2';
import Demo from './Demo';
import NewCall from './Calls/sub-screens/NewCall';
import SearchChat from './Chats/sub-screens/Search';
import ChatScreen from './Chats/sub-screens/ChatScreen';
import ImpMessages from './Chats/sub-screens/ImpMessages';
import CryptoTabNavigator from './Money/sub-crypto';
import VideoCall from './Calls/sub-screens/VideoCall';
import MainTabNavigator from './BottomNavigator';
import ContactInfo from './Chats/sub-screens/ContactInfo';
import BroadcastScreen from './Chats/sub-screens/BroadcastScreen';
import HiddenChats from './Chats/sub-screens/HiddenChats';
import { ContactCard } from './Chats/sub-screens/ContactInfo';
import { ForwardMessage } from './Chats/sub-screens/ChatScreenUtilities';
import ChatSettingsGeneral from './Profile/sub-screens/ChatSettings';
import HelpnSupport from './Profile/sub-screens/HelpnSupport';
import Deactivate from './Profile/sub-screens/Deactivate';
import MediaLinksFiles from './Chats/sub-screens/MediaLinksFiles';
import AccountSettings, {SecuritySettings, EditEmail} from './Profile/sub-screens/AccountSettings';
import { FollowList } from './Posts/sub-screens/FollowList';
import { ChannelProvider, useChannelSet } from '../context/channel';
import RNCallKeep from 'react-native-callkeep';

import { IncomingCall, OutgoingCall} from './Calls/sub-screens/IncomingCall';

import { setContacts } from '../slices/contacts';
import * as Contacts from 'expo-contacts';
import { useRTC } from '../context/rtc';
import ForgotPassword from './ForgotPassword';
import { ListofPosts } from './Posts/sub-screens/ListofPosts';
import { Archived } from './Posts/sub-screens/Archived';
import { Saved } from './Posts/sub-screens/Saved';
import { Search } from './Posts/sub-screens/Search';
import { Interests } from './Posts/sub-screens/Interests';
import { ListofFlix } from './Posts/sub-screens/ListOfFlix';
import { ListofStories } from './Posts/sub-screens/ListOfStories';
import { Notifications } from './Posts/sub-screens/Notifications';
import StoryDisplay from './Posts/sub-screens/StoryContent';
import SelfChatInfo from './Chats/sub-screens/SelfChatInfo';

import ViewBlockedUsers from './Profile/sub-screens/ViewBlockedUsers';
import Screen3 from './Screen3';
import { flushNavQueue, navigate, navigationRef } from '../utils/staticNavigationutils';

const Stack = createNativeStackNavigator();

// const requestPermission = async () => {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     console.log('Authorization status:', authStatus);
//   }
// };

function formatPhoneNumber(phoneNumber) {
  // Remove all non-numeric characters except the leading '+' sign
  return phoneNumber.replace(/\D/g, '').replace(/^(?:\+?1)?/, '+1');

}

const AuthContainer = () => {

  let {socket, setChats,ask, setHiddenChats, setArchivedChats} = useChannelSet();
  let user = useSelector(state=>state.user.value);
  let {setType, type, processAccept, endCall, waitForIncomingCallSetup, socket: rtcSocket} = useRTC()
  const callkeepAnswerHandledRef = useRef(false);

  useEffect(()=>{
    (
      async function(){
        try{
          let reply = await fetch('http://216.126.78.3:8500/api/chats',{
            method:'GET',
            headers:{
              'Content-type':'application/json',
              'Authorization':`Bearer ${user.token}`
            }
          });
          let response = await reply.json();
          if(response.success){
            setChats(response.data);
            setHiddenChats(response.hidden);
            setArchivedChats(response.archived)
          }
          
          console.log('Chattein fir fetch karwayi maine toh...\n\n', response.data)
        }catch(err){
          console.log(err,'Error in fetching chats....\n\n')
        }
        
      }
    )();

  },[ask]);

  /* ---------- CallKeep listeners (ONCE) ---------- */
  useEffect(() => {
    const onAnswer = async () => {
      try {
      if (callkeepAnswerHandledRef.current) {
        console.log('[NAV] Ignoring duplicate CallKeep answerCall event');
        return;
      }
      callkeepAnswerHandledRef.current = true;

      const callDataStr = await AsyncStorage.getItem('incomingCallData');
        if (!callDataStr) return endCall();
      
        // Wait for socket
        let tries = 0;
        while (!rtcSocket?.connected && tries < 30) {
          await new Promise(r => setTimeout(r, 100));
          tries++;
        }

        await waitForIncomingCallSetup();
        await processAccept({ source: 'callkeep' });
        
          navigate('Video Call');
      } catch (err) {
        console.error('[NAV] Accept failed:', err);
        endCall();
      } finally {
        // Allow future calls to be answered
        setTimeout(() => {
          callkeepAnswerHandledRef.current = false;
        }, 2000);
      }
    };

    const onEnd = async () => {
          await endCall();
          navigate('Home');
    };

    RNCallKeep.addEventListener('answerCall', onAnswer);
    RNCallKeep.addEventListener('endCall', onEnd);

    return () => {
      try {
        RNCallKeep.removeEventListener('answerCall', onAnswer);
        RNCallKeep.removeEventListener('endCall', onEnd);
      } catch (error) {
        console.warn('[NAV] Error removing CallKeep listeners during cleanup:', error);
        // Silently handle errors during cleanup to prevent crashes on logout
      }
    };
  }, []);

  return(
    <>    
              
            <Stack.Navigator screenOptions={{
              headerShown: false
            }}>  
              <Stack.Screen 
              name="Home"
              component={MainTabNavigator}
              options={{ headerShown: false }}
              initialParams={{video_initialized:true}}
              />
              <Stack.Screen 
              name="Profile"
              component={Profile}
              />
              <Stack.Screen
              name='Edit Profile'
              component={EditProfile}
              />
              <Stack.Screen
              name='Social Profile'
              component={SocialProfile}
              />
              <Stack.Screen
              name='Posts List'
              component={ListofPosts}
              />
              <Stack.Screen
              name='Flix List'
              component={ListofFlix}
              />
              <Stack.Screen
              name='Stories List'
              component={ListofStories}
              />
              <Stack.Screen
              name='Solo Story Display'
              component={StoryDisplay}
              />
              <Stack.Screen
              name='Archived'
              component={Archived}
              />
              <Stack.Screen
              name='Notifications'
              component={Notifications}
              />
              <Stack.Screen
              name='Saved'
              component={Saved}
              />
              <Stack.Screen
              name='New Chat'
              component={NewChat}
              />
              <Stack.Screen
              name='New Call'
              component={NewCall}
              />
              <Stack.Screen 
              name='View Blocked Users'
              component={ViewBlockedUsers}
              />
              <Stack.Screen 
              name='Video Call'
              component={VideoCall}
              />
              <Stack.Screen 
                name='Outgoing Call'
                component = {OutgoingCall}
              />
              <Stack.Screen 
                name='Incoming Call'
                component={IncomingCall}
              />
              <Stack.Screen
              name='Demo'
              component={Demo}
              />
              <Stack.Screen 
              name='Search Chats'
              component={SearchChat}
              />
              <Stack.Screen 
              name='Chat Screen'
              component={ChatScreen}
              />
              <Stack.Screen 
              name='Imp Messages for a chat'
              component={ImpMessages}
              />
              <Stack.Screen 
              name='Contact Info'
              component={ContactInfo}
              />
              <Stack.Screen 
              name='Self Chat Info'
              component={SelfChatInfo}
              />
              <Stack.Screen
              name='Media Links Files'
              component={MediaLinksFiles}
              />
              <Stack.Screen 
              name='Crypto Section'
              component={CryptoTabNavigator}
              options={{ headerShown: false }}
              />
              <Stack.Screen 
              name='Broadcast Screen'
              component={BroadcastScreen}
              options={{headerShown:false}}
              />
              <Stack.Screen 
              name='Hidden Chats'
              component={HiddenChats}
              />
              <Stack.Screen 
              name='Contact Card'
              component={ContactCard}
              />
              <Stack.Screen 
              name='Forward Message'
              component={ForwardMessage}
              />
              <Stack.Screen 
              name='Interests'
              component={Interests}
              />
              <Stack.Screen 
              name='Search'
              component={Search}
              />
              <Stack.Screen 
              name='Chat Settings General'
              component={ChatSettingsGeneral}
              />
              <Stack.Screen 
              name='Contact Us'
              component={HelpnSupport}
              />
              <Stack.Screen 
              name='Deactivate'
              component={Deactivate}
              />
              <Stack.Screen 
              name='Account Settings'
              component={AccountSettings}
              />
              <Stack.Screen 
              name='Security Settings'
              component={SecuritySettings}
              />
              <Stack.Screen 
              name='Follow List'
              component={FollowList}
              />
            </Stack.Navigator>
     
    </>
  )
}

const NavigationWrapper = () => {

    let user = useSelector(state=>state.user.value);
    let [appState, setAppState] = useState(AppState.currentState)
    let {contacts} = useSelector(state=>state.contacts.value);
    const prevUserDataRef = useRef(user?.data);
    
    let dispatch = useDispatch();
    
    // Handle navigation after logout - navigate to Opening when user.data becomes null
    useEffect(() => {
      // Check if user just logged out (had data before, now doesn't)
      if (prevUserDataRef.current && !user?.data) {
        // User just logged out - wait for navigator to switch, then navigate
        // Use setTimeout to ensure navigator has switched
        const timer = setTimeout(() => {
          if (navigationRef.isReady()) {
            try {
              navigationRef.navigate('Opening');
            } catch (error) {
              // Navigator might not be ready yet, try again
              setTimeout(() => {
                if (navigationRef.isReady()) {
                  try {
                    navigationRef.navigate('Opening');
                  } catch (e) {
                    console.warn('Failed to navigate to Opening after logout:', e);
                  }
                }
              }, 100);
            }
          }
        }, 50);
        
        return () => clearTimeout(timer);
      }
      
      // Update ref for next render
      prevUserDataRef.current = user?.data;
    }, [user?.data]);
    
    
    // This is to keep reading contacts and checking when app is in background

    useEffect(() => {
      // Subscribe to app state changes
      const handleAppStateChange = async (nextAppState) => {
        if (appState === 'active' && nextAppState.match(/inactive|background/)) {
          // App has gone to the background
          console.log('App is in the background');
          await setcontacts_tom();
        }
  
        setAppState(nextAppState);
      };
  
      
      let subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => {
        subscription.remove()
      }
    }, [appState]);

    useEffect(()=>{
  
      if(contacts.length>0) {
        console.log('true we have contacts...\n\n')
        return;
      };
      (async function(){ 
          await setcontacts_tom();
        }
      )();

    },[]);


    async function setcontacts_tom(){
      let contactsData=[];

      try{
        const { status } = await Contacts.requestPermissionsAsync();

        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers],
          });

          if (data.length > 0) {
            contactsData = data
          }
        }

        let contactsDataChecked = [];
        for (let item of contactsData){
          

            if(!item.phoneNumbers) continue;
            const phone = Platform.OS=='ios'?encodeURIComponent(item.phoneNumbers[0].digits):encodeURIComponent(formatPhoneNumber(item.phoneNumbers[0].number));
            
            let reply = await fetch(`http://216.126.78.3:4500/check/contact/${phone}`, {
              method: 'GET',
            });
            let response = await reply.json();
            
            if (response.success) {
              contactsDataChecked.push({ item: item, server_info: response.data, isRegistered: true }) 
            } else {
              contactsDataChecked.push({ item: item, isRegistered: false });
            }       
        }

        const contactsOIChat = contactsDataChecked.filter((contact) => contact.isRegistered);
        const notOIChat = contactsDataChecked.filter((contact) => !contact.isRegistered);
        
        dispatch(setContacts([...contactsOIChat, ...notOIChat]))

      }catch(err){
        console.log(err,'Error.... in setting contacts\n\n\n')
      }
        
      }

    return (
      
        <NavigationContainer
          ref={navigationRef}
          onReady={()=>{
            flushNavQueue(user?.data);
          }}
        >
            {user.data ?
              <AuthContainer />        
            :
              <Stack.Navigator screenOptions={{
                headerShown: false
              }}>
                <Stack.Screen
                  name='Money Transfer'
                  component={Screen1}
                />
                <Stack.Screen
                  name='Easy Chat'
                  component={Screen2}
                />
                <Stack.Screen 
                  name='Screen 3'
                  component={Screen3}
                />
                <Stack.Screen
                  name='Forgot Password'
                  component={ForgotPassword}
                />
                <Stack.Screen 
                  name="Opening"
                  component={Opening}
                />
                <Stack.Screen 
                  name="Login"
                  component={Login}
                />
                <Stack.Screen 
                  name="SignUp"
                  component={SignUp}
                />
                <Stack.Screen 
                  name="Verify"
                  component={Otp}
                />
                
              </Stack.Navigator> 
            }
          
        </NavigationContainer>
      
    )
  }


  {/**

  linking={{
              config:{
                screens:{
                  ChatScreen:{
                    path:"chat/:id",
                    parse:{
                      id:(id)=>`${id}`
                    }
                  }
                }
              },
              async getInitialURL(){
                const url = await Linking.getInitialURL();

                if (url != null) {
                    return url;
                }
                const response = await Notifications.getLastNotificationResponseAsync();
                
                console.log(response?.notification.request.content,url,'....8 raflan \n\n')
                return response?.notification.request.content.data.url;

              },
              subscribe(listener) {
                const onReceiveURL = ({ url }) => listener(url);
      
                // Listen to incoming links from deep linking
                const eventListenerSubscription = Linking.addEventListener('url', onReceiveURL);
                
                // Listen to expo push notifications
                const subscription = Notifications.addNotificationResponseReceivedListener(response => {
                  const url = response.notification.request.content.data.url;
      
                  // Any custom logic to see whether the URL needs to be handled
                  //...
      
                  // Let React Navigation handle the URL
                  listener(url);
                });
      
                return () => {
                  eventListenerSubscription.remove();
                  subscription.remove();
                };
              },

          }}

  */}

export default NavigationWrapper;