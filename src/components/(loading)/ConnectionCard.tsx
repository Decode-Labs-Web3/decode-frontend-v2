"use client";
import Skeleton from "react-loading-skeleton";

export default function ConnectionCard() {
  return (
    <>
      <Skeleton width="100%" height={150} />
      <Skeleton width="100%" height={300} />
      <div className="w-full flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton width="100%" height={60} key={i} />
        ))}
      </div>
    </>
  );
}
