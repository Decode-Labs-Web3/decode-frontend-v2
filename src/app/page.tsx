"use client";

import 'react-loading-skeleton/dist/skeleton.css';
import dynamic from 'next/dynamic';
import AuthCard from '@/components/(loading)/AuthCard';
// Dynamically import the AppKit wrapper to prevent SSR issues
const AppKitWrapper = dynamic(() => import("@/components/AppKitWrapper"), {
  ssr: false,
  loading: () => (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <AuthCard />
    </main>
  ),
});

export default function Home() {
  return <AppKitWrapper />;
  // return (
  //   <>
  //     <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
  //       <AuthCard />
  //     </main>
  //   </>
  // );
}
