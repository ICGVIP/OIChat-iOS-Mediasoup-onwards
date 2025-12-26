import { SafeAreaView, Text, View, StatusBar, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { Component } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';
import Display from './sub-portfolio/Display';


const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

export default function Portfolio({navigation}) {

  let movers=[{name:'Bitcoin',logo:'https://oichat.s3.us-east-2.amazonaws.com/assets/Bitcoin.png',trend:'+4.5%',price:'$ 5,000',amount:'0.1 BTC',data:{labels: ["", "", "", "", "", ""],datasets: [{data: [20, 45, 28, 80, 99, 43],color: (opacity = 1) => `rgba(126,80,82, 1)`}]},chartConfig:{backgroundGradientFrom: "rgb(124,72,56)",backgroundGradientFromOpacity: 0,backgroundGradientTo: "rgb(53,31,70)",backgroundGradientToOpacity: 0,color: (opacity = 1) => `rgba(244,146,47, ${opacity})`,strokeWidth: 4,fillShadowGradientFrom:'rgb(124,72,56)',fillShadowGradientFromOpacity:1,fillShadowGradientTo:'rgb(124,72,56)',fillShadowGradientToOpacity:1,propsForBackgroundLines:{strokeWidth:0}}},
  {name:'Ethereum',logo:'https://cryptologos.cc/logos/ethereum-eth-logo.png',trend:'-6.33%',price:'$ 2,000',amount:'0.1 ETH',data:{labels: ["", "", "", "", "", ""],datasets: [{data: [20, 45, 28, 80, 99, 43],color: (opacity = 1) => `rgba(119,55,88,1)`}]},chartConfig:{backgroundGradientFrom: "rgb(124,72,56)",backgroundGradientFromOpacity: 0,backgroundGradientTo: "rgb(53,31,70)",backgroundGradientToOpacity: 0,color: (opacity = 0) => `rgba(244,146,47, ${opacity})`,strokeWidth: 4,fillShadowGradientFrom:'rgb(126,53,91)',fillShadowGradientFromOpacity:1,fillShadowGradientTo:'rgb(126,53,91)',fillShadowGradientToOpacity:1,propsForBackgroundLines:{strokeWidth:0}}},
  {name:'Litecoin',logo:'https://cryptologos.cc/logos/litecoin-ltc-logo.png',trend:'+1.3%',price:'$ 1,000',amount:'1 LTC',data:{labels: ["", "", "", "", "", ""],datasets: [{data: [20, 45, 28, 80, 99, 43],color: (opacity = 1) => `rgba(140,82,227,1)`}]},chartConfig:{backgroundGradientFrom: "rgb(124,72,56)",backgroundGradientFromOpacity: 0,backgroundGradientTo: "rgb(53,31,70)",backgroundGradientToOpacity: 0,color: (opacity = 1) => `rgba(244,146,47, ${opacity})`,strokeWidth: 8,fillShadowGradientFrom:'rgb(74,46,130)',fillShadowGradientFromOpacity:1,fillShadowGradientTo:'rgb(53,31,70)',fillShadowGradientToOpacity:1,propsForBackgroundLines:{strokeWidth:0}}}]
  return(
    <>
        <MyStatusBar
              backgroundColor={'rgb(27,14,52)'}
              barStyle={'light-content'}
        ></MyStatusBar>
        <LinearGradient colors={['rgb(27,14,52)','rgb(11,9,13)']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} onPress={()=>navigation.navigate('Money')}><AntDesign name="left" size={24} color='white' /><Text style={{color:'white',fontWeight:'bold',marginHorizontal:10,fontSize:19}}>Exit</Text></TouchableOpacity>
          </View>
          <View style={{marginTop:30,paddingLeft:10,flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontWeight:'bold',color:'white',fontSize:25,marginHorizontal:10}}>My Portfolio </Text>
            <AntDesign name="piechart" size={24} color={'rgb(153,42,204)'} />
          </View>
          <View style={{paddingHorizontal:40,marginVertical:30}}>
            <Text style={{color:'white',fontSize:15}}>Hi, </Text>
            <Text style={{color:'white',fontSize:18}}>Richard</Text>
          </View>
          <LinearGradient colors={['rgb(49,27,82)','rgb(19,12,33)']} style={styles.card}>
            <View style={{width:'60%'}}>
              <Text style={{color:'white'}}>Portfolio Value</Text>
              <Text style={{color:'white',fontSize:23,marginVertical:10,fontWeight:'bold'}}>$ 4,409.98</Text>
              <View style={{flexDirection:'row'}}>
                <Text style={{color:'rgb(55,240,253)',marginRight:20}}>+ $342.87</Text>
                <Text style={{color:'white'}}>last month</Text>
              </View>
            </View>
            <View style={{width:'40%',height:100}}>
                <Image resizeMode='contain' style={{width:'100%',height:'100%'}} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/crypto_vector_1.png'}}/>
            </View>
            
          </LinearGradient>
          <ScrollView style={{marginBottom:120,paddingHorizontal:30,paddingTop:20}}>
            <Text style={{color:'white', fontWeight:'bold',fontSize:19, marginBottom:30}}>My Assets</Text>
            {movers.map((i,index)=>
            <Display data={i} key={index}/>)}
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
  },
  card:{
    borderRadius:20,
    marginHorizontal:30,
    padding:20,
    flexDirection:'row'
  },
  
})
