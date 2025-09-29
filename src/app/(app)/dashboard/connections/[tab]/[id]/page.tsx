"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toastSuccess, toastError } from "@/utils/index.utils";
import Loading from "@/components/(loading)";

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
  mutual_followers_list: [];
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

  return (
    <>
      {loading && (
        <div>
          <Loading.OverviewCard />
        </div>
      )}

      {userData && (
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
      )}
    </>
  );
}
