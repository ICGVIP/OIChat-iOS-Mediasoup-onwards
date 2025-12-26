import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Text, View, StyleSheet, SafeAreaView, Pressable, useColorScheme, FlatList } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { ChatDisplay} from '../ChatDisplay';
import { useFocusEffect } from '@react-navigation/native';
import { useChannelSet } from '../../../context/channel';

export default function HiddenChats({navigation}) {

    let colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);
    let {channel, setChannel,hidden_chats,setHiddenChats} = useChannelSet()

    useFocusEffect(
        useCallback(()=>{
            setChannel(null)
        },[channel])
    )

    return (
        <SafeAreaView style={colorScheme=='light'?styles.container:styles.container_dark}>
            <View style={styles.header}>
                <Pressable onPress={()=>navigation.pop()}><AntDesign name="left" size={24} color="rgb(20,130,199)" /></Pressable>
                <View style={styles.text}>
                    <Text style={styles.newchat} onPress={()=>navigation.navigate('SignUp')}>Hidden Chats</Text>
                </View>        
            </View>

            <FlatList 
                data={hidden_chats}
                renderItem={(item,index)=>(<ChatDisplay key={index} item={item}/>)}
            />
            

        </SafeAreaView>
    )
}

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
    text:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center'
    },
    newchat:{
        fontSize:19,
        fontWeight:'bold',
        color:'rgb(20,130,199)',
    }
})