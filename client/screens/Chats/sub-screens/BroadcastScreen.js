import React,{useState, useEffect, useContext} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Dimensions,useColorScheme, Image, TouchableOpacity,Modal, StatusBar, Pressable, KeyboardAvoidingView, Platform, ImageBackground} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import {useHeaderHeight} from '@react-navigation/elements';
import { useChannelSet } from '../../../context/channel';
import {CustomMessage } from './ChatScreen';

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

// export function SendButton(){
//     let {sendMessage,giphyActive} = useMessageInputContext();
//     let {disabled} = useChannelContext();

//     function sendMessageNew(e){
//         console.log(e,'...arjun vailly...\n');
//         sendMessage(e);
//     }

//     return (
//         <TouchableOpacity disabled={disabled||giphyActive} onPress={sendMessageNew}>

//             {giphyActive &&  <Ionicons name="arrow-forward-circle-sharp" size={24} color="rgb(123,124,53)" />}
//             {!giphyActive && disabled && <Ionicons name="arrow-forward-circle-sharp" size={24} color="rgb(123,124,53)" />}
//             {!giphyActive && !disabled && <Ionicons name="arrow-forward-circle-sharp" size={24} color="rgb(252,168,58)" />}
            
//         </TouchableOpacity>
        
//     )
// }

const BroadcastScreen = ({navigation}) => {

    let headerHeight = useHeaderHeight();
    const colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);
    const {bchannel,setBChannel} = useChannelSet();
    let [creating, setCreating] = useState(false);
    // let [members,setMembers] = useState(Object.values(bchannel.state.members ?? {},).map(member=>({user_id:member.user_id})));
    // let {client} = useChatContext();

    async function sendBroadcast() {
        // setCreating(true);
        // let messages = bchannel.state.messageSets[0].messages;
        // await bchannel.delete();
        // for (let ele of members){
        //     if(ele.user_id!=user.data.id){
        //         let target = await client.queryChannels({type:'messaging', members:{$eq:[user.data.id,ele.user_id]}});
                
        //         try{
        //             for( let m of messages){
        //                 let message = await target[0].sendMessage({"text":m.text,"user_id":user.data.id, "attachments":m.attachments, "skip_push":true});
                        
        //             }
        //         }
        //         catch(err){
        //             console.log(err,'....\n\n')
        //             let newChannel = client.channel('messaging', {members: [user.data.id,ele.user_id]});
        //             await newChannel.watch();
        //             for( let m of messages){
        //                 let message = await newChannel.sendMessage({"text":m.text,"user_id":user.data.id, "attachments":m.attachments, "skip_push":true});
        //             }

        //         }
                

        //     }
            
        // };
        
        // navigation.pop();
        // setCreating(false);
    }



    return (
        <KeyboardAvoidingView behavior={(Platform.OS === 'ios') ? 'padding' : null}>
            {/* <Channel channel={bchannel} keyboardVerticalOffset={headerHeight} SendButton={SendButton} MessageSimple={CustomMessage}>
                <MyStatusBar
                backgroundColor={'rgb(46,53,78)'}
                barStyle={'light-content'}
                ></MyStatusBar>

                {colorScheme=='light'?
                <>
                    <View style={styles.header}>
                        <ImageBackground style={styles.image} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/Header.png'}}>
                        
                            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',width:'100%'}}>
                                <TouchableOpacity onPress={sendBroadcast} style={{marginHorizontal:10, position:'absolute',left:3}} disabled={creating}><Feather name="send" size={24} color="white" /></TouchableOpacity>
                                <TouchableOpacity style={{flexDirection:'row', alignItems:'center',justifyContent:'center'}}>
                                    <Text numberOfLines={1} ellipsizeMode="tail" style={{color:'white',fontWeight:'bold',marginBottom:4, fontSize:18, alignSelf:'center'}}>
                                        Broadcast
                                    </Text>
                                </TouchableOpacity>
                            </View>
                    
                        </ImageBackground>
                    </View>
                    

                    <MessageList />
                    
                    <MessageInput />

                
                </>
                :
                <>
                    <View style={styles.header_dark}>
                        <ImageBackground style={styles.image} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/Header.png'}}>
                            
                                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',width:'100%'}}>
                                    <TouchableOpacity onPress={sendBroadcast} style={{marginHorizontal:10, position:'absolute',left:3}} disabled={creating}><Feather name="send" size={24} color="white" /></TouchableOpacity>
                                    <TouchableOpacity style={{flexDirection:'row', alignItems:'center',justifyContent:'center'}}>
                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{color:'white',fontWeight:'bold',marginBottom:4, fontSize:18, alignSelf:'center'}}>
                                            Broadcast
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                    
                        </ImageBackground>
                    </View>
                    

                    <MessageList>

                    </MessageList>
                    
                    <MessageInput />

                    
                </>
                
                }

            </Channel> */}
        </KeyboardAvoidingView>
    )
}
const styles = StyleSheet.create({
    header:{
        flexDirection:'row',
        backgroundColor:'white',
        height:130,
        width:'100%'
    },
    header_dark:{
        flexDirection:'row',
        backgroundColor:'rgb(41,44,56)',
        height:130,
        width:'100%'
    },
    image:{
        width:'100%',
        height:'100%',
        resizeMode:'cover',
        
    },
    pp:{
        width:50,
        height:50,
        borderRadius:25,
        overflow:'hidden'
    },
    statusBar:{
        height: STATUSBAR_HEIGHT,
    }
})

export default BroadcastScreen;