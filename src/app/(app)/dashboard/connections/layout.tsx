"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Auth from "@/components/(auth)";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Tabs value={pathname} className="mt-2 mb-4">
        <TabsList className="bg-white/60 dark:bg-white/5 shadow-sm ring-1 ring-black/5 backdrop-blur">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.href} value={tab.href} asChild>
              <Link href={tab.href} className="font-medium">
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </>
  );
}
