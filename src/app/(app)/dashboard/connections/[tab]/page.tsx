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
        <div className="flex flex-col gap-2">
          {userFollow.length > 0 &&
            userFollow.map((user) => (
              <div
                key={user.user_id}
                id={user.user_id}
                className="flex items-center justify-between mb-2 w-100 px-2 bg-gray-800 p-2 rounded-2xl"
              >
                <div className="flex flex-row gap-3 min-w-0">
                  <div className="w-18 h-18 rounded-2xl border-2 border-white/20 overflow-hidden shadow-xl">
                    <Image
                      src={
                        user.avatar_ipfs_hash
                          ? `https://gateway.pinata.cloud/ipfs/${user.avatar_ipfs_hash}`
                          : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                      }
                      alt={"Avatar"}
                      width={10}
                      height={10}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3>{user.username}</h3>
                    <p>{user.display_name}</p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/connections/${tab}/${user.user_id}`}
                  className="bg-blue-500 p-2"
                >
                  View
                </Link>
              </div>
            ))}
          {endOfData && (
            <div className="text-white/60 text-sm mt-2">End of data</div>
          )}
          {!endOfData && (
            <div className="text-white/60 text-sm mt-2">
              Current page: {page}
            </div>
          )}
        </div>
      )}
      {loading && <Loading.AuthCard />}
    </main>
  );
}
