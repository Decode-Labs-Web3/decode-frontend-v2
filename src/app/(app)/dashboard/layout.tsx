"use client";

import App from "@/components/(app)";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import Loading from "@/components/(loading)";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useNotification } from "@/hooks/useNotification.hooks";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { useEffect, useRef, useState, useCallback } from "react";
import { fingerprintService } from "@/services/fingerprint.services";
import { NotificationSocketEvent } from "@/interfaces/notification.interfaces";
import {
  NotificationProvider,
  useNotificationContext,
} from "@/contexts/NotificationContext";
import { toastInfo, toastError, toastSuccess } from "@/utils/index.utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OutEvent =
  | { type: "disconnect"; data: string }
  | { type: "connect_error"; data: string }
  | { type: "connected"; data: { sid: string } }
  | { type: "user_connected"; data: Record<string, unknown> }
  | { type: "notification_received"; data: Record<string, unknown> };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </NotificationProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const { pushNewNotification } = useNotification();
  const { unread, setUnread } = useNotificationContext();
  const [isDeactivated, setIsDeactivated] = useState(false);
  const { fingerprintHash, updateFingerprint } = useFingerprint();

  useEffect(() => {
    (async () => {
      try {
        const { fingerprint_hashed } = await fingerprintService();
        // console.log("Fingerprint hashed:", fingerprint_hashed);
        updateFingerprint(fingerprint_hashed);
      } catch (error) {
        console.error("Error getting fingerprint:", error);
      }
    })();
  }, [updateFingerprint]);

  const fetchUserInfo = useCallback(async () => {
    if (!fingerprintHash) return;
    try {
      const apiResponse = await fetch("/api/users/overview", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
        credentials: "include",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();
      if (
        response.statusCode === 403 &&
        response.message === "Your account is deactivated"
      ) {
        setIsDeactivated(true);
        toastError("Account deactivated, please choose the modal");
        return;
      }
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("User data fetch error:", error);
      toastError("Failed to load user data");
      // Clear invalid data from localStorage
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
      // setLoading(true);
      console.log("User data fetch operation completed");
    }
  }, [fingerprintHash, setUser]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/users/websocket");
    esRef.current = es;

    es.onopen = () => {
      console.log("🟢 SSE connection opened");
    };

    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as OutEvent;
        if (msg.type === "connected") {
          console.log("🟢 SSE connection opened");
        }

        if (msg.type === "notification_received") {
          // msg.data: { event, data: {...}, timestamp, userId }
          const payload = msg.data as unknown as Record<string, unknown>;
          const notification = payload?.data as NotificationSocketEvent;
          if (notification) {
            setUnread((v) => v + 1);
            pushNewNotification(notification);
            console.log("New notification received:", notification);
            toastInfo(`Notification received: ${notification.title}`);
          }
        }
      } catch (error) {
        console.log("error", error);
        toastError("Error receiving notification from websocket");
      }
    };

    es.onerror = () => {
      console.log("SSE error");
    };

    return () => {
      console.log("SSE closed");
      es.close();
    };
  }, [pushNewNotification, setUnread, unread]);

  const handleReactivateAccount = useCallback(
    async (status: boolean) => {
      try {
        const apiResponse = await fetch("/api/users/reactivate", {
          method: "DELETE",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ status }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });
        const response = await apiResponse.json();

        if (status === false) {
          setIsDeactivated(false);
          router.push("/");
          router.refresh();
          return;
        }

        if (response.success) {
          toastSuccess("Account reactivated successfully");
          setIsDeactivated(false);
          router.refresh();
        } else {
          toastError(response.message || "Account reactivation failed");
          router.refresh();
          return;
        }
      } catch (error) {
        console.error("Account reactivation request error:", error);
        toastError("Account reactivation failed. Please try again.");
        router.refresh();
        return;
      }
    },
    [fingerprintHash, router]
  );

  if (isDeactivated) {
    return (
      <Dialog open={true} onOpenChange={() => handleReactivateAccount(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm account deactivation</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate your account? Account
              deactivated successfully, it will be permanently deleted after 1
              month.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleReactivateAccount(false)}
            >
              Return to login
            </Button>
            <Button onClick={() => handleReactivateAccount(true)}>
              Reactivate account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (loading || !user._id) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-hidden">
        <App.Navbar />
        <App.Sidebar />
        <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
          <Loading.OverviewCard />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <App.Navbar />
      <App.Sidebar />
      <main className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">{children}</main>
    </div>
  );
}
