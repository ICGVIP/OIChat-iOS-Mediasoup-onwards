import { StyleSheet, Text, View, Image } from 'react-native'
import React, { Component } from 'react'
import {LineChart} from 'react-native-chart-kit';
const chartConfig = {
    
    
  }
export default function HomeGraph(props){

    let {data} = props;
    return(
        <View style={styles.container}>
            <View style={{flexDirection:'row',marginVertical:10,alignItems:'center',width:'100%',justifyContent:'flex-start'}}>
                <Image resizeMode='cover' source={{uri:data.logo}} style={{width:30,height:30}}/>
                <Text style={{marginHorizontal:10,fontWeight:'bold',fontSize:17,color:'white'}}>{data.name}</Text>
            </View>
            <Text style={{fontWeight:'bold',fontSize:23,color:'white',marginVertical:10}}>{data.price}</Text>
            {data.name=='Bitcoin'&&<Text style={{color:'rgb(244,146,47)'}}>{data.trend}</Text>}
            {data.name=='Ethereum'&&<Text style={{color:'rgb(250,93,119)'}}>{data.trend}</Text>}
            {data.name=='Litecoin'&&<Text style={{color:'rgb(250,93,119)'}}>{data.trend}</Text>}
            <LineChart
                data={data.data}
                height={80}
                width={300}
                chartConfig={data.chartConfig}
                yAxisSuffix=''
                yAxisLabel=''
                bezier
                withDots={false}
                style={{paddingRight:0}}
                withHorizontalLabels={false}
            >

            </LineChart>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        backgroundColor:'rgb(45,27,72)',
        borderRadius:20,
        marginRight:40,
        alignItems:'center',
        paddingHorizontal:10,
        width:200,
        overflow:'hidden'
    }
})