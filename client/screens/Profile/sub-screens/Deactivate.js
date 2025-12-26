import { Text, View, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView, Modal, Image, useColorScheme, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Button} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {logout} from '../../../slices/user';
import { Toast } from '../../../context/ToastContext';

const window_width = Dimensions.get('window').width;
const imageWidth = window_width * 0.3;

const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);


function Deactivate({navigation}) {

  let [pwd,setPwd] = useState('');
  let [description, setDescription] = useState('');
  let [secured,setSecured] = useState(true);
  let [loading, setLoading] = useState(false);
  let colorScheme = useColorScheme();
  let dispatch = useDispatch()
  let user = useSelector(state=>state.user.value);

  
  async function deactivateAccount(){
    
    if(!pwd){
      return Toast.show('Password missing', {
        duration: Toast.durations.LONG,
        position: -60,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor:'rgb(11,11,11)',
      })
    }
    setLoading(true);

    try{
      let reply = await fetch('http://216.126.78.3:4500/deactivate',{
          method:'POST',
          headers:{
            'Content-type':'application/json',
            'Authorization':`Bearer ${user.token}`
          },
          body: JSON.stringify({password:pwd})
      });
      let response = await reply.json();

      if(!response.success && response.pw_not_correct){
        setLoading(false)
        return Toast.show('Incorrect password', {
          duration: Toast.durations.LONG,
          position: -60,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor:'rgb(11,11,11)',
        })
      }

      setLoading(false)
      dispatch(logout())

    }catch(err){
      console.log(err);
    }

  }

  return(
    <View style={{backgroundColor:colorScheme=='light'?'white':'rgb(22,27,53)', flex:1}}>

      <MyStatusBar
        backgroundColor={colorScheme=='light'?'white':'rgb(22,27,53)'}
        barStyle={colorScheme=='light'?'dark-content':'light-content'}
      ></MyStatusBar>

      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons style={{alignSelf:'center'}}  name="chevron-back" size={26} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
        <TouchableOpacity >
            <Text style={{...styles.editText, color:colorScheme=='light'?'black':'white'}}>Deactivate Account</Text>
        </TouchableOpacity>
        {/**Just for alignment purposes */}
        <TouchableOpacity><AntDesign name="leftcircle" size={30} color="transparent" /></TouchableOpacity>
      </View>

      <Text style={{fontStyle:'italic', marginHorizontal:40, textAlign:'center', marginVertical:30, color: colorScheme=='light'?'black':'white'}}>
          We are sorry to see you go. There would be a 30 days grace period provided in case you decide to log back in, after which all the data related to your account would be permanently deleted. Contact support in case you need some assistance.
      </Text>

      <ScrollView contentContainerStyle={{ alignSelf:'center', width:window_width*0.8, paddingBottom:80}} automaticallyAdjustKeyboardInsets={true}>

        <View style={{marginTop:40}}>
          <Text style={{color:colorScheme=='light'?'black':'white', fontSize:16, fontWeight:400}}>Enter password to confirm:</Text>
          <View style={{flexDirection:'row', alignItems:'center', borderRadius:8, backgroundColor:colorScheme=='light'?'rgba(166,166,166,0.3)':'rgba(255,255,255,0.2)', marginVertical:10}}>
            <TextInput
                style={{borderRadius:8,flex:1, padding:10,paddingVertical:15, backgroundColor:'transparent', fontSize:17, color: colorScheme=='light'?'black':'white'}} 
                onChangeText={e=>setPwd(e)}
                secureTextEntry={secured}
            />
            <TouchableOpacity onPress={()=>setSecured(!secured)} style={{marginRight:10}}>
                {secured ? 
                    <Ionicons name="eye-off" size={24} color={colorScheme=='light'?'black':'white'} />
                :
                    <Ionicons name="eye" size={24} color={colorScheme=='light'?'black':'white'}/>
                }
                
            </TouchableOpacity>
          </View>
          
        </View>

        <View style={{marginTop:15}}>
          <Text style={{color:colorScheme=='light'?'black':'white', fontSize:16, fontWeight:400}}>Reason for deactivation:</Text>
          <TextInput
            style={{borderRadius:8, width:'100%', padding:10,paddingVertical:15, backgroundColor:colorScheme=='light'?'rgba(166,166,166,0.3)':'rgba(255,255,255,0.2)', marginVertical:10, fontSize:17, height:200, color: colorScheme=='light'?'black':'white'}}
            multiline={true}
            onChangeText={e=>setDescription(e)}
          />
        </View>

        <Button disabled={loading} onPress={deactivateAccount} mode='contained-tonal' style={{marginVertical:20}} textColor={'white'} buttonColor={'rgb(250,90,91)'}>
          Submit
        </Button>
        
      </ScrollView>

    </View>
  )
}


const styles = StyleSheet.create({
  header:{
    flexDirection:'row',
    width:'100%',
    paddingHorizontal:20,
    marginBottom:5,
    paddingTop:10,
    justifyContent:'space-between'
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
      width: '80%',
      paddingHorizontal: 20,
      paddingVertical:10,
      borderRadius: 10,
      zIndex:20,
  },
  closeButton: {
      alignSelf: 'flex-end'
  },
  menuOption:{
      alignSelf:'center',
      marginVertical:10
  },
  option:{
      fontWeight:'bold',
      letterSpacing:3,
      fontSize:16
  },
  black:{
        backgroundColor:'black'
  },
  overlay_menu:{
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.4)',
      elevation:10,
      zIndex:100,
  },
  menu_changes:{
      backgroundColor: 'rgb(255,255,255)',
      width: '100%',
      height:'70%',
      paddingHorizontal: 20,
      borderRadius: 10,
      zIndex:20,
      paddingTop:10,
      paddingBottom:30
  },
  editText:{
    fontWeight:'bold',
    justifyContent:'center',
    flexDirection:'row',
    fontSize:20,
    alignSelf:'center'
},
})

export default Deactivate