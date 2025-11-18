"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
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
  { key: "post", label: "Create Post", icon: faPenToSquare },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { fingerprintHash } = useFingerprint();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unread, setUnread } = useNotificationContext();

  const active = pathname.replace(/\/+$/, "").split("/")[2] || "overview";

  useEffect(() => {
    const handler = () => setMobileOpen((v) => !v);
    window.addEventListener("toggle-sidebar", handler as EventListener);
    return () =>
      window.removeEventListener("toggle-sidebar", handler as EventListener);
  }, []);

  const fetchUnread = useCallback(async () => {
    if (!fingerprintHash) return;
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
          console.log("Unread API error:", response);
        }
        return;
      }

      const response = await apiResponse.json();
      setUnread(response.data.count ?? 0);
    } catch (error) {
      console.log(error);
    }
  }, [fingerprintHash, setUnread]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

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
