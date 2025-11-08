"use client";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConnectionCard() {
  return (
    <>
      <Skeleton className="w-full h-36" />
      <Skeleton className="w-full h-72" />
      <div className="w-full flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton className="w-full h-14" key={i} />
        ))}
      </div>
    </>
  );
}
