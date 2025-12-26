import React,{useState, useEffect} from 'react';
import {Button, Avatar} from 'react-native-paper';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,TextInput,Dimensions,useColorScheme, Image, TouchableOpacity,Modal, StatusBar, Pressable, KeyboardAvoidingView, Platform, ImageBackground} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import * as Contacts from 'expo-contacts';
//Stream Services

import {CountryPicker} from "react-native-country-codes-picker"; 
import { Toast } from '../../../context/ToastContext';

import { setContacts } from '../../../slices/contacts';
import { useChannelSet } from '../../../context/channel';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

export const EachItem = ({item, setSelected, selected}) => {

  let colorScheme = useColorScheme();

  async function handleSelection(){
    const existingObj = selected.find(i=>i.item.name==item.item.name);
    if (existingObj) {
        let arrayOfObjects = selected.filter(i => i.item.name !== item.item.name);
        setSelected(arrayOfObjects)
 
      } else {
        setSelected([...selected, item])

      }
  }
  
  
    return (
      <View style={{margin:20, marginHorizontal:15, alignItems:'center',justifyContent:'center'}}>
        <View style={{flexDirection:'row',alignItems:'center', justifyContent:'center'}}>
          <View style={styles.circularIcon}>
            <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.server_info?.avatar}}></Image>
          </View>
          <TouchableOpacity onPress={() => handleSelection()} style={styles.closeIcon}>
            <Avatar.Icon size='30' icon={()=><Feather name="x" size={17} color={colorScheme=='light'?'black':'white'} />} style={{backgroundColor:'grey'}}/>
          </TouchableOpacity>
        </View>
        <Text numberOfLines={1} ellipsizeMode="tail" style={{width:60,marginTop:10,textAlign:'center', fontWeight:'bold', fontSize:14, color:colorScheme=='light'?'black':'white'}}>{item.item.name}</Text>
      </View>
      
    )
    
  }
  
export const ContactItem = (props) => {
  
    let {selected,setSelected,item} = props
    let user = useSelector(state=>state.user.value);
    let [self,setSelf] = useState(false);
    let colorScheme = useColorScheme();
  
    useEffect(()=>{
        if(user.data.id==item.server_info?.id) setSelf(true)
    },[])
  
    async function handleSelection(){
        const existingObj = selected.find(i=>i.item.name==item.item.name);
        if (existingObj) {
            let arrayOfObjects = selected.filter(i => i.item.name !== item.item.name);
            setSelected(arrayOfObjects)
          } else {
            setSelected([...selected, item])
          }
    }
    return (
            <>
            {item.isRegistered&&!self ? 
  
              <Pressable style={styles.contactItem} onPress={handleSelection}>
                  <View style={styles.normal}>
                      <View style={{height:64,width:64,borderRadius:32,overflow:'hidden'}}>
                          <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.server_info?.avatar}}></Image>
                      </View>
                      <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                          <Text numberOfLines={1} ellipsizeMode="tail" style={{...styles.name_dark, color:colorScheme=='light'?'black':'white'}}>{user.data.phone==item.server_info?.phone?`${item.item?.name} (Myself)`:item.item?.name}</Text>
                          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bio}>{item.server_info?.bio}</Text>
                      </View>
                      
                  </View>
              </Pressable>
  
            :
                <>
                    {self?
                    <></>
                    :
                    <View style={styles.normal}>
                        <View style={{height:64,width:64,borderRadius:32,overflow:'hidden',backgroundColor:colorScheme=='dark'?'rgb(146,146,143)':'rgba(0,0,0,0.2)'}}>
                        </View>
                        <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                            <Text style={{...styles.name_dark,  color:colorScheme=='light'?'black':'white'}}>{item.item.name}</Text>
                            <Text style={styles.notonoi}>User not on OIChat. Invite</Text>
                        </View>
                        <AntDesign name="rightcircle" size={24} color="rgb(247,138,68)" />
                    </View>
                    }
                
                </>
            
            }
            
        </>
    )
  }


