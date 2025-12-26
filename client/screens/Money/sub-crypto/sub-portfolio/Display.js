import { StyleSheet, Text, View, Image } from 'react-native'
import React, { Component } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { LineChart } from 'react-native-chart-kit';

export default function Display(props){

    let {data} = props;
    return(
        <LinearGradient colors={['rgb(37,40,48)','rgb(14,11,18)']} style={styles.gradient}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Image resizeMode='cover' source={{uri:data.logo}} style={{width:30,height:30}}/>
                    <Text style={{fontSize:17,color:"rgb(166,172,183)",marginLeft:10}}>{data.name}</Text>
                </View>
                <Text style={{color:'white',fontSize:20,fontWeight:'bold'}}>{data.price}</Text>
            </View>
            <View style={{marginVertical:20, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <LineChart
                data={data.data}
                height={50}
                width={100}
                chartConfig={data.chartConfig}
                yAxisSuffix=''
                yAxisLabel=''
                bezier
                withDots={false}
                style={{paddingRight:0}}
                withHorizontalLabels={false}
                />
                {data.trend[0]=='+'&&<Text style={{color:'rgb(89,199,176)',marginRight:10}}>{data.trend}</Text>}
                {data.trend[0]=='-'&&<Text style={{color:'rgb(250,93,119)',marginRight:10}}>{data.trend}</Text>}
                <Text style={{color:'white'}}>{data.amount}</Text>
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
        marginHorizontal:30,
        marginBottom:30
    }
})