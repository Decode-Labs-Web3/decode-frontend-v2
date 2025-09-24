"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface LoadingSkeletonProps {
  height?: number | string;
  width?: number | string;
  count?: number;
  className?: string;
  baseColor?: string;
  highlightColor?: string;
  circle?: boolean;
}

export default function LoadingSkeleton({
  height = 20,
  width = "100%",
  count = 1,
  className = "",
  baseColor = "#374151",
  highlightColor = "#4B5563",
  circle = false,
}: LoadingSkeletonProps) {
  return (
    <Skeleton
      height={height}
      width={width}
      count={count}
      className={className}
      baseColor={baseColor}
      highlightColor={highlightColor}
      circle={circle}
    />
  );
}

// Predefined skeleton components for common use cases
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-lg p-4 ${className}`}
    >
      <LoadingSkeleton height={24} width="80%" className="mb-2" />
      <LoadingSkeleton height={16} width="60%" className="mb-4" />
      <LoadingSkeleton height={60} width="100%" />
    </div>
  );
}

export function BlogPostSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <LoadingSkeleton height={120} width={120} />
        <div className="flex-1 space-y-3">
          <LoadingSkeleton height={24} width="80%" />
          <LoadingSkeleton height={16} width="60%" />
          <LoadingSkeleton height={60} width="100%" />
          <div className="flex gap-4">
            <LoadingSkeleton height={16} width={80} />
            <LoadingSkeleton height={16} width={100} />
            <LoadingSkeleton height={16} width={60} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <LoadingSkeleton height={40} width={200} />
      <LoadingSkeleton height={20} width={400} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="space-y-4">
        <LoadingSkeleton height={200} />
        <LoadingSkeleton height={200} />
      </div>
    </div>
  );
}

export function IPFSUploadSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg ${className}`}
    >
      <div className="text-white text-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSkeleton
            height={32}
            width={32}
            circle
            baseColor="#ffffff"
            highlightColor="#e5e7eb"
          />
          <LoadingSkeleton
            height={16}
            width={120}
            baseColor="#ffffff"
            highlightColor="#e5e7eb"
          />
        </div>
      </div>
    </div>
  );
}
