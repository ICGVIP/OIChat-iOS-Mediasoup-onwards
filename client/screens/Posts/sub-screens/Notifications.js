import React,{useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {Text,SafeAreaView,FlatList, StyleSheet,View,Image,TouchableOpacity, useColorScheme, StatusBar, Dimensions, KeyboardAvoidingView, TextInput, Platform} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; 
import { useSelector } from 'react-redux';


const windowWidth = Dimensions.get('window').width;
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);


export const Notifications = ({navigation, route}) => {

    let colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);
    
    useEffect(()=>{
      
    },[])

    return(
      <View style={{flex:1, backgroundColor:colorScheme=='light'?'white':'rgb(21,24,37)'}}>

          <MyStatusBar
            backgroundColor={colorScheme=='light'?'white':'rgb(21,24,37)'}
            barStyle={colorScheme=='dark'?'light-content':'dark-content'}
          ></MyStatusBar>

          <View style={styles.header}>
            <TouchableOpacity onPress={()=>navigation.pop()}><Ionicons name="chevron-back" size={24} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
            <Text style={{fontWeight:'bold', fontSize:17, color:colorScheme=='light'?'black':'white'}}>Notifications</Text>
            <Ionicons name="chevron-back" size={24} color="transparent" />
          </View>

      </View>
    )
}
const styles = StyleSheet.create({
    statusBar:{
        height: STATUSBAR_HEIGHT,
    },
    header:{
        flexDirection:'row',
        width:'100%',
        paddingHorizontal:15,
        paddingVertical:10,
        alignItems:'center',
        justifyContent:'space-between',
    },
    comment_avatar:{
      height:windowWidth*0.08, 
      width:windowWidth*0.08,
      borderRadius:windowWidth*0.04,
      overflow:'hidden'
    },
    input:{
      borderWidth:0.5,
      borderColor:'grey',
      paddingVertical:7,
      paddingHorizontal:5,
      fontSize:14,
      width:'70%',
      borderRadius:20
    }
})
