import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore
} from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import contactsReducer from './slices/contacts';
import modeReducer from './slices/mode';
import userReducer from './slices/user';

import NavigationWrapper from './screens/NavigationWrapper';
// import { WithSplashScreen } from './Splash';

import { ChannelProvider } from './context/channel';
import { RTCProvider } from './context/rtc';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ToastProvider } from './context/ToastContext';


//Use any key of choice 
const persistConfig = {
  key: 'OIChat_real',
  storage: AsyncStorage
}
var rootReducer=combineReducers({
  user:userReducer,
  mode:modeReducer,
  contacts:contactsReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)
var store = configureStore({
  reducer:persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

const STATUSBAR_HEIGHT = StatusBar.currentHeight;



const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

export default function App(){

  let [isAppReady,setIsAppReady] = useState(false);
  
  
  useEffect(() => {

    (async()=>{  
      // await requestNotifications(['alert', 'sound']);
      setIsAppReady(true);
      
    })();

  }, []);


  return (
    <>
      
      
        <GestureHandlerRootView style={{flex:1}}>
        
          <Provider store={store}>
              <PersistGate loading={<Text>Loading.....</Text>} persistor={persistor}>
                  <ChannelProvider>
                    <RTCProvider>
                      <PaperProvider>
                          <ToastProvider>
                            <BottomSheetModalProvider>
                                  <NavigationWrapper />
                            </BottomSheetModalProvider>
                          </ToastProvider>
                        </PaperProvider>
                    </RTCProvider>
                  </ChannelProvider>
              </PersistGate>
          </Provider>
        </GestureHandlerRootView>
    </>
    
  )
}


let styles={
  statusBar: {
    height: STATUSBAR_HEIGHT,
  }
}