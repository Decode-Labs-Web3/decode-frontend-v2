"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewCard() {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-48" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 border rounded-xl">
        <Skeleton className="h-72 w-72 lg:w-72 shrink-0" />

        <div className="flex flex-col gap-4 flex-1">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="border"></div>
          <Skeleton className="h-12 w-full" />
          <div className="border"></div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-12 w-full sm:flex-1" />
            <Skeleton className="h-12 w-full sm:flex-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </>
  );
}
