"use client";

import Loading from "@/components/(loading)";
import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NotificationReceived {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [endOfData, setEndOfData] = useState(false);
  const [notifications, setNotifications] = useState<NotificationReceived[]>(
    []
  );
  const { fetchUnread } = useNotificationContext();

  const getNotifications = useCallback(async () => {
    if (endOfData) return;
    setLoading(true);

    try {
      const apiResponse = await fetch("/api/users/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
      console.log("this is notifications", response);
      // setNotifications({
      //   id: response.data.notifications._id,
      //   title: response.data.notifications.title,
      //   message: response.data.notifications.message,
      //   read: response.data.notifications.read,
      //   createAt: response.data.notifications.createdAt,
      // });
      setNotifications((prev) => [...prev, ...response.data.notifications]);
      setEndOfData(response.data.meta.is_last_page);
      console.log("this is end of data", response.data.meta.is_last_page);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [page, endOfData]);

  // const getNotifications = async (pageIndex: number) => {
  //   try {
  //     const apiResponse = await fetch("/api/users/notifications", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ page: pageIndex }),
  //     });
  //     const responseJson = await apiResponse.json();
  //     if (!apiResponse.ok) {
  //       return;
  //     }
  //     setNotifications(responseJson.data.notifications);
  //   } catch (error) {}
  // };

  const markAllAsRead = async () => {
    try {
      const apiResponse = await fetch("/api/users/read-all", {
        method: "PATCH",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
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
      fetchUnread?.();
      console.log("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // const markAllAsRead = async () => {
  //   try {
  //     const apiResponse = await fetch("/api/users/read-all", { method: "PATCH" });
  //     const responseJson = await apiResponse.json();
  //     if (!apiResponse.ok) {
  //       return;
  //     }
  //    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  //   } catch (error) {}
  // };

  const markAsRead = async (id: string) => {
    try {
      const apiResponse = await fetch("/api/users/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
      fetchUnread?.();
      console.log("Notification marked as read:", id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // const markAsReadExample = async (notificationId: string) => {
  //   try {
  //     const apiResponse = await fetch("/api/users/read", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ id: notificationId }),
  //     });
  //     const responseJson = await apiResponse.json();
  //     if (!apiResponse.ok) {
  //       return;
  //     }
  //     // setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
  //   } catch (error) {}
  // };

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
