"use client";
import Skeleton from "react-loading-skeleton";

export default function NotificationCard() {
  return (
    <>
      <div className="w-full">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-[300px] w-[300]">
            <Skeleton width="100%" height="100%" />
          </div>
        ))}
      </div>
    </>
  );
}
