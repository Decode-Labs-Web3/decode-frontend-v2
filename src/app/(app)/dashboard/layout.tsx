'use client';

import App from '@/components/(app)';
import Auth from '@/components/(auth)';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserInfoContext } from '@/contexts/UserInfoContext';
import { UserProfile } from '@/interfaces';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>('overview');
  const [user, setUser] = useState<UserProfile | null>(null);

  const refetchUserData = async () => {
    try {
      const apiResponse = await fetch('/api/users/overview', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Frontend-Internal-Request': 'true',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });

      const responseData = await apiResponse.json();
      
      if (responseData.success && responseData.data) {
        const userData: UserProfile = {
          id: responseData.data._id,
          email: responseData.data.email,
          username: responseData.data.username,
          role: responseData.data.role,
          display_name: responseData.data.display_name,
          bio: responseData.data.bio,
          avatar_ipfs_hash: responseData.data.avatar_ipfs_hash,
          last_login: responseData.data.last_login,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refetching user data:', error);
    } finally {
      console.log('User data refetch operation completed');
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }

    const fetchUser = async () => {
      try {
        const apiResponse = await fetch('/api/users/overview', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Frontend-Internal-Request': 'true',
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });

        const responseData = await apiResponse.json();
        
        const userData: UserProfile = {
          id: responseData.data._id,
          email: responseData.data.email,
          username: responseData.data.username,
          role: responseData.data.role,
          display_name: responseData.data.display_name,
          bio: responseData.data.bio,
          avatar_ipfs_hash: responseData.data.avatar_ipfs_hash,
          last_login: responseData.data.last_login,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error('User data fetch error:', error);
      } finally {
        setLoading(false);
        console.log('User data fetch operation completed');
      }
    };

    fetchUser();
  }, []);

  const handleChange = (key: string) => {
    setActive(key);
    if (key === 'overview') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${key}`);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Frontend-Internal-Request': 'true'
        },
        credentials: 'include',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      const data = await response.json();
      console.log('Logout response:', data);
      if (data.success && data.statusCode === 200) {
        router.push('/');
      } else {
        console.log('Logout failed:', data.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
        console.error("Request timeout/aborted");
      } else {
        console.error(error);
      }
    } finally {
      console.log('Logout operation completed');
    }
  };

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
    <UserInfoContext.Provider value={{ user, refetchUserData }}>
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        <Auth.BackgroundAccents />
        <App.Navbar
          user={{ username: user?.username || '', email: user?.email || '' }}
          onLogout={handleLogout}
        />
        <App.Sidebar active={active} onChange={handleChange} />
        {children}
      </div>
    </UserInfoContext.Provider>
  );
}


