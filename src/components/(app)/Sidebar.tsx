"use client";

import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGaugeHigh,
  faUserShield,
  faWallet,
  faLink,
  faNewspaper,
  faBell,
  faLaptop,
  faUser,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

import { SidebarProps } from "@/interfaces/index.interfaces";

const items = [
  { key: "overview", label: "Overview", icon: faGaugeHigh },
  { key: "personal", label: "Personal", icon: faUser },
  { key: "security", label: "Security", icon: faUserShield },
  { key: "wallets", label: "Wallets", icon: faWallet },
  { key: "connections", label: "Connections", icon: faLink },
  { key: "news", label: "News", icon: faNewspaper },
  { key: "notifications", label: "Notifications", icon: faBell },
  { key: "devices", label: "Devices", icon: faLaptop },
  { key: "blog-post", label: "Create Post", icon: faPenToSquare },
];

// interface NotificationReceived {
//   id: string;
//   title: string;
//   message: string;
//   read: boolean;
//   createdAt: string;
// }

export default function Sidebar({ active, onChange }: SidebarProps) {
  const [unread, setUnread] = useState<number>(0);
  // const [notifications, setNotifications] = useState<NotificationReceived[]>(
  //   []
  // );

  const getUnread = async () => {
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
        const errorMessage =
          response?.message || `API error: ${apiResponse.status}`;
        console.error("Follow API error:", errorMessage);
        return;
      }
      console.log("this is sidebar count notification", response);
      setUnread(response.data.count);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUnread();
  }, []);

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-black/60 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col">
      <nav className="p-3 space-y-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              active === item.key
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.key === "notifications" && unread > 0 && (
                <span className="text-xs text-gray-400">{unread}</span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
}
