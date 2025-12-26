import { SafeAreaView, Text, View, StatusBar, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, TextInput } from 'react-native';
import React, { useState } from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import Display from './sub-portfolio/Display';
import HomeGraph from './sub-home/HomeGraph';
import Choice from './sub-trade/Choice';

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

export default function Trade({navigation}) {

  let [choice,setChoice] = useState(0);
  let [data,setData] = useState([{name:'Bitcoin',logo:'https://oichat.s3.us-east-2.amazonaws.com/assets/Bitcoin.png',trend:'+0.46%',price:'$50,000'},{name:'Ethereum',logo:'https://cryptologos.cc/logos/ethereum-eth-logo.png',trend:'-0.26%',price:'$10,000'},{name:'Litecoin',logo:'https://cryptologos.cc/logos/litecoin-ltc-logo.png',trend:'+0.46%',price:'$1,000'}])
  let movers=[{name:'Bitcoin',logo:'https://oichat.s3.us-east-2.amazonaws.com/assets/Bitcoin.png',trend:'+18.33%',price:'$ 50,000',data:{labels: ["", "", "", "", "", ""],datasets: [{data: [20, 45, 28, 80, 99, 43],color: (opacity = 1) => `rgba(126,80,82, 1)`}]},chartConfig:{backgroundGradientFrom: "rgb(124,72,56)",backgroundGradientFromOpacity: 0,backgroundGradientTo: "rgb(53,31,70)",backgroundGradientToOpacity: 0,color: (opacity = 1) => `rgba(244,146,47, ${opacity})`,strokeWidth: 4,fillShadowGradientFrom:'rgb(124,72,56)',fillShadowGradientFromOpacity:1,fillShadowGradientTo:'rgb(124,72,56)',fillShadowGradientToOpacity:1,propsForBackgroundLines:{strokeWidth:0}}},
  {name:'Ethereum',logo:'https://cryptologos.cc/logos/ethereum-eth-logo.png',trend:'-18.33%',price:'$ 20,000',data:{labels: ["", "", "", "", "", ""],datasets: [{data: [20, 45, 28, 80, 99, 43],color: (opacity = 1) => `rgba(119,55,88,1)`}]},chartConfig:{backgroundGradientFrom: "rgb(124,72,56)",backgroundGradientFromOpacity: 0,backgroundGradientTo: "rgb(53,31,70)",backgroundGradientToOpacity: 0,color: (opacity = 0) => `rgba(244,146,47, ${opacity})`,strokeWidth: 4,fillShadowGradientFrom:'rgb(126,53,91)',fillShadowGradientFromOpacity:1,fillShadowGradientTo:'rgb(126,53,91)',fillShadowGradientToOpacity:1,propsForBackgroundLines:{strokeWidth:0}}},
  {name:'Litecoin',logo:'https://cryptologos.cc/logos/litecoin-ltc-logo.png',trend:'-1.3%',price:'$ 1,000',data:{labels: ["", "", "", "", "", ""],datasets: [{data: [20, 45, 28, 80, 99, 43],color: (opacity = 1) => `rgba(140,82,227,1)`}]},chartConfig:{backgroundGradientFrom: "rgb(124,72,56)",backgroundGradientFromOpacity: 0,backgroundGradientTo: "rgb(53,31,70)",backgroundGradientToOpacity: 0,color: (opacity = 1) => `rgba(244,146,47, ${opacity})`,strokeWidth: 8,fillShadowGradientFrom:'rgb(74,46,130)',fillShadowGradientFromOpacity:1,fillShadowGradientTo:'rgb(53,31,70)',fillShadowGradientToOpacity:1,propsForBackgroundLines:{strokeWidth:0}}}]
  return(
    <>
        <MyStatusBar
              backgroundColor={'rgb(27,14,52)'}
              barStyle={'dark-content'}
        ></MyStatusBar>
        <LinearGradient colors={['rgb(27,14,52)','rgb(11,9,13)']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} onPress={()=>navigation.navigate('Money')}><AntDesign name="left" size={24} color='white' /><Text style={{color:'white',fontWeight:'bold',marginHorizontal:10,fontSize:19}}>Exit</Text></TouchableOpacity>
          </View>
          <ScrollView style={{marginBottom:120,paddingHorizontal:20}}>
          
          <View style={{marginTop:15,paddingLeft:10,flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontWeight:'bold',color:'white',fontSize:25,marginHorizontal:10}}>Trade</Text>
            <Entypo name="bar-graph" size={24} color={'rgb(153,42,204)'} />
          </View>

          <ImageBackground style={styles.card} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/Balance.png'}}>
                    <Text style={{fontSize:18,marginBottom:10}}>Total Funds</Text>
                    <Text style={{fontWeight:'bold',fontSize:30,marginBottom:30}}>$ 18,366.11</Text>
                    <View style={styles.buttons}>
                        <View style={styles.orange}>
                            <AntDesign name="download" size={24} color="white" />
                            <Text style={{color:'white',marginHorizontal:10, fontWeight:'bold',fontSize:17}}>Deposit</Text>
                        </View>
                        <View style={styles.orange}>
                            <Feather name="external-link" size={24} color="white" />
                            <Text style={{color:'white',marginHorizontal:10, fontWeight:'bold',fontSize:17}}>Withdraw</Text>
                        </View>
                    </View>
          </ImageBackground>   
          <Text style={{color:'white', fontWeight:'bold',fontSize:19, marginBottom:15}}>Recommended</Text>
          <ScrollView horizontal style={{marginVertical:20}}>
                {movers.map((i,index)=>
                <HomeGraph data={i} key={index}/>)}
          </ScrollView>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <TouchableOpacity style={choice==0?styles.selected:styles.unselected} onPress={()=>setChoice(0)}>
                  <Text style={choice==0?{color:'rgb(rgb(216,139,36))'}:{color:'rgb(84,84,84)'}}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={choice==1?styles.selected:styles.unselected} onPress={()=>setChoice(1)}>
                  <Text style={choice==1?{color:'rgb(rgb(216,139,36))'}:{color:'rgb(84,84,84)'}}>Top gainers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={choice==2?styles.selected:styles.unselected} onPress={()=>setChoice(2)}>
                  <Text style={choice==2?{color:'rgb(rgb(216,139,36))'}:{color:'rgb(84,84,84)'}}>Top 50</Text>
              </TouchableOpacity>
              <TouchableOpacity style={choice==3?styles.selected:styles.unselected} onPress={()=>setChoice(3)}>
                  <Text style={choice==3?{color:'rgb(rgb(216,139,36))'}:{color:'rgb(84,84,84)'}}>All my assets</Text>
              </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
              <Entypo name="magnifying-glass" size={24} color="rgb(139,145,153)" style={{margin:5}}/>
              <TextInput style={styles.input} placeholder='Search'></TextInput>
          </View>
          {data.map((i,index)=>
          <Choice data={i} key={index}/>)}
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
    paddingHorizontal:20,
    justifyContent:'space-between',
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
    alignItems:'center',
    paddingVertical:40,
    borderRadius:30,
    overflow:'hidden'
  },
  buttons:{
    flexDirection:'row',
    justifyContent:'space-between'
  },
  orange:{
    backgroundColor:'rgb(142,87,227)',
    borderRadius:30,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    padding:10,
    marginHorizontal:10
  },
  selected:{
    backgroundColor:'rgb(48,31,13)',
    borderColor:'rgb(145,84,20)',
    borderWidth:1,
    borderRadius:20,
    padding:10
  },
  unselected:{
    backgroundColor:'rgb(20,20,20)',
    borderColor:'rgb(35,35,35)',
    borderWidth:1,
    borderRadius:20,
    padding:10
  },
  input:{
    color:'black',
    height:30,
    borderRadius:8,
    maxWidth:'82%',
    paddingStart:0,
    flexGrow:1,
    color:'rgb(139,145,153)',
    fontSize:17,
    justifyContent:'center',
    paddingTop:3
},
inputContainer:{
    height: 35,
    borderRadius:8,
    backgroundColor: 'rgb(30,32,32)',
    width:'90%',
    marginHorizontal:20,
    flexDirection:'row',
    flexWrap:'nowrap',
    justifyContent:'space-between',
    marginVertical:30,
} 
  
})
