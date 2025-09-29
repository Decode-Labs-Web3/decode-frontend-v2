"use client";

import App from "@/components/(app)";
import Loading from "@/components/(loading)";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserProfile } from "@/interfaces/index.interfaces";
import { toastInfo, toastError } from "@/utils/index.utils";
import { UserInfoContext } from "@/contexts/UserInfoContext.contexts";

interface NotificationReceived {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

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
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>("overview");
  const [user, setUser] = useState<UserProfile | null>(null);

  const refetchUserData = async () => {
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

      const responseData = await apiResponse.json();

      if (responseData.success && responseData.data) {
        const userData: UserProfile = {
          last_username_change: responseData.data.last_username_change,
          last_email_change: responseData.data.last_email_change,
          id: responseData.data._id,
          email: responseData.data.email,
          username: responseData.data.username,
          role: responseData.data.role,
          display_name: responseData.data.display_name,
          bio: responseData.data.bio,
          avatar_ipfs_hash: responseData.data.avatar_ipfs_hash,
          last_login: responseData.data.last_login,
          primary_wallet: responseData.data.primary_wallet,
          following_number: responseData.data.following_number,
          followers_number: responseData.data.followers_number,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error refetching user data:", error);
      toastError("Failed to refresh user data");
    } finally {
      console.log("User data refetch operation completed");
    }
  };

  useEffect(() => {
    if (!pathname) return;
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "dashboard") {
      const section = parts[1] || "overview";
      setActive(section);
    }
  }, [pathname]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }

    const fetchUser = async () => {
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

        const responseData = await apiResponse.json();

        const userData: UserProfile = {
          last_username_change: responseData.data.last_username_change,
          last_email_change: responseData.data.last_email_change,
          id: responseData.data._id,
          email: responseData.data.email,
          username: responseData.data.username,
          role: responseData.data.role,
          display_name: responseData.data.display_name,
          bio: responseData.data.bio,
          avatar_ipfs_hash: responseData.data.avatar_ipfs_hash,
          last_login: responseData.data.last_login,
          primary_wallet: responseData.data.primary_wallet,
          following_number: responseData.data.following_number,
          followers_number: responseData.data.followers_number,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("User data fetch error:", error);
        toastError("Failed to load user data");
      } finally {
        setLoading(false);
        // setLoading(true);
        console.log("User data fetch operation completed");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (key: string) => {
    setActive(key);
    if (key === "overview") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard/${key}`);
    }
  };

  const [logs, setLogs] = useState<NotificationReceived[]>([]);
  console.log("logs", logs);
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
            setLogs((prev) => {
              const newLogs = [
                {
                  _id: String(notification.id ?? ""),
                  title: String(notification.title ?? ""),
                  message: String(notification.message ?? ""),
                  read: Boolean(notification.read ?? false),
                  createdAt: String(
                    notification.createdAt ?? new Date()
                  ).toLocaleString(),
                },
                ...prev,
              ];
              sessionStorage.setItem("notifications", JSON.stringify(newLogs));
              return newLogs;
            });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
        <App.Navbar />
        <App.Sidebar active="overview" onChange={() => {}} />
        <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
          <Loading.OverviewCard />
        </div>
      </div>
    );
  }

  return (
    <UserInfoContext.Provider value={{ user, refetchUserData }}>
      <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
        <App.Navbar />
        <App.Sidebar active={active} onChange={handleChange} />
        <main className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">{children}</main>
      </div>
    </UserInfoContext.Provider>
  );
}
