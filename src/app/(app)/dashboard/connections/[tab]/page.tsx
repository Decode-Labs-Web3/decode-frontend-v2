"use client";

import Link from "next/link";
import App from "@/components/(app)";
import { useParams } from "next/navigation";
import Loading from "@/components/(loading)";
import { Badge } from "@/components/ui/badge";
import { getApiHeaders } from "@/utils/api.utils";
import { Card, CardContent } from "@/components/ui/card";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface UserFollow {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_list: MutualFollower[];
  mutual_followers_number: number;
}

interface MutualFollower {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
}

export default function PageFollow() {
  const [page, setPage] = useState(0);
  const {  fingerprintHash } = useFingerprint();
  const { tab } = useParams<{ tab: string }>();
  const [loading, setLoading] = useState(false);
  const [endOfData, setEndOfData] = useState(false);
  const [userFollow, setUserFollow] = useState<UserFollow[]>([]);
  console.log("this is user follow", userFollow);

  const fetchFollowData = useCallback(async () => {
    if (endOfData) return;
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/follow", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ tab, page }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        const errorMessage =
          response?.message || `API error: ${apiResponse.status}`;
        console.error("Follow API error:", errorMessage);
        toastError(errorMessage);
        setLoading(false);
        return;
      }
      setUserFollow((prev) => [...prev, ...response.data.users]);
      setEndOfData(response.data.meta.is_last_page);
      console.log("Follow API response:", response);
      toastSuccess(response?.message || "Follow data fetched successfully");
    } catch (error) {
      console.error(error);
      toastError("Fetch follow data failed");
    } finally {
      setLoading(false);
    }
  }, [tab, page, endOfData]);

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  const ticking = useRef(false);
  const cooldownRef = useRef(false);

  useEffect(() => {
    if (endOfData) return;
    const onScroll = () => {
      if (loading) return;
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const contentHeight = document.documentElement.scrollHeight;
        const scrolled = window.scrollY + window.innerHeight;
        const atBottom = contentHeight - scrolled <= 10;

        if (atBottom && !cooldownRef.current) {
          cooldownRef.current = true;
          setPage((p) => p + 1);
          setTimeout(() => {
            cooldownRef.current = false;
          }, 300);
        }
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [endOfData, loading]);

  return (
    <main className="p-6">
      <App.PageHeader
        title={`${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
        description={`Your ${tab}`}
      />{" "}
      {!loading && (
        <div className="flex flex-col gap-3">
          {userFollow.length === 0 && (
            <div className="text-muted-foreground text-sm mt-2">
              No connections found
            </div>
          )}
          {userFollow.length > 0 &&
            userFollow.map((user) => (
              <HoverCard key={user.user_id}>
                <HoverCardTrigger asChild>
                  <Card className="hover-card cursor-pointer">
                    <CardContent className="p-4">
                      <Link
                        href={`/dashboard/connections/${tab}/${user.user_id}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <Avatar className="w-14 h-14 border-2 border-border">
                          <AvatarImage
                            src={
                              user.avatar_ipfs_hash
                                ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                                : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                            }
                            alt={user.display_name || "Avatar"}
                            className="object-contain"
                          />
                          <AvatarFallback>
                            {user.display_name?.charAt(0) ||
                              user.username?.charAt(0) ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-foreground truncate font-medium">
                              {user.display_name}
                            </h3>
                            {user.role && (
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            @{user.username}
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
                      <Avatar className="w-16 h-16 border-2 border-border">
                        <AvatarImage
                          src={
                            user.avatar_ipfs_hash
                              ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                              : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                          }
                          alt={user.display_name || "Avatar"}
                          className="object-contain"
                        />
                        <AvatarFallback>
                          {user.display_name?.charAt(0) ||
                            user.username?.charAt(0) ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground truncate">
                            {user.display_name}
                          </p>
                          {user.role && (
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <Card>
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground">
                            Following
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {user.following_number}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground">
                            Followers
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {user.followers_number}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground">
                            Mutual
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {user.mutual_followers_number}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {user.mutual_followers_number > 0 && (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex -space-x-2">
                          {user.mutual_followers_list
                            .slice(0, 3)
                            .map((mutualFollower) => (
                              <Avatar
                                key={mutualFollower.user_id}
                                className="w-5 h-5 border border-border"
                              >
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
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          Followed by{" "}
                          {user.mutual_followers_list
                            .slice(0, 2)
                            .map((m) => m.display_name)
                            .join(", ")}
                          {user.mutual_followers_number - 2 > 0 &&
                            ` and ${user.mutual_followers_number - 2} other${
                              user.mutual_followers_number - 2 > 1 ? "s" : ""
                            }`}
                        </p>
                      </div>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          {endOfData && (
            <div className="text-muted-foreground text-sm mt-2">
              End of data
            </div>
          )}
          {!endOfData && (
            <div className="text-muted-foreground text-sm mt-2">
              Current page: {page}
            </div>
          )}
        </div>
      )}
      {loading && <Loading.NotificationCard />}
    </main>
  );
}
