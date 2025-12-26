import { SafeAreaView, Text, View, StyleSheet, useColorScheme, StatusBar, Image, Dimensions,Linking, ScrollView, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar, IconButton } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Demo({navigation}) {

    let [selected,setSelected]=useState('chat')
    let colorScheme = useColorScheme();

    return (
      <SafeAreaView style={colorScheme=='light'?styles.container:styles.container_dark}>
        <LinearGradient colors={['rgb(0,0,0)','rgb(54,42,6)']} end={{y:0.1}} style={styles.linearGradient}>
            <View style={styles.nav}>
                <AntDesign name="back" size={24} color="white" />
                <MaterialIcons name="menu" size={24} color="white" />
            </View>
            <View style={styles.data_container}>
              <Avatar.Image size={106} source={{uri:'https://www.billboard.com/wp-content/uploads/2023/02/Drake-2022-billboard-1548.jpg?w=942&h=623&crop=1'}} />
              <View style={styles.text}>
                <Text style={styles.heading}>Drake</Text>
                <Text style={{color:'white'}}>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</Text>
              </View>
            </View>
            <View style={styles.data_container2}>
              <View style={styles.miniview}>
                <IconButton icon={()=><Ionicons name="ios-pencil" size={20} color="white" />} size={20} />
                <IconButton icon='camera' size={20} />
                <IconButton icon={()=><FontAwesome5 name="keycdn" size={20} color="white" />} size={20} />
                <IconButton icon={()=><FontAwesome5 name="guitar" size={20} color="white" />} size={20} />
              </View>
            </View>
        </LinearGradient>
        
        <ScrollView style={styles.linearGradient2}>
          <View style={styles.tile}>
            <Avatar.Image size={66} source={{uri:'https://i.scdn.co/image/ab6761610000e5eb06bd126b2e5be27d79231bdf'}} />
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',fontWeight:'bold',fontSize:15,marginBottom:15}}>Hrjxt</Text>
              <Text style={{color:'rgb(119,133,120)'}}>Synthesizing</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',marginBottom:15}}>+$1000</Text>
              <Text style={{color:'rgb(119,133,120)'}}>0.5%</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center'}}>
              <MaterialIcons name="stars" size={24} color="rgb(250,197,51)" />
            </View>
          </View>
          <View style={styles.tile}>
            <Avatar.Image size={66} source={{uri:'https://i.scdn.co/image/ab6761610000e5eb06bd126b2e5be27d79231bdf'}} />
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',fontWeight:'bold',fontSize:15,marginBottom:15}}>Hrjxt</Text>
              <Text style={{color:'rgb(119,133,120)'}}>Synthesizing</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',marginBottom:15}}>+$1000</Text>
              <Text style={{color:'rgb(119,133,120)'}}>0.5%</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center'}}>
              <MaterialIcons name="stars" size={24} color="rgb(250,197,51)" />
            </View>
          </View>
          <View style={styles.tile}>
            <Avatar.Image size={66} source={{uri:'https://i.scdn.co/image/ab6761610000e5eb06bd126b2e5be27d79231bdf'}} />
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',fontWeight:'bold',fontSize:15,marginBottom:15}}>Hrjxt</Text>
              <Text style={{color:'rgb(119,133,120)'}}>Synthesizing</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',marginBottom:15}}>+$1000</Text>
              <Text style={{color:'rgb(119,133,120)'}}>0.5%</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center'}}>
              <MaterialIcons name="stars" size={24} color="rgb(250,197,51)" />
            </View>
          </View>
          <View style={styles.tile}>
            <Avatar.Image size={66} source={{uri:'https://i.scdn.co/image/ab6761610000e5eb06bd126b2e5be27d79231bdf'}} />
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',fontWeight:'bold',fontSize:15,marginBottom:15}}>Hrjxt</Text>
              <Text style={{color:'rgb(119,133,120)'}}>Synthesizing</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',marginBottom:15}}>+$1000</Text>
              <Text style={{color:'rgb(119,133,120)'}}>0.5%</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center'}}>
              <MaterialIcons name="stars" size={24} color="rgb(250,197,51)" />
            </View>
          </View>
          <View style={styles.tile}>
            <Avatar.Image size={66} source={{uri:'https://i.scdn.co/image/ab6761610000e5eb06bd126b2e5be27d79231bdf'}} />
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',fontWeight:'bold',fontSize:15,marginBottom:15}}>Hrjxt</Text>
              <Text style={{color:'rgb(119,133,120)'}}>Synthesizing</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
              <Text style={{color:'white',marginBottom:15}}>+$1000</Text>
              <Text style={{color:'rgb(119,133,120)'}}>0.5%</Text>
            </View>
            <View style={{flexDirection:'column',justifyContent:'center'}}>
              <MaterialIcons name="stars" size={24} color="rgb(250,197,51)" />
            </View>
          </View>
        </ScrollView>
        {console.log('selected',selected)}
        <View style={styles.label}>
          <Pressable style={selected=='chat'?styles.select:styles.no_select} onPress={()=>setSelected('chat')}><Ionicons name="chatbubble-ellipses" size={selected=='chat'?23:18} color={selected=='chat'?'black':'white'} /></Pressable>
          <Pressable style={selected=='call'?styles.select:styles.no_select} onPress={()=>setSelected('call')}><Ionicons name="call" size={selected=='call'?23:18} color={selected=='call'?'black':'white'} /></Pressable>
          <Pressable style={selected=='compass'?styles.select:styles.no_select} onPress={()=>setSelected('compass')}><FontAwesome5 name="compass" size={selected=='compass'?23:18} color={selected=='compass'?'black':'white'} /></Pressable>
          <Pressable style={selected=='dollar'?styles.select:styles.no_select} onPress={()=>setSelected('dollar')}><FontAwesome5 name="dollar-sign" size={selected=='dollar'?23:18} color={selected=='dollar'?'black':'white'} /></Pressable>
          
        </View>
      </SafeAreaView>
    )
  
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'white',
      alignItems: 'center',
    },
    container_dark:{
      flex: 1,
      backgroundColor:'black',
      alignItems: 'center',
      justifyContent:'space-between'
    },
    linearGradient:{
        width:'100%',
        height:'47.5%',
        borderBottomLeftRadius:20,
        borderBottomRightRadius:20,
        paddingVertical:10
    },
    linearGradient2:{
      width:'100%',
      marginTop:30,
      borderTopLeftRadius:20,
      borderTopRightRadius:20,
      paddingVertical:30,
      backgroundColor:'rgb(36,53,40)',
      paddingHorizontal:20
  },
    nav:{
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal:10
    },
    data_container:{
      marginVertical:40,
      paddingHorizontal:30,
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center'
    },
    text:{
      flex:1,
      paddingLeft:20,
      flexDirection:'column'
    },
    heading:{
      fontSize:25,
      fontWeight:'bold',
      color:'white',
      marginBottom:30
    },
    data_container2:{
      flexDirection:'column',
      shadowColor:'black',
      shadowOpacity: 0.9, 
      shadowRadius: 5,
      elevation: 5, 
      backgroundColor: 'transparent',

    },
    miniview:{
      width:'100%',
      marginVertical:40,
      paddingHorizontal:30,
      paddingVertical:20,
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
    },
    label:{
      backgroundColor:'rgb(250,197,51)',
      position:'absolute',
      bottom:50,
      width:'65%',
      borderRadius:35,
      paddingHorizontal:20,
      color:'black',
      paddingVertical:15,
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center'
    },
    tile:{
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      flexWrap:'nowrap',
      borderBottomWidth:1,
      borderBottomColor:'rgb(119,133,120)',
      paddingBottom:20,
      marginTop:15
    },
    select:{
      padding:10,
      borderRadius:200,
      backgroundColor:'rgba(20,20,20,0.3)'
    },
    no_select:{

    }
  });
