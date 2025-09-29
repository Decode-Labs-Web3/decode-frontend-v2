"use client";

import Skeleton from "react-loading-skeleton";

export default function OverviewCard() {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton height={50} width={200} className="w-full sm:w-auto" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 border rounded-xl">
        <Skeleton height={300} width={300} className="relative lg:w-300 flex-shrink-0" />

        <div className="flex flex-col gap-4 flex-1">
          <Skeleton height={50} className="w-full" />
          <Skeleton height={50} className="w-full" />
          <div className="border"></div>
          <Skeleton height={50} className="w-full" />
          <div className="border"></div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton height={50} className="w-full sm:flex-1" />
            <Skeleton height={50} className="w-full sm:flex-1" />
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton height={100} className="w-full" key={i} />
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton height={100} className="w-full" key={i} />
        ))}
      </div>
    </>
  );
}
