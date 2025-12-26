import React,{useEffect, useState} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Image,Dimensions,TextInput, TouchableOpacity, StatusBar, useColorScheme, Platform, Alert, ActionSheetIOS} from 'react-native';
import { Button, Menu, Portal } from 'react-native-paper';
import ImageModal from 'react-native-image-modal'
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Octicons from '@expo/vector-icons/Octicons'; 
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { login } from '../../../slices/user';
const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;

const STATUSBAR_HEIGHT = StatusBar.currentHeight;

function getFileExtension(fileUrl) {
  // Split the URL string by '/' to get the file name
  const parts = fileUrl.split('/');
  const fileName = parts[parts.length - 1];

  // Split the file name by '.' to get the file name and extension
  const fileNameParts = fileName.split('.');
  
  // If the file name has multiple parts, return the last part as the extension
  if (fileNameParts.length > 1) {
    return fileNameParts[fileNameParts.length - 1];
  } else {
    // If the file name doesn't have an extension, return an empty string
    return '';
  }
}



const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

const EditProfile = ({navigation}) => {

  let user = useSelector(state=>state.user.value);
  let dispatch = useDispatch();
  const [image, setImage] = useState(user.data.image);
  let [loading,setLoading] = useState(false);
  let [name,setName] = useState(user.data.firstName+" "+user.data.lastName);
  let [description,setDescription] = useState(user.data.bio);
  let colorScheme = useColorScheme();
  
  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose Photo', 'Remove Photo'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImage(true);
          } else if (buttonIndex === 2) {
            pickImage(false);
          } else if (buttonIndex === 3) {
            removePhoto();
          }
        }
      );
    } else {
      Alert.alert(
        'Edit Profile Image',
        'Select an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => pickImage(true) },
          { text: 'Choose Photo', onPress: () => pickImage(false) },
          { text: 'Remove Photo', style: 'destructive', onPress: removePhoto },
        ]
      );
    }
  };

  
  const pickImage = async (fromCamera) => {
    let result;
    if (fromCamera) {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access the camera is required!');
        return;
      }

      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      result.assets[0].fileName = `${new Date().getTime()}.${getFileExtension(result.assets[0].uri)}`;

    } else {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access the camera roll is required!');
        return;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
    hideModal();
  };

  const removePhoto = ()=>{
    setImage('https://images.nightcafe.studio//assets/profile.png?tr=w-1600,c-at_max');
    hideModal();
  }
  
  async function handleSubmit(){

    try {
      if(typeof image =='string') {
        let reply = await fetch('http://216.126.78.3:4500/update/simple',{
          method:'POST',
          headers:{
            'Content-type':'application/json',
            'Authorization':`Bearer ${user.token}`
          },
          body: JSON.stringify({image:image,name:name,description:description})
        })
        
        let response = await reply.json();
        console.log(response,'jnjvf.....\n\n')
        dispatch(login(response.token)) 
        setLoading(false)
      }
      else {
        let form = new FormData();
        if(image){
          form.append('file',{uri:image.uri,type:image.mimeType,name:image.fileName? image.fileName : `${new Date().getTime()}.${getFileExtension(image.uri)}`});
        }
        form.append('name',name);
        form.append('description',description);
        setLoading(true);
        
        let reply = await fetch('http://216.126.78.3:4500/update',{
          method:'POST',
          headers:{
            'Authorization':`Bearer ${user.token}`
          },
          body:form
        })
        let response = await reply.json()
        console.log(response,'jnjvf.....\n\n')
        dispatch(login(response.token)) 
        setLoading(false)
      }
      navigation.navigate('Home')
    }
   
    catch(err){
      console.log(err,'error....\n\n')
        setLoading(false)
    }
  }

  return (
    <>
    
      <MyStatusBar
          backgroundColor={'rgb(22,27,53)'}
          barStyle={'light-content'}
      ></MyStatusBar>

      <View style={{flex:1,backgroundColor:'rgb(22,27,53)'}}>
          <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.goBack()}><AntDesign name="left-circle" size={30} color="white" /></TouchableOpacity>
                <TouchableOpacity onPress={showImagePickerOptions} >
                  <Text style={styles.editText}>Edit Profile</Text>
                </TouchableOpacity>
                {/**Just for alignment purposes */}
                <TouchableOpacity><AntDesign name="left-circle" size={30} color="transparent" /></TouchableOpacity>
          </View>

          <View style={styles.outerPP}>
              <View style={styles.pp}>
                <ImageModal
                  resizeMode='cover'
                  modalImageResizeMode='contain'
                  swipeToDismiss
                  imageBackgroundColor="#000000"
                  style={{
                      width: 140,
                      height: 140,
                      borderRadius:70
                  }}
                  source={{
                      uri: image?.uri || user.data?.image
                  }}
                />
                {}
              </View>
          </View>
          

          <ScrollView style={[styles.body, {backgroundColor: colorScheme === 'dark' ? 'rgb(56,59,62)' : 'white'}]} automaticallyAdjustKeyboardInsets>
            
            <TouchableOpacity onPress={showImagePickerOptions} style={{marginTop:10,alignSelf:'center'}}>
              <Text style={[styles.editProfileText, {color: colorScheme === 'dark' ? 'rgb(47,186,243)' : 'rgb(20,130,199)'}]}>Edit Profile Image</Text>
            </TouchableOpacity>

            <View style={styles.form}>
                <View style={styles.dataForm}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                        <Text style={{color: colorScheme === 'dark' ? 'white' : 'black',fontWeight:'bold',fontSize:17,width:'30%'}}>Name</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: colorScheme === 'dark' ? 'rgb(70,73,76)' : 'rgb(245,245,245)',
                                color: colorScheme === 'dark' ? 'white' : 'black'
                            }]}
                            onChangeText={setName}
                            value={name}
                            placeholderTextColor={colorScheme === 'dark' ? 'rgb(180,180,180)' : 'gray'}
                        />
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:30,marginBottom:50}}>
                        <Text style={{color: colorScheme === 'dark' ? 'white' : 'black',fontWeight:'bold',fontSize:17,width:'30%'}}>Bio</Text>
                        <TextInput
                            style={[styles.inputBox, {
                                backgroundColor: colorScheme === 'dark' ? 'rgb(70,73,76)' : 'rgb(245,245,245)',
                                color: colorScheme === 'dark' ? 'white' : 'black'
                            }]}
                            onChangeText={setDescription}
                            value={description}
                            placeholder='Maximum 130 characters'
                            placeholderTextColor={colorScheme === 'dark' ? 'rgb(180,180,180)' : 'gray'}
                            multiline={true}
                            maxLength={130}
                            minHeight={120}
                        />
                    </View>
                    <Button mode="contained" style={{width:100}} disabled={loading} compact={true} onPress={handleSubmit} buttonColor='rgb(236,143,76)' textColor='white'>
                        Done
                    </Button>
                </View>
            </View>

        </ScrollView>
      </View>
      
    
    </>
    
  )
}

