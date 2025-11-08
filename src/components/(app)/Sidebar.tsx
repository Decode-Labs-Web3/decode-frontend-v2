"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNotificationContext } from "@/contexts/NotificationContext";
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

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { unread } = useNotificationContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [notifications, setNotifications] = useState<NotificationReceived[]>(
  //   []
  // );

  const active = pathname.replace(/\/+$/, "").split("/")[2] || "overview";

  useEffect(() => {
    const handler = () => setMobileOpen((v) => !v);
    window.addEventListener("toggle-sidebar", handler as EventListener);
    return () =>
      window.removeEventListener("toggle-sidebar", handler as EventListener);
  }, []);

  return (
    <>
      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-(--surface-muted) backdrop-blur-xl border-r border-(--border) hidden md:flex flex-col">
        <nav className="p-3 space-y-1">
          {items.map((item) => (
            <Button
              key={item.key}
              onClick={() => {
                router.push(`/dashboard/${item.key}`);
                setMobileOpen(false);
              }}
              variant={active === item.key ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 px-3 py-2 h-auto ${
                active === item.key ? "border-l-4 border-primary" : ""
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.key === "notifications" && unread > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {unread}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <nav className="p-3 space-y-1">
            {items.map((item) => (
              <Button
                key={item.key}
                onClick={() => {
                  router.push(`/dashboard/${item.key}`);
                  setMobileOpen(false);
                }}
                variant={active === item.key ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 px-3 py-2 h-auto ${
                  active === item.key ? "border-l-4 border-primary" : ""
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.key === "notifications" && unread > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {unread}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

// const SidebarRenderExample = (items: { key: string; label: string }[], activeKey: string) => {
//   // naive render without accessibility or focus management
//   return (
//     <div>
//       {items.map((item) => (
//         <button key={item.key} className={item.key === activeKey ? "bg-blue-700 text-white" : ""}>
//           {item.label}
//         </button>
//       ))}
//     </div>
//   );
// };
