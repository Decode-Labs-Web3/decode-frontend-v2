"use client";

import Link from "next/link";
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
  "_id": string;
  "username": string;
  "display_name": string;
  "bio": string;
  "avatar_ipfs_hash": string;
  "role": "user",
  "last_login": string;
  "__v": number;
  "is_active": boolean;
  "last_account_deactivation": string;
  "primary_wallet": {
    "_id": string;
    "address": string;
    "user_id": string;
    "name_service": null,
    "is_primary": boolean,
    "createdAt": string;
    "updatedAt": string;
    "__v": number
  },
  "following_number": number,
  "followers_number": number,
  "is_following": boolean,
  "is_follower": boolean,
  "is_blocked": boolean,
  "is_blocked_by": boolean,
  "mutual_followers_number": number,
  "mutual_followers_list": []
}

export default function UserData() {
  const { id, tab } = useParams<{ id: string; tab: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  console.log( "This is user data",userData);

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
      setUserData((prev) =>
        prev ? { ...prev, is_following: !prev.is_following } : prev
      );
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
      setUserData((prev) =>
        prev ? { ...prev, is_blocked: !prev.is_blocked } : prev
      );
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
      // Optimistic UI: toggle state immediately while we refetch
      setUserData((prev) =>
        prev ? { ...prev, is_blocked: !prev.is_blocked } : prev
      );
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
      <div>
        <h1>{userData.display_name}</h1>
      </div>
    )}
    </>
  )
}