const styles = StyleSheet.create({
  header:{
      flexDirection:'row',
      width:'100%',
      paddingHorizontal:15,
      marginBottom:5,
      paddingVertical:10,
      justifyContent:'space-between'
  },
  pp:{
    width:140,
    height:140,
    borderRadius:70,
    overflow:'hidden',
    backgroundColor:'white',
    alignSelf:'center'
  },
  body:{
    flex:1,
    borderTopLeftRadius:40,
    borderTopRightRadius:40,
    marginTop:-75,
    zIndex:0,
    paddingTop:80
  },
  outerPP:{
    marginTop:30,
    height:150,
    width:150,
    borderRadius:75,
    backgroundColor:'rgb(236,143,76)',
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center',
    zIndex:1
  },
  name:{
    marginTop:30,
    fontSize:25,
    fontWeight:'bold',
    alignSelf:'center'
  },
  bio:{
    marginTop:20,
    fontSize:18,
    alignSelf:'center',
    fontStyle:'italic'
  },
  image_cover:{
    width:180,
    height:180, 
    marginHorizontal:10,
    borderRadius:20,
    marginVertical:10,
    flexGrow:1
  },
  editText:{
      color:'white',
      fontWeight:'bold',
      justifyContent:'center',
      flexDirection:'row',
      fontSize:17
  },
  form:{
      alignItems:'center',
  },
  editProfileText:{
    fontWeight:'bold',
    fontSize:17
  },
  dataForm:{
      marginTop:50,
      width:'100%',
      paddingHorizontal:20,
      alignItems:'center'
  },
  input:{
    width:'70%',
    padding:10,
    borderRadius:10
  },
  inputBox:{
    width:'70%',
    padding:10,
    borderRadius:10,
  },
  containerStyle:{
      backgroundColor: 'white', 
      padding: 20,
      width:200,
      borderRadius:10
  },
  option:{
      borderBottomColor:'rgb(235,235,235)',
      borderBottomWidth:2,
      paddingVertical:5,
      justifyContent:'space-between',
      flexDirection:'row',
      alignItems:'center',
      marginBottom:15
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
})
export default EditProfile 