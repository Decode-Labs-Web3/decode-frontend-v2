"use client";

import { useParams } from "next/navigation";
import Loading from "@/components/(loading)";
import { getApiHeaders } from "@/utils/api.utils";
import UserHoverCard from "@/components/common/UserHoverCard";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { UserFollow } from "@/interfaces/connections.interfaces";
import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Page() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const { fingerprintHash } = useFingerprint();
  const [endOfData, setEndOfData] = useState(false);
  const { id, type } = useParams<{ id: string; type: string }>();
  const [userFollow, setUserFollow] = useState<UserFollow[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);
  const restoreOnNextRenderRef = useRef(false);
  const fetchingRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (endOfData || fetchingRef.current) return;
    fetchingRef.current = true;
    if (page === 0) setLoading(true);

    try {
      const apiResponse = await fetch("/api/users/detail", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ id, type, page }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(apiResponse);
        toastError("API error");
        if (page === 0) setLoading(false);
        fetchingRef.current = false;
        return;
      }
      console.log("This is [tab] [id] [type]", response);
      setUserFollow((prev) => [...prev, ...response.data.users]);
      setEndOfData(response.data.meta.is_last_page);
      toastSuccess(response?.message || "Profile fetched successfully");
      console.log(response);
    } catch (error) {
      console.log(error);
      toastError("error");
    } finally {
      if (page === 0) setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [id, type, endOfData, page, fingerprintHash]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleScroll = () => {
    const element = containerRef.current;
    if (!element || endOfData || loadingMore || fetchingRef.current) return;
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      prevScrollHeightRef.current = element.scrollHeight;
      restoreOnNextRenderRef.current = true;
      setLoadingMore(true);
      setPage((p) => p + 1);
    }
  };

  useEffect(() => {
    if (page === 0) return;
    if (!restoreOnNextRenderRef.current) return;
    const element = containerRef.current;
    if (element) {
      element.scrollTop = prevScrollHeightRef.current - element.clientHeight;
      prevScrollHeightRef.current = element.scrollHeight;
    }
    restoreOnNextRenderRef.current = false;
  }, [userFollow, page]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem-2.5rem)] overflow-hidden">
      <ScrollArea
        className="h-full"
        ref={containerRef}
        onScrollViewport={handleScroll}
      >
        <div className="space-y-3 p-4 pb-16">
          {loading && (
            <div>
              <Loading.NotificationCard />
            </div>
          )}

          {userFollow.length > 0 &&
            userFollow.map((user) => (
              <UserHoverCard
                key={user.user_id}
                user={user}
                href={`/dashboard/connections/followings/${user.user_id}`}
                avatarSize="w-14 h-14"
              />
            ))}

          {loadingMore && (
            <div className="p-3 text-center text-xs text-(--muted-foreground)">
              Loading more...
            </div>
          )}

          {endOfData ? (
            <div className="text-(--muted-foreground) text-sm mt-2">
              End of data
            </div>
          ) : (
            <div className="text-(--muted-foreground) text-sm mt-2">
              Current page: {page}
            </div>
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
