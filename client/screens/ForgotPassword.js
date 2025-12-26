import React,{useEffect, useState} from 'react';
import { StyleSheet,Text, SafeAreaView, View, Image, Dimensions, useColorScheme, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { TextInput,MD3LightTheme as DefaultTheme ,Button } from 'react-native-paper';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons'; 
import {CountryPicker} from "react-native-country-codes-picker"; 
import { useDispatch} from 'react-redux';
import {login} from '../slices/user';
import { Toast } from '../context/ToastContext';
import * as Keychain from 'react-native-keychain';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.25;

const ForgotPassword = ({route, navigation}) => {

    const [countryCode, setCountryCode] = useState('+1');
    let [phone,setPhone] = useState('');
    let [otp,setOTP] = useState('');
    let [otpReceived,setOTPReceived] = useState(false);
    let [otpSucceeded, setOTPSucceeded] = useState(false);
    let [secureTextEntryPwd,setSecureTextEntryPwd] = useState(true);
    let [secureTextEntryCPwd,setSecureTextEntryCPwd] = useState(true);
    const [show, setShow] = useState(false);
    let [correct,setCorrect] = useState(false);
    let [newPassword,setPassword] = useState('');
    let [confirmPassword,setConfirmPassword] = useState('');
    let dispatch = useDispatch();
    let colorScheme = useColorScheme();
    let [verifying,setVerifying] = useState(false);

    async function handleOTPSend(){

        if(!phone.match(/^\d{10}$/)){
            return Toast.show('Invalid phone number', {
              duration: Toast.durations.LONG,
              position: -60,
              shadow: true,
              animation: true,
              hideOnPress: true,
              backgroundColor:'rgb(11,11,11)',
            })
        }
        setVerifying(true)
        //Make API Call to generate OTP
        let reply = await fetch('http://216.126.78.3:4500/verify/number',{
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body: JSON.stringify({phone:countryCode+phone})
        });
        let response = await reply.json();

        setOTPReceived(true);
        setVerifying(false)

    }

    async function handleVerify(){
        
        if(!otp.match(/^\d{6}$/)){
            console.log("OTP didn't match")
            return Toast.show("OTP didn't match", {
                duration: Toast.durations.LONG,
                position: -60,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor:'rgb(11,11,11)',
            })
        }
        setVerifying(true)
        try{
            let reply = await fetch(`http://216.126.78.3:4500/verify/otp/${countryCode+phone}`,{
                method:'POST',
                headers:{
                    'Content-type':'application/json'
                },
                body:JSON.stringify({otp})
            })
            let response = await reply.json();

            setVerifying(false);

            if(response.success){
                setOTPSucceeded(true)
            }
            else{
                return Toast.show("Incorrect OTP entered", {
                    duration: Toast.durations.LONG,
                    position: -60,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    backgroundColor:'rgb(11,11,11)',
                })
            }
            
        }catch(err){
            //toast for not logged in
            console.log(err)
            setVerifying(false)
        }
        
    }

    async function handleChangePassword(){

        if(!newPassword || !confirmPassword) {
            return Toast.show('Please fill all fields', {
                duration: Toast.durations.LONG,
                position: -60,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor:'rgb(11,11,11)',
            })
        }
        if(confirmPassword!=newPassword){
            return Toast.show('Please ensure confirm password matches your new password', {
                duration: Toast.durations.LONG,
                position: -60,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor:'rgb(11,11,11)',
            })
        }
        setVerifying(true);

        console.log({phone: countryCode + phone, password:newPassword},'..chitta..\n\n')

        try{
            let reply = await fetch('http://216.126.78.3:4500/reset/password',{
                method:'POST',
                headers:{
                    'Content-type':'application/json'
                },
                body:JSON.stringify({phone: countryCode + phone, password:newPassword})
            });
            
            // Check if response is ok before parsing
            if (!reply.ok) {
                throw new Error(`HTTP error! status: ${reply.status}`);
            }
            
            let response = await reply.json();
            console.log(response,'..response..\n\n')
            
            // Check if response exists and is successful
            if(response && response.success){
                dispatch(login(response.token));
                
                // Show Alert only after successful password reset
                Alert.alert('Save Credentials', 'Do you want to save your login credentials to keychain for faster access next time you log in ?',[
                    {text:'No', style:'destructive'},
                    {text:'Yes', onPress:
                      async()=>{
                        try {
                          await Keychain.setGenericPassword(countryCode + phone, newPassword);
                          console.log('Credentials saved successfully');
                        } catch (error) {
                          console.log('Error saving credentials', error);
                        }
                      }
                    }
                  ])
            } else {
                // Handle unsuccessful response
                setVerifying(false);
                return Toast.show(response?.message || 'Failed to reset password. Please try again.', {
                    duration: Toast.durations.LONG,
                    position: -60,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    backgroundColor:'rgb(11,11,11)',
                });
            }
            

        }catch(err){
            //toast for not logged in
            console.log(err)
            setVerifying(false)
            return Toast.show('An error occurred. Please try again.', {
                duration: Toast.durations.LONG,
                position: -60,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor:'rgb(11,11,11)',
            });
        }
    }
  
    return (
        <SafeAreaView style={colorScheme=='light'?styles.container:{flex:1,backgroundColor:'rgb(33,38,51)'}}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.pop()}><AntDesign name="left" size={24} color={'rgb(20,130,199)'} /></TouchableOpacity>
                <Image resizeMode="contain" source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/OI.png'}} style={styles.image}></Image>
            <Text></Text>
            </View>

            {!otpReceived && !otpSucceeded &&
                <View style={styles.body1}>
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
                        <TextInput
                            mode="outlined"
                            label="Country"
                            style={colorScheme=='light'?{width:'27%',backgroundColor:'white'}:{width:'27%',backgroundColor:'rgb(63,68,80)'}}
                            value={countryCode}
                            onPressIn={()=>setShow(true)}
                        >

                        </TextInput>
                        <TextInput
                            mode="outlined"
                            label="Phone"
                            style={colorScheme=='light'?{width:'67%',backgroundColor:'white'}:{width:'67%',backgroundColor:'rgb(63,68,80)'}}
                            onChangeText={(e)=>setPhone(e)}
                            keyboardType='numeric'
                        />
                    </View>

                    <View style={{...styles.body2, marginTop:50}}>
                        <Button compact disabled={verifying} buttonColor='rgb(233,88,36)' textColor='white' mode="contained" onPress={handleOTPSend} style={{width:'50%'}}>
                            Send OTP
                        </Button>
                    </View>
                </View>
            }
            {otpReceived && !otpSucceeded &&
                <ScrollView automaticallyAdjustKeyboardInsets>
                    <View style={styles.body1}>
                        <Text style={colorScheme=='light'?{color:'black'}:{color:'white'}}>Please enter the OTP sent to your number</Text>
                        <TextInput
                            mode="outlined"
                            label="OTP" 
                            style={colorScheme=='light'?{backgroundColor:'white',marginVertical:40}:{backgroundColor:'rgb(63,68,80)',marginVertical:40}}
                            onChangeText={text=>setOTP(text)}
                        ></TextInput>
                    </View>

                    <View style={styles.body2}>
                        <Button compact disabled={verifying} buttonColor='rgb(233,88,36)' textColor='white' mode="contained" onPress={handleVerify} style={{width:'50%'}}>
                            Verify
                        </Button>
                    </View>
                
                </ScrollView>
            }

            {otpSucceeded &&
                <>
                    <ScrollView containerStyle={styles.body1} automaticallyAdjustKeyboardInsets>
                        <TextInput
                            mode="outlined"
                            label="Password"
                            style={colorScheme=='light'?{marginVertical:15,backgroundColor:'white', width:'85%', alignSelf:'center'}:{marginVertical:15,backgroundColor:'rgb(63,68,80)', width:'85%', alignSelf:'center'}}
                            secureTextEntry={secureTextEntryPwd}
                            right={
                            <TextInput.Icon 
                                icon={()=><Ionicons name={secureTextEntryPwd?"eye-off-outline":"eye-outline"} size={24} color={colorScheme=='light'?'black':'grey'}/>}
                                onPress={()=>setSecureTextEntryPwd(!secureTextEntryPwd)}
                            />
                            }
                            onChangeText={e=>setPassword(e)}
                        ></TextInput>
                        <TextInput
                            mode="outlined"
                            label="Confirm Password"
                            style={colorScheme=='light'?{marginVertical:15,backgroundColor:'white', width:'85%', alignSelf:'center'}:{marginVertical:15,backgroundColor:'rgb(63,68,80)', width:'85%', alignSelf:'center'}}
                            secureTextEntry={secureTextEntryCPwd}
                            right={
                            <TextInput.Icon 
                                icon={()=><Ionicons name={secureTextEntryCPwd?"eye-off-outline":"eye-outline"} size={24} color={colorScheme=='light'?'black':'grey'}/>}
                                onPress={()=>setSecureTextEntryCPwd(!secureTextEntryCPwd)}
                            />
                            }
                            onChangeText={e=>setConfirmPassword(e)}
                        ></TextInput>

                        <View style={styles.body2}>
                            <Button compact disabled={verifying} buttonColor='rgb(233,88,36)' textColor='white' mode="contained" onPress={handleChangePassword} style={{width:'50%'}}>
                                Change Password
                            </Button>
                        </View>
                    </ScrollView>

                    
            
                </>
            
            }
            
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'white'
    },
    image:{
      width:imageWidth,
      alignItems:'center',
      justifyContent:'center',
      height:imageWidth
    },
    header:{
      flexDirection:'row',
      justifyContent:'space-between',
      paddingHorizontal:15,
      alignItems:'center'
    },
    signUp:{
      fontSize:17,
      fontWeight:'bold',
      color:'white',
    },
    body1:{
      flex:1,
      paddingHorizontal:15,
      justifyContent:'center',
      paddingTop:30
    },
    body2:{
      flex:1,
      paddingHorizontal:15,
      justifyContent:'flex-start',
      alignItems:'center',
      marginTop:40
    }
})
export default ForgotPassword