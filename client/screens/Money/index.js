import { Text, View, StyleSheet, StatusBar, useColorScheme, SafeAreaView, Image, TouchableOpacity, ScrollView} from 'react-native'
import React, { Component } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);

export default function Money({navigation}) {

    let colorScheme = useColorScheme();
    return(
        <>
        <MyStatusBar
              backgroundColor={colorScheme=='light'?'white':'rgb(21,24,34)'}
              barStyle={colorScheme=='dark'?'black':'white'}
        ></MyStatusBar>
        <ScrollView style={colorScheme=='light'?{backgroundColor:'white'}:{backgroundColor:'rgb(21,24,34)'}} contentContainerStyle={{paddingBottom:120}}>
            <View style={styles.header}>
                <Text style={{color:'rgb(251,138,57)',fontSize:25,fontWeight:'bold'}}>Finances</Text>
            </View>

            <View style={{marginVertical:25, width:'100%',alignItems:'center',backgroundColor:colorScheme=='dark'?'rgb(20,20,20)':'whitesmoke', padding:10}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons name="warning-outline" size={26} color="grey" style={{marginRight:15}}/>
                    <Text style={{color:'grey', fontStyle:'italic', fontSize:17}}>COMING SOON</Text>
                </View>
                <Text style={{fontSize:14, color:colorScheme=='light'?'black':'white', padding:20, textAlign:'center'}}>
                    The Finance section is under development, and we’re working hard to bring you an enhanced experience. Stay tuned for exciting updates! Meanwhile, enjoy exploring OI Chat!
                </Text>
            </View>
            <View style={styles.body1}>
                {/**onPress={()=>navigation.navigate('Crypto Section')} */}
                <TouchableOpacity style={styles.crypto}>
                    <View style={styles.pp}>
                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/crypto.png'}}></Image>
                    </View>
                    <Text style={{marginTop:10,fontWeight:'bold',color:'white'}}>Crypto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.wallet}>
                    <View style={styles.pp}>
                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/Wallet.png'}}></Image>
                    </View>
                    <Text style={{marginTop:10,fontWeight:'bold',color:'white'}}>Wallet</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.body2}>
                <TouchableOpacity style={styles.stocks}>
                    <View style={styles.pp}>
                        <Image style={{width:'100%',height:'100%',resizeMode:'cover'}} source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/stocks.png'}}></Image>
                    </View>
                        <Text style={{marginTop:10,fontWeight:'bold',color:'white'}}>Stocks</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
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
    body1:{
        marginTop:90,
        paddingHorizontal:20,
        flexDirection:'row',
        justifyContent:'space-evenly'
    },
    body2:{
        marginTop:15,
        paddingHorizontal:20,
        justifyContent:'center',
        alignItems:'center'
    },
    crypto:{
        borderRadius:20,
        backgroundColor:'rgb(125,81,231)',
        padding:20,
        alignItems:'center',
        paddingVertical:30
    },
    wallet:{
        borderRadius:20,
        backgroundColor:'rgb(22,112,77)',
        padding:20,
        alignItems:'center',
        paddingVertical:30
    },
    stocks:{
        borderRadius:20,
        backgroundColor:'rgb(250,93,119)',
        padding:20,
        alignItems:'center',
        paddingVertical:30
    }, 
    pp:{
        width:40,
        height:40,
        overflow:'hidden',
        marginHorizontal:30,
    }
})