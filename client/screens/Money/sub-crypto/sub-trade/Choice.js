import { StyleSheet, Text, View, Image } from 'react-native';
import React, { Component } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
export default function Choice(props){

    let {data} = props;
    return(
        <LinearGradient colors={['rgb(37,40,48)','rgb(14,11,22)']} style={styles.gradient}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Image resizeMode='cover' source={{uri:data.logo}} style={{width:40,height:40}}/>
                <View style={{justifyContent:'space-between', alignItems:'center',flex:1,marginLeft:10}}>
                    <Text style={{fontSize:17,color:"white",fontWeight:'bold',marginBottom:15}}>{data.name}</Text>
                    <Text style={{color:'white'}}>{data.price}</Text>
                </View>
                <Text style={{color:'white', marginRight:10}}>{data.trend}</Text>
                {data.trend[0]=='+'?
                <Feather size={22} name='trending-up' color='rgb(74,173,134)'/>
                :
                <Feather size={22} name='trending-down' color='rgb(253,93,119)'/>
                }
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    gradient:{
        borderRadius:20,
        borderWidth:1,
        borderColor:'rgb(198,171,237)',
        padding:10,
        marginHorizontal:20,
        marginBottom:30
    }
})