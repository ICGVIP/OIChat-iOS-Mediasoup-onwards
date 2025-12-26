import { Text, View,SafeAreaView, useColorScheme,StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { Component } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SearchChat({navigation}){

    let colorscheme=useColorScheme();

    return(
        <SafeAreaView style={colorscheme=='light'?styles.container:styles.container_dark}>
            <View style={styles.header}>
                <TouchableOpacity  onPress={()=>navigation.goBack()}><Ionicons name="chevron-back" size={30} color="rgb(32,132,196)"/></TouchableOpacity>
                <Text style={{fontWeight:'bold',fontSize:20, color:'rgb(32,132,196)'}}>Search</Text>
                <Ionicons name="chevron-back" size={30} color={colorscheme=='light'?'white':'rgb(33,38,51)'} />
            </View>
            <TextInput style={colorscheme=='light'?styles.input:styles.input_dark} placeholder='Search'></TextInput>            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container_dark:{
        flex:1,
        backgroundColor:'rgb(33,38,51)',
        padding:10,
        alignItems:'center'
    },
    container:{
        flex:1,
        backgroundColor:'rgb(255,255,255)',
        padding:10,
        alignItems:'center'
    },
    header:{
        width:'100%',
        padding:15,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    input:{
        width:'90%',
        backgroundColor:'rgb(228,229,231)',
        padding:10,
        borderRadius:20,
        color:'rgb(120,134,142)'
    },
    input_dark:{
        width:'90%',
        backgroundColor:'rgb(63,68,81)',
        padding:10,
        borderRadius:20,
        color:'white'
    }
})