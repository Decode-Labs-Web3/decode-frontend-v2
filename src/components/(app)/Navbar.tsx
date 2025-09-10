'use client';

import Image from 'next/image';

interface NavbarProps {
  user: { 
    username: string; 
    email: string;
  };
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-2xl">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Navbar */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/20 rounded-lg p-1.5 backdrop-blur-sm">
              <Image src="/images/tokens/3d_token_nobg.png" width={28} height={28} alt="Logo Icon" />
            </div>
              <h1 className="text-sm md:text-base font-semibold text-white">Decode Protocol</h1>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-6">
            <input
              type="text"
              placeholder="Search settings, security, devices..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <div className="leading-tight">
                  <p className="text-xs text-white font-medium">{user.username}</p>
                  {user.email && <p className="text-[10px] text-gray-400">{user.email}</p>}
                </div>
              </div>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


