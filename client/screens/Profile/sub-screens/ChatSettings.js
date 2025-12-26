import { View, Text, SafeAreaView, StyleSheet, useColorScheme, Dimensions, StatusBar, TouchableOpacity } from 'react-native'
import React, {useState, useEffect} from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Octicons from '@expo/vector-icons/Octicons'; 
import { ScrollView } from 'react-native-virtualized-view';
import { Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import {login} from '../../../slices/user';

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
  

const ChatSettingsGeneral = ({navigation}) => {

    let [isLastSeenActive, setLastSeenActive] = useState();
    let [readReceipts, setReadReceipts] = useState();
    let [loadingSeenActive, setLoadingSeenActive] = useState(false);
    let [loadingReadReceipts, setLoadingReadReceipts] = useState(false);
    let dispatch = useDispatch();
    let user = useSelector(state=>state.user.value)
    let colorScheme = useColorScheme();

    useEffect(()=>{
        setLastSeenActive(user.data.is_seen_enabled);
        setReadReceipts(user.data.is_receipts_enabled)
      },[user.data.is_seen_enabled, user.data.is_receipts_enabled])

    async function toggleReadReceipts(){
        setLoadingReadReceipts(true);
    
        let reply = await fetch('http://216.126.78.3:4500/toggle/read_receipts',{
            headers:{
                'Content-type':'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        });
        let response = await reply.json();

        if(response.success){
            dispatch(login(response.token));
        }
        setLoadingReadReceipts(false)
    }

    async function toggleLastSeen(){
        setLoadingSeenActive(true);
    
        let reply = await fetch('http://216.126.78.3:4500/toggle/last_seen',{
            headers:{
                'Content-type':'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        });
        let response = await reply.json();

        if(response.success){
            dispatch(login(response.token));
        }
        setLoadingSeenActive(false)
    }

    return (
        <>
            <MyStatusBar
                backgroundColor={colorScheme=='light'?'white':'rgb(22,27,53)'}
                barStyle={colorScheme=='light'?'dark-content':'light-content'}
            ></MyStatusBar>
            {console.log(user.data,'...aujla...\n\n')}
            <View style={{flex:1,backgroundColor:colorScheme=='dark'?'rgb(22,27,53)':'white'}}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons style={{alignSelf:'center'}}  name="chevron-back" size={26} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
                    <TouchableOpacity >
                        <Text style={{...styles.editText, color:colorScheme=='light'?'black':'white'}}>Chat Settings</Text>
                    </TouchableOpacity>
                    {/**Just for alignment purposes */}
                    <TouchableOpacity><AntDesign name="leftcircle" size={30} color="transparent" /></TouchableOpacity>
                </View>

                <ScrollView style={styles.body} automaticallyAdjustKeyboardInsets>

                    <View style={{marginVertical:20, marginHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                        <Text style={{fontSize:18, color:colorScheme=='light'?'black':'white'}}>Read Receipts</Text>
                        <Switch value={readReceipts} onValueChange={toggleReadReceipts} color='orange' disabled={loadingReadReceipts}/>
                    </View>

                    <TouchableOpacity style={{marginVertical:20, marginHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                        <Text style={{fontSize:18, color:colorScheme=='light'?'black':'white'}}>Important Messages</Text>
                        <Ionicons style={{alignSelf:'center'}}  name="chevron-forward" size={26} color={colorScheme=='light'?'black':'white'} />
                    </TouchableOpacity>

                    <View style={{marginVertical:20, marginHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                        <Text style={{fontSize:18, color:colorScheme=='light'?'black':'white'}}>Last Seen & Online</Text>
                        <Switch value={isLastSeenActive} onValueChange={toggleLastSeen} color='orange' disabled={loadingSeenActive}/>
                    </View>

                    <TouchableOpacity style={{marginVertical:20, marginHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} onPress={()=>navigation.navigate('View Blocked Users')}>
                        <Text style={{fontSize:18, color:'rgb(250,90,91)'}}>View blocked users</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{marginVertical:20, marginHorizontal:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                        <Text style={{fontSize:18, color:'rgb(250,90,91)'}}>Delete all chats</Text>
                    </TouchableOpacity>

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
    }
})

export default ChatSettingsGeneral