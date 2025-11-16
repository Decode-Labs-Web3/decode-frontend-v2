"use client";

import Loading from "@/components/(loading)";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Card, CardContent } from "@/components/ui/card";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

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

export default function NotificationsPage() {
  const [page, setPage] = useState(0);
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [endOfData, setEndOfData] = useState(false);
  const [notifications, setNotifications] = useState<NotificationReceived[]>(
    []
  );

  const getNotifications = useCallback(async () => {
    if (endOfData) return;
    setLoading(true);

    try {
      const apiResponse = await fetch("/api/users/notifications", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ page }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(
          "Notifications API error:",
          response?.message || apiResponse.status
        );
        return;
      }
      setNotifications((prev) => [...prev, ...response.data.notifications]);
      setEndOfData(response.data.meta.is_last_page);
      console.log("this is end of data", response.data.meta.is_last_page);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [page, endOfData, fingerprintHash]);

  const markAllAsRead = async () => {
    try {
      const apiResponse = await fetch("/api/users/read-all", {
        method: "PATCH",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(
          "Notifications API error:",
          response?.message || apiResponse.status
        );
        return;
      }

      // Update local state immediately instead of refetching
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      // fetchUnread?.();
      console.log("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const apiResponse = await fetch("/api/users/read", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ id }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        const errorMessage =
          response?.message || `API error: ${apiResponse.status}`;
        console.error("Mark as read API error:", errorMessage);
        return;
      }

      // Update local state immediately instead of refetching
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      // fetchUnread?.();
      console.log("Notification marked as read:", id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const ticking = useRef(false);
  const cooldownRef = useRef(false);

  useEffect(() => {
    if (endOfData) return;
    const onScroll = () => {
      if (loading) return;
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const contentHeight = document.documentElement.scrollHeight;
        const scrolled = window.scrollY + window.innerHeight;
        const atBottom = contentHeight - scrolled <= 10;

        if (atBottom && !cooldownRef.current) {
          cooldownRef.current = true;
          setPage((p) => p + 1);
          setTimeout(() => {
            cooldownRef.current = false;
          }, 300);
        }
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [endOfData, loading]);

  return (
    <div className="flex flex-col justify-start gap-4">
      <Button onClick={() => markAllAsRead()} className="w-40">
        Mark all as read
      </Button>
      {loading && <Loading.NotificationCard />}
      {!loading &&
        notifications.map((notification) => (
          <Card
            key={notification._id}
            className="bg-(--card) border border-(--border) rounded-lg"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {notification.read ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-(--success)"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faBell}
                      className="text-(--warning)"
                    />
                  )}

                  <div>
                    <p className="text-sm">{notification.title}</p>
                    <p className="text-xs text-(--muted-foreground)">
                      {notification.createdAt}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    onClick={() => markAsRead(notification._id)}
                    size="sm"
                    className="w-20"
                  >
                    Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      {endOfData && (
        <p className="text-muted-foreground text-sm mt-2">End of data</p>
      )}
      {!endOfData && (
        <p className="text-muted-foreground text-sm mt-2">
          Current page: {page}
        </p>
      )}
    </div>
  );
}
