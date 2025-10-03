"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Auth from "@/components/(auth)";
export default function ConnectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard/connections", label: "Connections" },
    {
      href: "/dashboard/connections/followings",
      label: "Followings",
    },
    {
      href: "/dashboard/connections/followers",
      label: "Followers",
    },
  ];
  return (
    <>
      <div>
        <Auth.BackButton text="Go to Back" />
      </div>
      <nav className="mt-2 mb-4">
        <div className="inline-flex items-center gap-2 rounded-xl bg-white/60 dark:bg-white/5 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  "group relative px-4 py-2 rounded-lg transition-colors " +
                  (isActive
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-black hover:text-white hover:bg-blue-300 dark:text-gray-300 dark:hover:text-white")
                }
              >
                <span className="font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </>
  );
}
