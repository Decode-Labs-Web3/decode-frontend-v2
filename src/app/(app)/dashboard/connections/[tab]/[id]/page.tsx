"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toastSuccess, toastError } from "@/utils/index.utils";
import Loading from "@/components/(loading)";
import Link from "next/link";

// interface UserData {
//   followers_number: number;
//   avatar_ipfs_hash: string;
//   role: string;
//   user_id: string;
//   display_name: string;
//   username: string;
//   following_number: number;
//   is_following: boolean;
//   is_follower: boolean;
//   is_blocked: boolean;
//   is_blocked_by: boolean;
//   mutual_followers_list: Follower[];
//   mutual_followers_number: number;
// }

// interface Follower {
//   followers_number: number;
//   avatar_ipfs_hash: string;
//   role: string;
//   user_id: string;
//   display_name: string;
//   username: string;
//   following_number: number;
// }

interface UserData {
  _id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: "user";
  last_login: string;
  __v: number;
  is_active: boolean;
  last_account_deactivation: string;
  primary_wallet: {
    _id: string;
    address: string;
    user_id: string;
    name_service: null;
    is_primary: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: MutualFollower[];
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

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  console.log("This is user data", userData);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/relationship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
  }, [id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/follow-and-unfollow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
          <Loading.OverviewCard />
        </div>
      )}

      {userData && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col mt-4 gap-4 p-4 rounded-2xl border-2 border-[color:var(--border)] bg-gradient-to-br from-blue-500/5 to-purple-500/5 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-[color:var(--border)] bg-black/5">
                <Image
                  src={
                    userData.avatar_ipfs_hash
                      ? `https://gateway.pinata.cloud/ipfs/${userData.avatar_ipfs_hash}`
                      : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={"Avatar"}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold truncate">
                  {userData.display_name || userData.username}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  @{userData.username}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  Wallet: {userData.primary_wallet.address}
                </div>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  <span>{userData.followers_number} followers</span>
                  <span>•</span>
                  <span>{userData.following_number} following</span>
                  {typeof userData.mutual_followers_number === "number" && (
                    <>
                      <span>•</span>
                      <span>{userData.mutual_followers_number} mutual</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {!userData.is_blocked && (
                  <button
                    onClick={
                      userData.is_following ? handleUnFollow : handleFollow
                    }
                    disabled={loading || userData.is_blocked}
                    className={`px-4 py-2 rounded-lg transition-colors border text-sm ${
                      userData.is_following
                        ? "bg-transparent border-[color:var(--border)] hover:bg-white/5"
                        : "bg-blue-600 hover:bg-blue-500 text-white border-blue-600"
                    } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {userData.is_following
                      ? loading
                        ? "Unfollowing..."
                        : "Unfollow"
                      : loading
                      ? "Following..."
                      : "Follow"}
                  </button>
                )}

                <button
                  onClick={userData.is_blocked ? handleUnBlock : handleBlock}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors border text-sm ${
                    userData.is_blocked
                      ? "bg-transparent border-[color:var(--border)] hover:bg-white/5"
                      : "bg-red-600 hover:bg-red-500 text-white border-red-600"
                  } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {userData.is_blocked
                    ? loading
                      ? "Unblocking..."
                      : "Unblock"
                    : loading
                    ? "Blocking..."
                    : "Block"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[color:var(--foreground)]">
                Mutual followers
              </h2>
              {typeof userData.mutual_followers_number === "number" && (
                <span className="text-xs rounded-md border border-[color:var(--border)] px-2 py-0.5 text-[color:var(--muted-foreground)]">
                  {userData.mutual_followers_number}
                </span>
              )}
            </div>
            {/*
            <div className="border rounded-lg p-3 mb-3">
              <div className="text-sm font-medium mb-1">mutual followers</div>
              <div className="text-xs text-muted-foreground">count</div>
            </div>
            */}

            {userData.mutual_followers_list.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] p-6 text-sm text-[color:var(--muted-foreground)]">
                No mutual followers
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {userData.mutual_followers_list.map(
                  (mutualFollower: MutualFollower) => (
                    <li
                      key={mutualFollower.user_id}
                      className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-3 hover:bg-[color:var(--surface-muted)] transition-colors"
                    >
                      {/*
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        <div className="flex-1">
                          <div className="text-sm">name</div>
                          <div className="text-xs text-muted-foreground">@username</div>
                        </div>
                        <button className="text-xs px-2 py-1 border rounded">view</button>
                      </div>
                      */}
                      <Image
                        src={
                          mutualFollower.avatar_ipfs_hash
                            ? `https://gateway.pinata.cloud/ipfs/${mutualFollower.avatar_ipfs_hash}`
                            : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                        }
                        alt={mutualFollower.display_name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-[color:var(--border)]"
                        unoptimized
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[color:var(--foreground)]">
                          {mutualFollower.display_name}
                        </div>
                        <div className="truncate text-xs text-[color:var(--muted-foreground)]">
                          @{mutualFollower.username}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/connections/followings/${mutualFollower.user_id}`}
                        className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-[color:var(--border)] text-[color:var(--foreground)] hover:bg-[color:var(--surface)] transition-colors"
                      >
                        View
                      </Link>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
