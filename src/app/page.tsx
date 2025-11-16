"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Loading from "@/components/(loading)";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { fingerprintService } from "@/services/fingerprint.services";

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
  const { updateFingerprint } = useFingerprint();

  useEffect(() => {
    (async () => {
      try {
        const { fingerprint_hashed } = await fingerprintService();
        // console.log("Fingerprint hashed:", fingerprint_hashed);
        updateFingerprint(fingerprint_hashed);
      } catch (error) {
        console.error("Error getting fingerprint:", error);
      }
    })();
  }, [updateFingerprint]);

  return <AppKitWrapper />;
  // return (
  //   <>
  //     <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
  //       <AuthCard />
  //     </main>
  //   </>
  // );
}
