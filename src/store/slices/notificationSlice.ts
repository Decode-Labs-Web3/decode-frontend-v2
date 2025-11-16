import {  createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationReceived {
  _id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  delivered: boolean;
  delivered_at: null | string;
  read: boolean;
  read_at: null | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const initialState: NotificationReceived[] = [];

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification(_state, action: PayloadAction<NotificationReceived[]>) {
      return action.payload;
    },
  },
});

export const { setNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
