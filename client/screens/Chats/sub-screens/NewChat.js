import React,{useEffect,useState} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, TextInput,Dimensions, Pressable, ScrollView, useColorScheme, Modal, Platform, Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { Button, Menu, Divider, Avatar } from 'react-native-paper';
import { MenuView } from '@react-native-menu/menu';
import { useSelector } from 'react-redux';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useChannelSet } from '../../../context/channel';
import { Toast } from '../../../context/ToastContext';

const windowHeight = Dimensions.get('window').height;

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


const OverlayMenu = ({onClose,selected,setSelected, navigation}) => {

    let colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);
    let [loading,setLoading] = useState(false);
    let [name,setName] = useState('');
    let [description,setDescription] = useState('');
    let [avatar,setAvatar] = useState();
    let {setChannel, socket, setChats, chats} = useChannelSet();

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
                quality: 0.5,
            });
            result.assets[0].fileName = `${new Date().getTime()}.${getFileExtension(result.assets[0].uri)}`;
        } 
        else {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert('Permission to access the camera roll is required!');
                return;
            }

            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
            });
            result.assets[0].fileName = `${new Date().getTime()}.${getFileExtension(result.assets[0].uri)}`;
        }

        console.log(result,'...my house...\n\n')
        if (!result.canceled) {
            setAvatar(result.assets[0])
        }

    };

    async function handleSubmit(){

        if(!name) {
            return Alert.alert('A unique name is needed for group creation')
        }
        let form = new FormData();

        if(avatar){
            form.append('file',{uri:avatar.uri, type:avatar.mimeType, name:avatar.fileName});
        }
        
        //logic to create custom group chat
        setLoading(true)
        
        let members=[]
        for (let a of selected){
            members.push(a.server_info.id);
        }
        form.append('members',JSON.stringify(members));
        form.append('bio', description);
        form.append('name', name);

        let reply = await fetch('http://216.126.78.3:8500/api/create/group',{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${user.token}`
            },
            body:form
        });
        let response = await reply.json();

        if(!response.success) {
            setLoading(false);
            onClose();
            return Toast.show(response.message, {
                duration: Toast.durations.LONG,
                position: -windowHeight/2,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor:'rgb(11,11,11)',
              })
        }
        setChannel({...response.data});
        setChats(allChats=>{
            console.log(allChats,'...here I can remind you')
            return [response.data,...allChats]
        })
        socket.emit('Add new group chat', {chat:{...response.data},creator:response.data.chat_member});
        setSelected([]);
        onClose();
        setLoading(false);
        return navigation.navigate('Chat Screen');

    }

    function pickerHelper({nativeEvent}){
        if(nativeEvent.event=='camera'){
            pickImage(true)
        }
        else{pickImage(false)}
    }
    
    return (
      <View style={styles.overlay}>
        <View style={{...styles.menu,backgroundColor:colorScheme=='light'?'rgb(241,238,246)':'rgb(39,41,48)'}}>

            {/* ScrollView is being used here to add the keyboard inset feature otherwise keyboard comes over the form itself */}
            <ScrollView style={{flex:1}} automaticallyAdjustKeyboardInsets={true}>
                <View style={styles.closeButton}>
                    <TouchableOpacity style={{position:'absolute',left:0}} onPress={onClose}><Entypo name="cross" size={27} color="rgb(32,132,196)" /></TouchableOpacity>
                    <Text style={{fontSize:17,textAlign:'center',color:'rgb(32,132,196)',fontWeight:'bold'}}>New Group</Text>
                </View>
         
                <View style={{alignItems:'center',justifyContent:'space-evenly',flex:1}}>
                    <View style={{marginVertical:30}}>
                        <TouchableOpacity style={{alignSelf:'center',marginBottom:30}}>
                            {!avatar&&
                                <MenuView
                                onPressAction={pickerHelper}
                                actions={[
                                {
                                    id: 'photo',
                                    title: 'Import from Photo Library',
                                    image: Platform.select({
                                    ios: 'photo',
                                    android: 'photo',
                                    }), 
                                },
                                {
                                    id: 'camera',
                                    title: 'Take a Picture',
                                    image: Platform.select({
                                    ios: 'camera',
                                    android: 'camera',
                                    }),
                                }
                                ]}
                            >
                                <Avatar.Icon size={64} icon='camera' style={{backgroundColor:'rgb(20,130,199)'}}/>
                            </MenuView>}
                            {avatar&&<Avatar.Image size={90} icon='camera' source={{uri:avatar.uri}}/>}
                        </TouchableOpacity>
    

                        <View style={styles.dataForm}>
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                <Text style={{color:colorScheme=='light'?'black':'white',fontSize:17,width:'30%'}}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={setName}
                                    value={name}
                                />
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:30,marginBottom:50}}>
                                <Text style={{color:colorScheme=='light'?'black':'white',fontSize:17,width:'30%'}}>Bio</Text>
                                <TextInput
                                    style={styles.inputBox}
                                    onChangeText={setDescription}
                                    value={description}
                                    placeholder='Maximum 130 characters'
                                    multiline={true}
                                    maxLength={130}
                                    minHeight={120}
                                />
                            </View>
                            <Button mode="contained" style={{width:100}} textColor='white' disabled={loading} compact={true} onPress={handleSubmit} buttonColor='rgb(20,130,199)'>
                                Done
                            </Button>
                        </View>
                    </View>  
                </View>      
            </ScrollView>
        </View>
      </View>
    );
  }

export const ContactItem = (props) => {

    let {selected,setSelected,item} = props
    let user = useSelector(state=>state.user.value);
    let colorScheme=useColorScheme();
    let [inSelection,setInSelection] = useState(false);
    let [self,setSelf] = useState(false);
    let {blockedUsers} = useChannelSet();
    let [blockedUsersMap, setBlockedUsersMap] = useState(new Map())

    useEffect(()=>{
        if(user.data.id==item.server_info?.id) setSelf(true)

        setBlockedUsersMap(new Map(blockedUsers.map(i=>[i.id,true])))

    },[blockedUsers.length])

    async function handleSelection(){
        const existingObj = selected.find(i=>i.item.name==item.item.name);
        if (existingObj) {
            let arrayOfObjects = selected.filter(i => i.item.name !== item.item.name);
            setSelected(arrayOfObjects)
            setInSelection(false)
          } else {
            setSelected([...selected, item])
            setInSelection(true)
          }
    }
    return (
            <>
            {item.isRegistered&&!self&&!blockedUsersMap.has(item.server_info?.id)? 
            
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
                <>
                    {self?
                    <></>
                    :
                    <>
                        {blockedUsersMap.has(item.server_info?.id) ? 
                        <View style={styles.normal}>
                            <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                                <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:item.server_info?.avatar}}></Image>
                            </View>
                            <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                                <Text style={{fontWeight:'bold', fontSize:15, marginVertical:5, color:'grey'}}>{item.item.name}</Text>
                                <Text style={styles.notonoi}>You have blocked this user</Text>
                            </View>
                        </View>
                        :
                        <View style={styles.normal}>
                            <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                            </View>
                            <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                                <Text style={colorScheme=='light'?styles.name:styles.name_dark}>{item.item.name}</Text>
                                <Text style={styles.notonoi}>User not on OIChat. Invite</Text>
                            </View>
                            <AntDesign name="right-circle" size={24} color="rgb(247,138,68)" />
                        </View>
                        }
                        
                    </>
                    }
                
                </>
            
            }
            
        </>
    )
}

const NewChatScreen = ({navigation}) => {

    let screenWidth = Dimensions.get('window').width;
    let colorScheme=useColorScheme();
    let [selected, setSelected] = useState([]);
    let {channel, setChannel, chats, setChats, socket} = useChannelSet();
    let user = useSelector(state=>state.user.value);
    let {contacts} = useSelector(state=>state.contacts.value);
    let [creating,setCreating] = useState(false)
    let [text,setSearchText] = useState('');
    

    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const openMenu = () => {
        setIsMenuVisible(true);
    };
    const closeMenu = () => {
        setIsMenuVisible(false);
    };

    useEffect(()=>{
        setSelected([]);
    },[]);


    async function handleChat(){

        if(selected.length==1){
            let otherId = String(selected[0].server_info.id);
            
            let reply = await fetch('http://216.126.78.3:8500/api/add',{
                method:'POST',
                headers:{
                    'Content-type':'application/json',
                    'Authorization':`Bearer ${user.token}`
                },
                body:JSON.stringify({id:otherId, isGroupChat:false})
            });
            let response = await reply.json();

            console.log(response,'...dil lagana ...\n\n')
            if(response.success){
                
                setChannel({...response.data});

                //Check if chat in our list already
                let chat_exists = chats.filter(i=>i.id==response.data.id);
                if(chat_exists.length<1){
                    setChats([{...response.data},...chats]);
                }

                if(response.created_new){
                    socket.emit('Add new duo chat', {chat:{...response.data},creator:{...response.data.chat_member}});
                    return navigation.navigate('Chat Screen');
                }
            }
        }
        else{
            openMenu()
        }
        
    }

    async function createSelfChat(){
        
        let reply = await fetch('http://216.126.78.3:8500/api/create/self_chat',{
            headers:{
                'Content-type':'application/json',
                'Authorization':`Bearer ${user.token}`
            }
        });
        let response = await reply.json();
        if(response.success){
            
            setChannel({...response.data});

            //Check if chat in our list already
            let chat_exists = chats.filter(i=>i?.id==response.data.id);
            if(chat_exists.length<1){
                setChats([{...response.data},...chats]);
            }

            if(response.created_new){
                setChats([{...response.data},...chats]);
                return navigation.navigate('Chat Screen');
            }
        }
    }

    if(!contacts){
        return (<>{console.log(contacts,'...ram...\n\n')}<Text>Still loading.....</Text></>)
    }
    return (
        <SafeAreaView style={colorScheme=='light'?styles.container:styles.container_dark}>
                <View style={styles.header}>
                    <Pressable onPress={()=>{setSelected([]);setCreating(false);navigation.pop();}}><AntDesign name="left" size={24} color="rgb(20,130,199)" /></Pressable>
                    <View style={styles.text}>
                        <Text style={styles.newchat} onPress={()=>navigation.navigate('SignUp')}>New Chat</Text>
                    </View>
                    
                </View>
                <View style={styles.contacts}>
                    <TextInput style={colorScheme=='light'?styles.searchInput:styles.searchInput_dark} placeholder="Search contacts" onChangeText={(text)=>setSearchText(text)}/>
                    <ScrollView style={styles.contactsScroll} contentContainerStyle={{justifyContent:'flex-start',paddingBottom:100}}>

                        {/* Chat with yourself option */}

                        <TouchableOpacity style={styles.normal} onPress={createSelfChat}>
                            <View style={{height:50,width:50,borderRadius:25,overflow:'hidden',backgroundColor:'rgb(146,146,143)'}}>
                                <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:user.data?.image}}></Image>
                            </View>
                            <View style={{flexDirection:'column',marginHorizontal:20,justifyContent:'space-evenly',width:'60%',overflow:'hidden'}}>
                                <Text style={colorScheme=='light'?styles.name:styles.name_dark}>{user.data.firstName} {user.data.lastName}</Text>
                                <Text style={{color:'rgb(247,138,68)',fontStyle:'italic'}}>Chat with yourself !!</Text>
                            </View>
                            <TouchableOpacity>
                                <Entypo name="chevron-right" size={24} color="rgb(32,132,196)" />
                            </TouchableOpacity>
                        </TouchableOpacity>

                        {/* Chat with contacts */}
                        {!text&&contacts.map((i,index)=>
                        <ContactItem item={i} key={index} selected={selected} setSelected={setSelected}/>)}
                        {text&&
                        (contacts.filter(contact=>{return contact.item.name?.toLowerCase().includes(text.toLowerCase())})).map((i,index)=>
                        <ContactItem item={i} key={index} selected={selected} setSelected={setSelected}/>)}
                        
                        <View style={{paddingVertical:40}}>

                        </View>
                    </ScrollView>
                
                </View>
                <Button disabled={creating} mode="contained" onPress={handleChat} buttonColor='rgb(20,130,199)' textColor='white' style={{position:'absolute',bottom:40,width:100,left:(screenWidth-100)/2}} labelStyle={{fontWeight:'bold',fontSize:17}}>
                    Chat
                </Button>
                <Modal animationType='slide' visible={isMenuVisible} transparent={true}>
                    <OverlayMenu onClose={closeMenu} selected={selected} setSelected={setSelected} navigation={navigation}/>
                </Modal>
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
        backgroundColor: 'rgb(63,68,81)',
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
        fontSize:17,
        fontWeight:'bold',
        color:'rgb(20,130,199)',
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
        color:'white',
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
        zIndex:200,
        height:'93%',
        paddingVertical:10,
        
      },
      closeButton: {
        flexDirection:'row',
        paddingVertical: 10,
        alignItems: 'center', 
        justifyContent: 'center'

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
      dataForm:{
        marginTop:20,
        width:'100%',
        paddingHorizontal:20,
        alignItems:'center',
        justifyContent:'center'
    },
    input:{
        width:'70%',
        backgroundColor:'rgb(245,245,245)',
        padding:10,
        borderRadius:10
    },
    inputBox:{
        width:'70%',
        backgroundColor:'rgb(245,245,245)',
        padding:10,
        paddingTop:10,
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
    }
});

export default NewChatScreen;