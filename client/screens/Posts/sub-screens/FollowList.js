import React,{useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {Text,SafeAreaView,FlatList, StyleSheet,View,Image,TouchableOpacity, useColorScheme, StatusBar, Dimensions, ScrollView, TextInput} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; 
import { useSelector } from 'react-redux';

import { Avatar, Button} from 'react-native-paper';


const windowWidth = Dimensions.get('window').width;
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
      </SafeAreaView>
    </View>
);

const FriendItem = ({data,navigation, type}) => {

    let colorScheme = useColorScheme();

    return (
        <View style={styles.friendItem}>
            <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
                <TouchableOpacity>
                    <Avatar.Image source={{uri:data.item.image}} size={50} />
                </TouchableOpacity>

                <View style={{marginHorizontal:15}}>
                    <TouchableOpacity><Text style={{color:colorScheme=='light'?'black':'white', fontWeight:'bold', marginBottom:5}}>{data.item.username}</Text></TouchableOpacity>
                    <TouchableOpacity><Text style={{color:'grey'}}>{data.item.name}</Text></TouchableOpacity>
                </View>
            </View>
            
            <Button mode="contained" onPress={() => console.log('Pressed')} buttonColor={colorScheme=='light'?'rgba(40,40,40,0.1)':'rgba(40,40,40,0.5)'} textColor={colorScheme=='light'?'black':'white'}>
                {type=='Followers'?'Remove':'Unfollow'}
            </Button>
        </View>
    )
}

export const FollowList = ({navigation, route}) => {

    let {type} = route.params;
    let colorScheme = useColorScheme();
    const ref = useRef();
    let user = useSelector(state=>state.user.value);
    let [friends, setFriends] = useState([{id:1, username:'virat.kohli', name:'Virat Kohli',image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe89vMgCtE5hF2srQTr02nXfx19RoA4-HK9ncD73gevAUINu3oTAd6LIXP9muGEU2PFkU&usqp=CAU'},{id:2, username:'andrew.tate', name:'Andrew Tate',image:'https://pbs.twimg.com/profile_images/1837023772546617345/1bdo3rVR_400x400.jpg'},{id:3, username:'thomas.shelby', name:'Thomas Shelby',image:'https://static.wikia.nocookie.net/peaky-blinders/images/f/f5/Peaky_Tommy_Shelby.jpg/revision/latest/scale-to-width-down/220?cb=20141013005757'},{id:4, username:'navi.brar', name:'Navi Brar', image:'https://i.pinimg.com/736x/d5/9c/eb/d59cebd20dc26a626afbc08fb4fa0079.jpg'},{id:5, username:'virat.kohli', name:'Virat Kohli',image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe89vMgCtE5hF2srQTr02nXfx19RoA4-HK9ncD73gevAUINu3oTAd6LIXP9muGEU2PFkU&usqp=CAU'},{id:6, username:'andrew.tate', name:'Andrew Tat',image:'https://pbs.twimg.com/profile_images/1837023772546617345/1bdo3rVR_400x400.jpg'},{id:7, username:'thomas.shelby', name:'Thomas Shelby',image:'https://static.wikia.nocookie.net/peaky-blinders/images/f/f5/Peaky_Tommy_Shelby.jpg/revision/latest/scale-to-width-down/220?cb=20141013005757'},{id:8, username:'navi.brar', name:'Navi Brar', image:'https://i.pinimg.com/736x/d5/9c/eb/d59cebd20dc26a626afbc08fb4fa0079.jpg'}])
    let [text, setText] = useState('');
    
    
    useEffect(()=>{
      
    },[])

    return(
      <View style={{flex:1, backgroundColor:colorScheme=='light'?'white':'rgb(21,24,37)'}}>

        <MyStatusBar
            backgroundColor={colorScheme=='light'?'white':'rgb(21,24,37)'}
            barStyle={colorScheme=='dark'?'light-content':'dark-content'}
        ></MyStatusBar>

        <View style={styles.header}>
            <TouchableOpacity onPress={()=>navigation.pop()}><Ionicons name="chevron-back" size={24} color={colorScheme=='light'?'black':'white'} /></TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', fontSize:17, fontWeight:'bold'}}>{type}</Text>
            <View><Ionicons name="chevron-back" size={24} color={'transparent'} /></View>
        </View>

        <TextInput style={colorScheme=='light'?styles.input:styles.input_dark} placeholder='Search' onChangeText={setText}></TextInput>

        <FlatList
            data={friends}
            renderItem={(item,index)=><FriendItem data={item} key={index} navigation={navigation} type={type}/>}
            contentContainerStyle={{marginVertical:20,width:'100%'}}
        />


      </View>
    )
}
const styles = StyleSheet.create({
    statusBar:{
        height: STATUSBAR_HEIGHT,
    },
    header:{
        flexDirection:'row',
        width:'100%',
        paddingHorizontal:15,
        paddingVertical:20,
        alignItems:'center',
        justifyContent:'space-between',
    },
    comment_avatar:{
      height:windowWidth*0.08, 
      width:windowWidth*0.08,
      borderRadius:windowWidth*0.04,
      overflow:'hidden'
    },
    input:{
        width:'90%',
        backgroundColor:'rgb(228,229,231)',
        padding:10,
        borderRadius:20,
        color:'rgb(120,134,142)',
        marginVertical:15,
        alignSelf:'center'
    },
    input_dark:{
        width:'90%',
        backgroundColor:'rgb(63,68,81)',
        padding:10,
        borderRadius:20,
        color:'white',
        marginVertical:15,
        alignSelf:'center'
    },
    friendItem:{
        width:'90%', 
        alignSelf:'center', 
        flexDirection:'row', 
        alignItems:'center', 
        marginBottom:25
    }
})
