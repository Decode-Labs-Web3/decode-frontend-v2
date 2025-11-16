import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  NotificationReceived,
  NotificationSocketEvent,
} from "@/interfaces/notification.interfaces";

const initialState: NotificationReceived[] = [];

function normalizeNotification(notification: NotificationSocketEvent) {
  const { id, ...rest } = notification;
  return { ...(rest as Omit<NotificationReceived, "_id">), _id: id };
}

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
    setNewNotification(state, action: PayloadAction<NotificationSocketEvent>) {
      const incoming = normalizeNotification(action.payload);
      const exists = state.find((n) => n._id === incoming._id);
      if (exists) return;
      state.unshift(incoming);
    },
    resetNotifications() {
      return [] as NotificationReceived[];
    },
  },
});

export const {
  setNotification,
  setOldNotification,
  setReadAll,
  setReadOne,
  setNewNotification,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
