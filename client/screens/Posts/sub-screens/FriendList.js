import React,{useState} from 'react';
import {Text,SafeAreaView,ScrollView, StyleSheet,View,Image,Dimensions} from 'react-native';
import { Button, TextInput,  Menu } from 'react-native-paper';

import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.3;

const FriendList = (props) => {

  let {i} = props;
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <>
      
        <View style={styles.container}>
          <View style={styles.displayPicture}>
            <Image style={styles.image} src={i.avatar}></Image>
          </View>
          <View style={styles.remaining}>
            <View style={{justifyContent:'space-between',alignItems:'center'}}>
                <Text style={styles.name}>{i.name}</Text>
            </View>
          </View>
          <Menu
              visible={visible}
              onDismiss={closeMenu}
              style={{backgroundColor:'rgb(255,255,255)',padding:0}}           
              anchor={<Entypo onPress={openMenu} name="dots-three-vertical" size={22} color="black" />}>
              <Menu.Item leadingIcon={()=><Ionicons name="person-outline" size={24} color="black" />} onPress={() => {}} title="Share contact" />
              <Menu.Item leadingIcon={()=><FontAwesome name="send-o" size={24} color="black" />} onPress={() => {}} title="Message" />
              <Menu.Item leadingIcon={()=><FontAwesome name="ban" size={24} color="black" />} onPress={() => {}} title="Block" />
          </Menu>
          
        </View>
       
      

    </>
    
  )
}
const styles = StyleSheet.create({
  container:{
    paddingHorizontal:20,
    marginVertical:10,
    flexDirection:'row',
    alignItems:'center',
  },
  displayPicture:{
    height:50,
    width:50,
    overflow:'hidden',
    borderRadius:25
  },
  image:{
    height:'100%',
    width:'100%',
    resizeMode:'cover'
  },
  remaining:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginHorizontal:16,
    height:40
  },
  name:{
    fontWeight:'bold',
    fontSize:17
  },
})
export default FriendList