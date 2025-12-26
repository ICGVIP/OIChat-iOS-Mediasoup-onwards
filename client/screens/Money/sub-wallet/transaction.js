import React from 'react'
import { StyleSheet, View, Text, SafeAreaView, StatusBar, Dimensions, Image, useColorScheme, ImageBackground, ScrollView, TouchableOpacity } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather'; 
import TransactionDisplay from './TransactionDisplay';
const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

export default function Transaction({navigation}){
    let colorScheme = useColorScheme();
    let transaction = [{name:'Shell',date:'May 26, 2023',cost:'-$ 87.11',pic:'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Shell_logo.svg/1200px-Shell_logo.svg.png'},{name:'Amazon',date:'May 25, 2023',cost:'-$ 142.11',pic:'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'},{name:'Apple',date:'May 24, 2023',cost:'-$ 40',pic:'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'}]
    return(
        <>
            <MyStatusBar
                backgroundColor={colorScheme=='light'?'white':'rgb(33,38,52)'}
                barStyle={colorScheme=='dark'?'light-content':'dark-content'}
            ></MyStatusBar>
            <SafeAreaView style={colorScheme=='light'?{backgroundColor:'white',flex:1}:{backgroundColor:'rgb(33,38,52)',flex:1}}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={()=>navigation.navigate('Money')}><AntDesign name="left" size={24} color='rgb(20,130,199)' /></TouchableOpacity>
                    <Text style={{color:'rgb(20,130,199)',fontSize:20,fontWeight:'bold'}}>Wallet</Text>
                    <Entypo name="dots-three-vertical" size={24} color='rgb(20,130,199)' />
                </View>
                <ImageBackground style={styles.card} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/card_bg'}}>
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

                <View style={{marginTop:20,marginBottom:70,flex:1,paddingHorizontal:30}}>
                    <Text style={colorScheme=='light'?{color:'black',fontSize:20,fontWeight:'bold'}:{color:'white',fontSize:20,fontWeight:'bold'}}>My Transactions</Text>
                    <ScrollView style={{flex:1, paddingTop:10}}>
                        {transaction.map((i,index)=>
                        <TransactionDisplay data={i} key={index}/>)}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    )
}

var styles = StyleSheet.create({
    statusBar:{
        height: STATUSBAR_HEIGHT,
    },
    header:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingHorizontal:20,
        marginVertical:20
    },
    card:{
        marginHorizontal:30,
        marginVertical:20,
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
        backgroundColor:'rgb(251,138,37)',
        borderRadius:30,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        padding:10,
        marginHorizontal:10
    }
})