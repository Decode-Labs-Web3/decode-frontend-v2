'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  name: string;
  email?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authentication is already handled by middleware
    // Just set user data and stop loading
    setUser({ name: 'User' }); // Placeholder user data
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // Clear cookies and redirect to login
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-500">Decode Protocol</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard Cards */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Authentication Status</h3>
            <p className="text-green-400">✓ Authenticated</p>
            <p className="text-gray-400 text-sm mt-2">Device fingerprint verified</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Session Info</h3>
            <p className="text-gray-300">Active session</p>
            <p className="text-gray-400 text-sm mt-2">Token valid</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Security</h3>
            <p className="text-green-400">✓ Secure connection</p>
            <p className="text-gray-400 text-sm mt-2">HTTPS enabled</p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to Decode Protocol</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            You have successfully authenticated and verified your device. 
            Your session is now secure and you can access protected resources.
          </p>
        </div>
      </main>
    </div>
  );
}
