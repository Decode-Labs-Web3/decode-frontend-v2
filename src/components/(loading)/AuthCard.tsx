"use client";
import Skeleton from "react-loading-skeleton";

export default function ProductCardSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton height={40} width={40} circle />
        <Skeleton height={40} width={200} />
      </div>
      <div className="p-4 border rounded-xl">
        <div className="m-4"></div>
        <Skeleton height={50} width={300} />
        <div className="m-4 border"></div>
        <Skeleton height={50} width={300} />
        <div className="m-4"></div>
        <Skeleton height={50} width={300} />
      </div>
      <div className="flex items-center gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton height={80} width={80} key={i} />
        ))}
      </div>
    </>
  );
}
