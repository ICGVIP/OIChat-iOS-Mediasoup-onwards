import { SafeAreaView, Text, View, StatusBar, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { Component } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';
import HomeGraph from './sub-home/HomeGraph';

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

export default function Home({navigation}) {

  let movers=[{name:'Bitcoin',logo:'https://oichat.s3.us-east-2.amazonaws.com/assets/Bitcoin.png',trend:'+18.33%',price:'$ 50,000',data:{labels: ["", "", "", "", "", ""],datasets: [{data: [20, 45, 28, 80, 99, 43],color: (opacity = 1) => `rgba(126,80,82, 1)`}]},chartConfig:{backgroundGradientFrom: "rgb(124,72,56)",backgroundGradientFromOpacity: 0,backgroundGradientTo: "rgb(53,31,70)",backgroundGradientToOpacity: 0,color: (opacity = 1) => `rgba(244,146,47, ${opacity})`,strokeWidth: 4,fillShadowGradientFrom:'rgb(124,72,56)',fillShadowGradientFromOpacity:1,fillShadowGradientTo:'rgb(124,72,56)',fillShadowGradientToOpacity:1,propsForBackgroundLines:{strokeWidth:0}}},
  {name:'Ethereum',logo:'https://cryptologos.cc/logos/ethereum-eth-logo.png',trend:'-18.33%',price:'$ 20,000',data:{labels: ["", "", "", "", "", ""],datasets: [{data: [20, 45, 28, 80, 99, 43],color: (opacity = 1) => `rgba(119,55,88,1)`}]},chartConfig:{backgroundGradientFrom: "rgb(124,72,56)",backgroundGradientFromOpacity: 0,backgroundGradientTo: "rgb(53,31,70)",backgroundGradientToOpacity: 0,color: (opacity = 0) => `rgba(244,146,47, ${opacity})`,strokeWidth: 4,fillShadowGradientFrom:'rgb(126,53,91)',fillShadowGradientFromOpacity:1,fillShadowGradientTo:'rgb(126,53,91)',fillShadowGradientToOpacity:1,propsForBackgroundLines:{strokeWidth:0}}},
  {name:'Litecoin',logo:'https://cryptologos.cc/logos/litecoin-ltc-logo.png',trend:'-1.3%',price:'$ 1,000',data:{labels: ["", "", "", "", "", ""],datasets: [{data: [20, 45, 28, 80, 99, 43],color: (opacity = 1) => `rgba(140,82,227,1)`}]},chartConfig:{backgroundGradientFrom: "rgb(124,72,56)",backgroundGradientFromOpacity: 0,backgroundGradientTo: "rgb(53,31,70)",backgroundGradientToOpacity: 0,color: (opacity = 1) => `rgba(244,146,47, ${opacity})`,strokeWidth: 8,fillShadowGradientFrom:'rgb(74,46,130)',fillShadowGradientFromOpacity:1,fillShadowGradientTo:'rgb(53,31,70)',fillShadowGradientToOpacity:1,propsForBackgroundLines:{strokeWidth:0}}}]
  return(
    <>
        <MyStatusBar
              backgroundColor={'rgb(27,14,52)'}
              barStyle={'white'}
        ></MyStatusBar>
        <LinearGradient colors={['rgb(27,14,52)','rgb(11,9,13)']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} onPress={()=>navigation.navigate('Money')}><AntDesign name="left" size={24} color='white' /><Text style={{color:'white',fontWeight:'bold',marginHorizontal:10,fontSize:19}}>Exit</Text></TouchableOpacity>
          </View>
          <ScrollView style={{marginTop:30,paddingLeft:10, marginBottom:70}}>
            <Text style={{color:'white',fontWeight:'bold',marginHorizontal:10,fontSize:23}}>Top Movers</Text>
            <ScrollView horizontal style={{marginVertical:20}}>
              {movers.map((i,index)=>
              <HomeGraph data={i} key={index}/>)}
            </ScrollView>
            <View style={{marginBottom:70,paddingHorizontal:20}}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <View style={styles.pp}><Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:'https://as1.ftcdn.net/v2/jpg/02/23/53/44/1000_F_223534409_rsvfrYsWlNyJPtz58IzqbPlcfo8hL3K2.jpg'}}></Image></View>
                    <View style={{paddingHorizontal:10, justifyContent:'space-between',flexShrink:1}}>
                      <Text style={{color:'white',fontWeight:'bold',flexShrink:1}}>Bitcoin is soaring so high it will leave everything else behind</Text>
                      <Text style={{color:'white',marginVertical:10}}>Dec 19, 2023</Text>
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <View style={styles.pp}><Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:'https://as1.ftcdn.net/v2/jpg/02/23/53/44/1000_F_223534409_rsvfrYsWlNyJPtz58IzqbPlcfo8hL3K2.jpg'}}></Image></View>
                    <View style={{paddingHorizontal:10, justifyContent:'space-between',flexShrink:1}}>
                      <Text style={{color:'white',fontWeight:'bold',flexShrink:1}}>Bitcoin is soaring so high it will leave everything else behind</Text>
                      <Text style={{color:'white',marginVertical:10}}>Dec 19, 2023</Text>
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <View style={styles.pp}><Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:'https://as1.ftcdn.net/v2/jpg/02/23/53/44/1000_F_223534409_rsvfrYsWlNyJPtz58IzqbPlcfo8hL3K2.jpg'}}></Image></View>
                    <View style={{paddingHorizontal:10, justifyContent:'space-between',flexShrink:1}}>
                      <Text style={{color:'white',fontWeight:'bold',flexShrink:1}}>Bitcoin is soaring so high it will leave everything else behind</Text>
                      <Text style={{color:'white',marginVertical:10}}>Dec 19, 2023</Text>
                    </View>
                </View>
            </View>
          </ScrollView>
        </LinearGradient>
    </>
   
  )
}

const styles = StyleSheet.create({
  statusBar: {
    height: StatusBar.currentHeight,
  },
  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:10,
    alignItems:'center',
    marginVertical:10
  },
  gradient:{
    flex:1,
  },
  pp:{
    width:120,
    height:120,
    borderRadius:20,
    overflow:'hidden',
    marginTop:10
  }
})
