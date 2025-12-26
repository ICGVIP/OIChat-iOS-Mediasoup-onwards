import { View, Text, SafeAreaView, StyleSheet, useColorScheme, Dimensions, StatusBar, TouchableOpacity, Alert } from 'react-native'
import React, {useState, useEffect} from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Octicons from '@expo/vector-icons/Octicons'; 
import { ScrollView } from 'react-native-virtualized-view';
import { Avatar, Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import {login} from '../../../slices/user';
import { useChannelSet } from '../../../context/channel';

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
  

const ViewBlockedUsers = ({navigation}) => {

    let user = useSelector(state=>state.user.value);
    let {contacts} = useSelector(state=>state.contacts.value);
    let {blockedUsers, setBlockedUsers, setAsk, ask} = useChannelSet();
    let colorScheme = useColorScheme();
    let [loading, setLoading] = useState();

    function findName(obj){
        let name = `~ ${obj.name}`;
        if(!(!contacts||contacts.length==0)) {
            for (let i of contacts){
                if(!i.isRegistered) continue;
                
                if(i.server_info.id==obj.id){
                    name = (i.item?.firstName?i.item.firstName:'') + (i.item?.lastName?i.item.lastName:'')
                }
            }
        }
        return name
    }

    async function unblockUser(id){

        Alert.alert('Unblock User','Do you want to unblock this user ?',[
            {text:'No', destructive:true},
            {text:'Yes', onPress: async () => {
                setLoading(true);
    
                let reply = await fetch(`http://216.126.78.3:8500/api/unblock_user/${id}`,{
                    headers:{
                        'Content-type':'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                let response = await reply.json();
                setBlockedUsers(prev=>prev.filter(i=>i.id!=id));
                setAsk(!ask)
            }}
        ]);

        setLoading(false)
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
                        <Text style={{...styles.editText, color:colorScheme=='light'?'black':'white'}}>Blocked Users</Text>
                    </TouchableOpacity>
                    {/**Just for alignment purposes */}
                    <TouchableOpacity><AntDesign name="leftcircle" size={30} color="transparent" /></TouchableOpacity>
                </View>

                <ScrollView style={styles.body} automaticallyAdjustKeyboardInsets>
                    {blockedUsers.map((i,index)=>
                        <TouchableOpacity key={index} style={styles.blocked_user} onPress={()=>unblockUser(i.id)} disabled={loading}>
                            <Avatar.Image size={55} source={{uri:i.avatar}}/>
                            <View style={{justifyContent:'space-evenly', height:'100%', marginHorizontal:20}}>
                                <Text style={{color:'white', fontWeight:'bold', fontSize:15}}>{findName(i)}</Text>
                                <Text style={{color:'grey', fontStyle:'italic'}}>Tap to unblock</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </ScrollView>


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
    blocked_user:{
        margin:15,
        flexDirection:'row',
        alignItems:'center'
    }
})

export default ViewBlockedUsers