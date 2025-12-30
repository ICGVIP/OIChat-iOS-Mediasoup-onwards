import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react'
import {View,Text, StyleSheet,useColorScheme} from 'react-native';
import { Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { useRTC } from '../../../context/rtc';


export function convertTo12HourFormat(time24hr) {
    // Split the input time into hours and minutes
    const [hours, minutes] = time24hr.split(':');
  
    // Convert hours to 12-hour format
    let hours12hr = parseInt(hours, 10) % 12;
    hours12hr = hours12hr === 0 ? 12 : hours12hr;
  
    // Determine if it's AM or PM
    const period = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
  
    // Format the result
    const time12hr = `${hours12hr}:${minutes} ${period}`;
  
    return time12hr;
}

export function differenceInTime(createdAt, endedAt){

    const start = new Date(createdAt);
    const end = new Date(endedAt);
    const diffMs = end - start;

    if (isNaN(diffMs)) {
        throw new Error("Invalid timestamps provided.");
    }

    let totalSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let parts = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
}
  

export function areConsecutiveDates(date1, date2) {
    // Convert the input strings to Date objects
    const d1 = new Date(date1);
    const d2 = new Date(date2);
  
    // Set the time part of the dates to midnight
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
  
    // Calculate the difference in days
    const dayDifference = Math.abs((d2 - d1) / (24 * 60 * 60 * 1000));
  
    // Check if the dates are consecutive (difference is 1 day)
    return dayDifference === 1;
}
  
export function convertToReadableFormat(isoString) {
    // Create a new Date object from the ISO 8601 string
    const dateObject = new Date(isoString);
    const InDateTime = moment(dateObject).local().format('YYYY-MM-DD HH:mm:ss');
    const date = InDateTime.slice(0,10);
    const time = InDateTime.slice(11,16)
    
    const now = moment(new Date()).local().format('YYYY-MM-DD HH:mm:ss')
    const now_date = now.slice(0,10);
    const now_time = now.slice(11,)
  
    if(date==now_date){
        return convertTo12HourFormat(time)
    }
    else{
        if(areConsecutiveDates(dateObject,new Date())){
            return 'Yesterday'
        }
        return date
    }
    
    
}

const CallDisplay = (props) => {

    let {data} = props;
    let {contacts} = useSelector(state=>state.contacts.value);
    let user = useSelector(state=>state.user.value);
    let colorScheme = useColorScheme();
    let [name,setName] = useState('OIChat User')
    let [image, setImage] = useState('');
    let [showInfo, setShowInfo] = useState(false);
    let {setType, startCall, setInCall} = useRTC()

    useEffect(()=>{
       setInfo()
    },[contacts, data]);

    async function repeatCall(){

    }

    const _displayNameFromUserRecord = (u) => {
        if (!u) return '';
        const first = (u.firstName || '').trim();
        const last = (u.lastName || '').trim();
        const full = `${first} ${last}`.trim();
        if (full) return full;
        // Common backend fallbacks (if you decide to return them)
        if (u.name) return String(u.name);
        if (u.username) return String(u.username);
        if (u.phone) return String(u.phone);
        return '';
    };

    const _lookupNameForUser = (uOrId) => {
        const uid = (uOrId && typeof uOrId === 'object') ? uOrId.id : uOrId;
        const uidNum = parseInt(uid, 10);
        const uidStr = uid?.toString?.() ?? String(uid);

        // Prefer local contacts cache (if user is saved in contacts)
        const c = (contacts || []).find(i => {
            if (!i?.isRegistered) return false;
            const cid = i?.server_info?.id;
            return cid === uidNum || cid === uidStr || cid === uid;
        });

        if (c?.item) {
            const first = (c.item.firstName || '').trim();
            const last = (c.item.lastName || '').trim();
            const full = `${first} ${last}`.trim();
            return full || c.item.name || c?.server_info?.username || uidStr;
        }

        // If not in contacts, fall back to backend-provided name fields
        if (uOrId && typeof uOrId === 'object') {
            const fromRecord2 = _displayNameFromUserRecord(uOrId);
            if (fromRecord2) return fromRecord2;
        }
        return uidStr;
    };

    const _formatGroupTitle = (names) => {
        const clean = (names || []).map(n => (n || '').trim()).filter(Boolean);
        if (clean.length === 0) return 'Group Call';
        if (clean.length === 1) return clean[0];
        if (clean.length === 2) return `${clean[0]}, ${clean[1]}`;
        return `${clean[0]}, ${clean[1]} & ${clean.length - 2} other`;
    };

    function setInfo(){
        try {
            const otherUsers = Array.isArray(data?.otherUsers) ? data.otherUsers : [];
            const otherIds = otherUsers.map(u => u?.id).filter(Boolean);

            if (otherIds.length <= 1) {
                const u = otherUsers?.[0];
                if (u?.id != null) {
                    setName(_lookupNameForUser(u));
                } else {
                    setName('OIChat User');
                }
                setImage(otherUsers?.[0]?.avatar || '');
                return;
            }

            // Group call: show "A, B & N other"
            const displayNames = otherUsers.map(_lookupNameForUser);
            setName(_formatGroupTitle(displayNames));
            setImage(otherUsers?.[0]?.avatar || '');
        } catch (e) {
            // ignore
        }
    }

    async function repeatCall(type) {
        try {
            const otherUsers = Array.isArray(data?.otherUsers) ? data.otherUsers : [];
            const otherIds = otherUsers.map(u => u?.id).filter(Boolean);

            if (otherIds.length <= 1) {
                // 1:1 call repeat
                let reply = await fetch('http://216.126.78.3:8500/api/create_call',{
                    method:'POST',
                    headers:{
                        'Content-type':'application/json',
                        'Authorization':`Bearer ${user.token}`
                    },
                    body: JSON.stringify({to: otherIds[0], type})
                });
                let response = await reply.json();
                if(response.success){
                    await startCall(otherIds[0], type);
                    setType('Outgoing')
                } else {
                    console.log('Error in creating a call...\n\n')
                }
                return;
            }

            // Group call repeat
            let reply = await fetch('http://216.126.78.3:8500/api/create_group_call',{
                method:'POST',
                headers:{
                    'Content-type':'application/json',
                    'Authorization':`Bearer ${user.token}`
                },
                body: JSON.stringify({to: otherIds, type})
            });
            let response = await reply.json();
            if(response.success){
                await startCall(otherIds, type);
                setType('Outgoing')
            } else {
                console.log('Error in creating a group call...\n\n')
            }
        }catch (err) {
            console.log('Error in starting a call: ', err)
        }
    }


    if(!data) return <></> 
    
    return(
        <>
        {colorScheme=='light'?
            <TouchableOpacity style={styles.container} onPress={()=>setShowInfo(!showInfo)}>
                <Avatar.Image size={55} source={{uri:image || 'https://via.placeholder.com/55'}}></Avatar.Image>
                <View style={!showInfo ? styles.message : styles.details}>
                    {showInfo ? 
                        <>
                            <TouchableOpacity style={{marginHorizontal:5}} onPress={()=>repeatCall('video')}>
                                <Ionicons name="videocam-outline" size={25} color="rgb(99, 197, 93)" style={{marginBottom:10}}/>
                                <Text style={{color:'rgb(99, 197, 93)'}}>Video</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{marginHorizontal:5}} onPress={()=>repeatCall('audio')}>
                                <Ionicons name="call-outline" size={25} color="rgb(99, 197, 93)" style={{marginBottom:10}}/>
                                <Text style={{color:'rgb(99, 197, 93)'}}>Audio</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{marginHorizontal:5}}>
                                <Ionicons name="chatbubble-ellipses-outline" size={25} color="black" style={{marginBottom:10}}/>
                                <Text style={{color:'black'}}>Chat</Text>
                            </TouchableOpacity>
                        </>
                    :
                        <>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:17,fontWeight:'bold',color:'black', marginBottom:10}}>{name}</Text>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={{fontSize:14,color:'black'}}>{data.startedBy==user.data.id ? 'Outgoing Call':'Incoming Call'}</Text>
                            {data.type=='video' ?
                                <Ionicons name="videocam-outline" size={18} color="black" style={{marginHorizontal:10}}/>
                                :
                                <Ionicons name="call-outline" size={18} color="black" style={{marginHorizontal:10}}/>
                            }
                    </View> 
                        </>
                    }
                </View>
                <View style={styles.time}>
                    <Text style={{color:'rgb(251,138,57)',alignSelf:'center'}}>{convertToReadableFormat(data.createdAt)}</Text>
                    {!showInfo ?
                    <Ionicons style={{alignSelf:'center'}} name="information-circle" size={26} color="rgb(251,138,57)" />
                    :
                        <Text style={{color:'rgb(251,138,57)',alignSelf:'center'}}>{differenceInTime(data.createdAt, data.endedAt)}</Text>
                    }
                </View>
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={()=>setShowInfo(!showInfo)}>
                <LinearGradient colors={['rgb(39,42,55)','rgb(12,16,30)']} style={styles.container_dark}>
                    <Avatar.Image size={55} source={{uri:image || 'https://via.placeholder.com/55'}}></Avatar.Image>
                    <View style={!showInfo ? styles.message : styles.details}>
                        {showInfo ? 
                            <>
                                <TouchableOpacity style={{marginHorizontal:5}} onPress={()=>repeatCall('video')}>
                                    <Ionicons name="videocam-outline" size={25} color="rgb(99, 197, 93)" style={{marginBottom:10}}/>
                                    <Text style={{color:'rgb(99, 197, 93)'}}>Video</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{marginHorizontal:5}} onPress={()=>repeatCall('audio')}>
                                    <Ionicons name="call-outline" size={25} color="rgb(99, 197, 93)" style={{marginBottom:10}}/>
                                    <Text style={{color:'rgb(99, 197, 93)'}}>Audio</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{marginHorizontal:5}}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={25} color="white" style={{marginBottom:10}}/>
                                    <Text style={{color:'white'}}>Chat</Text>
                                </TouchableOpacity>
                            </>
                        :
                            <>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={{fontSize:17,fontWeight:'bold',color:'white', marginBottom:10}}>{name}</Text>
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <Text style={{fontSize:14,color:'white'}}>{data.startedBy==user.data.id ? 'Outgoing Call':'Incoming Call'}</Text>
                                    {data.type=='video' ?
                                        <Ionicons name="videocam-outline" size={18} color="white" style={{marginHorizontal:10}}/>
                                        :
                                        <Ionicons name="call-outline" size={18} color="white" style={{marginHorizontal:10}}/>
                                    }
                                </View> 
                            </>
                        }
                        
                    </View>
                    <View style={styles.time}>
                        <Text style={{color:'rgb(251,138,57)',alignSelf:'center'}}>{convertToReadableFormat(data.createdAt)}</Text>
                        {!showInfo ?
                            <Ionicons style={{alignSelf:'center'}} name="information-circle" size={26} color="rgb(251,138,57)" />
                        :
                            <Text style={{color:'rgb(251,138,57)',alignSelf:'center'}}>{differenceInTime(data.createdAt, data.endedAt)}</Text>
                        }
                        
                    </View>
                </LinearGradient>
            </TouchableOpacity>
            
        }
        
        </>
    )
}

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        marginVertical:10,
        backgroundColor:'rgb(218,218,218)',
        padding:20,
        borderRadius:50,
        marginHorizontal:5,

    },
    container_dark:{
        flexDirection:'row',
        marginVertical:10,
        backgroundColor:'rgb(218,218,218)',
        padding:20,
        borderRadius:50,
        marginHorizontal:5
    },
    message:{
        width:'50%',
        marginHorizontal:20,
        paddingVertical:3,
        justifyContent:'space-between',
        alignSelf:'center'
    },
    details:{
        width:'50%',
        marginHorizontal:20,
        paddingVertical:3,
        justifyContent:'space-between',
        flexDirection:'row'
    },
    time:{
        width:'30%',
        alignItems:'flex-start',
        justifyContent:'space-between'
    }
})



export default CallDisplay

