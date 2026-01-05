import React,{useEffect,useState} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, TextInput,FlatList, Pressable, ScrollView,Dimensions, useColorScheme, ActivityIndicator, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from 'react-native-paper';
import * as Contacts from 'expo-contacts';
import { useSelector, useDispatch} from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useRTC } from '../../../context/rtc';
import { useChannelSet } from '../../../context/channel';
import { useCallsSet } from '../../../context/calls';

const GroupItem = (props) => {

    let {groupSelected,setGroupSelected,item} = props
    let user = useSelector(state=>state.user.value);
    let colorScheme=useColorScheme();
    let [inSelection,setInSelection] = useState(false);

    async function handleSelection(){
        const existingObj = groupSelected.find(i=>i.id==item.id);
        if (existingObj) {
            let arrayOfObjects = groupSelected.filter(i => i.id!== item.id);
            setGroupSelected(arrayOfObjects)
            setInSelection(false)
          } else {
            setGroupSelected([...groupSelected,{id:item.id, otherUsers:item.otherUsers}])
            setInSelection(true)
          }
    }

    return (
        <>
            
            {inSelection&&colorScheme=='light'&&
            <Pressable style={styles.contactItem} onPress={handleSelection}>
                <View style={styles.selected}>
                    <View style={{height:50,width:50,borderRadius:25,overflow:'hidden'}}>
                    <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.avatar}}></Image>
                    </View>
                    <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={colorScheme=='light'?styles.name:styles.name_dark}>{item.name}</Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bio}>{item.bio}</Text>
                    </View>
                    {inSelection?
                    <AntDesign name="check-circle" size={24} color="rgb(20,130,199)" />
                    :
                    <></>}
                </View>
            </Pressable>}
            {inSelection&&colorScheme=='dark'&&
            <Pressable style={styles.contactItem} onPress={handleSelection}>
                <View style={styles.selected_dark}>
                    <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                    <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.avatar}}></Image>
                    </View>
                    <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={colorScheme=='light'?styles.name:styles.name_dark}>{item.name}</Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bio}>{item.bio}</Text>
                    </View>
                    {inSelection?
                    <AntDesign name="check-circle" size={24} color="rgb(20,130,199)" />
                    :
                    <></>}
                </View>
            </Pressable>}
            {!inSelection&&
            <Pressable style={styles.contactItem} onPress={handleSelection}>
                <View style={styles.normal}>
                    <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.avatar}}></Image>
                    </View>
                    <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={colorScheme=='light'?styles.name:styles.name_dark}>{item.name}</Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bio}>{item.bio}</Text>
                    </View>
                    {inSelection?
                    <AntDesign name="check-circle" size={24} color="rgb(20,130,199)" />
                    :
                    <></>}
                </View>
            </Pressable>}
            
        </>
    )
}


