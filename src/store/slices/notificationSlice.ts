import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationReceived {
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
  __v?: number;
}

const initialState: NotificationReceived[] = [];

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotification(_state, action: PayloadAction<NotificationReceived[]>) {
      return action.payload;
    },
    setOldNotification(state, action: PayloadAction<NotificationReceived[]>) {
      const existingIds = new Set(
        state.map((notification) => notification._id)
      );
      const uniqueOldNotifications = action.payload.filter(
        (notification) => !existingIds.has(notification._id)
      );
      state.push(...uniqueOldNotifications);
    },
    setReadAll(state) {
      state.forEach((notification) => {
        notification.read = true;
      });
    },
    setReadOne(state, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      const notification = state.find(
        (notification) => notification._id === id
      );
      if (notification) {
        notification.read = true;
      }
    },
    setNewNotification(state, action: PayloadAction<NotificationReceived>) {
      const exists = state.find(
        (notification) => notification._id === action.payload._id
      );
      if (exists) return;
      state.unshift(action.payload);
    },
  },
});

export const {
  setNotification,
  setOldNotification,
  setReadAll,
  setReadOne,
  setNewNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
