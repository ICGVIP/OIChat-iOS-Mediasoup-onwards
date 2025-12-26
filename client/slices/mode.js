import { createSlice } from "@reduxjs/toolkit";

const initialValue = {mode:'private'};
export const modeSlice = createSlice({
    name:'mode',
    initialState:{value:initialValue},
    reducers:{
        setPrivate:(state)=>{
            state.value = {mode:'private'};
        },
        setPublic:(state)=>{
            state.value = {mode:'public'}
        }
    }
})

export const {setPrivate,setPublic} = modeSlice.actions
export default modeSlice.reducer