export  const OverlayNewBroadcast = ({onClose,setAction, navigation}) => {
  
    let {contacts} = useSelector(state=>state.contacts.value);
    let [text,setSearchText] = useState('');
    let [selected,setSelected] = useState([]);
    let {setBChannel} = useChannelSet();
    let user = useSelector(state=>state.user.value);
    let colorScheme = useColorScheme();

    const randomGenerator = ()=>{
        return (
          Math.random().toString(36).slice(2, 7) +
          Math.random().toString(36).slice(2, 7) +
          Math.random().toString(36).slice(2, 7)
        );
      
    }

    async function sendBroadcast(){
        var ids = [];
        for (let ele of selected){
            ids.push(String(ele.server_info.id))
        }
        ids.push(user.data.id);
        //Adding admin to prevent same chat from getting repeated error.....
        ids.push('1');
        
        setBChannel(channel);
        onClose();

        return navigation.navigate('Broadcast Screen')

    }

    return(
      
      <View style={styles.overlay}>
        <KeyboardAvoidingView style={{...styles.menu_,height:'80%', backgroundColor:colorScheme=='light'?'white':'rgb(39,41,48)'}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{...styles.overlayHeader, marginBottom:15, marginHorizontal:20,justifyContent:'space-between'}}>
            <TouchableOpacity onPress={()=>{setAction(0);onClose();}}><Entypo name="cross" size={30} color="rgb(32,132,196)" /></TouchableOpacity>
            <Text style={{fontSize:20,textAlign:'center',color:'rgb(32,132,196)',fontWeight:'bold'}}>New Broadcast</Text>
            <TouchableOpacity disabled={selected.length==0?true:false} onPress={sendBroadcast}><Text style={{fontSize:20,textAlign:'center',color:'rgb(32,132,196)'}}>Next</Text></TouchableOpacity>
          </View>
   
          <View style={styles.contacts}>
            <TextInput style={{...styles.searchInput, marginHorizontal:20, backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(63,68,81)', color:colorScheme=='light'?'rgb(120,134,142)':'white'}} placeholder="Search contacts" onChangeText={(text)=>setSearchText(text)} placeholderTextColor='rgb(149,149,149)'/>
  
            <ScrollView horizontal contentContainerStyle={selected.length>=1?{padding:10}:{}} style={{marginVertical:20,backgroundColor:colorScheme=='dark'?'rgba(0,0,0,0.3)':'rgba(0,0,0,0.1)'}}>
              {selected.map((item,index)=><EachItem item={item} key={index} selected={selected} setSelected={setSelected}/>)}
            </ScrollView>
  
            <ScrollView style={styles.contactsScroll} contentContainerStyle={{justifyContent:'flex-start',paddingBottom:70, marginHorizontal:20,}}>
                {/* Chat with contacts */}
                {!text&&contacts.map((i,index)=>
                <ContactItem item={i} key={index} selected={selected} setSelected={setSelected}/>)}
                {text&&
                (contacts.filter(contact=>{return contact.item?.name?.toLowerCase().includes(text.toLowerCase())})).map((i,index)=>
                <ContactItem item={i} key={index} selected={selected} setSelected={setSelected}/>)}
                
                <View style={{paddingVertical:40}}>
  
                </View>
            </ScrollView>
  
          </View>
  
        </KeyboardAvoidingView>
        
      </View>
    )
  }
  
export  const OverlayNewContact = ({onClose,setAction}) => {
  
    let colorScheme = useColorScheme();
    let [mobile,setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    let [firstName,setFirstName] = useState('');
    let [lastName,setLastName] = useState('');
    let [company, setCompany] = useState('');
    let [loading, setLoading] = useState(false)
    const [show, setShow] = useState(false);
    let dispatch = useDispatch();
    let {contacts} = useSelector(state=>state.contacts.value);
  
    
    let handleSubmit = async ()=>{
  
      if(!firstName||!mobile){
        return Toast.show('Please fill in First Name and Phone', {
          duration: Toast.durations.LONG,
          position: -60,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor:'rgb(11,11,11)',
          zIndex:50
        })
      }
  
      if(!mobile.match(/^\d{10}$/)){
        return Toast.show('Invalid phone number', {
          duration: Toast.durations.LONG,
          position: -60,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor:'rgb(11,11,11)',
        })
      }
  
      //Adding Contact
      setLoading(true)
      let contact = {
        [Contacts.Fields.FirstName]: firstName,
        [Contacts.Fields.LastName]: lastName,
        [Contacts.Fields.Company]: company,
        [Contacts.Fields.Name]:firstName+' '+lastName,
        [Contacts.Fields.PhoneNumbers]:[{countryCode,number:`${countryCode}${mobile}`,digits:`${countryCode}${mobile.trim()}`}]
      };
      console.log(contact,'...birthday...\n\n')
      const contactId = await Contacts.addContactAsync(contact);
  
      //Checking if the contact exists or not
      const phone = encodeURIComponent(contact.phoneNumbers[0].digits)
      let reply = await fetch(`http://216.126.78.3:4500/check/contact/${phone}`,{
          method:'GET'
      })
      let response = await reply.json();
      if(response.success) dispatch(setContacts([{item:contact,server_info:response.data,isRegistered:true},...contacts]));
      else dispatch(setContacts([...contacts,{item:contact,isRegistered:false}]));
  
      setLoading(false);
      setAction(0);
      onClose();
      return Toast.show('Contact created successfully!', {
        duration: Toast.durations.LONG,
        position: -60,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor:'rgb(11,11,11)',
      })
    }
  
    return (
      <View style={styles.overlay}>
        <View style={{...styles.menu, backgroundColor:colorScheme=='light'?'white':'rgb(39,41,48)', height:'80%'}}>
          <View style={styles.overlayHeader}>
            <TouchableOpacity style={{position:'absolute',left:0}} onPress={()=>{setAction(0);onClose();}}><Entypo name="cross" size={30} color="white" /></TouchableOpacity>
            <Text style={{fontSize:20,textAlign:'center',color:'white',fontWeight:'bold'}}>New Contact</Text>
          </View>
            <CountryPicker
                show={show}
                style={colorScheme=='dark'?
                {
                  textInput: {
                    backgroundColor:'rgb(30,30,30)!important'
                  },
                  countryButtonStyles: {
                    backgroundColor:'rgb(50,50,50)'
                  },
                  countryName:{
                    color:'white'
                  },
                  dialCode:{
                    color:'white'
                  },
                  modal:{
                    backgroundColor:'black'
                  },
                  
                }
                :
                {}}
                pickerButtonOnPress={(item) => {
                setCountryCode(item.dial_code);
                setShow(false);
              }}
              />
              <ScrollView automaticallyAdjustKeyboardInsets>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center', marginTop:40, marginBottom:20}}>
                  <Text style={{color:'white',fontSize:18,width:'30%'}}>First Name: </Text>
                  <TextInput
                      style={{...styles.input, width:'60%', backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(63,68,81)', color:colorScheme=='light'?'rgb(120,134,142)':'white'}}
                      onChangeText={setFirstName}
                      placeholder={'John'}
                      placeholderTextColor='rgb(149,149,149)'
                  />
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:20}}>
                  <Text style={{color:'white',fontSize:18,width:'30%'}}>Last Name: </Text>
                  <TextInput
                      style={{...styles.input, width:'60%', backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(63,68,81)', color:colorScheme=='light'?'rgb(120,134,142)':'white'}}
                      onChangeText={setLastName}
                      placeholder={'Doe'}
                      placeholderTextColor='rgb(149,149,149)'
                  />
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:20}}>
                  <Text style={{color:'white',fontSize:18,width:'30%'}}>Company(optional): </Text>
                  <TextInput
                      style={{...styles.input, width:'60%', backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(63,68,81)', color:colorScheme=='light'?'rgb(120,134,142)':'white'}}
                      onChangeText={setCompany}
                      placeholder={'OI Tech'}
                      placeholderTextColor='rgb(149,149,149)'
                  />
                </View>
                <View style={{width:'100%',flexDirection:'row',marginVertical:20,justifyContent:'space-between'}}>
                  <View style={{width:'33%'}}>
                    <Text style={{marginBottom:10,color:'white', fontSize:16 }}>Country Code:</Text>
                    <TextInput
                      style={{...styles.input, width:'100%', backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(63,68,81)', color:colorScheme=='light'?'rgb(120,134,142)':'white'}}
                      onPressIn={()=>setShow(true)}
                      value={countryCode}
                      selectionColor='rgb(255,255,255)'
                      placeholder='+91'
                      placeholderTextColor='rgb(149,149,149)'
                    />
                  </View>
                  
                  <View style={{width:'60%'}}>
                    <Text style={{marginBottom:10, color:'white', fontSize:16}}>Phone:</Text>
                    <TextInput
                      inputMode='numeric'
                      style={{...styles.input,width:'100%', backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(63,68,81)', color:colorScheme=='light'?'rgb(120,134,142)':'white'}}
                      placeholder='(647) 987-4516'
                      placeholderTextColor='rgb(149,149,149)'
                      onChangeText={setPhone}
                    />
                  </View>
                  
              </View>
              <Button mode="contained" style={{width:100, marginVertical:30, alignSelf:'center'}} textColor='white' disabled={loading} compact={true} onPress={handleSubmit} buttonColor='rgb(241,171,71)'>
                Done
              </Button>
              </ScrollView>
              
        </View>
      </View>
    )
  }

  const styles = StyleSheet.create({

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
      zIndex:20,
      paddingTop:10,
      paddingBottom:30
    },
    closeButton: {
      alignSelf: 'flex-end',
      paddingBottom: 10,
    },
    menuOption: {
      padding:20,
      flexDirection:'row',
      alignItems:'center'
    },
    option:{
      fontSize:19,
      color:'white',
      marginHorizontal:20
    },
    statusBar: {
      height: STATUSBAR_HEIGHT,
    },
    overlayHeader: {
      flexDirection:'row',
      paddingVertical: 10,
      alignItems: 'center', 
      justifyContent: 'center'
    },
    input:{
      paddingHorizontal:8,
      paddingVertical:10,
      fontSize:18,
      borderRadius:10
    },
    searchInput:{
      height: 40,
      borderRadius:8,
      paddingHorizontal: 15,
      marginBottom: 10,
      width:'90%',
      margin:15,
      marginBottom:20
    },
    contactsScroll:{
      width:'100%',
  
    },
    contactItem:{
      flexDirection:'row',
      flex:1,    
      marginVertical:10
    },
    name:{
      fontWeight:'bold',
      fontSize:15,
      color:'black',
      marginVertical:5
    },
    name_dark:{
        fontWeight:'bold',
        fontSize:15,
        marginVertical:5
    },
    bio:{
        color:'grey'
    },
    selected:{
      flexDirection:'row',
      backgroundColor:'rgb(200,201,203)',
      width:'100%',
      paddingVertical:10,
      paddingHorizontal:20,
      borderRadius:20,
      alignItems:'center'
    },
    selected_dark:{
      flexDirection:'row',
      backgroundColor:'rgb(30,30,30)',
      width:'100%',
      paddingVertical:10,
      paddingHorizontal:20,
      borderRadius:20,
      alignItems:'center'
    },
    normal:{
      flexDirection:'row',
      width:'100%',
      paddingVertical:10,
      paddingHorizontal:20,
      alignItems:'center'
    },
    notonoi:{
      color:'grey',
      fontStyle:'italic'
    },
    circularIcon:{
      height:60,
      width:60,
      borderRadius:30,
      overflow:'hidden'
    },
    closeIcon:{
      position: 'absolute',
      top: -8,
      right: 0,
    },
    menu_: {
      width: '100%',
      borderRadius: 10,
      zIndex:20,
      paddingTop:10,
      paddingBottom:30
    },
    header:{
        flexDirection:'row',
        backgroundColor:'white',
        height:90,
        width:'100%'
    },
    header_dark:{
        flexDirection:'row',
        backgroundColor:'rgb(41,44,56)',
        height:90,
        width:'100%'
    },
    image:{
        width:'100%',
        height:'100%',
        resizeMode:'cover',
        
    }
  
  })