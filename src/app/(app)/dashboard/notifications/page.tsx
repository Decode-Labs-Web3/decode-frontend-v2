"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

interface NotificationReceived {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationReceived[]>(
    []
  );
  const getNotifications = async () => {
    try {
      const apiResponse = await fetch("/api/users/notifications", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        const errorMessage =
          response?.message || `API error: ${apiResponse.status}`;
        console.error("Follow API error:", errorMessage);
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
      setNotifications(response.data.notifications);
    } catch (error) {
      console.log(error);
    }
  };

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
        const errorMessage =
          response?.message || `API error: ${apiResponse.status}`;
        console.error("Follow API error:", errorMessage);
        return;
      }
      getNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  const markAsRead = async (id: string) => {
    // console.log("test from", id);
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
        console.error("Follow API error:", errorMessage);
        return;
      }
      getNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <div className="flex flex-col justify-start gap-2">
      <button
        onClick={() => markAllAsRead()}
        className="bg-blue-500 p-2 rounded-lg text-white w-40"
      >
        Mark all as read
      </button>
      {notifications.map((notification) => (
        <div
          key={notification._id}
          id={notification._id}
          className="flex items-center justify-between p-4 border border-white/10 rounded-lg my-2 bg-white/5"
        >
          <div className="flex items-center gap-3">
          {notification.read ?
          <FontAwesomeIcon icon={faCircleCheck} className="text-green-400" /> :
          <FontAwesomeIcon icon={faBell} className="text-yellow-400" />}

            <div>
              <p className="text-sm">{notification.title}</p>
              <p className="text-xs text-gray-400">{notification.createdAt}</p>
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
    </div>
  );
}
