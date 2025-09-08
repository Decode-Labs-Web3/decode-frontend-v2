'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>('overview');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/overview');
        const data = await response.json();
        setUser(
          {
            _id: data.data._id,
            email: data.data.email,
            username: data.data.username,
            role: data.data.role,
            display_name: data.data.display_name,
            bio: data.data.bio,
            avatar_ipfs_hash: data.data.avatar_ipfs_hash,
            avatar_fallback_url: data.data.avatar_fallback_url,
            last_login: data.data.last_login,
          }
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try{
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success && data.statusCode === 200) {
        router.push('/');
      }
      console.log(data);

    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (key: string) => {
    setActive(key);
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

  const renderContent = () => {
    switch (active) {
      case 'overview':
        return <App.Overview user={user || undefined} />;
      case 'personal':
        return <App.Personal user={user || undefined} />;
      case 'security':
        return <App.Security />;
      case 'wallets':
        return <App.Wallets />;
      case 'connections':
        return <App.Connections />;
      case 'news':
        return <App.News />;
      case 'notifications':
        return <App.Notifications />;
      case 'devices':
        return <App.Devices />;
      default:
        return <App.Overview user={user || undefined} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <Auth.BackgroundAccents />
      {/* Fixed Topbar */}
      <App.Topbar
        user={user ? { name: user.display_name || user.username, email: user.email } : undefined}
        onLogout={handleLogout}
      />

      {/* Sidebar */}
      <App.Sidebar active={active} onChange={handleChange} onLogout={handleLogout} />

      {/* Content */}
      {renderContent()}
    </div>
  );
}
