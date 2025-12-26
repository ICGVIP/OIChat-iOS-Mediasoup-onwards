import { Text, View, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView, Modal, Image, useColorScheme, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Button} from 'react-native-paper';
import { useSelector } from 'react-redux';
import * as DocumentPicker from 'expo-document-picker';

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

function SuccessOverlay(props){

  let {onClose, navigation} = props;

  return(
      <View style={styles.overlay}>
          <View style={styles.menu}>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Feather name="x" size={24} color="black" />
              </TouchableOpacity>

              <View style={styles.menuOption}>
                  <Text style={styles.option}>SUBMISSION SUCCESS</Text>
              </View>

              <Image style={{marginVertical:20, alignSelf:'center'}} source={{uri:'https://garnaz.s3.us-east-2.amazonaws.com/assets/tick.png'}} height={30} width={30}/>

              <Text style={{alignSelf:'center', textAlign:'center'}}>
                  We have received your enquiry. A member of our team will contact you via email shortly. Please check your spam/junk folder if it is not visible in the inbox after 72 hours
              </Text>
              
              <Image style={{alignSelf:'center'}} source={{uri:'https://garnaz.s3.us-east-2.amazonaws.com/assets/border.png'}} height={60} width={120} resizeMode='contain'/>

              <View style={{flexDirection:'row', alignSelf:'center', marginVertical:10, justifyContent:'center', width:'100%'}}>
                  <Button mode='outlined' textColor='rgb(0,0,0)' onPress={()=>{onClose();navigation.navigate('Home')}}>Back to Home</Button>
              </View>
              
          </View>
      </View>
  )

}

function FailureOverlay(props){

  let {onClose} = props;

  return(
      <View style={styles.overlay}>
          <View style={styles.menu}>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Feather name="x" size={24} color="black" />
              </TouchableOpacity>

              <View style={styles.menuOption}>
                  <Text style={styles.option}>SUBMISSION FAILURE</Text>
              </View>

              <AntDesign name="exclamationcircleo" size={28} color="rgb(189,157,147)" style={{alignSelf:'center', marginVertical:10}}/>

              <Text style={{alignSelf:'center', textAlign:'center'}}>
                  Your form wasn't submitted due to a technical error. Please try again or contact us at support@garnaz.com
              </Text>
              <Image style={{alignSelf:'center'}} source={{uri:'https://garnaz.s3.us-east-2.amazonaws.com/assets/border.png'}} height={60} width={120} resizeMode='contain'/>
          </View>
      </View>
  )


}

function HelpnSupport({navigation}) {

  let [subject,setSubject] = useState('');
  let [description, setDescription] = useState('');
  let [loading, setLoading] = useState(false);
  let [show,setShow] = useState(false);
  let [type,setType] = useState(0);
  let [file, setFile] = useState();
  let colorScheme = useColorScheme();
  let user = useSelector(state=>state.user.value);

  const pickDocument = async() => {
    let result = await DocumentPicker.getDocumentAsync();
    console.log(result,'...result...\n\n')
    if(!result.canceled){ 
        setFile({...result.assets[0], type:result.assets[0].mimeType});
    }
  }

  async function contactUs(){
    
    setLoading(true);
    try{

      let formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', description);
      if(file){
        formData.append('file', file)
      }
      

      let reply = await fetch('http://216.126.78.3:8500/api/contact', {
        method:'POST',
        headers:{
          'Authorization':`Bearer ${user.token}`
        },
        body:formData
      });

      let response = await reply.json();

      if(response.success){
        setLoading(false);
        setShow(true);
        setType(1);
        setFile();
        return;
      }
    }catch(err){
      console.log(err);
    }

    setLoading(false);
    setShow(true);
    setType(2);
    setFile();
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
            <Text style={{...styles.editText, color:colorScheme=='light'?'black':'white'}}>Contact Us</Text>
        </TouchableOpacity>
        {/**Just for alignment purposes */}
        <TouchableOpacity><AntDesign name="leftcircle" size={30} color="transparent" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ alignSelf:'center', width:window_width*0.8, paddingBottom:80}} automaticallyAdjustKeyboardInsets={true}>

        <View style={{marginTop:40}}>
          <Text style={{color:colorScheme=='light'?'black':'white', fontSize:16, fontWeight:600}}>Subject</Text>
          <TextInput
            style={{borderRadius:8, width:'100%', padding:10,paddingVertical:15, backgroundColor:'rgba(166,166,166,0.3)', marginVertical:10, fontSize:17, color:colorScheme=='light'?'black':'white'}} 
            onChangeText={e=>setSubject(e)}
          />
        </View>

        <View style={{marginTop:15}}>
          <Text style={{color:colorScheme=='light'?'black':'white', fontSize:16, fontWeight:600}}>Message</Text>
          <TextInput
            style={{borderRadius:8, width:'100%', padding:10,paddingVertical:15, backgroundColor:'rgba(166,166,166,0.3)', marginVertical:10, fontSize:17, height:200, color:colorScheme=='light'?'black':'white'}}
            multiline={true}
            onChangeText={e=>setDescription(e)}
          />
        </View>

        {!file &&
          <Button mode='outlined' style={{marginVertical:20}} theme={{borderColor:{primary:'black'}}} textColor={colorScheme=='light'?'black':'white'} onPress={pickDocument}>
            Attach Files (.jpg, .pdf)
          </Button>
        }
        

        {file &&
          <TouchableOpacity onPress={()=>setFile()} style={{flexDirection:'row', alignItems:'center', marginVertical:20}}>
            <Entypo name="cross" size={22} color={colorScheme=='light'?'black':'white'} style={{marginRight:10}}/>
            <FontAwesome name="file" size={22} color={colorScheme=='light'?'black':'white'} />
            <Text style={{marginHorizontal:5, fontWeight:'bold', color:colorScheme=='light'?'black':'white'}}>{file.name}</Text>
          </TouchableOpacity>
        }
        
        

        <Button disabled={loading} onPress={contactUs} mode='contained-tonal' style={{marginVertical:20}} textColor={colorScheme=='light'?'white':'black'} buttonColor={colorScheme=='light'?'black':'white'}>
          Submit
        </Button>
        
      </ScrollView>

        <Modal animationType='slide' visible={show} transparent={true}>
          {type==1&&<SuccessOverlay onClose={()=>setShow(false)} navigation={navigation}/>}
          {type==2&&<FailureOverlay onClose={()=>setShow(false)}/>}
        </Modal>

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

export default HelpnSupport