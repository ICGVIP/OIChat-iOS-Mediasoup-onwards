import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppRegistry, Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-gesture-handler';
import VoipPushNotification from "react-native-voip-push-notification";
import { registerGlobals } from 'react-native-webrtc';
import App from './App';

const options = {
    ios:{
        appName:'OIChat'
    }
}

registerGlobals();
global.__RTC_DEBUG__ = true;

VoipPushNotification.addEventListener('notification', async (voipPayload)=>{

    const {uuid, callerName, handle, callId, callType, callerId} = voipPayload;

    console.log('📱 VoIP push notification received:', {uuid, callerName, handle, callId, callType});

    // Save call data to storage so it can be used after app is restored
    // Include all necessary data for Mediasoup call handling
    const callData = {
        uuid,
        callerName,
        handle,
        callId: callId || voipPayload.callId,
        callType: callType || voipPayload.callType || 'video',
        callerId: callerId || voipPayload.callerId || handle,
        ...voipPayload // Include any other data from the payload
    };
    
    await AsyncStorage.setItem('incomingCallData', JSON.stringify(callData));
    console.log('💾 Saved VoIP call data to AsyncStorage');

    // Note: The native iOS code (AppDelegate.swift) already calls RNCallKeep.reportNewIncomingCall
    // So we don't need to call displayIncomingCall here - it's handled natively
    // This ensures the native UI shows even when app is completely killed
    
})

AppRegistry.registerComponent('main', () => App);

if (Platform.OS === 'web') {
    const rootTag = document.getElementById('root') || document.getElementById('main');
    AppRegistry.runApplication('main', { rootTag });
}