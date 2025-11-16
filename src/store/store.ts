import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import fingerprintReducer from "./slices/fingerprintSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    fingerprint: fingerprintReducer,
    user: userReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
