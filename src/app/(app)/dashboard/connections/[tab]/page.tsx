"use client";

import Link from 'next/link'
import Image from "next/image";
import App from "@/components/(app)";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toastSuccess, toastError } from "@/utils/index.utils";

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
  const { tab } = useParams<{ tab: string }>();
  const [userFollow, setUserFollow] = useState<UserFollow[]>([]);

  const fetchFollowData = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/users/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ tab }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        const errorMessage =
          response?.message || `API error: ${apiResponse.status}`;
        console.error("Follow API error:", errorMessage);
        toastError(errorMessage);
        return;
      }
      setUserFollow(response.data.users);
      console.log("Follow API response:", response);
      toastSuccess(response?.message || "Follow data fetched successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(errorMessage);
      toastError(errorMessage);
    }
  }, [tab]);

  useEffect(()=> {
    fetchFollowData()
  },[fetchFollowData])

  return (
    <main className="p-6">
      <App.PageHeader
        title={`${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
        description={`Your ${tab}`}
      />{" "}
      <div className="grid gap-2 md:grid-cols-2 sm:grid-cols-1">
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
            <Link href={`/dashboard/connections/${tab}/${user.user_id}`}
            className="bg-blue-500 p-2">
                View
              </Link>
            </div>
          ))}
      </div>
    </main>
  );
}
