import React,{useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {Text,StyleSheet,ScrollView,View,Image,Dimensions, useColorScheme, Pressable, Platform, SafeAreaView, TouchableOpacity, TextInput, Keyboard, KeyboardAvoidingView} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'; 
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetTextInput,
  BottomSheetFooter
} from '@gorhom/bottom-sheet';

import { Avatar } from 'react-native-paper';

const storyViewDuration = 15 * 1000;

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const imageWidth = windowWidth * 0.3;


const RenderFooterForward = ({props}) => {

  let colorScheme = useColorScheme();
  return (
    <BottomSheetFooter {...props}>
      <View style={{width:'100%', padding:10, paddingBottom:30, backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(51,54,67)', borderTopWidth:0.5, borderTopColor:'grey'}}>

        <ScrollView
          horizontal
          style={{width:windowWidth}}
          contentContainerStyle={{paddingHorizontal:20}}
          showsHorizontalScrollIndicator={false}
        >

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='share-outline' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Share to</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='link-outline' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Copy Link</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <MaterialCommunityIcons name="progress-clock" size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Add to Story</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='logo-whatsapp' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Whatsapp</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='logo-instagram' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white',marginTop:10}}>Instagram</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <FontAwesome6 name="x-twitter" size={24} color={colorScheme=='light'?'black':'white'} />
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>X (Twitter)</Text>
          </View>

          <View style={{alignItems:'center', marginHorizontal:20}}>
            <TouchableOpacity style={{height:windowWidth/8,width:windowWidth/8,borderRadius:windowWidth/16,backgroundColor:colorScheme=='light'?'rgb(228,229,231)':'rgb(79,85,113)', justifyContent:'center', alignItems:'center'}}>
              <Ionicons name='chatbubble-outline' size={28} color={colorScheme=='light'?'black':'white'}/>
            </TouchableOpacity>
            <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10}}>Messages</Text>
          </View>
          
          

        </ScrollView>

      </View>
    </BottomSheetFooter>
  )
}

const RenderAvatarForward = ({item, ...rest}) => {

  let colorScheme = useColorScheme();
  let data = item.item

  return (
    <TouchableOpacity style={{alignItems:'center', marginHorizontal:20, marginVertical:15}}>
      <View style={{height:windowWidth/5,width:windowWidth/5,borderRadius:windowWidth/10,overflow:'hidden'}}>
        <Image source={{uri:data.avatar}} style={{height:'100%', width:'100%'}} resizeMode='cover'></Image>
      </View>
      <Text style={{color:colorScheme=='light'?'black':'white', marginTop:10, fontWeight:'bold'}}>{data.name}</Text>
    </TouchableOpacity>
  )
}

