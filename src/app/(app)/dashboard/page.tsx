'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  display_name?: string;
  bio?: string;
  avatar_ipfs_hash?: string;
  avatar_fallback_url?: string;
  last_login?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/overview', {
          headers: {
            'Frontend-Internal-Request': 'true'
          }
        });
        const responseData = await response.json();
        setUser({
          id: responseData.data._id,
          email: responseData.data.email,
          username: responseData.data.username,
          role: responseData.data.role,
          display_name: responseData.data.display_name,
          bio: responseData.data.bio,
          avatar_ipfs_hash: responseData.data.avatar_ipfs_hash,
          avatar_fallback_url: responseData.data.avatar_fallback_url,
          last_login: responseData.data.last_login,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Redirect to overview page
  useEffect(() => {
    if (!loading) {
      router.push('/dashboard/overview');
    }
  }, [loading, router]);

  if (loading) {
    return (
      <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
        {/* Headline skeleton */}
        <div className="mb-6">
          <div className="h-6 w-40 bg-white/10 rounded" />
          <div className="mt-2 h-4 w-72 bg-white/5 rounded" />
        </div>

        {/* Profile skeleton */}
        <div className="relative border border-white/10 rounded-2xl p-6 mb-10 bg-white/[0.03]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-5 w-48 bg-white/10 rounded" />
              <div className="h-4 w-64 bg-white/5 rounded" />
              <div className="flex gap-2 mt-2">
                <div className="h-5 w-24 bg-white/5 rounded" />
                <div className="h-5 w-32 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-white/10" />
                <div className="h-4 w-28 bg-white/10 rounded" />
              </div>
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-3 w-36 bg-white/5 rounded mt-2" />
            </div>
          ))}
        </div>

        {/* Recent activity skeleton */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-4 w-16 bg-white/10 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10" />
                  <div>
                    <div className="h-4 w-64 bg-white/10 rounded" />
                    <div className="mt-1 h-3 w-32 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-4 w-14 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null; // Will redirect to overview
}
