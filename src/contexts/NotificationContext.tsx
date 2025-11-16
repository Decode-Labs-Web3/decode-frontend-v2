"use client";

import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
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
  const { fingerprintHash } = useFingerprint();

  const fetchUnread = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/users/unread", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        if (apiResponse.status !== 401) {
          const response = await apiResponse.json();
          console.log("Follow API error:", response);
        }
        return;
      }

      const response = await apiResponse.json();
      console.log("this is sidebar count notification", response);
      setUnread(response.data.count);
    } catch (error) {
      console.log(error);
    }
  }, [fingerprintHash]);

  useEffect(() => {
    const fetchUnreadData = async () => {
      try {
        const apiResponse = await fetch("/api/users/unread", {
          method: "GET",
          headers: getApiHeaders(fingerprintHash),
          cache: "no-cache",
          signal: AbortSignal.timeout(10000),
        });

        if (!apiResponse.ok) {
          if (apiResponse.status !== 401) {
            const response = await apiResponse.json();
            console.log("Follow API error:", response);
          }
          return;
        }

        const response = await apiResponse.json();
        console.log("this is sidebar count notification", response);
        setUnread(response.data.count);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUnreadData();
  }, [fingerprintHash]);

  return (
    <NotificationContext.Provider value={{ unread, setUnread, fetchUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => useContext(NotificationContext);
