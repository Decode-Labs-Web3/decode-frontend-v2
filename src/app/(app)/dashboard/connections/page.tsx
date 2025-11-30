"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toastError } from "@/utils/index.utils";
import { useSearchParams } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import { Card, CardContent } from "@/components/ui/card";
import UserHoverCard from "@/components/common/UserHoverCard";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import InterestModal, { type Interest } from "@/components/(app)/Interest";
import type {
  UserSuggestion,
  UserKeyword,
  UserSearchProps,
} from "@/interfaces/connections.interfaces";

export default function ConnectionsIndex() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const { fingerprintHash } = useFingerprint();
  const query = searchParams.get("name") ?? "";
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userKeyword, setUserKeyword] = useState<UserKeyword[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchProps[]>([]);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [suggestionsEndOfData, setSuggestionsEndOfData] = useState(false);
  const [loadingMoreSuggestions, setLoadingMoreSuggestions] = useState(false);
  const fetchingRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const restoreOnNextRenderRef = useRef(false);

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
        // toastSuccess(response?.message || "Search successful");
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
      setUserKeyword(response.data.users);
    } catch (error) {
      console.error("Fetch interests error:", error);
      toastError("Failed to fetch interests");
    }
  }, [fingerprintHash]);

  const handleInterest = useCallback(async () => {
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
  }, [interests, fingerprintHash, handleUserSuggestSameInterest]);

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
        if (
          response.statusCode === 404 &&
          response.message === "User interests not found"
        ) {
          setModalOpen(true);
          return;
        }
        console.error(response);
        toastError("Failed to fetch interests nha");
        return;
      }

      if (response.message === "User interests fetched successfully") {
        setModalOpen(false);
        handleUserSuggestSameInterest();
        return;
      }
    } catch (error) {
      console.error("Fetch interests error:", error);
      toastError("Failed to fetch interests");
    }
  }, [handleUserSuggestSameInterest, fingerprintHash]);

  const fetchSuggestions = useCallback(
    async (currentPage: number) => {
      if (suggestionsEndOfData || fetchingRef.current) return;
      fetchingRef.current = true;
      if (currentPage === 0) setLoading(true);
      else setLoadingMoreSuggestions(true);
      try {
        const apiResponse = await fetch("/api/interest/get-suggestion", {
          method: "POST",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ page: currentPage }),
          cache: "no-cache",
          signal: AbortSignal.timeout(10000),
        });
        const response = await apiResponse.json();
        if (!apiResponse.ok) {
          console.error(response);
          if (currentPage === 0) handleGetInterest();
          toastError("Failed to fetch suggestions");
          return;
        }
        if (response.statusCode === 200) {
          if (currentPage === 0) {
            setSuggestions(response.data.users);
            if (response.data.users.length === 0) {
              handleGetInterest();
              return;
            }
          } else {
            setSuggestions((prev) => [...prev, ...response.data.users]);
          }
          setSuggestionsEndOfData(response.data.meta?.is_last_page || false);
        }
      } catch (error) {
        console.error("Fetch suggestions error:", error);
        toastError("Failed to fetch suggestions");
      } finally {
        if (currentPage === 0) setLoading(false);
        setLoadingMoreSuggestions(false);
        fetchingRef.current = false;
      }
    },
    [fingerprintHash, handleGetInterest, suggestionsEndOfData]
  );

  useEffect(() => {
    fetchSuggestions(0);
  }, [fetchSuggestions]);

  useEffect(() => {
    if (page > 0) {
      fetchSuggestions(page);
    }
  }, [page, fetchSuggestions]);

  const handleScroll = useCallback(() => {
    const element = containerRef.current;
    if (!element || suggestionsEndOfData || loadingMoreSuggestions) return;
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      prevScrollHeightRef.current = element.scrollHeight;
      restoreOnNextRenderRef.current = true;
      setLoadingMoreSuggestions(true);
      setPage((p) => p + 1);
    }
  }, [suggestionsEndOfData, loadingMoreSuggestions]);

  useEffect(() => {
    if (page === 0) return;
    if (!restoreOnNextRenderRef.current) return;
    const element = containerRef.current;
    if (element) {
      element.scrollTop = prevScrollHeightRef.current - element.clientHeight;
      prevScrollHeightRef.current = element.scrollHeight;
    }
    restoreOnNextRenderRef.current = false;
  }, [suggestions, page]);

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
            <UserHoverCard
              key={user._id}
              user={user}
              href={`/dashboard/connections/followings/${user._id}`}
              avatarSize="w-14 h-14"
            />
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

      <InterestModal
        value={interests}
        onChangeAction={setInterests}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        handleInterest={handleInterest}
      />

      {searchResults.length === 0 &&
        !loading &&
        (suggestions.length > 0 || userKeyword.length > 0) && (
          <div>
            {suggestions.length > 0 ? (
              <>
                <h2 className="text-(--foreground) text-xl font-semibold mb-4">
                  Suggested Users
                </h2>
                <ScrollArea
                  className="h-screen"
                  ref={containerRef}
                  onScrollViewport={handleScroll}
                >
                  <div className="space-y-3">
                    {suggestions.map((user) => (
                      <UserHoverCard
                        key={user.user_id}
                        user={user}
                        href={`/dashboard/connections/followings/${user.user_id}`}
                        avatarSize="w-14 h-14"
                      />
                    ))}
                  </div>
                  {loadingMoreSuggestions && (
                    <div className="p-3 text-center text-xs text-(--muted-foreground)">
                      Loading more...
                    </div>
                  )}
                  {suggestionsEndOfData && suggestions.length > 0 && (
                    <div className="p-3 text-center text-xs text-(--muted-foreground)">
                      End of data
                    </div>
                  )}
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </>
            ) : (
              <>
                <h2 className="text-(--foreground) text-xl font-semibold mb-4">
                  User Suggestions
                </h2>
                <div className="space-y-3">
                  {userKeyword.map((user) => (
                    <UserHoverCard
                      key={user.user_id}
                      user={user}
                      href={`/dashboard/connections/followings/${user.user_id}`}
                      avatarSize="w-14 h-14"
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
    </main>
  );
}
