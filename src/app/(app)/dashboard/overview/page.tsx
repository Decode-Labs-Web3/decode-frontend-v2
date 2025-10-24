"use client";

import Link from "next/link";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { fetchUnread } = useNotificationContext();
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
        fetchUnread?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [notifications.length, router, fetchUnread]);

  return (
    <>
      {userInfo && (
        <Card className="relative overflow-hidden mb-8 shadow-2xl hover-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg mb-1">
                  Profile Information
                </CardTitle>
                <p className="font-mono text-sm text-muted-foreground">
                  User ID: {userInfo._id}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="w-32 h-32 rounded-2xl border-2 border-border overflow-hidden shadow-xl">
                  <AvatarImage
                    src={
                      userInfo?.avatar_ipfs_hash
                        ? `https://ipfs.de-id.xyz/ipfs/${userInfo.avatar_ipfs_hash}`
                        : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                    }
                    alt="Avatar"
                    className="object-contain"
                  />
                  <AvatarFallback>Avatar</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold">
                      {userInfo.display_name ||
                        userInfo.username ||
                        "Your name"}
                    </h2>
                    {userInfo.role && (
                      <Badge variant="secondary">
                        {userInfo.role.charAt(0).toUpperCase() +
                          userInfo.role.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {userInfo.email}
                  </p>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold">About me</h4>
                    <Card className="hover-card">
                      <CardContent className="p-4">
                        <p className="leading-relaxed">{userInfo.bio}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Link href="/dashboard/connections/followers">
                        <span className="text-sm text-muted-foreground">
                          Followers
                        </span>
                        <p className="text-sm">{userInfo.followers_number}</p>
                      </Link>
                    </div>
                    <div className="space-y-2">
                      <Link href="/dashboard/connections/followings">
                        <span className="text-sm text-muted-foreground">
                          Following
                        </span>
                        <p className="text-sm">{userInfo.following_number}</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="text-green-600 dark:text-green-400"
              />
              <span className="text-sm text-muted-foreground">Security</span>
            </div>
            <p className="font-medium">Protected</p>
            <p className="text-xs text-muted-foreground mt-1">2FA enabled</p>
          </CardContent>
        </Card>

        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <FontAwesomeIcon
                icon={faWallet}
                className="text-blue-600 dark:text-blue-400"
              />
              <span className="text-sm text-muted-foreground">Wallets</span>
            </div>
            <p className="font-medium">Primary wallet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {" "}
              {userInfo?.primary_wallet?.address
                ? userInfo?.primary_wallet?.address.slice(0, 10) +
                  "......" +
                  userInfo?.primary_wallet?.address.slice(-6)
                : "No wallet connected"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <FontAwesomeIcon
                icon={faLaptop}
                className="text-purple-600 dark:text-purple-400"
              />
              <span className="text-sm text-muted-foreground">Devices</span>
            </div>
            <p className="font-medium">Current device</p>
            <p className="text-xs text-muted-foreground mt-1">
              {userInfo?.last_login
                ? new Date(userInfo.last_login).toLocaleString()
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <FontAwesomeIcon
                icon={faPlug}
                className="text-cyan-600 dark:text-cyan-400"
              />
              <span className="text-sm text-muted-foreground">dApps</span>
            </div>
            <p className="font-medium">5 connected</p>
            <p className="text-xs text-muted-foreground mt-1">Active today</p>
          </CardContent>
        </Card>
      </div>

      {notifications.length > 0 && (
        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Activity</h3>
              <Link
                href="/dashboard/notifications"
                className="text-sm text-muted-foreground hover:text-foreground"
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
                        <p className="text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.createdAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
