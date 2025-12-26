import React,{useState, useEffect, useCallback} from 'react';
import {Text,SafeAreaView,FlatList, StyleSheet,View,Image,Dimensions,useColorScheme, ImageBackground, StatusBar, TouchableOpacity} from 'react-native';
import { Button, Menu, ActivityIndicator} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; 
import CallDisplay from './sub-screens/CallDisplay';

import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useCallsSet } from '../../context/calls';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

const Call = ({navigation}) => {

  let [calls, setCalls] = useState([]);
  let colorscheme = useColorScheme();
  let [hasMore, setHasMore] = useState(true);
  let [loading, setLoading] = useState(false)
  let user = useSelector(state=>state.user.value);

  useFocusEffect (
    useCallback(()=>{
      fetchCalls();
    },[])
  )

  const fetchCalls = async() => {
    
    try{
      let reply = await fetch('http://216.126.78.3:8500/api/get_calls',{
        headers:{
          'Content-type':'application/json',
          'Authorization':`Bearer ${user.token}`
        }
      });
      let response = await reply.json();
      
      if(response.success){
        setCalls(response.data);
      }
    } catch(err){
      console.log(err, '..Error in fetching calls....\n\n')
    }
  }

   // Optional loading indicator at the end of the list
  const renderFooter = () => {
    if (!loading) return null;
    <ActivityIndicator animating={true} color={'rgb(170,170,170)'} style={{marginVertical:40}}/>
  };
  

  return (
    <>
    <MyStatusBar
              backgroundColor={colorscheme=='light'?'white':'rgb(33,38,52)'}
              barStyle={colorscheme=='dark'?'light-content':'dark-content'}
    ></MyStatusBar>
      <SafeAreaView style={colorscheme=='light'?{flex:1,backgroundColor:'white'}:{flex:1,backgroundColor:'rgb(33,38,52)'}}>
        <View style={styles.header}>
                <Text style={{color:'rgb(251,138,57)',fontSize:25,fontWeight:'bold'}}>Calls</Text>

                <View style={{flexDirection:'row',justifyContent:'space-evenly',width:'30%'}}>
                  <TouchableOpacity onPress={()=>navigation.navigate('New Call')}><Entypo name="circle-with-plus" size={24} color="rgb(251,138,57)" /></TouchableOpacity>
                  <TouchableOpacity onPress={()=>{}}><Feather name="link-2" size={24} color={colorscheme=='light'?'black':'white'} /></TouchableOpacity>  
                </View>
        </View>
        <FlatList 
          style={{marginBottom:70}}
          data={calls}
          renderItem = {({index,item})=><View style={{marginTop:15}}><CallDisplay data={item} index={index} /></View>}
          ListFooterComponent={renderFooter}
          keyExtractor={(item) => item.id}
          onEndReached={fetchCalls}
          onEndReachedThreshold={0.5}
          
        />
      </SafeAreaView>
      </>
  )
}
const styles = StyleSheet.create({
  image:{
    width:imageWidth,
    alignItems:'center',
    justifyContent:'center',
    
  },
  callBox_dark:{
    marginTop:15, 
  },
  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:20,
    alignItems:'center',
    marginVertical:10,
  },
  statusBar:{
    height:StatusBar.currentHeight
  }
})
export default Call