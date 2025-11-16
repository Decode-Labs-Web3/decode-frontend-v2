import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setNotification,
  setOldNotification,
  setReadAll,
  setReadOne,
  setNewNotification,
  type NotificationReceived,
} from "@/store/slices/notificationSlice";

interface UseNotificationResult {
  notifications: NotificationReceived[];
  setNotifications: (list: NotificationReceived[]) => void;
  addOldNotifications: (list: NotificationReceived[]) => void;
  markAllRead: () => void;
  markOneRead: (id: string) => void;
  pushNewNotification: (n: NotificationReceived) => void;
}

export const useNotification = (): UseNotificationResult => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notification);

  const setNotifications = useCallback(
    (list: NotificationReceived[]) => {
      dispatch(setNotification(list));
    },
    [dispatch]
  );

  const addOldNotifications = useCallback(
    (list: NotificationReceived[]) => {
      dispatch(setOldNotification(list));
    },
    [dispatch]
  );

  const markAllRead = useCallback(() => {
    dispatch(setReadAll());
  }, [dispatch]);

  const markOneRead = useCallback(
    (id: string) => {
      dispatch(setReadOne({ id }));
    },
    [dispatch]
  );

  const pushNewNotification = useCallback(
    (n: NotificationReceived) => {
      dispatch(setNewNotification(n));
    },
    [dispatch]
  );

  return {
    notifications,
    setNotifications,
    addOldNotifications,
    markAllRead,
    markOneRead,
    pushNewNotification,
  };
};
