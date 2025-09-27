"use client";

import Skeleton from "react-loading-skeleton";

export default function AuthCard() {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton height={40} width={40} circle />
        <Skeleton height={40} className="w-full sm:w-48" />
      </div>

      <div className="p-4 border rounded-xl">
        <div className="m-4"></div>
        <Skeleton height={50} className="w-full" />
        <div className="m-4 border"></div>
        <Skeleton height={50} className="w-full" />
        <div className="m-4"></div>
        <Skeleton height={50} className="w-full" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton height={80} className="w-full" key={i} />
        ))}
      </div>
    </>
  );
}
