import { createSlice } from '@reduxjs/toolkit'

export const messageSlice = createSlice({
    name: 'message',
    initialState: {
        show: false,
        message: '',
        displayClass: 'alert-primary',
        stopTimeOut: 0,
        notifications: []
    },
    reducers: {
        show: (state, action) => {
            state.show = true;
            state.message = action.payload.message;
            state.displayClass = action.payload.displayClass;
            state.stopTimeOut = action.payload?.stopTimeOut;
            state.notifications = [{
                message: action.payload.message,
                displayClass: action.payload.displayClass ? action.payload.displayClass : 'alert-info',
                time: Date.now()
            }, ...state.notifications]
        },
        hide: (state, action) => {
            state.show = false;
            state.message = '';
            state.displayClass = 'alert-primary';
            state.stopTimeOut = 0;
        },
        clearNotifications: (state, action) => {
            state.notifications = []
        },

        setLoading: (state, action) => {
            state.show = action.payload
        }
    },
})
// export const { show, hide, clearNotifications } = messageSlice.actions
export const { setLoading } = messageSlice.actions
export default messageSlice.reducer