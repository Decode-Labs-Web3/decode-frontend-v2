'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import App from '@/components/(app)';
import Auth from '@/components/(auth)';

interface User {
  name: string;
  email?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>('overview');

  useEffect(() => {
    // Authentication is already handled by middleware
    // Just set user data and stop loading
    setUser({ name: 'User' }); // Placeholder user data
    setLoading(false);
  }, []);

  const handleLogout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
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
        return <App.Overview />;
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
        return <App.Overview />;
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <Auth.BackgroundAccents />
      {/* Fixed Topbar */}
      <App.Topbar user={user || undefined} onLogout={handleLogout} />

      {/* Sidebar */}
      <App.Sidebar active={active} onChange={handleChange} onLogout={handleLogout} />

      {/* Content */}
      {renderContent()}
    </div>
  );
}
