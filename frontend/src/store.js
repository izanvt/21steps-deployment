import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import routinesReducer from "./routines/routinesSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    routines: routinesReducer, 
  },
});