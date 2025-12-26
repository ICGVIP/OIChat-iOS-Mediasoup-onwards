import React,{useState} from 'react';
import { StyleSheet,Text, SafeAreaView, View, Image, Dimensions, useColorScheme} from 'react-native';
import { TextInput,MD3LightTheme as DefaultTheme ,Button } from 'react-native-paper';
import AntDesign from '@expo/vector-icons/AntDesign'; 
import { useDispatch} from 'react-redux';
import {login} from '../slices/user'
import { Toast } from '../context/ToastContext';
const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.25;
const Otp = ({route, navigation}) => {

    let [otp,setOTP] = useState('');
    let phone = route.params.phone
    let dispatch = useDispatch();
    let colorScheme = useColorScheme();
    let [verifying,setVerifying] = useState(false)
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
            let reply = await fetch(`http://216.126.78.3:4500/verify_otp/${phone}`,{
            method:'POST',
            headers:{
                'Content-type':'application/json'
            },
            body:JSON.stringify({otp})
            })
            let response = await reply.json()
            console.log(response,'..gg..\n\n')
            dispatch(login(response.token))
            setVerifying(false)
        }catch(err){
            //toast for not logged in
            console.log(err)
            setVerifying(false)
        }
        
    }
  
    return (
        <SafeAreaView style={colorScheme=='light'?styles.container:{flex:1,backgroundColor:'rgb(33,38,51)'}}>
            <View style={styles.header}>
            <AntDesign name="left" size={24} color={colorScheme=='light'?'white':'rgb(33,38,51)'} />
            <Image resizeMode="contain" source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/OI.png'}} style={styles.image}></Image>
            <Text></Text>
            </View>
            
            <View style={styles.body1}>
                <Text style={colorScheme=='light'?{color:'black'}:{color:'white'}}>Please enter the OTP sent to the number you provided for authentication</Text>
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
      justifyContent:'center'
    },
    body2:{
      flex:1,
      paddingHorizontal:15,
      justifyContent:'flex-start',
      alignItems:'center'
    }
})
export default Otp