import { configureStore, combineReducers } from '@reduxjs/toolkit'
import messageSlice from './AllReducers/messageSlice';
import userSlice from './AllReducers/userSlice';
import navSlice from './AllReducers/navSlice';

const combinedReducer = combineReducers({
    message: messageSlice,
    currentUser: userSlice,
    nav: navSlice,
});

const rootReducer = (state, action) => {
    return combinedReducer(state, action);
};

export default configureStore({
    reducer: rootReducer,
    devTools: true
});