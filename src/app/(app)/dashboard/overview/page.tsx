"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserInfoContext } from "@/contexts/UserInfoContext.contexts";
import { useNotificationContext } from "@/contexts/NotificationContext.contexts";
import {
  faShieldHalved,
  faWallet,
  faLaptop,
  faPlug,
  faCircleCheck,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

interface NotificationReceived {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function OverviewPage() {
  const router = useRouter();
  const { userInfo } = useUserInfoContext() || {};
  const { setUnread } = useNotificationContext();
  const [notifications, setNotifications] = useState<NotificationReceived[]>(
    []
  );

  useEffect(() => {
    router.refresh();

    const interval = setInterval(() => {
      const storedNotifications = sessionStorage.getItem("notifications");
      const notificationsData = storedNotifications
        ? JSON.parse(storedNotifications)
        : [];
      if (notificationsData.length > notifications.length) {
        setNotifications(notificationsData);
        setUnread((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [notifications.length, router, setUnread]);

  return (
    <>
      {/* Profile */}
      {userInfo && (
        <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] backdrop-blur-sm p-8 mb-8 shadow-2xl hover-card">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-[color:var(--foreground)]">
                Profile Information
              </h3>
              <p className="font-mono text-sm text-[color:var(--muted-foreground)]">
                User ID: {userInfo._id}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-80 h-80 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-[color:var(--border)] overflow-hidden shadow-xl">
                <Image
                  src={
                    userInfo?.avatar_ipfs_hash
                      ? `https://ipfs.de-id.xyz/ipfs/${userInfo.avatar_ipfs_hash}`
                      : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={"Avatar"}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-1 space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-[color:var(--foreground)]">
                    {userInfo.display_name || userInfo.username || "Your name"}
                  </h2>
                  {userInfo.role && (
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-600/80 dark:text-blue-300 text-sm font-medium border border-blue-500/20">
                      {userInfo.role.charAt(0).toUpperCase() +
                        userInfo.role.slice(1)}
                    </span>
                  )}
                </div>
                <p className="text-lg text-[color:var(--muted-foreground)]">
                  {userInfo.email}
                </p>
              </div>

              {/* Bio Section */}
              <div className="pt-6 border-t border-[color:var(--border)]">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-[color:var(--foreground)]">
                    About me
                  </h4>
                  <div className="bg-[color:var(--surface)] rounded-xl p-4 border border-[color:var(--border)] hover-card">
                    <p className="leading-relaxed text-[color:var(--foreground)]/90">
                      {userInfo.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-[color:var(--border)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Link href="/dashboard/connections/followers">
                      <span className="text-sm text-[color:var(--muted-foreground)]">
                        Followers
                      </span>
                      <p className="text-sm text-[color:var(--foreground)]">
                        {userInfo.followers_number}
                      </p>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <Link href="/dashboard/connections/followings">
                      <span className="text-sm text-[color:var(--muted-foreground)]">
                        Following
                      </span>
                      <p className="text-sm text-[color:var(--foreground)]">
                        {userInfo.following_number}
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-3">
            <FontAwesomeIcon
              icon={faShieldHalved}
              className="text-green-600 dark:text-green-400"
            />
            <span className="text-sm text-[color:var(--muted-foreground)]">
              Security
            </span>
          </div>
          <p className="font-medium text-[color:var(--foreground)]">
            Protected
          </p>
          <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
            2FA enabled
          </p>
        </div>

        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-3">
            <FontAwesomeIcon
              icon={faWallet}
              className="text-blue-600 dark:text-blue-400"
            />
            <span className="text-sm text-[color:var(--muted-foreground)]">
              Wallets
            </span>
          </div>
          <p className="font-medium text-[color:var(--foreground)]">
            Primary wallet
          </p>
          <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
            {" "}
            {userInfo?.primary_wallet?.address
              ? userInfo?.primary_wallet?.address.slice(0, 10) +
                "......" +
                userInfo?.primary_wallet?.address.slice(-6)
              : "No wallet connected"}
          </p>
        </div>

        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-3">
            <FontAwesomeIcon
              icon={faLaptop}
              className="text-purple-600 dark:text-purple-400"
            />
            <span className="text-sm text-[color:var(--muted-foreground)]">
              Devices
            </span>
          </div>
          <p className="font-medium text-[color:var(--foreground)]">
            Current device
          </p>
          <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
            {userInfo?.last_login
              ? new Date(userInfo.last_login).toLocaleString()
              : "—"}
          </p>
        </div>

        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-3">
            <FontAwesomeIcon
              icon={faPlug}
              className="text-cyan-600 dark:text-cyan-400"
            />
            <span className="text-sm text-[color:var(--muted-foreground)]">
              dApps
            </span>
          </div>
          <p className="font-medium text-[color:var(--foreground)]">
            5 connected
          </p>
          <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
            Active today
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      {notifications.length > 0 && (
        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg p-4 hover-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[color:var(--foreground)]">
              Recent Activity
            </h3>
            <Link
              href="/dashboard/notifications"
              className="text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification._id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex justify-between items-center w-full gap-3">
                  {notification.read ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-green-600 dark:text-green-400 text-sm"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faBell}
                      className="text-yellow-600 dark:text-yellow-400 text-sm"
                    />
                  )}

                  <div className="flex justify-between w-full gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-[color:var(--foreground)]">
                        {notification.title}
                      </p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
                      {notification.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
