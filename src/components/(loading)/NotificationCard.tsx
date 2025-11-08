"use client";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationCard() {
  return (
    <>
      <div className="w-full flex flex-col gap-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-14" />
        ))}
      </div>
    </>
  );
}
