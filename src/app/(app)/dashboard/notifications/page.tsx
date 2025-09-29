"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useCallback, useRef } from "react";
import { faBell, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import Loading from "@/components/(loading)";

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
      console.log("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

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
    <div className="flex flex-col justify-start gap-2">
      <button
        onClick={() => markAllAsRead()}
        className="bg-blue-500 p-2 rounded-lg text-white w-40"
      >
        Mark all as read
      </button>
      {loading && <Loading.AuthCard />}
      {!loading &&
        notifications.map((notification, index) => (
          <div
            key={index}
            id={notification._id}
            className="flex items-center justify-between p-4 border border-[color:var(--border)] rounded-lg my-2 bg-[color:var(--surface)] hover-card"
          >
            <div className="flex items-center gap-3">
              {notification.read ? (
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-green-600 dark:text-green-400"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-yellow-600 dark:text-yellow-400"
                />
              )}

              <div>
                <p className="text-sm text-[color:var(--foreground)]">
                  {notification.title}
                </p>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  {notification.createdAt}
                </p>
              </div>
            </div>
            <button
              onClick={() => markAsRead(notification._id)}
              className="bg-blue-500 p-2 rounded-lg text-white w-20"
            >
              Read
            </button>
          </div>
        ))}
      {endOfData && (
        <div className="text-[color:var(--muted-foreground)] text-sm mt-2">
          End of data
        </div>
      )}
      {!endOfData && (
        <div className="text-[color:var(--muted-foreground)] text-sm mt-2">
          Current page: {page}
        </div>
      )}
    </div>
  );
}
