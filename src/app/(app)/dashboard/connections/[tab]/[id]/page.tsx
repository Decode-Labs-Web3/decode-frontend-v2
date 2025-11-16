"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Loading from "@/components/(loading)";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SnapshotChart from "@/components/(app)/SnapshotChart";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type {
  UserData,
  MutualFollower,
} from "@/interfaces/connections.interfaces";

// Interfaces moved to src/interfaces/connections.interfaces.ts

export default function Page() {
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const { tab, id } = useParams<{ id: string; tab: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);

  console.log("This is user data", userData);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/relationship", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ id }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(apiResponse);
        toastError("API error");
        return;
      }
      setUserData(response.data);
      toastSuccess(response?.message || "Profile fetched successfully");
      console.log(response);
    } catch (error) {
      console.log(error);
      toastError("error");
    } finally {
      setLoading(false);
    }
  }, [id, fingerprintHash]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/follow-and-unfollow", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ id }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.log(response.message);
        toastError(response.message || `API error follow`);
        return;
      }
      toastSuccess(response?.message || "Follow/unfollow action successful");
      setUserData(response.data);
      fetchUserData();
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnFollow = async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/follow-and-unfollow", {
        method: "DELETE",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ id }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(response.message);
        toastError(response.message || `API error unfollow fail`);
        return;
      }
      toastSuccess(response?.message || "Follow/unfollow action successful");
      setUserData(response.data);
      fetchUserData();
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/block-and-unblock", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ id }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(response.message);
        toastError(response.message || `API error block fail`);
        return;
      }
      toastSuccess(response?.message || "Follow/unfollow action successful");
      setUserData(response.data);
      fetchUserData();
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnBlock = async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/block-and-unblock", {
        method: "DELETE",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ id }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(response.message);
        toastError(response.message || `API error unblock fail`);
        return;
      }
      toastSuccess(response?.message || "Follow/unfollow action successful");
      setUserData(response.data);
      fetchUserData();
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // const preloadAvatarExample = (avatarUrl: string) => {
  //   const image = new Image();
  //   image.src = avatarUrl;
  // };

  return (
    <>
      {loading && (
        <div>
          <Loading.ConnectionCard />
        </div>
      )}

      {userData && (
        <div className="flex flex-col gap-6">
          <Card className="bg-(--card) border border-(--border) rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 border border-(--border)">
                  <AvatarImage
                    src={
                      userData.avatar_ipfs_hash
                        ? `https://ipfs.de-id.xyz/ipfs/${userData.avatar_ipfs_hash}`
                        : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                    }
                    alt={userData.display_name || "Avatar"}
                    className="object-contain"
                  />
                  <AvatarFallback>
                    {userData.display_name?.charAt(0) ||
                      userData.username?.charAt(0) ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-semibold truncate flex items-center">
                      <span className="truncate">
                        {userData.display_name || userData.username}
                      </span>
                      <FontAwesomeIcon
                        icon={faCircle}
                        className={`ml-3 ${
                          userData.is_online
                            ? "text-(--success)"
                            : "text-(--muted-foreground-2)"
                        }`}
                        title={userData.is_online ? "Online" : "Offline"}
                        aria-hidden={false}
                      />
                    </h1>
                    <Badge variant="outline" className="text-xs">
                      {userData.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-(--muted-foreground) truncate mb-1">
                    @{userData.username}
                  </p>
                  {userData.primary_wallet?.address && (
                    <p className="text-sm text-(--muted-foreground) truncate mb-3">
                      Wallet: {userData.primary_wallet.address.slice(0, 6)}...
                      {userData.primary_wallet.address.slice(-4)}
                    </p>
                  )}
                  <div className="flex gap-3 text-xs text-(--muted-foreground)">
                    <Link
                      href={`/dashboard/connections/${tab}/${id}/followers`}
                      className="hover:text-(--foreground) transition-colors"
                    >
                      <span>{userData.followers_number} followers</span>
                    </Link>
                    <span>•</span>
                    <Link
                      href={`/dashboard/connections/${tab}/${id}/followings`}
                      className="hover:text-(--foreground) transition-colors"
                    >
                      <span>{userData.following_number} following</span>
                    </Link>
                    {typeof userData.mutual_followers_number === "number" && (
                      <>
                        <span>•</span>
                        <span>{userData.mutual_followers_number} mutual</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!userData.is_blocked && (
                    <Button
                      onClick={
                        userData.is_following ? handleUnFollow : handleFollow
                      }
                      disabled={loading || userData.is_blocked}
                      variant={userData.is_following ? "outline" : "default"}
                      size="sm"
                    >
                      {userData.is_following
                        ? loading
                          ? "Unfollowing..."
                          : "Unfollow"
                        : loading
                        ? "Following..."
                        : "Follow"}
                    </Button>
                  )}

                  <Button
                    onClick={userData.is_blocked ? handleUnBlock : handleBlock}
                    disabled={loading}
                    variant={userData.is_blocked ? "outline" : "destructive"}
                    size="sm"
                  >
                    {userData.is_blocked
                      ? loading
                        ? "Unblocking..."
                        : "Unblock"
                      : loading
                      ? "Blocking..."
                      : "Block"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <SnapshotChart userId={id} />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-(--foreground)">
              Mutual followers
            </h2>
            {typeof userData.mutual_followers_number === "number" && (
              <Badge variant="outline" className="text-xs">
                {userData.mutual_followers_number}
              </Badge>
            )}
          </div>

          {userData.mutual_followers_list.length === 0 ? (
            <Card className="bg-(--card) border border-(--border) rounded-lg">
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-(--muted-foreground) text-sm">
                  No mutual followers
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userData.mutual_followers_list.map(
                (mutualFollower: MutualFollower) => (
                  <HoverCard key={mutualFollower.user_id}>
                    <HoverCardTrigger asChild>
                      <Card className="hover:shadow-md cursor-pointer">
                        <CardContent className="p-4">
                          <Link
                            href={`/dashboard/connections/followings/${mutualFollower.user_id}`}
                            className="flex items-center gap-3 min-w-0"
                          >
                            <Avatar className="w-10 h-10 border border-(--border)">
                              <AvatarImage
                                src={
                                  mutualFollower.avatar_ipfs_hash
                                    ? `https://ipfs.de-id.xyz/ipfs/${mutualFollower.avatar_ipfs_hash}`
                                    : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                                }
                                alt={mutualFollower.display_name || "Avatar"}
                                className="object-contain"
                              />
                              <AvatarFallback className="text-xs">
                                {mutualFollower.display_name?.charAt(0) ||
                                  mutualFollower.username?.charAt(0) ||
                                  "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-(--foreground)">
                                {mutualFollower.display_name}
                              </p>
                              <p className="truncate text-xs text-(--muted-foreground)">
                                @{mutualFollower.username}
                              </p>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="w-80 p-4"
                      side="bottom"
                      align="start"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-16 h-16 border border-(--border)">
                            <AvatarImage
                              src={
                                mutualFollower.avatar_ipfs_hash
                                  ? `https://ipfs.de-id.xyz/ipfs/${mutualFollower.avatar_ipfs_hash}`
                                  : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                              }
                              alt={mutualFollower.display_name || "Avatar"}
                              className="object-contain"
                            />
                            <AvatarFallback>
                              {mutualFollower.display_name?.charAt(0) ||
                                mutualFollower.username?.charAt(0) ||
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-(--foreground) truncate">
                                {mutualFollower.display_name}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {mutualFollower.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-(--muted-foreground) truncate">
                              @{mutualFollower.username}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center">
                          <Card className="bg-(--card) border border-(--border)">
                            <CardContent className="p-3">
                              <p className="text-xs text-(--muted-foreground)">
                                Following
                              </p>
                              <p className="text-sm font-medium text-(--foreground)">
                                {mutualFollower.following_number}
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="bg-(--card) border border-(--border)">
                            <CardContent className="p-3">
                              <p className="text-xs text-(--muted-foreground)">
                                Followers
                              </p>
                              <p className="text-sm font-medium text-(--foreground)">
                                {mutualFollower.followers_number}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
