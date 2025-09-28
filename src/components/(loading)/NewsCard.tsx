"use client";

import Skeleton from "react-loading-skeleton";

export default function OverviewCard() {
  return (
    <div className="w-full grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="h-[300px] w-[300]">
          <Skeleton width="100%" height="100%" />
        </div>
      ))}
    </div>
  );
}