const ContactItem = (props) => {

    let {selected,setSelected,item} = props
    let user = useSelector(state=>state.user.value);
    let colorScheme=useColorScheme();
    let [inSelection,setInSelection] = useState(false);
    let [self,setSelf] = useState(false)

    useEffect(()=>{
        if(user.data.id==item.server_info?.id) setSelf(true)
    },[])


    async function handleSelection(){
        //On tap of item, whether to add or remove from list of people who need to be called. 
        const existingObj = selected.find(i=>i.id==item.server_info.id);
        if (existingObj) {
            let arrayOfObjects = selected.filter(i => i.id !== item.server_info.id);
            setSelected(arrayOfObjects)
            setInSelection(false)
          } else {
            setSelected([...selected, {name:item.item.name, id:item.server_info.id, phone:item.server_info.phone}])
            setInSelection(true)
          }
    }

    return (
        <>
            {item.isRegistered && item.server_info.id!=user.data.id ? 
            
            <>
            
            {inSelection&&colorScheme=='light'&&
            <Pressable style={styles.contactItem} onPress={handleSelection}>
                <View style={styles.selected}>
                    <View style={{height:50,width:50,borderRadius:25,overflow:'hidden'}}>
                    <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.server_info?.avatar}}></Image>
                    </View>
                    <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                        <Text style={colorScheme=='light'?styles.name:styles.name_dark}>{user.data.phone==item.server_info?.phone?`${item.item.name} (Myself)`:item.item.name}</Text>
                        <Text style={styles.bio}>{item.server_info?.bio}</Text>
                    </View>
                    {inSelection?
                    <AntDesign name="check-circle" size={24} color="rgb(20,130,199)" />
                    :
                    <></>}
                </View>
            </Pressable>}
            {inSelection&&colorScheme=='dark'&&
            <Pressable style={styles.contactItem} onPress={handleSelection}>
                <View style={styles.selected_dark}>
                    <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                    <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.server_info?.avatar}}></Image>
                    </View>
                    <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                        <Text style={colorScheme=='light'?styles.name:styles.name_dark}>{user.data.phone==item.server_info?.phone?`${item.item.name} (Myself)`:item.item.name}</Text>
                        <Text style={styles.bio}>{item.server_info?.bio}</Text>
                    </View>
                    {inSelection?
                    <AntDesign name="check-circle" size={24} color="rgb(20,130,199)" />
                    :
                    <></>}
                </View>
            </Pressable>}
            {!inSelection&&
            <Pressable style={styles.contactItem} onPress={handleSelection}>
                <View style={styles.normal}>
                    <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.server_info?.avatar}}></Image>
                    </View>
                    <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                        <Text style={colorScheme=='light'?styles.name:styles.name_dark}>{user.data.phone==item.server_info?.phone?`${item.item?.name} (Myself)`:item.item?.name}</Text>
                        <Text style={styles.bio}>{item.server_info?.bio}</Text>
                    </View>
                    {inSelection?
                    <AntDesign name="check-circle" size={24} color="rgb(20,130,199)" />
                    :
                    <></>}
                </View>
            </Pressable>}
            
            </>
            
            :
                <></>
            
            }
            
        </>
    )
}

// Helper function to format phone number for Android
function formatPhoneNumber(phoneNumber) {
  // Remove all non-numeric characters except the leading '+' sign
  return phoneNumber.replace(/\D/g, '').replace(/^(?:\+?1)?/, '+1');
}

