'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import App from '@/components/(app)';
import Auth from '@/components/(auth)';

interface UserProfile {
  _id: string;
  email: string;
  username: string;
  role: string;
  display_name?: string;
  bio?: string;
  avatar_ipfs_hash?: string;
  avatar_fallback_url?: string;
  last_login?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>('overview');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/overview');
        const responseData = await response.json();
        setUser({
          _id: responseData.data._id,
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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && data.statusCode === 200) {
        router.push('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (key: string) => {
    setActive(key);
    if (key === 'overview') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${key}`);
    }
  };

  useEffect(() => {
    if (!pathname) return;
    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] === 'dashboard') {
      const section = parts[1] || 'overview';
      setActive(section);
    }
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <Auth.BackgroundAccents />
      <App.Navbar
        user={{ username: user?.username || '', email: user?.email || '' }}
        onLogout={handleLogout}
      />
      <App.Sidebar active={active} onChange={handleChange} />
      {children}
    </div>
  );
}


