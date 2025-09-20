"use client";

import dynamic from "next/dynamic";

// Dynamically import the AppKit wrapper to prevent SSR issues
const AppKitWrapper = dynamic(() => import("@/components/AppKitWrapper"), {
  ssr: false,
  loading: () => (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      <p className="mt-4 text-gray-400">Loading...</p>
    </main>
  ),
});

export default function Home() {
  return <AppKitWrapper />;
}
