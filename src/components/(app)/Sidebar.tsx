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
  const [mobileOpen, setMobileOpen] = useState(false);
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
        console.log("Follow API error:", response);
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

  useEffect(() => {
    const handler = () => setMobileOpen((v) => !v);
    window.addEventListener("toggle-sidebar", handler as EventListener);
    return () =>
      window.removeEventListener("toggle-sidebar", handler as EventListener);
  }, []);

  const Nav = (
    <nav className="p-3 space-y-1">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => {
            onChange(item.key);
            setMobileOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            active === item.key
              ? "bg-[color:var(--surface)] text-[color:var(--foreground)] border border-[color:var(--border)]"
              : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
          }`}
        >
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
            {item.key === "notifications" && unread > 0 && (
              <span className="text-xs text-[color:var(--muted-foreground-2)]">
                {unread}
              </span>
            )}
          </div>
        </button>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-[color:var(--surface-muted)] backdrop-blur-xl border-r border-[color:var(--border)] hidden md:flex flex-col">
        {Nav}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-0 bottom-0 w-64 bg-[color:var(--surface-muted)] border-r border-[color:var(--border)] shadow-xl">
            {Nav}
          </div>
        </div>
      )}
    </>
  );
}

// const SidebarRenderExample = (items: { key: string; label: string }[], activeKey: string) => {
//   // naive render without accessibility or focus management
//   return (
//     <div>
//       {items.map((item) => (
//         <button key={item.key} className={item.key === activeKey ? "bg-blue-600 text-white" : ""}>
//           {item.label}
//         </button>
//       ))}
//     </div>
//   );
// };