export default function StoryDisplay({navigation, route}) {

    let {stories,idOfStory} = route.params;
    console.log(stories,'...gets away ...\n\n')
    let colorScheme = useColorScheme();
    let user = useSelector(state=>state.user.value);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [storyIndex, setStoryIndex] = useState(idOfStory);
    const ref = useRef();
    let [text,setText] = useState('');
    let [searchText, setSearchText] = useState('');

    const player = useVideoPlayer(stories[storyIndex]?.url, (player) => {
        player.play();
    });
    const progress = useSharedValue(0); // 0 -> 1

    //Forward Modal Ref
    const forwardSheetModalRef = useRef(null);
    // variables
    const snapPointsForward = useMemo(() => ['45%','80%'], []);
    const story = stories[storyIndex]
    
    //Get this from context
    let chats = [{id:1, avatar: 'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', name: 'Andrew Tate'}, {id:2, avatar: 'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png', name: 'Hamza'}, {id:3, avatar: 'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', name: 'Navi'}, {id:7, avatar: 'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', name: 'Andrew Tate'}, {id:5, avatar: 'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png', name: 'Hamza'}, {id:8, avatar: 'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', name: 'Navi'}, {id:1, avatar: 'https://pbs.twimg.com/profile_images/1728837013023895552/nCHrdjlh_400x400.jpg', name: 'Andrew Tate'}, {id:9, avatar: 'https://pbs.twimg.com/media/FkqgQQWWYAAYzao.png', name: 'Hamza'}, {id:3, avatar: 'https://yt3.googleusercontent.com/WanIsZVkx6_O2tpjWdMhSH0EPCxmxbpYpG19LpYPPYp8nsjbZoz8EpN5NAaKJyqNUAN3Mr5_yA=s900-c-k-c0x00ffffff-no-rj', name: 'Navi'}]
    useEffect(() => {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: storyViewDuration,
        easing: Easing.linear,
      });
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
          setKeyboardVisible(true);
      });
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardVisible(false);
      });
    
      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, [storyIndex]);

    const goToPrevStory = () => {
      setStoryIndex((index) => {
        if (index === 0) {
          // if(type=='stories'){
          //     goToPrevUser();
          //     return 0;
          // }
          return navigation.pop(); 
        }
        return index - 1;
      });
  };
  
  const goToNextStory = () => {
      setStoryIndex((index) => {
        if (index >= stories.length - 1) {
          // if(type=='stories'){
          //     goToNextUser();
          //     return 0;
          // }
          return navigation.pop(); 
        }
        return index + 1;
      });
  };

  
    useAnimatedReaction(
      () => progress.value,
      (currentValue, previousValue) => {
        if (currentValue !== previousValue && currentValue === 1) {
          runOnJS(goToNextStory)();
        }
      }
    );
  
    const indicatorAnimatedStyle = useAnimatedStyle(() => ({
      width: `${progress.value * 100}%`,
    }));

    // callbacks for forward
    const handlePresentModalForwardPress = useCallback(() => {
      forwardSheetModalRef.current?.present();
    }, []);
    const handleForwardSheetChanges = useCallback((index) => {
      console.log('handleSheetChanges', index);
    }, []);
  
    return (
      <KeyboardAvoidingView style={{flex:1, backgroundColor:colorScheme=='light'?'white':'rgb(21,24,37)'}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        
        <SafeAreaView style={styles.container}>
        <View style={styles.storyContainer}>
            {story?.type=='image' ?
                <Image source={{ uri: story?.url }} style={styles.image} />
            :
                <VideoView
                    ref={ref}
                    player={player}
                    allowsPictureInPicture
                    style={[StyleSheet.absoluteFill]}
                    nativeControls={false}
                />
            }

  
          <Pressable 
            style={styles.navPressable} 
            onPress={isKeyboardVisible? ()=>Keyboard.dismiss():goToPrevStory} 
          />
  
          <Pressable
            style={[styles.navPressable, { right: 0 }]}
            onPress={isKeyboardVisible? ()=>Keyboard.dismiss():goToNextStory}
          />
  
          <View style={styles.header}>
            <LinearGradient
              // Background Linear Gradient
              colors={['rgba(0,0,0,0.7)', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            
            <View style={styles.indicatorRow}>

              <View key={`${story.id}`} style={styles.indicatorBG}>
                <Animated.View
                  style={[
                    styles.indicator,
                    indicatorAnimatedStyle
                  ]}
                />
              </View>

            </View>

            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Avatar.Image size={30} source={{uri:story?.avatar}}/>
                    <Text style={styles.username}>{story?.name}</Text>
                    <Text style={styles.timestamp}>{story?.timestamp}</Text>
                </View>
                <Pressable onPress={()=>navigation.pop()}>
                    <Feather name="x" size={30} color="white"/>
                </Pressable>
            </View>
            
          </View>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={{marginHorizontal:10}}><Ionicons name="heart-outline" size={28} color={'white'}/></TouchableOpacity>
          <TouchableOpacity style={{marginHorizontal:10}} onPress={handlePresentModalForwardPress}><Ionicons style={{transform:[{rotate:'-45deg'}], marginBottom:5}} name="send-outline" size={24} color={'white'} /></TouchableOpacity>
        </View>
      </SafeAreaView>

          

        <BottomSheetModal
          ref={forwardSheetModalRef}
          snapPoints={snapPointsForward}
          onChange={handleForwardSheetChanges}
          containerStyle={{zIndex:10, elevation:10}}
          backgroundStyle={{backgroundColor:colorScheme=='light'?'rgb(240,240,240)':'rgb(51,54,67)'}}
          handleIndicatorStyle={{backgroundColor:colorScheme=='light'?'black':'white'}}
          footerComponent={props => <RenderFooterForward props={props}/>}
        >
          <TextInput style={colorScheme=='light'?styles.searchInput:styles.searchInput_dark} placeholder="Search users" onChangeText={(text)=>setSearchText(text)}/>
          <BottomSheetFlatList 
            data={chats}
            numColumns={3}
            keyExtractor={(i) => i}
            contentContainerStyle={{alignItems:'center'}}
            renderItem={(item,index) => <RenderAvatarForward item={item} key={index}/>}
          />

        </BottomSheetModal>

      </KeyboardAvoidingView>
    );
  }
  
  const styles = StyleSheet.create({
    searchInput:{
      height: 40,
      borderRadius:8,
      backgroundColor: 'rgb(228,229,231)',
      paddingHorizontal: 15,
      marginBottom: 10,
      width:'90%',
      color:'rgb(120,134,142)',
      margin:15
    },
    searchInput_dark:{
        height: 40,
        borderRadius:8,
        backgroundColor: 'rgb(63,68,81)',
        paddingHorizontal: 15,
        marginBottom: 10,
        width:'90%',
        color:'white',
        margin:15
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    storyContainer: {
      flex: 1,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
    },
    header: {
      position: 'absolute',
      top: 0,
      // backgroundColor: 'rgba(0, 0, 0, 0.25)',
      width: '100%',
      padding: 20,
      paddingTop: 10,
    },
    username: {
      color: 'white',
      fontWeight: 'bold',
      marginHorizontal:10,
      fontSize:15
    },
    timestamp: {
        color: 'lightgrey',
        fontSize:14
    },
    footer: {
      width: '100%',
      backgroundColor: 'black',
      padding: 10,
      flexDirection:'row',
      alignItems:'center'
    },
    input: {
      borderWidth: 1,
      borderColor: 'gray',
      padding: 15,
      borderRadius: 50,
      color: 'white',
      flex:1
    },
    navPressable: {
      position: 'absolute',
      width: '30%',
      height: '100%',
    },  
    indicatorRow: {
      gap: 5,
      flexDirection: 'row',
      marginBottom: 20,
    },
    indicatorBG: {
      flex: 1,
      height: 3,
      backgroundColor: 'gray',
      borderRadius: 10,
      overflow: 'hidden',
    },
    indicator: {
      backgroundColor: 'white',
      height: '100%',
    },
  });