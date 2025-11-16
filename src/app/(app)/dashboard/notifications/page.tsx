"use client";

import Loading from "@/components/(loading)";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Card, CardContent } from "@/components/ui/card";
import { useNotification } from "@/hooks/useNotification.hooks";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { faBell, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function NotificationsPage() {
  const [page, setPage] = useState(0);
  const { fingerprintHash } = useFingerprint();
  const { setUnread } = useNotificationContext();
  const [loading, setLoading] = useState(false);
  const [endOfData, setEndOfData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const {
    notifications,
    setNotifications,
    addOldNotifications,
    markAllRead,
    markOneRead,
  } = useNotification();

  const getNotifications = useCallback(async () => {
    if (endOfData || fetchingRef.current) return;
    fetchingRef.current = true;
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
      if (page === 0) {
        setNotifications(response.data.notifications);
      } else {
        addOldNotifications(response.data.notifications);
      }
      setEndOfData(response.data.meta.is_last_page);
      console.log("this is end of data", response.data.meta.is_last_page);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [page, endOfData, fingerprintHash, setNotifications, addOldNotifications]);

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

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
      markAllRead();
      setUnread(0);
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
      markOneRead(id);
      setUnread((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);
  const restoreOnNextRenderRef = useRef(false);
  const fetchingRef = useRef(false);

  const handleScroll = () => {
    const element = containerRef.current;
    if (!element || endOfData || loadingMore || fetchingRef.current) return;
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      prevScrollHeightRef.current = element.scrollHeight;
      restoreOnNextRenderRef.current = true;
      setLoadingMore(true);
      setPage((p) => p + 1);
    }
  };

  useEffect(() => {
    if (page === 0) return;
    if (!restoreOnNextRenderRef.current) return;
    const element = containerRef.current;
    if (element) {
      element.scrollTop = prevScrollHeightRef.current - element.clientHeight;
      prevScrollHeightRef.current = element.scrollHeight;
    }
    setLoadingMore(false);
    restoreOnNextRenderRef.current = false;
  }, [notifications, page]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem-2.5rem)] overflow-hidden">
      <ScrollArea
        className="h-full"
        ref={containerRef}
        onScrollViewport={handleScroll}
      >
        <div className="flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-(--card) border-b border-(--border) p-2">
            <Button onClick={() => markAllAsRead()} className="w-40">
              Mark all as read
            </Button>
          </div>

          <div className="space-y-2 p-2 pb-16">
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
            {loadingMore && (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Loading more...
              </div>
            )}
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 z-10 bg-(--card) border-t border-(--border) p-2">
            {endOfData ? (
              <p className="text-muted-foreground text-sm">End of data</p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Current page: {page}
              </p>
            )}
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
