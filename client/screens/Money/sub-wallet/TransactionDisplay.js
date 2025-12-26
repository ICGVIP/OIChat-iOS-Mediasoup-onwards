import { LinearGradient } from 'expo-linear-gradient';
import React from 'react'
import {View,Text, StyleSheet,useColorScheme, TouchableOpacity} from 'react-native';
import { Avatar } from 'react-native-paper';

const TransactionDisplay = (props) => {

    let {data,goToChat} = props;
    let colorScheme = useColorScheme();
    return(
        <>
        {colorScheme=='light'?
        <TouchableOpacity style={styles.container}>
            <Avatar.Image size={55} source={{uri:data.pic}}></Avatar.Image>
            <View style={styles.message}>
                <Text style={colorScheme=='light'?{fontSize:17,fontWeight:'bold',color:'black'}:{fontSize:17,fontWeight:'bold',color:'white'}}>{data.name}</Text>
                <Text style={colorScheme=='light'?{fontSize:14,color:'black'}:{fontSize:14,color:'white'}}>{data.date}</Text>
            </View>
            <View style={styles.time_dark}>
                <Text style={{color:'black'}}>{data.cost}</Text>
            </View>
        </TouchableOpacity>
        :
        <TouchableOpacity style={styles.container_dark}>
            <LinearGradient colors={['rgb(39,42,55)','rgb(12,16,30)']} style={styles.gradient} >
                <Avatar.Image size={55} source={{uri:data.pic}}></Avatar.Image>
                <View style={styles.message}>
                    <Text style={{fontSize:17,fontWeight:'bold',color:'white',marginVertical:4}}>{data.name}</Text>
                    <Text style={{fontSize:14,color:'white'}}>{data.date}</Text>
                </View>
                <View style={styles.time}>
                   <Text style={{color:'white'}}>{data.cost}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
        }
        
        </>
    )
}

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        marginVertical:10,
        justifyContent:'space-between',
        backgroundColor:'rgb(218,218,218)',
        padding:20,
        borderRadius:50,
        marginHorizontal:5,
        alignItems:'center'
    },
    container_dark:{
        flexDirection:'row',
        marginVertical:10,
        backgroundColor:'rgb(218,218,218)',
        borderRadius:50,
        marginHorizontal:5
    },
    gradient:{
        flexDirection:'row',
        width:'100%',
        height:'100%',
        justifyContent:'space-between',
        alignItems:'center',
        borderRadius:50,
        padding:20,
    },
    message:{
        flex:1,
        paddingVertical:3,
        justifyContent:'space-between',
        paddingLeft:10,
    },
    time:{
        padding:10,
        alignItems:'center',
        borderRadius:20,
        borderWidth:0.5,
        borderColor:'rgba(255,255,255,0.5)'
    },
    time_dark:{
        padding:10,
        alignItems:'center',
        borderRadius:20,
        borderWidth:0.5,
        borderColor:'rgba(0,0,0,0.5)'
    }
})

export default TransactionDisplay