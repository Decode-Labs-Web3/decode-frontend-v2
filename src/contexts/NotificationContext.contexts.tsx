"use client";

import {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
  SetStateAction,
} from "react";

interface NotificationContextValue {
  unread: number;
  setUnread: React.Dispatch<SetStateAction<number>>;
  fetchUnread: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  unread: 0,
  setUnread: () => {},
  fetchUnread: async () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/users/unread", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.log("Follow API error:", response);
        return;
      }
      console.log("this is sidebar count notification", response);
      setUnread(response.data.count);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  return (
    <NotificationContext.Provider value={{ unread, setUnread, fetchUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => useContext(NotificationContext);
