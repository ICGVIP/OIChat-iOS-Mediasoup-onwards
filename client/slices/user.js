import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";


const initialValue = {token:null,data:null};
export const userSlice = createSlice({
    name:'user',
    initialState:{value:initialValue},
    reducers:{
        login:(state,action)=>{
            state.value = {token:action.payload,data:jwtDecode(action.payload).sub};
        },
        logout:(state)=>{
            state.value = initialValue
        }
    }
})

export const {login,logout} = userSlice.actions
export default userSlice.reducer