"use client";

import Link from "next/link";
import App from "@/components/(app)";
import { useParams } from "next/navigation";
import Loading from "@/components/(loading)";
import { Badge } from "@/components/ui/badge";
import { toastError } from "@/utils/index.utils";
import { getApiHeaders } from "@/utils/api.utils";
import { Card, CardContent } from "@/components/ui/card";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { UserFollow } from "@/interfaces/connections.interfaces";
import UserHoverCard from "@/components/common/UserHoverCard";

export default function PageFollow() {
  const [page, setPage] = useState(0);
  const { fingerprintHash } = useFingerprint();
  const { tab } = useParams<{ tab: string }>();
  const [loading, setLoading] = useState(false);
  const [endOfData, setEndOfData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userFollow, setUserFollow] = useState<UserFollow[]>([]);
  console.log("this is user follow", userFollow);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);
  const restoreOnNextRenderRef = useRef(false);
  const fetchingRef = useRef(false);

  const fetchFollowData = useCallback(async () => {
    if (endOfData || fetchingRef.current) return;
    fetchingRef.current = true;
    if (page === 0) setLoading(true);
    try {
      const apiResponse = await fetch("/api/users/follow", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ tab, page }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        const errorMessage =
          response?.message || `API error: ${apiResponse.status}`;
        console.error("Follow API error:", errorMessage);
        toastError(errorMessage);
        if (page === 0) setLoading(false);
        fetchingRef.current = false;
        return;
      }
      setUserFollow((prev) => [...prev, ...response.data.users]);
      setEndOfData(response.data.meta.is_last_page);
      // console.log("Follow API response:", response);
      // toastSuccess(response?.message || "Follow data fetched successfully");
    } catch (error) {
      console.error(error);
      toastError("Fetch follow data failed");
    } finally {
      if (page === 0) setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [tab, page, endOfData, fingerprintHash]);

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  const handleScroll = useCallback(() => {
    const element = containerRef.current;
    if (!element || endOfData || loadingMore || fetchingRef.current) return;
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      prevScrollHeightRef.current = element.scrollHeight;
      restoreOnNextRenderRef.current = true;
      setLoadingMore(true);
      setPage((p) => p + 1);
    }
  }, [endOfData, loadingMore]);

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
        <div className="flex flex-col h-full">
          <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
            <App.PageHeader
              title={`${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
              description={`Your ${tab}`}
            />
          </div>

          <div className="space-y-3 p-4 pb-16">
            {loading && <Loading.NotificationCard />}
            {!loading && (
              <div className="flex flex-col gap-3">
                {userFollow.length === 0 && (
                  <div className="text-muted-foreground text-sm mt-2">
                    No connections found
                  </div>
                )}
                {userFollow.length > 0 &&
                  userFollow.map((user) => (
                    <UserHoverCard
                      key={user.user_id}
                      user={user}
                      href={`/dashboard/connections/${tab}/${user.user_id}`}
                      avatarSize="w-14 h-14"
                    />
                  ))}

                {loadingMore && (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    Loading more...
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 z-10 bg-card border-t border-border p-4">
            {endOfData ? (
              <p className="text-muted-foreground text-sm">End of data</p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Current page: {page}
              </p>
            )}
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
