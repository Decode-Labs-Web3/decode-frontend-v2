"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toastSuccess, toastError } from "@/utils/index.utils";

interface UserData {
  _id: string;
  username: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login: string;
  __v: number;
  is_active: boolean;
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: Follower[];
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

export default function ConnectionsIndex() {
  const searchParams = useSearchParams();
  const query = searchParams.get("email_or_username") ?? "";
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  console.log("search:", searchResults);

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const queryToSearch = searchQuery ?? query;
      if (!queryToSearch.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const apiResponse = await fetch("/api/users/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Frontend-Internal-Request": "true",
          },
          body: JSON.stringify({ email_or_username: queryToSearch }),
          cache: "no-cache",
          signal: AbortSignal.timeout(10000),
        });
        const response = await apiResponse.json();
        console.log(response);
        if (!apiResponse.ok) {
          console.error(apiResponse);
          toastError("API error");
          return;
        }
        setSearchResults(response?.data?.users || []);
        toastSuccess(response?.message || "Search successful");
        console.log(response);
      } catch (error) {
        console.error("Search error:", error);
        toastError("Search failed");
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <main className="p-6 space-y-6 max-w-4xl mx-auto">
      <form
        className="flex flex-col sm:flex-row gap-4 items-center bg-gray-900/80 p-6 rounded-xl shadow-lg border border-gray-700"
      >
        <input
          className="flex-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          type="text"
          name="email_or_username"
          placeholder="Enter email or username..."
          defaultValue={query}
        />
        <button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {loading && (
        <div className="flex justify-center items-center py-6">
          <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></span>
          <span className="text-white">Loading...</span>
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between bg-gray-800/50 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-800/70 transition-all duration-200 border border-gray-700/50"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/20 overflow-hidden shadow-lg flex-shrink-0">
                  <Image
                    src={
                      user.avatar_ipfs_hash
                        ? `https://gateway.pinata.cloud/ipfs/${user.avatar_ipfs_hash}`
                        : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                    }
                    alt={user.username || "Avatar"}
                    width={64}
                    height={64}
                    className="w-full h-full"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white truncate text-lg">
                      {user.display_name || user.username}
                    </span>
                    {user.is_following && (
                      <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                        Following
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 truncate">
                    @{user.username}
                  </span>
                  <span className="text-xs text-gray-500 truncate mt-1">
                    {user.email}
                  </span>
                  {user.bio && (
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <Link
                  href={`/dashboard/connections/followings/${user._id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && searchResults.length === 0 && query && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No users found</div>
          <p className="text-gray-500 text-sm">
            Try searching with a different email or username
          </p>
        </div>
      )}

      {!loading && !query && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Search for users</div>
          <p className="text-gray-500 text-sm">
            Enter an email or username to find connections
          </p>
        </div>
      )}
    </main>
  );
}
