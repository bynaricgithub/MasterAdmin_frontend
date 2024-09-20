import { createSlice } from "@reduxjs/toolkit";

export const navSlice = createSlice({
    name: 'nav',
    initialState: {
        path: null,
        data: null
    },
    reducers: {
        navigate: (state, action) => {
            state.path = action.payload
        },
        navigateData: (state, action) => {
            state.path = action.payload.path
            state.data = action.payload.data
        }
    },
})

export const {
    navigate,
    navigateData
} = navSlice.actions

export default navSlice.reducer