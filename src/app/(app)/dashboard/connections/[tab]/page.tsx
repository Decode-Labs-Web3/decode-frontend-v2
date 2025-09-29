"use client";

import Link from "next/link";
import Image from "next/image";
import App from "@/components/(app)";
import { useParams } from "next/navigation";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { useState, useEffect, useCallback, useRef } from "react";
import Loading from "@/components/(loading)";

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
  mutual_followers_list: [];
  mutual_followers_number: number;
}

export default function Page() {
  const [page, setPage] = useState(0);
  const { tab } = useParams<{ tab: string }>();
  const [loading, setLoading] = useState(false);
  const [endOfData, setEndOfData] = useState(false);
  const [userFollow, setUserFollow] = useState<UserFollow[]>([]);

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
                className="flex items-center justify-between w-full px-3 py-2 rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] hover-card"
              >
                <div className="flex flex-row gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl border-2 border-[color:var(--border)] overflow-hidden shadow-sm">
                    <Image
                      src={
                        user.avatar_ipfs_hash
                          ? `https://gateway.pinata.cloud/ipfs/${user.avatar_ipfs_hash}`
                          : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                      }
                      alt={"Avatar"}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-[color:var(--foreground)] truncate font-medium">
                      {user.username}
                    </h3>
                    <p className="text-sm text-[color:var(--muted-foreground)] truncate">
                      {user.display_name}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/connections/${tab}/${user.user_id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  View
                </Link>
                {endOfData && (
                  <div className="text-[color:var(--muted-foreground)] text-sm mt-2">
                    End of data
                  </div>
                )}
              </div>
            ))}
          {!endOfData && (
            <div className="text-[color:var(--muted-foreground)] text-sm mt-2">
              Current page: {page}
            </div>
          )}
        </div>
      )}
      {loading && <Loading.AuthCard />}
    </main>
  );
}
