"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/(loading)";
import { fingerprintService } from "@/services/index.services";

// Dynamically import the AppKit wrapper to prevent SSR issues
const AppKitWrapper = dynamic(() => import("@/components/AppKitWrapper"), {
  ssr: false,
  loading: () => (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Loading.AuthCard />
    </main>
  ),
});

export default function Home() {

  useEffect(() => {
    (async () => {
      const { fingerprint_hashed } = await fingerprintService();
      document.cookie = `fingerprint=${fingerprint_hashed}; path=/; max-age=31536000; SameSite=Lax`;
    })();
  }, []);

  return <AppKitWrapper />;
  // return (
  //   <>
  //     <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
  //       <AuthCard />
  //     </main>
  //   </>
  // );
}
