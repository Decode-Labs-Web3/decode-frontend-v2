"use client";

import Link from "next/link";
import Image from "next/image";
import App from "@/components/(app)";
import { useParams } from "next/navigation";
import Loading from "@/components/(loading)";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { useState, useEffect, useCallback, useRef } from "react";

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
  // console.log("this is page", page);
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
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
            <div className="text-[color:var(--muted-foreground)] text-sm mt-2">
              No connections found
            </div>
          )}
          {userFollow.length > 0 &&
            userFollow.map((user) => (
              <div
                key={user.user_id}
                id={user.user_id}
                className="flex w-full px-3 py-2 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] hover-card"
              >
                <Link
                  href={`/dashboard/connections/${tab}/${user.user_id}`}
                  className="text-white text-sm font-medium px-3 py-1.5 rounded-lg w-full h-full"
                >
                  <div className="flex flex-row gap-3 min-w-0">
                    <div className="  w-14 h-14 rounded-xl border-2 border-[color:var(--border)] overflow-hidden shadow-sm">
                      <Image
                        src={
                          user.avatar_ipfs_hash
                            ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                            : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                        }
                        alt={"Avatar"}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-[color:var(--foreground)] truncate font-medium">
                        {user.display_name}
                      </h3>
                      <p className="text-sm text-[color:var(--muted-foreground)] truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </Link>
                {/* hover card */}
                <div className="absolute z-50 left-1/2 top-full mt-2 -translate-x-1/2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] opacity-100 group-hover:opacity-100 p-4">
                  <div className="flex flex-col">
                    {/* image section */}
                    <div className="flex flex-row gap-4">
                      <div className="w-25 h-25 rounded-xl overflow-hidden border border-[color:var(--border)] flex-shrink-0">
                        <Image
                          src={
                            user.avatar_ipfs_hash
                              ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                              : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                          }
                          alt={"Avatar"}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                          unoptimized
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[color:var(--foreground)] truncate">
                            {user.display_name}
                          </p>
                          {user.role && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] text-[color:var(--muted-foreground)] whitespace-nowrap">
                              {user.role}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[color:var(--muted-foreground)] truncate">
                          @{user.username}
                        </p>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2">
                            <p className="text-[10px] text-[color:var(--muted-foreground)]">
                              Following
                            </p>
                            <p className="text-sm font-medium text-[color:var(--foreground)]">
                              {user.following_number}
                            </p>
                          </div>
                          <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2">
                            <p className="text-[10px] text-[color:var(--muted-foreground)]">
                              Followers
                            </p>
                            <p className="text-sm font-medium text-[color:var(--foreground)]">
                              {user.followers_number}
                            </p>
                          </div>
                          <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2">
                            <p className="text-[10px] text-[color:var(--muted-foreground)]">
                              Mutual
                            </p>
                            <p className="text-sm font-medium text-[color:var(--foreground)]">
                              {user.mutual_followers_number}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* mutual followers compact row */}
                    {user.mutual_followers_number > 0 && (
                      <div className="mt-3 flex items-center gap-2 min-w-0">
                        <div className="flex -space-x-2">
                          {user.mutual_followers_list
                            .slice(0, 3)
                            .map((mutualFollower) => (
                              <Image
                                key={mutualFollower.user_id}
                                src={
                                  mutualFollower.avatar_ipfs_hash
                                    ? `https://ipfs.de-id.xyz/ipfs/${mutualFollower.avatar_ipfs_hash}`
                                    : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                                }
                                alt={"Avatar"}
                                width={20}
                                height={20}
                                className="h-5 w-5 rounded-full border border-[color:var(--border)] object-contain bg-[color:var(--surface)]"
                                unoptimized
                              />
                            ))}
                        </div>
                        <p className="text-xs text-[color:var(--muted-foreground)] truncate">
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
                </div>
              </div>
            ))}
          {endOfData && (
            <div className="text-[color:var(--muted-foreground)] text-sm mt-2">
              End of data
            </div>
          )}
          {!endOfData && (
            <div className="text-[color:var(--muted-foreground)] text-sm mt-2">
              Current page: {page}
            </div>
          )}
        </div>
      )}
      {loading && <Loading.NotificationCard />}
    </main>
  );
}
