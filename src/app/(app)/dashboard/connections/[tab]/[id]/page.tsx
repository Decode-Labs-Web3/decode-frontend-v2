"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toastSuccess, toastError } from "@/utils/index.utils";

interface UserData {
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
  mutual_followers_list: Follower[];
  mutual_followers_number: number;
}

interface Follower {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
}

export default function UserData() {
  const { id, tab } = useParams<{ id: string; tab: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = useCallback(async () => {
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
      toastSuccess(response?.message || "User data fetched successfully");
      console.log(response);
    } catch (error) {
      console.log(error);
      toastError("error");
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();
  },[fetchUserData]);

  const handleFollow = async () => {
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
        console.error(response.message);
        toastError(response.message || `API error follow`);
        return;
      }
      toastSuccess(response?.message || "Follow/unfollow action successful");
      fetchUserData();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnFollow = async () => {
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
        toastError( response.message || `API error unfollow fail`);
        return;
      }
      toastSuccess(response?.message || "Follow/unfollow action successful");
      fetchUserData();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlock = async () => {
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
        toastError( response.message || `API error block fail`);
        return;
      }
      toastSuccess(response?.message || "Follow/unfollow action successful");
      fetchUserData();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnBlock = async () => {
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
        toastError( response.message || `API error unblock fail`);
        return;
      }
      toastSuccess(response?.message || "Follow/unfollow action successful");
      fetchUserData();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    userData && (
      <div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 backdrop-blur-sm p-8 m-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Profile Information
              </h3>
              <p className="text-white font-mono text-sm">
                User ID: {userData.user_id}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/20 overflow-hidden shadow-xl">
                <Image
                  src={
                    userData.avatar_ipfs_hash
                      ? `https://gateway.pinata.cloud/ipfs/${userData.avatar_ipfs_hash}`
                      : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={userData.username || "Avatar"}
                  width={320}
                  height={320}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-1 space-y-6">
              {/* Display Name */}
              <div className="flex flex-row justify-between px-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-white">
                    {userData.display_name || userData.username || "Your name"}
                  </h2>
                  {userData?.role && (
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 text-sm font-medium border border-blue-500/30">
                      {userData.role.charAt(0).toUpperCase() +
                        userData.role.slice(1)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {userData.is_blocked ? (
                    <button
                      onClick={handleUnBlock}
                      className="bg-red-500 p-2 rounded-xl"
                    >
                      UnBlock
                    </button>
                  ) : (
                    <button
                      onClick={handleBlock}
                      className="bg-red-500 p-2 rounded-xl"
                    >
                      Block
                    </button>
                  )}
                  {userData.is_following ? (
                    <button
                      onClick={handleUnFollow}
                      className="bg-blue-500 p-2 rounded-xl"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className="bg-blue-500 p-2 rounded-xl"
                    >
                      Follow
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-sm text-gray-400">Followers</span>
                    <p className="text-white text-sm">
                      {userData.followers_number}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-gray-400">Following</span>
                    <p className="text-white text-sm">
                      {userData.following_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {userData.mutual_followers_list.length > 0 &&
          userData.mutual_followers_list.map((user) => (
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
                className="bg-blue-500 p-2 rounded-xl"
              >
                View
              </Link>
            </div>
          ))}
      </div>
    )
  );
}
