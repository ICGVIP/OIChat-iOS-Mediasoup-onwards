import React,{useState, useCallback, useEffect} from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View,Pressable, StyleSheet, useColorScheme, Alert, TouchableOpacity} from "react-native";
const Tab = createBottomTabNavigator();
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Avatar } from 'react-native-paper';
import Post from './Posts';
import CallsScreen from './Calls';
import Profile from './Profile';
import Money from './Money';
import Transaction from './Money/sub-wallet/transaction';
import Chats from './Chats';
import { useSelector } from 'react-redux';
import { useCallsSet } from '../context/calls';

const MyTabBar = (props) => {

    let {navigation,state} = props;

    return (
        <View style={styles.label_post}>
          <Pressable style={{...styles.center,flex:1}}  onPress={()=>navigation.navigate('Chats')}><View style={state.index==1?styles.select:styles.no_select}><Ionicons name="chatbubble-ellipses" size={state.index==1?26:21} color={state.index==1?'rgb(251,138,57)':'white'} /></View></Pressable>
          <Pressable style={{...styles.center,flex:1}}  onPress={()=>navigation.navigate('Calls')}><View style={state.index==2?styles.select:styles.no_select}><Ionicons name="call" size={state.index==2?26:21} color={state.index==2?'rgb(251,138,57)':'white'} /></View></Pressable>
          <Pressable style={{...styles.center,flex:1}}  onPress={()=>navigation.navigate('Post')}><View style={state.index==0||state.index==6?styles.select:styles.no_select}><FontAwesome5 name="compass" size={state.index==0||state.index==6?26:21} color={state.index==0||state.index==6?'rgb(251,138,57)':'white'} /></View></Pressable>
          <Pressable style={{...styles.center,flex:1}}  onPress={()=>navigation.navigate('Money')}><View style={state.index==3||state.index==5?styles.select:styles.no_select}><FontAwesome name="dollar" size={state.index==3?26:21} color={state.index==3||state.index==5?'rgb(251,138,57)':'white'} /></View></Pressable>
          <Pressable style={{...styles.center,flex:1}}  onPress={()=>navigation.navigate('Profile')}><View style={state.index==4?styles.select:styles.no_select}><FontAwesome5 name="user-circle" size={state.index==4?26:21} color={state.index==4?'rgb(251,138,57)':'white'} /></View></Pressable>
        </View>
    )
}


const MainTabNavigator = ({}) => {

      return (
       <>
          <Tab.Navigator
          initialRouteName="Chats"
          tabBar={(props)=><MyTabBar {...props}/>}
          screenOptions={{headerShown:false}}
          >
            <Tab.Screen
              name="Post"
              component={Post}
            />
      
            <Tab.Screen
              name="Chats"
              component={Chats}
            />
            <Tab.Screen
              name="Calls"
              component={CallsScreen}
              
            />
            <Tab.Screen
              name='Money'
              component={Money}
            />
            <Tab.Screen
              name="Profile"
              component={Profile}
            />
            <Tab.Screen 
              name='Transaction'
              component={Transaction}
            />
          </Tab.Navigator>
        
       </>   
        
      );
 
  };
  
  const styles = StyleSheet.create({
    
    label_post:{
      backgroundColor:'rgb(30,33,45)',
      position:'absolute',
      bottom:40,
      width:'90%',
      left:'5%',
      borderRadius:35,
      paddingHorizontal:20,
      color:'black',
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      elevation:3,
      zIndex:1,
      borderTopColor:'rgb(228,126,34)',
      borderTopWidth:2,
      borderRightColor:'rgb(228,126,34)',
      borderRightWidth:1.3,
      borderLeftColor:'rgb(228,126,34)',
      borderLeftWidth:1.3
    },
    select:{
      padding:10,
      borderRadius:500,
      backgroundColor:'rgba(0,0,0,0.3)',
      flex:1,
      justifyContent:'center',
      alignItems:'center'
    },
    no_select:{
      flex:1,
      justifyContent:'center',
      alignItems:'center'
    },
    center:{
      alignItems:'center',
      justifyContent:'center',
      paddingVertical:15
    }
    
  });

  export default MainTabNavigator;
