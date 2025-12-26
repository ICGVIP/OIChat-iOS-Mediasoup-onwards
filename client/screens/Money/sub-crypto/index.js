import React,{useState} from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View,Pressable, StyleSheet, useColorScheme } from "react-native";
const Tab = createBottomTabNavigator();
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";

import Home from './Home';
import Portfolio from './Portfolio'
import Profile from './Profile'
import Trade from './Trade'
import QuickAction from './QuickAction'

const MyTabBar = (props) => {
    let {navigation,state} = props;
    return (
        <View style={styles.label_post}>
          <Pressable style={state.index==0?styles.select:styles.no_select} onPress={()=>navigation.navigate('Home')}><AntDesign name="home" size={state.index==0?25:20} color={state.index==0?'rgb(153,42,204)':'white'} /></Pressable>
          <Pressable style={state.index==1?styles.select:styles.no_select} onPress={()=>navigation.navigate('Trade')}><Entypo name="bar-graph" size={state.index==1?25:20} color={state.index==1?'rgb(153,42,204)':'white'} /></Pressable>
          <Pressable style={state.index==2?styles.select:styles.no_select} onPress={()=>navigation.navigate('Quick Action')}><Fontisto name="angle-dobule-up" size={state.index==2?25:20} color={state.index==2?'rgb(153,42,204)':'white'} /></Pressable>
          <Pressable style={state.index==3?styles.select:styles.no_select} onPress={()=>navigation.navigate('Portfolio')}><AntDesign name="piechart" size={state.index==3?25:20} color={state.index==3?'rgb(153,42,204)':'white'} /></Pressable>
          <Pressable style={state.index==4?styles.select:styles.no_select} onPress={()=>navigation.navigate('Profile')}><FontAwesome5 name="user-circle" size={state.index==4?23:18} color={state.index==4?'rgb(153,42,204)':'white'} /></Pressable>
        </View>
    )
}
const CryptoTabNavigator = ({navigation}) => {

    return (
      <Tab.Navigator
        initialRouteName="Home"
        tabBar={(props)=><MyTabBar {...props}/>}
        screenOptions={{headerShown:false}}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          
        />
        <Tab.Screen
          name="Trade"
          component={Trade}
        />
        <Tab.Screen
          name="Quick Action"
          component={QuickAction}
          
        />
        <Tab.Screen
           name='Portfolio'
           component={Portfolio}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
        />
       
      </Tab.Navigator>
    );
  };
  
  const styles = StyleSheet.create({
    
    label_post:{
      backgroundColor:'rgb(37,42,52)',
      position:'absolute',
      bottom:40,
      width:'90%',
      left:'5%',
      borderRadius:35,
      paddingHorizontal:20,
      color:'black',
      paddingVertical:15,
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      elevation:3,
      zIndex:1,
      borderTopColor:'rgb(87,51,103)',
      borderTopWidth:2,
      borderRightColor:'rgb(87,51,103)',
      borderRightWidth:1.3,
      borderLeftColor:'rgb(87,51,103)',
      borderLeftWidth:1.3
    },
    select:{
      padding:10,
      borderRadius:400,
      backgroundColor:'rgba(0,0,0,0.3)'
    },
    no_select:{}
  });

  export default CryptoTabNavigator;
