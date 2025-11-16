"use client";

import {
  useContext,
  createContext,
  useState,
  SetStateAction,
} from "react";

interface NotificationContextValue {
  unread: number;
  setUnread: React.Dispatch<SetStateAction<number>>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = useState(0);

  return (
    <NotificationContext.Provider value={{ unread, setUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return ctx;
};
