"use client"

import Link from "next/link";

export default function ConnectionsLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <>
      <div className="flex flex-row gap-4">
        <Link
          href="/dashboard/connections"
          className="px-4 py-2 rounded-lg border hover:bg-black hover:text-white"
        >
          Go to Connections
        </Link>
        <Link
          href="/dashboard/connections/followings"
          className="px-4 py-2 rounded-lg border hover:bg-black hover:text-white"
          >
          Go to followings
        </Link>
        <Link
          href="/dashboard/connections/followers"
          className="px-4 py-2 rounded-lg border hover:bg-black hover:text-white"
          >
          Go to followers
        </Link>
      </div>
      {children}
    </>
  );
}
