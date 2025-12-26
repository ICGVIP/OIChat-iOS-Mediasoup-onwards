import { createSlice } from "@reduxjs/toolkit";
const initialValue = {contacts:[]};
export const contactsSlice = createSlice({
    name:'contacts',
    initialState:{value:initialValue},
    reducers:{
        setContacts:(state,action)=>{
            state.value = {contacts:action.payload};
        }
    }
})

export const {setContacts} = contactsSlice.actions
export default contactsSlice.reducer