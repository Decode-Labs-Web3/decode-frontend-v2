"use client";
import { ReactNode } from "react";
import Auth from "@/components/(auth)";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 h-72 w-72 bg-blue-700/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-20 h-72 w-72 bg-purple-600/20 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),rgba(0,0,0,0)_60%)]" />
      </div>

      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Auth.BackButton href="/" text="Back to Decode Network" />

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
            <p className="text-lg">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 backdrop-blur-sm p-8 md:p-12 shadow-2xl">
          <div className="max-w-none space-y-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
