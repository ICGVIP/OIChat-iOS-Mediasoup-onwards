import React,{useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {Text,SafeAreaView,FlatList, StyleSheet,View,Image,TouchableOpacity, useColorScheme, StatusBar, Dimensions, ScrollView, TextInput} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; 
import PostDisplay from './PostContent';
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



export const Search = ({navigation, route}) => {

    let colorScheme = useColorScheme();
    const ref = useRef();
    let user = useSelector(state=>state.user.value);
    let [text, setText] = useState('');
    
    
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
            <TextInput style={{...styles.input, backgroundColor:colorScheme=='light'?'rgb(230,230,230)':'rgb(61,64,87)', color:colorScheme=='light'?'black':'white'}} onChangeText={setText}/>
            <TouchableOpacity><Ionicons name="search-circle" size={44} color={text?'rgb(241,171,71)':'grey'} /></TouchableOpacity>
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
        paddingVertical:20,
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
      padding:10,
      fontSize:15,
      width:'75%',
      borderRadius:10
    }
})