const NewCallScreen = ({navigation}) => {

    let screenWidth = Dimensions.get('window').width;
    let colorScheme = useColorScheme();
    let [selected,setSelected] = useState([]);
    let [groupSelected, setGroupSelected] = useState([]);
    let user = useSelector(state=>state.user.value);
    let {contacts} = useSelector(state=>state.contacts.value);
    let [creating,setCreating] = useState(false);
    let [groups,setGroups] = useState([]);
    let [text,setSearchText] = useState('');
    let {chats, archived_chats} = useChannelSet();
    let {setInCall, setType, startCall} = useRTC();
    let [scannedContacts, setScannedContacts] = useState([]);
    let [isScanning, setIsScanning] = useState(false);

    useEffect(()=>{
        let groups = chats.filter(i=>i.isGroupChat);
        groups = [...groups, ...archived_chats.filter(i=>i.isGroupChat)]
        setGroups(groups);
    },[])

    // Progressive contact scanning on mount - only if not already in Redux store
    useEffect(() => {
        // Check if contacts are already in Redux store (registered ones)
        const registeredContacts = contacts?.filter(contact => contact.isRegistered === true) || [];
        
        if (registeredContacts.length > 0) {
            // Use contacts from Redux store, no need to scan
            setScannedContacts(registeredContacts);
            setIsScanning(false);
            return;
        }

        // If no contacts in store, scan progressively
        async function scanContacts() {
            setIsScanning(true);
            let contactsData = [];

            try {
                const { status } = await Contacts.requestPermissionsAsync();

                if (status === 'granted') {
                    const { data } = await Contacts.getContactsAsync({
                        fields: [Contacts.Fields.PhoneNumbers],
                    });

                    if (data.length > 0) {
                        contactsData = data;
                    }
                }

                // Scan contacts progressively and render as found
                for (let item of contactsData) {
                    if (!item.phoneNumbers) continue;
                    
                    const phone = Platform.OS === 'ios' 
                        ? encodeURIComponent(item.phoneNumbers[0].digits)
                        : encodeURIComponent(formatPhoneNumber(item.phoneNumbers[0].number));
                    
                    try {
                        let reply = await fetch(`http://216.126.78.3:4500/check/contact/${phone}`, {
                            method: 'GET',
                        });
                        let response = await reply.json();
                        
                        // Only add if registered on OIChat
                        if (response.success) {
                            setScannedContacts(prev => [...prev, { 
                                item: item, 
                                server_info: response.data, 
                                isRegistered: true 
                            }]);
                        }
                    } catch (err) {
                        console.log('Error checking contact:', err);
                    }
                }
            } catch (err) {
                console.log('Error scanning contacts:', err);
            } finally {
                setIsScanning(false);
            }
        }

        scanContacts();
    }, [contacts])
    

    async function handleCall(type){
        setCreating(true);
        try {
            // Step 1: Collect individual contact IDs
            const individualIds = (selected || []).map(s => s?.id).filter(Boolean);
            
            // Step 2: Expand all selected groups into their member lists
            const groupMemberIds = [];
            (groupSelected || []).forEach(group => {
                if (Array.isArray(group?.otherUsers)) {
                    // otherUsers is an array of user objects, extract IDs
                    group.otherUsers.forEach(user => {
                        const userId = user?.id || user?.userId || user;
                        if (userId) {
                            groupMemberIds.push(userId);
                        }
                    });
                }
            });
            
            // Step 3: Merge individual contacts + group members, then deduplicate
            const allIds = [...individualIds, ...groupMemberIds];
            const uniqueIdsSet = new Set();
            const myId = user?.data?.id;
            
            allIds.forEach(id => {
                const idStr = id?.toString?.() ?? String(id);
                // Exclude current user and ensure it's a valid ID
                if (idStr && idStr !== 'undefined' && idStr !== 'null' && idStr !== myId?.toString?.()) {
                    uniqueIdsSet.add(idStr);
                }
            });
            
            const selectedIds = Array.from(uniqueIdsSet);
            
            console.log('📱 [NewCall] handleCall called', { 
                type, 
                selectedIds, 
                selectedCount: selectedIds.length,
                individualCount: individualIds.length,
                groupCount: groupSelected.length,
                groupMemberCount: groupMemberIds.length,
                uniqueCount: selectedIds.length
            });
            
            if (selectedIds.length === 0) {
                console.error('❌ [NewCall] No users selected (after deduplication)');
                return;
            }

            if (selectedIds.length === 1) {
                console.log('🌐 [NewCall] Calling create_call API (1:1)...');
                let reply = await fetch('http://216.126.78.3:8500/api/create_call',{
                    method:'POST',
                    headers:{
                        'Content-type':'application/json',
                        'Authorization':`Bearer ${user.token}`
                    },
                    body: JSON.stringify({to: selectedIds[0], type})
                });
                
                console.log('📥 [NewCall] API response received', { 
                    status: reply.status, 
                    ok: reply.ok 
                });
                
                let response = await reply.json();
                console.log('📥 [NewCall] API response data:', response);
                
                if(response.success){
                    console.log('✅ [NewCall] API call successful, starting RTC call...');
                    // setInCall(response.id)
                    await startCall(selectedIds[0], type);
                    console.log('✅ [NewCall] startCall completed, setting type to Outgoing');
                    setType('Outgoing');
                    console.log('✅ [NewCall] Type set to Outgoing');
                } else {
                    console.error('❌ [NewCall] API call failed:', response);
                }
            } else {
                // Group call: log it via backend API, then start mediasoup call with ALL selected IDs.
                // VoIP fanout is handled by the calls server (offline users) + incoming-call socket events (online users).
                console.log('🌐 [NewCall] Calling create_group_call API (group)...', { selectedIds, type });
                let reply = await fetch('http://216.126.78.3:8500/api/create_group_call', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ to: selectedIds, type })
                });
                let response = await reply.json();
                console.log('📥 [NewCall] create_group_call response:', response);

                if (response.success) {
                    console.log('✅ [NewCall] Group API call successful, starting RTC group call...');
                    await startCall(selectedIds, type);
                    setType('Outgoing');
                } else {
                    console.error('❌ [NewCall] Group API call failed:', response);
                }
            }
        } catch (err) {
            console.error('❌ [NewCall] Error in starting a call:', err);
        } finally {
            setCreating(false);
        }
    }

   
    return (
        <SafeAreaView style={colorScheme=='light'?styles.container:styles.container_dark}>
                <View style={styles.header}>
                    <Pressable onPress={()=>navigation.goBack()}><AntDesign name="left" size={24} color={colorScheme=='light'?'black':'white'} /></Pressable>
                    <View style={{...styles.text}}>
                        <Text style={{...styles.newchat, color:colorScheme=='light'?'black':'white'}}>Create Call</Text>
                    </View>
                    <Pressable><AntDesign name="left" size={24} color="transparent" /></Pressable>
                </View>
                <View style={styles.contacts}>
                    <TextInput style={colorScheme=='light'?styles.searchInput:styles.searchInput_dark} placeholder="Search contacts" onChangeText={(text)=>setSearchText(text)}/>
                    <ScrollView style={styles.contactsScroll} contentContainerStyle={{justifyContent:'flex-start',alignItems:'center', paddingBottom:200}}>
                        
                        <Text style={colorScheme=='light'?{color:'black',fontSize:25,fontWeight:'bold',width:'100%',marginVertical:20, paddingLeft:15}:{color:'white',fontSize:25,fontWeight:'bold',width:'100%',paddingLeft:15, marginVertical:20}}>Groups</Text>
                        {groups.length==0&&<Text style={styles.notonoi}>No groups to show at the moment</Text>}
                        {groups.map((i,index)=>
                        <GroupItem item={i} key={index} groupSelected={groupSelected} setGroupSelected={setGroupSelected}/>
                        )}
                        <Text style={colorScheme=='light'?{color:'black',fontSize:25,fontWeight:'bold',width:'100%',marginVertical:15, paddingLeft:15}:{color:'white',fontSize:25,fontWeight:'bold',width:'100%',marginVertical:15, paddingLeft:15}}>Contacts</Text>
                        
                        {isScanning && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
                                <ActivityIndicator size="small" color={colorScheme === 'light' ? '#ff8a00' : '#ff8a00'} />
                                <Text style={{ marginLeft: 10, color: colorScheme === 'light' ? 'black' : 'white' }}>
                                    Scanning contacts...
                                </Text>
                            </View>
                        )}
                    
                        {!text && scannedContacts.map((i, index) =>
                            <ContactItem item={i} key={index} selected={selected} setSelected={setSelected} />
                        )}
                        {text && (
                            scannedContacts.filter(contact => {
                                return contact.item?.name?.toLowerCase().includes(text.toLowerCase());
                            }).map((i, index) =>
                                <ContactItem item={i} key={index} selected={selected} setSelected={setSelected} />
                            )
                        )}
                        <View style={{paddingVertical:40}}>

                        </View>
                    </ScrollView>
                
                </View>
                <Button mode="contained" disabled={creating || (selected.length === 0 && groupSelected.length === 0)} onPress={handleCall.bind(null,'audio')} buttonColor='#ff8a00' textColor='white' style={{position:'absolute',bottom:130,width:screenWidth * 0.18,left:(screenWidth - screenWidth * 0.5 - 20)/2}} labelStyle={{fontWeight:'bold',fontSize:17}}>
                    <Ionicons name="call" size={24} color="white" />
                </Button>
                <Button mode="contained" disabled={creating || (selected.length === 0 && groupSelected.length === 0)} onPress={handleCall.bind(null,'video')} buttonColor='#ff8a00' textColor='white' style={{position:'absolute',bottom:130,width:screenWidth * 0.18,right:(screenWidth - screenWidth * 0.5 - 20)/2}} labelStyle={{fontWeight:'bold',fontSize:17}}>
                    <Ionicons name="videocam" size={24} color="white" />
                </Button>
                <Button mode="outlined" disabled={creating} onPress={()=>{}} textColor='#ff8a00' style={{position:'absolute',bottom:50,height:50,width:screenWidth * 0.8,left:(screenWidth - screenWidth * 0.8)/2, borderColor:'#ff8a00', borderRadius:200}} labelStyle={{fontSize:17, alignItems:'center', justifyContent:'center', textAlign:'center'}}>
                    Schedule Call
                </Button>
        </SafeAreaView>
        
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'white',
        padding:10
    },
    container_dark:{
        flex:1,
        backgroundColor:'rgb(33,38,51)',
        padding:10
    },
    header:{
      flexDirection:'row',
      justifyContent:'space-between',
      paddingHorizontal:15,
      marginVertical:10

    },
    searchInput:{
        height: 40,
        borderRadius:8,
        backgroundColor: 'rgb(228,229,231)',
        paddingHorizontal: 15,
        marginBottom: 10,
        width:'90%',
        color:'rgb(120,134,142)',
        margin:15
    },
    searchInput_dark:{
        height: 40,
        borderRadius:8,
        backgroundColor: '#1c1c1c',
        paddingHorizontal: 15,
        marginBottom: 10,
        width:'90%',
        color:'white',
        margin:15
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'gray', // Placeholder for profile image
        marginRight: 10,
    },
    contactName: {
        fontSize: 16,
    },
    text:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center'
    },
    newchat:{
        fontSize:19,
        fontWeight:'bold',
        color:'white',
    },
    contacts:{
        alignItems:'center'
    },
    contactsScroll:{
        width:'100%',
        height:'100%',
    },
    contactItem:{
        flexDirection:'row',
        flex:1,    
        marginVertical:10,
        width:'90%'
    },
    name:{
        fontWeight:'bold',
        fontSize:15,
        color:'black'
    },
    name_dark:{
        fontWeight:'bold',
        fontSize:15,
        color:'white'
    },
    bio:{
        color:'grey'
    },
    selected:{
        flexDirection:'row',
        backgroundColor:'rgb(200,201,203)',
        width:'100%',
        paddingVertical:10,
        paddingHorizontal:10,
        borderRadius:200,
        alignItems:'center'
    },
    selected_dark:{
        flexDirection:'row',
        backgroundColor:'rgb(50,50,50)',
        width:'100%',
        paddingVertical:10,
        paddingHorizontal:10,
        borderRadius:200,
        alignItems:'center'
    },
    normal:{
        flexDirection:'row',
        width:'100%',
        paddingVertical:10,
        paddingHorizontal:20,
        
    },
    contactsTitle:{
        backgroundColor:'rgb(40,40,40)',
        width:'100%',
        alignItems:'center',
        paddingVertical:10,
        marginBottom:20,
    },
    border:{
        borderBottomColor:'white',
        borderWidth:1,
        flexDirection:'column',
        marginHorizontal:20,
        justifyContent:'space-evenly',
        width:'60%',
        overflow:'hidden'
    },
    border_no:{
        flexDirection:'column',
        marginHorizontal:20,
        justifyContent:'space-evenly',
        width:'60%',
        overflow:'hidden'
    },
    notonoi:{
        color:'grey',
        fontStyle:'italic',
        marginVertical:10
    }
});

export default NewCallScreen;