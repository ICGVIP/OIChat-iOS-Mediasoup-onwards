import { View, Text, SafeAreaView, StyleSheet, useColorScheme, Dimensions, StatusBar, TouchableOpacity, Modal, ScrollView, Alert} from 'react-native'
import React, {useState, useEffect} from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather'; 
import { TextInput,MD3LightTheme as DefaultTheme ,Button, HelperText } from 'react-native-paper';
import {CountryPicker} from "react-native-country-codes-picker"; 
import { Switch } from 'react-native-paper';

import {login} from '../../../slices/user';

import { Toast } from '../../../context/ToastContext';
import { useDispatch, useSelector } from 'react-redux';

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

export const SecuritySettings = ({navigation}) => {

  let user = useSelector(state=>state.user.value)
  let [enabled2FA, setEnabled2FA] = useState();
  let [securityAlerts, setSecurityAlerts] = useState();
  let [loading2FA, setLoading2FA] = useState(false);
  let [loadingAlerts, setLoadingAlerts] = useState(false);
  let dispatch = useDispatch();

  let colorScheme = useColorScheme();

  useEffect(()=>{
    setEnabled2FA(user.data.is_2fa_enabled);
    setSecurityAlerts(user.data.is_alerts_enabled)
  },[user.data.is_2fa_enabled, user.data.is_alerts_enabled])

  async function toggleEnabled2FA(){

    setLoading2FA(true);
    
    let reply = await fetch('http://216.126.78.3:4500/toggle/2fa',{
      headers:{
        'Content-type':'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    });
    let response = await reply.json();

    if(response.success){
      dispatch(login(response.token));
      if(!enabled2FA ) {
        Alert.alert('You will receive 2FA messages during log in from now on your phone and email')
      }
      
    }
    setLoading2FA(false)

  }

  async function toggleSecurityAlerts(){

      setLoadingAlerts(true);

      let reply = await fetch('http://216.126.78.3:4500/toggle/security_alerts',{
        headers:{
          'Content-type':'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
      let response = await reply.json();

      if(response.success){
        dispatch(login(response.token))
        if(!securityAlerts) {
          Alert.alert('You will receive a notification on your email whenever your account is logged in from unrecognized locations')
        }
      }
      
      setLoadingAlerts(false)
  }

  return (
      <>
          <MyStatusBar
              backgroundColor={colorScheme=='light'?'white':'rgb(22,27,53)'}
              barStyle={colorScheme=='light'?'dark-content':'light-content'}
          ></MyStatusBar>
          <View style={{flex:1,backgroundColor:colorScheme=='dark'?'rgb(22,27,53)':'white'}}>
              <View style={styles.header}>
                  <TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons style={{alignSelf:'center'}}  name="chevron-back" size={26} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                  <TouchableOpacity >
                      <Text style={{...styles.editText, color:colorScheme=='light'?'black':'white'}}>Security Settings</Text>
                  </TouchableOpacity>
                  {/**Just for alignment purposes */}
                  <TouchableOpacity><AntDesign name="leftcircle" size={30} color="transparent" /></TouchableOpacity>
              </View>

              <View style={styles.body}>
                  <TouchableOpacity style={{marginVertical:20, marginHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                      <Text style={{fontSize:18, color:colorScheme=='light'?'black':'white'}}>2 Factor Authentication</Text>
                      <Switch value={enabled2FA} onValueChange={toggleEnabled2FA} color='orange' disabled={loading2FA}/>
                  </TouchableOpacity>

                  <TouchableOpacity style={{marginVertical:20, marginHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                      <Text style={{fontSize:18, color:colorScheme=='light'?'black':'white'}}>Security Alerts</Text>
                      <Switch value={securityAlerts} onValueChange={toggleSecurityAlerts} color='orange' disabled={loadingAlerts}/>
                  </TouchableOpacity>
              </View>


          </View>
      </>
      
  )
}

function SuccessOverlay(props){

  let {onClose, message, navigation} = props;
  let colorScheme = useColorScheme();

  return(
      <View style={styles.overlay}>
          <View style={{...styles.menu_result, backgroundColor:colorScheme=='dark'?'rgb(60,60,60)':'white'}}>

              <TouchableOpacity onPress={()=>{onClose();navigation.navigate('Home')}} style={styles.closeButton}>
                  <Feather name="x" size={24} color={colorScheme=='dark'?'white':'black'} />
              </TouchableOpacity>

              <AntDesign name="checkcircle" size={24} color="orange" style={{alignSelf:'center', marginVertical:10}}/>

              <View style={styles.menuOption}>
                  <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Operation Successful</Text>
              </View>

              <Text style={{alignSelf:'center', textAlign:'center',  marginVertical:20, color:colorScheme=='dark'?'white':'black'}}>
                  {message}
              </Text>
              
          </View>
      </View>
  )

}

function FailureOverlay(props){

  let {onClose,  message, navigation} = props;
  let colorScheme = useColorScheme();


  return(
      <View style={styles.overlay}>
          <View style={{...styles.menu_result, backgroundColor:colorScheme=='dark'?'rgb(40,40,40)':'white'}}>

              <TouchableOpacity onPress={()=>{onClose();navigation.navigate('Home')}} style={styles.closeButton}>
                  <Feather name="x" size={24} color={colorScheme=='dark'?'white':'black'} />
              </TouchableOpacity>

              <AntDesign name="exclamationcircleo" size={28} color="orange" style={{alignSelf:'center', marginVertical:10}}/>

              <View style={styles.menuOption}>
                  <Text style={{...styles.option, color:colorScheme=='dark'?'white':'black'}}>Operation Failure</Text>
              </View>

              <Text style={{alignSelf:'center', textAlign:'center', marginVertical:20, color:colorScheme=='dark'?'white':'black'}}>
                {message}
              </Text>

          </View>
      </View>
  )


}

function EditEmailOverlay(props){

  let {onClose, setType, setMessage} = props;

  let [secureTextEntry,setSecureTextEntry] = useState(true);
  let [email,setEmail] = useState('');
  let [loading,setLoading] = useState(false);
  let colorScheme = useColorScheme();
  let [password,setPWD] = useState('');
  let [messagePassword, setMessagePassword] = useState('Required for verification');
  let [messageEmail, setMessageEmail] = useState('Must be a valid email');
  let [otp, setOtp] = useState();
  let [showOtp, setShowOtp] = useState(false);
  let user = useSelector(state=>state.user.value);
  let dispatch = useDispatch();

  var validRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;

  function errorPassword(){
    return !password && messagePassword
  }
  function errorEmail(){
    return !email.match(validRegex) && messageEmail
  }

  async function initiateChangeEmail(){
    
    if(!password || !email.match(validRegex)){
      return;
    }
    setLoading(true)
    try{

      let reply = await fetch('http://216.126.78.3:4500/change/email',{
        method:'POST',
        headers:{
            'Content-type':'application/json',
            'Authorization':`Bearer ${user.token}`
        },
        body:JSON.stringify({password,email})
      })
      let response = await reply.json()
      setLoading(false)

      if(response.success){
        setShowOtp(true)
      } else{
        if(response.error_cause=='password'){
          setMessagePassword(response.message)
          setPWD('')
        } else if(response.error_cause=='email'){
          setMessageEmail(response.message)
          setEmail('');
        }
      }
      setLoading(false);
      console.log('OTP sent')
    }catch(err){
        console.log(err,'...Error in initiaiting number change...\n\n')
        setEmail('');
        setPWD('');
        setOtp();
        setShowOtp(false);
        setLoading(false);
        setMessage('The email was not updated this time due to an error. Please contact support for further assistance')
        setType('failure');
    }
    
  }

  async function verifyOtp(){
    setLoading(true)
    try{
      let reply = await fetch(`http://216.126.78.3:4500/verify_otp/change/email`,{
        method:'POST',
        headers:{
            'Content-type':'application/json',
            'Authorization':`Bearer ${user.token}`
        },
        body:JSON.stringify({otp,email})
      })

      let response = await reply.json();

      setEmail('');
      setPWD('');
      setOtp();
      setShowOtp(false);
    
      if(response.success){
        dispatch(login(response.token))
        setMessage('Your email was successfully changed')
        setType('success')
      }else {
        setMessage('The email was not updated this time. Please contact support for further assistance')
        setType('failure')
      }
        
      setLoading(false)
    }catch(err){
        console.log(err,'..Error in OTP verification...\n\n');
        setLoading(false);
        
    }
  }

  function handleClose(){
    setEmail('');
    setPWD('');
    setOtp();
    setShowOtp(false);
    onClose();
  }

  return(
      <View style={styles.overlay}>
          <SafeAreaView style={{...styles.menu, backgroundColor:colorScheme=='light'?'white':'rgb(22,27,53)'}}>

              <View style={styles.modal_header}>
                <TouchableOpacity onPress={handleClose}>
                    <Feather name="x" size={27} color={colorScheme=='light'?'black':'white'} />
                </TouchableOpacity>
                <View>
                    <Text style={{...styles.option, color:colorScheme=='light'?'black':'white' }}>Change Email</Text>
                </View>
                <TouchableOpacity style={{}}>
                    <Feather name="x" size={27} color="transparent" />
                </TouchableOpacity>
              </View>

              <Text style={{fontStyle:'italic', marginHorizontal:40, textAlign:'center', marginVertical:30, color: colorScheme=='light'?'black':'white'}}>
                {showOtp?
                  'Please enter the OTP sent to your new email'
                :
                  'In order to change your email, enter your current password followed by your new email.'}
                
              </Text>

              <ScrollView style={{marginTop:40}} contentContainerStyle={{paddingHorizontal:20}} automaticallyAdjustKeyboardInsets> 

                  {showOtp ?
                    <>
                      <TextInput
                        mode="outlined"
                        label="OTP"
                        keyboardType='numeric'
                        style={colorScheme=='light'?{marginVertical:15,backgroundColor:'white'}:{marginVertical:15,backgroundColor:'rgb(63,68,80)'}}
                        onChangeText={e=>setOtp(e)}
                      ></TextInput>
                      <Button disabled={loading || (!otp)} compact buttonColor='rgb(233,88,36)' textColor='white' mode="contained" onPress={verifyOtp} style={{width:'50%', alignSelf:'center', marginVertical:40}}>
                        Submit
                      </Button>
                  </>
                  :

                    <>
                      <TextInput
                        mode="outlined"
                        label="Password"
                        style={colorScheme=='light'?{marginVertical:15,backgroundColor:'white'}:{marginVertical:15,backgroundColor:'rgb(63,68,80)'}}
                        secureTextEntry={secureTextEntry}
                        right={
                          <TextInput.Icon 
                            icon={()=><Ionicons name={secureTextEntry?"eye-off-outline":"eye-outline"} size={24} color={colorScheme=='light'?'black':'grey'}/>}
                            onPress={()=>setSecureTextEntry(!secureTextEntry)}
                          />
                        }
                        onChangeText={e=>setPWD(e)}
                      ></TextInput>
                      <HelperText type="error" visible={errorPassword()} padding='none'>
                        {messagePassword}
                      </HelperText>

                      <TextInput
                        mode="outlined"
                        label="Email"
                        style={colorScheme=='light'?{backgroundColor:'white',marginVertical:15}:{backgroundColor:'rgb(63,68,80)',marginVertical:15}}
                        onChangeText={(e)=>setEmail(e)}
                      ></TextInput>
                      <HelperText type="error" visible={errorEmail()} padding='none'>
                        {messageEmail}
                      </HelperText>
                  
                      <Button disabled={(loading||(!password || !email.match(validRegex)))} compact buttonColor='rgb(233,88,36)' textColor='white' mode="contained" onPress={initiateChangeEmail} style={{width:'50%', alignSelf:'center', marginVertical:40}}>
                        Submit
                      </Button>
                    </>
                  
                    }

              </ScrollView>
             

          </SafeAreaView>
      </View>
  )
}

function EditNumberOverlay(props){

  let {onClose, setType, setMessage} = props;

  const [countryCode, setCountryCode] = useState('+1');
  let [secureTextEntry,setSecureTextEntry] = useState(true);
  const [show, setShow] = useState(false);
  let [phone,setPhone] = useState('');
  let [password,setPWD] = useState('');
  let [messagePassword, setMessagePassword] = useState('Required for verification');
  let [messagePhone, setMessagePhone] = useState('Must be a valid number');
  let [otp, setOtp] = useState();
  let [showOtp, setShowOtp] = useState(false);
  let [errorCountryCode, setErrorCountryCode] = useState(false);
  let [loading,setLoading] = useState(false);
  let colorScheme = useColorScheme();
  let user = useSelector(state=>state.user.value);
  let dispatch = useDispatch();

  function errorPassword(){
    return !password && messagePassword
  }
  function errorPhone(){
    return !phone.match(/^\d{10}$/) && messagePhone
  }

  async function initiateChangeNumber(){
    if(!password || !phone.match(/^\d{10}$/) || !countryCode){
      return;
    }
    setLoading(true)
    try{

      let reply = await fetch('http://216.126.78.3:4500/change/number',{
        method:'POST',
        headers:{
            'Content-type':'application/json',
            'Authorization':`Bearer ${user.token}`
        },
        body:JSON.stringify({password,phone:countryCode+phone})
      })
      let response = await reply.json()
      setLoading(false)

      if(response.success){
        setShowOtp(true)
      } else{
        if(response.error_cause=='password'){
          setMessagePassword(response.message)
          setPWD('')
        } else if(response.error_cause=='phone'){
          setMessagePhone(response.message)
          setPhone('');
        }
      }
      setLoading(false);
      console.log('OTP sent')
    }catch(err){
        console.log(err,'...Error in initiaiting number change...\n\n')
        setShow(false);
        setPhone('');
        setPWD('');
        setOtp('');
        setShowOtp(false);
        setLoading(false);
        setMessage('The number was not updated this time due to an error. Please contact support for further assistance')
        setType('failure');
    }
    
  }

  async function verifyOtp(){
    setLoading(true)
    try{
      let reply = await fetch(`http://216.126.78.3:4500/verify_otp/change/number/${countryCode+phone}`,{
        method:'POST',
        headers:{
            'Content-type':'application/json',
            'Authorization':`Bearer ${user.token}`
        },
        body:JSON.stringify({otp})
      })

      let response = await reply.json();
      
      console.log(otp,'...outside...\n\n')

      setShow(false);
      setPhone('');
      setPWD('');
      setOtp('');
      setShowOtp(false);
    

      if(response.success){
        dispatch(login(response.token))
        setMessage('Your number was successfully changed. Please allow some time for your chats to get updated.')
        setType('success')
      }else {
        setMessage('The number was not updated this time. Please contact support for further assistance')
        setType('failure')
      }
        
      setLoading(false)
    }catch(err){
        console.log(err,'..Error in OTP verification...\n\n');
        setLoading(false);
        
    }
  }

  function handleClose(){
    setShow(false);
    setPhone('');
    setPWD('');
    setOtp('');
    setShowOtp(false);
    onClose();
  }

  return(
      <View style={styles.overlay}>

          <SafeAreaView style={{...styles.menu, backgroundColor:colorScheme=='light'?'white':'rgb(22,27,53)'}}>

              <View style={styles.modal_header}>
                <TouchableOpacity onPress={handleClose}>
                    <Feather name="x" size={27} color={colorScheme=='light'?'black':'white'} />
                </TouchableOpacity>
                <View>
                    <Text style={{...styles.option, color:colorScheme=='light'?'black':'white' }}>Change Number</Text>
                </View>
                <TouchableOpacity style={{}}>
                    <Feather name="x" size={27} color="transparent" />
                </TouchableOpacity>
              </View>

              <Text style={{fontStyle:'italic', marginHorizontal:40, textAlign:'center', marginVertical:30, color: colorScheme=='light'?'black':'white'}}>
                {showOtp?
                  'Please enter the OTP sent to your new number'
                :
                  'In order to change your number, enter your current password followed by your new phone number and country code.'}
                
              </Text>

              <ScrollView style={{marginTop:40}} contentContainerStyle={{paddingHorizontal:20}} automaticallyAdjustKeyboardInsets> 

                {showOtp ?
                  <>
                    <TextInput
                      mode="outlined"
                      label="OTP"
                      keyboardType='numeric'
                      style={colorScheme=='light'?{marginVertical:15,backgroundColor:'white'}:{marginVertical:15,backgroundColor:'rgb(63,68,80)'}}
                      onChangeText={e=>setOtp(e)}
                    ></TextInput>
                    <Button disabled={loading || (!otp)} compact buttonColor='rgb(233,88,36)' textColor='white' mode="contained" onPress={verifyOtp} style={{width:'50%', alignSelf:'center', marginVertical:40}}>
                      Submit
                    </Button>
                  </>
                  
                :
                  <>
                    <TextInput
                    mode="outlined"
                    label="Password"
                    style={colorScheme=='light'?{marginVertical:15,backgroundColor:'white'}:{marginVertical:15,backgroundColor:'rgb(63,68,80)'}}
                    secureTextEntry={secureTextEntry}
                    right={
                      <TextInput.Icon 
                        icon={()=><Ionicons name={secureTextEntry?"eye-off-outline":"eye-outline"} size={24} color={colorScheme=='light'?'black':'grey'}/>}
                        onPress={()=>setSecureTextEntry(!secureTextEntry)}
                      />
                    }
                    onChangeText={e=>setPWD(e)}
                    ></TextInput>

                    <HelperText type="error" visible={errorPassword()} padding='none'>
                      {messagePassword}
                    </HelperText>

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
                    <View style={{width:'100%',flexDirection:'row',marginVertical:15,justifyContent:'space-between'}}>
                      <View style={{width:'27%'}}>
                        <TextInput
                          mode="outlined"
                          label="Country"
                          style={colorScheme=='light'?{width:'100%',backgroundColor:'white'}:{width:'100%',backgroundColor:'rgb(63,68,80)'}}
                          value={countryCode}
                          onPressIn={()=>setShow(true)}
                        >
                        </TextInput>
                        <HelperText type="error" visible={errorCountryCode}>
                          Required
                        </HelperText>
                      </View>

                      <View style={{width:'67%'}}>
                        <TextInput
                          mode="outlined"
                          label="Phone"
                          style={colorScheme=='light'?{width:'100%',backgroundColor:'white'}:{width:'100%',backgroundColor:'rgb(63,68,80)'}}
                          onChangeText={(e)=>setPhone(e)}
                          keyboardType='numeric'
                        />
                        <HelperText type="error" visible={errorPhone()}>
                          {messagePhone}
                        </HelperText>
                      </View>
                      
                      
                    </View>
                  
                    <Button disabled={loading || (!countryCode || !password || !phone)} compact buttonColor='rgb(233,88,36)' textColor='white' mode="contained" onPress={initiateChangeNumber} style={{width:'50%', alignSelf:'center', marginVertical:40}}>
                      Submit
                    </Button>

                  </>
                
                }
                  
              </ScrollView>
             

          </SafeAreaView>
      </View>
  )

}
  

const AccountSettings = ({navigation}) => {

    let [isLastSeenActive, setLastSeenActive] = useState(true);
    let [readReceipts, setReadReceipts] = useState(true);
    let [type, setType] = useState('success');
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    let [message, setMessage] = useState('The number was not updated this time. Please contact support for further assistance');
    let colorScheme = useColorScheme();

    async function toggleReadReceipts(){
        setReadReceipts(!readReceipts)
    }
    async function toggleLastSeen(){
        setLastSeenActive(!isLastSeenActive)
    }

    return (
        <>
            <MyStatusBar
                backgroundColor={colorScheme=='light'?'white':'rgb(22,27,53)'}
                barStyle={colorScheme=='light'?'dark-content':'light-content'}
            ></MyStatusBar>

            <View style={{flex:1,backgroundColor:colorScheme=='dark'?'rgb(22,27,53)':'white'}}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons style={{alignSelf:'center'}}  name="chevron-back" size={26} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                    <TouchableOpacity >
                        <Text style={{...styles.editText, color:colorScheme=='light'?'black':'white'}}>Account Settings</Text>
                    </TouchableOpacity>
                    {/**Just for alignment purposes */}
                    <TouchableOpacity><AntDesign name="leftcircle" size={30} color="transparent" /></TouchableOpacity>
                </View>

                <ScrollView style={styles.body} automaticallyAdjustKeyboardInsets>

                  <TouchableOpacity onPress={()=>{setIsMenuVisible(true); setType('phone')}} style={{marginVertical:20, marginHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                      <Text style={{fontSize:18, color:colorScheme=='light'?'black':'white'}}>Change Phone Number</Text>
                      <Ionicons style={{alignSelf:'center'}}  name="chevron-forward" size={26} color={colorScheme=='light'?'black':'white'} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={()=>{setIsMenuVisible(true); setType('email')}} style={{marginVertical:20, marginHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                      <Text style={{fontSize:18, color:colorScheme=='light'?'black':'white'}}>Change Email</Text>
                      <Ionicons style={{alignSelf:'center'}}  name="chevron-forward" size={26} color={colorScheme=='light'?'black':'white'} />
                  </TouchableOpacity>
                    
                </ScrollView>

                <Modal animationType='slide' visible={isMenuVisible} transparent={true}>
                  {type=='phone'&&<EditNumberOverlay onClose={()=>{setIsMenuVisible(false)}} navigation={navigation} setType={setType} setMessage={setMessage}/>}
                  {type=='email'&&<EditEmailOverlay onClose={()=>{setIsMenuVisible(false)}} navigation={navigation} setType={setType} setMessage={setMessage}/>}
                  {type=='success'&&<SuccessOverlay onClose={()=>setIsMenuVisible(false)} navigation={navigation} message={message}/>}
                  {type=='failure'&&<FailureOverlay onClose={()=>setIsMenuVisible(false)} navigation={navigation} message={message}/>}
                </Modal>

            </View>
        </>
        
    )
}

const styles = StyleSheet.create({
    header:{
        flexDirection:'row',
        width:'100%',
        paddingHorizontal:20,
        marginBottom:5,
        paddingVertical:20,
        justifyContent:'space-between'
    },
    editText:{
        fontWeight:'bold',
        justifyContent:'center',
        flexDirection:'row',
        fontSize:20,
        alignSelf:'center'
    },
    body:{
        padding:20
    },
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      elevation:10,
      zIndex:30,
  },
  menu: {
      backgroundColor: 'rgb(255,255,255)',
      width: '100%',
      flex:1,
      paddingHorizontal: 20,
      paddingVertical:10,
  },
  modal_header: {
      margin:20,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between'
  },
  option:{
      fontWeight:'bold',
      fontSize:16
  },
  black:{
        backgroundColor:'black'
  },
  menu_result:{
    backgroundColor: 'rgb(255,255,255)',
    width: '80%',
    paddingHorizontal: 20,
    paddingVertical:10,
    borderRadius: 10,
  },
  closeButton: {
    alignSelf: 'flex-end'
  },
  menuOption:{
    alignSelf:'center',
    marginVertical:10
  }
})

export default AccountSettings