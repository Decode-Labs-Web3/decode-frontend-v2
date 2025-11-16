"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InterestModal, { type Interest } from "@/components/(app)/Interest";

interface Follower {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
}

interface UserSuggestion {
  user_id: string;
  username: string;
  role: string;
  display_name: string;
  avatar_ipfs_hash: string;
  following_number: number;
  followers_number: number;
  shared_interests_count: number;
  shared_interests: string[];
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_list: Follower[];
  mutual_followers_number: number;
  is_online: boolean;
}

interface UserSearchProps {
  _id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login: string;
  is_active: boolean;
}

export default function ConnectionsIndex() {
  const searchParams = useSearchParams();
  const { fingerprintHash } = useFingerprint();
  const query = searchParams.get("name") ?? "";
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userSuggest, setUserSuggest] = useState<UserSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchProps[]>([]);

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
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ name: queryToSearch }),
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
    [query, fingerprintHash]
  );

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleUserSuggestSameInterest = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/interest/same-interest", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();

      if (!apiResponse.ok) {
        console.error(response);
        toastError("Failed to fetch interests");
        return;
      }

      console.log("Response from suggest", response.data.users);
      setUserSuggest(response.data.users);
    } catch (error) {
      console.error("Fetch interests error:", error);
      toastError("Failed to fetch interests");
    }
  }, [fingerprintHash]);

  const handleInterest = async () => {
    setModalOpen(true);
    try {
      const apiResponse = await fetch("/api/interest/create-interest", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ interest: interests }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();

      if (!apiResponse.ok) {
        console.error(response);
        toastError("Failed to create interests");
        return;
      }

      if (response.message === "User interests created successfully") {
        setModalOpen(false);
        handleUserSuggestSameInterest();
        return;
      }
    } catch (error) {
      console.error("Fetch interests error:", error);
      toastError("Failed to fetch interests");
    } finally {
      setModalOpen(false);
    }
  };

  const handleGetInterest = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/interest/get-interest", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();

      if (!apiResponse.ok) {
        console.error(response);
        toastError("Failed to fetch interests");
        return;
      }

      if (
        response.statusCode === 404 &&
        response.message === "User interests not found"
      ) {
        setModalOpen(true);
        return;
      }

      if (response.message === "User interests fetched successfully") {
        setModalOpen(false);
        // console.log("Response from get interest", response);
        handleUserSuggestSameInterest();
        return;
      }
    } catch (error) {
      console.error("Fetch interests error:", error);
      toastError("Failed to fetch interests");
    }
  }, [handleUserSuggestSameInterest, fingerprintHash]);

  useEffect(() => {
    handleGetInterest();
  }, [handleGetInterest]);

  return (
    <main className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card className="bg-(--card) border border-(--border) rounded-lg">
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-3 items-center">
            <Input
              className="flex-1 min-w-0 px-3 py-2 rounded-md bg-(--input) text-(--foreground) border border-transparent focus:border-(--ring)"
              type="text"
              name="name"
              placeholder="Search users by name or username"
              defaultValue={query}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-(--primary) text-(--primary-foreground) shadow-sm"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {loading && (
        <div className="flex flex-col justify-center items-center py-6 gap-2">
          <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-(--primary)"></span>
          <span className="text-(--foreground)">Loading...</span>
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((user) => (
            <Card
              key={user._id}
              className="bg-(--card) border border-(--border) rounded-lg hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-(--surface-muted) shrink-0 flex items-center justify-center">
                      <Image
                        src={
                          user.avatar_ipfs_hash
                            ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                            : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                        }
                        alt={user.username || "Avatar"}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0">
                        <span className="font-semibold text-(--foreground) truncate text-base">
                          {user.display_name || user.username}
                        </span>
                      </div>
                      <span className="text-sm text-(--muted-foreground) truncate">
                        @{user.username}
                      </span>

                      {user.bio && (
                        <p className="text-sm text-(--foreground)/90 mt-2 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-2">
                    <Button asChild>
                      <Link
                        href={`/dashboard/connections/followings/${user._id}`}
                      >
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!loading && searchResults.length === 0 && query && (
        <Card className="bg-(--card) border border-(--border) rounded-lg">
          <CardContent className="text-center py-8">
            <div className="text-(--muted-foreground) text-lg mb-2">
              No users found
            </div>
            <p className="text-(--muted-foreground) text-sm">
              Try searching with a different username
            </p>
          </CardContent>
        </Card>
      )}

      {modalOpen && (
        <InterestModal
          value={interests}
          onChangeAction={setInterests}
          onCloseAction={interests.length >= 3 ? handleInterest : undefined}
        />
      )}

      {searchResults.length === 0 && !loading && userSuggest.length > 0 && (
        <div>
          <h2 className="text-(--foreground) text-xl font-semibold mb-4">
            User Suggestions
          </h2>

          <div className="space-y-3">
            {userSuggest.map((user) => (
              <Card
                key={user.user_id}
                className="bg-(--card) border border-(--border) rounded-lg hover:shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-(--surface-muted) shrink-0 flex items-center justify-center">
                        <Image
                          src={
                            user.avatar_ipfs_hash
                              ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                              : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                          }
                          alt={user.username || "Avatar"}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0">
                          <span className="font-semibold text-(--foreground) truncate text-base">
                            {user.display_name || user.username}
                          </span>
                          {user.is_following && (
                            <Badge variant="secondary">Following</Badge>
                          )}
                          <FontAwesomeIcon
                            icon={faCircle}
                            className={`ml-2 ${
                              user.is_online
                                ? "text-(--success)"
                                : "text-(--muted-foreground-2)"
                            }`}
                            title={user.is_online ? "Online" : "Offline"}
                            aria-hidden={false}
                          />
                        </div>
                        <span className="text-sm text-(--muted-foreground) truncate">
                          @{user.username}
                        </span>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-(--primary)">
                            {user.shared_interests_count} shared
                          </span>
                          <span className="text-(--muted-foreground)">
                            {user.followers_number} followers
                          </span>
                        </div>
                        {user.shared_interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.shared_interests
                              .slice(0, 3)
                              .map((interest) => (
                                <Badge
                                  key={interest}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {interest.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            {user.shared_interests.length > 3 && (
                              <span className="text-xs text-(--muted-foreground)">
                                +{user.shared_interests.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-2">
                      <Button asChild>
                        <Link
                          href={`/dashboard/connections/followings/${user.user_id}`}
                        >
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
