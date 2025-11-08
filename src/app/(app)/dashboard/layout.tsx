"use client";

import App from "@/components/(app)";
import { useRouter } from "next/navigation";
import Loading from "@/components/(loading)";
import { UserProfile } from "@/interfaces/index.interfaces";
import { useEffect, useRef, useState, useCallback } from "react";
import { fingerprintService } from "@/services/fingerprint.services";
import { UserInfoContext } from "@/contexts/UserInfoContext";
import { toastInfo, toastError, toastSuccess } from "@/utils/index.utils";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserProfile>();
  const [isDeactivated, setIsDeactivated] = useState(false);

  useEffect(() => {
    (async () => {
      const { fingerprint_hashed } = await fingerprintService();
      document.cookie = `fingerprint=${fingerprint_hashed}; path=/; max-age=31536000; SameSite=Lax`;
    })();
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/users/overview", {
        method: "GET",
        credentials: "include",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();
      // const fetchUser = async () => {
      //   try {
      //     const apiResponse = await fetch("/api/users/overview");
      //     const responseJson = await apiResponse.json();
      //     if (responseJson?.statusCode === 403) {
      //     }
      //   } catch (error) {}
      // };
      if (
        response.statusCode === 403 &&
        response.message === "Your account is deactivated"
      ) {
        setIsDeactivated(true);
        toastError("Account deactivated, please choose the modal");
        return;
      }
      setUserInfo(response.data);
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
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
        setLoading(false);
      } catch (error) {
        router.push("/");
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("user");
      }
    }
    fetchUserInfo();
  }, [fetchUserInfo, router]);

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
          const notification = payload?.data as unknown as Record<
            string,
            unknown
          >;

          if (notification) {
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
  }, []);

  const handleReactivateAccount = async (status: boolean) => {
    try {
      const apiResponse = await fetch("/api/users/reactivate", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
  };

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

  if (loading) {
    return (
      <NotificationProvider>
        <div className="min-h-screen bg-(--background) text-(--foreground) overflow-hidden">
          <App.Navbar />
          <App.Sidebar />
          <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
            <Loading.OverviewCard />
          </div>
        </div>
      </NotificationProvider>
    );
  }

  return (
    <UserInfoContext.Provider value={{ userInfo, fetchUserInfo }}>
      <NotificationProvider>
        <div className="relative min-h-screen bg-(--background) text-(--foreground) overflow-hidden">
          <App.Navbar />
          <App.Sidebar />
          <main className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">{children}</main>
        </div>
      </NotificationProvider>
    </UserInfoContext.Provider>
  );
}
