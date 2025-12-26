import AsyncStorage from '@react-native-async-storage/async-storage';


export const TokenKey = 'oichat_key';

export const getItemFromLocalStorage = async (key)=>{

    try{
        const token = await AsyncStorage.getItem(key)
        return token
    }
    catch(err){
        console.error('No key found to retrieve token from in getItem')
        return null
    }
    
};
export const setItemInLocalStorage = async (key,value)=>{

    try{
        let storeValue = typeof value != "string" ? JSON.stringify(value):value;
        await AsyncStorage.setItem(key,storeValue);
    }catch(err){
        console.error("Can't set item as key/value not found")
        return  null
    }

};

export const deleteItemFromLocalStorage = async (key)=>{

    try{
        await AsyncStorage.removeItem(key)
    }catch(err){
        console.error("'Can't delete as no key found")
        return null
    }

};