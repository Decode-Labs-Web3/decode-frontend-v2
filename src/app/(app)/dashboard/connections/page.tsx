"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toastSuccess, toastError } from "@/utils/index.utils";
import InterestModal, { type Interest } from "@/components/(app)/Interest";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
}

export default function ConnectionsIndex() {
  const searchParams = useSearchParams();
  const query = searchParams.get("name") ?? "";
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  // console.log("search:", searchResults);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [userSuggest, setUserSuggest] = useState<UserSuggestion[]>([]);

  // console.log("userSuggest:", userSuggest);

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
    [query]
  );

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleUserSuggestSameInterest = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/interest/same-interest", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
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
  }, []);

  const handleInterest = async () => {
    setModalOpen(true);
    try {
      const apiResponse = await fetch("/api/interest/create-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
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
  }, [handleUserSuggestSameInterest]);

  useEffect(() => {
    handleGetInterest();
  }, [handleGetInterest]);

  return (
    <main className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <form className="flex flex-col sm:flex-row gap-4 items-center">
            <Input
              className="flex-1"
              type="text"
              name="name"
              placeholder="Enter name of user..."
              defaultValue={query}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {loading && (
        <div className="flex justify-center items-center py-6">
          <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mr-2"></span>
          <span className="text-foreground">Loading...</span>
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((user) => (
            <Card key={user._id} className="hover-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-border overflow-hidden shadow-lg flex-shrink-0 rounded-full">
                      <Image
                        src={
                          user.avatar_ipfs_hash
                            ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                            : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                        }
                        alt={user.username || "Avatar"}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground truncate text-lg">
                          {user.display_name || user.username}
                        </span>
                        {user.is_following && (
                          <Badge variant="secondary">Following</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </span>
                      <span className="text-xs text-muted-foreground truncate mt-1">
                        {user.email}
                      </span>
                      {user.bio && (
                        <p className="text-sm text-foreground/80 mt-2 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Button asChild>
                      <Link
                        href={`/dashboard/connections/followings/${user._id}`}
                      >
                        View Profile
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
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-2">
              No users found
            </div>
            <p className="text-muted-foreground text-sm">
              Try searching with a different email or username
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
          <h2 className="text-foreground text-xl font-semibold mb-4">
            User Suggestions
          </h2>

          <div className="space-y-4">
            {userSuggest.map((user) => (
              <Card key={user.user_id} className="hover-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-border overflow-hidden shadow-lg flex-shrink-0 rounded-full">
                        <Image
                          src={
                            user.avatar_ipfs_hash
                              ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                              : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                          }
                          alt={user.username || "Avatar"}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground truncate text-lg">
                            {user.display_name || user.username}
                          </span>
                          {user.is_following && (
                            <Badge variant="secondary">Following</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground truncate">
                          @{user.username}
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-green-600">
                            {user.shared_interests_count} shared interests
                          </span>
                          <span className="text-xs text-muted-foreground">
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
                              <span className="text-xs text-muted-foreground">
                                +{user.shared_interests.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Button asChild>
                        <Link
                          href={`/dashboard/connections/followings/${user.user_id}`}
                        >
                          View Profile
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
