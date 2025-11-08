"use client";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="p-4 border rounded-xl">
        <div className="m-4"></div>
        <Skeleton className="h-12 w-72" />
        <div className="m-4 border"></div>
        <Skeleton className="h-12 w-72" />
        <div className="m-4"></div>
        <Skeleton className="h-12 w-72" />
      </div>
      <div className="flex items-center gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton className="h-20 w-20" key={i} />
        ))}
      </div>
    </>
  );
}
