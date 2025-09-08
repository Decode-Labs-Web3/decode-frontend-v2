'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faWallet, faLaptop, faPlug, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

interface UserData {
    _id: string;
    email: string;
    username: string;
    role: string;
    display_name?: string;
    bio?: string;
    avatar_ipfs_hash?: string;
    avatar_fallback_url?: string;
    last_login?: string;
  };

export default function Overview({ user }: { user?: UserData }) {
  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      {/* Headline */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-gray-400 text-sm">Manage your Decode account, security and Web3 connections.</p>
      </div>

      {/* Profile */}
      {user && (
        <div className="relative bg-gradient-to-br from-black/80 via-gray-900/80 to-blue-900/60 border border-blue-700/30 shadow-lg rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar with ring */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500/30 to-purple-500/30 flex items-center justify-center border-4 border-blue-600/30 shadow-lg">
              <img
                src={user.avatar_fallback_url || '/images/icons/user-placeholder.png'}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            </div>
            {/* Status badge */}
            <span className="absolute bottom-2 right-2 bg-green-500 border-2 border-white w-4 h-4 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs text-white" />
            </span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
              <p className="text-xl font-bold text-white truncate">{user.display_name || user.username}</p>
              <span className="mt-1 md:mt-0 px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 text-xs font-medium inline-block">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-400 truncate mt-1">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300">User ID: <span className="font-mono">{user._id}</span></span>
              {user.last_login && (
                <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300">
                  Last login: <span className="font-mono">{new Date(user.last_login).toLocaleString()}</span>
                </span>
              )}
            </div>
            {user.bio && (
              <p className="mt-4 text-sm text-gray-200 italic border-l-4 border-blue-500/40 pl-3">{user.bio}</p>
            )}
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <span className="text-sm text-gray-300">Security status</span>
          </div>
          <p className="text-white font-medium">Protected</p>
          <p className="text-xs text-gray-400 mt-1">2FA enabled, device trusted</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faWallet} />
            </div>
            <span className="text-sm text-gray-300">Linked wallets</span>
          </div>
          <p className="text-white font-medium">2 wallets</p>
          <p className="text-xs text-gray-400 mt-1">MetaMask, Ledger Nano X</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faLaptop} />
            </div>
            <span className="text-sm text-gray-300">Linked devices</span>
          </div>
          <p className="text-white font-medium">3 devices</p>
          <p className="text-xs text-gray-400 mt-1">Last used: MacBook Pro</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faPlug} />
            </div>
            <span className="text-sm text-gray-300">Connected dApps</span>
          </div>
          <p className="text-white font-medium">5 apps</p>
          <p className="text-xs text-gray-400 mt-1">Last connected today</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent activity</h3>
          <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
        </div>
        <ul className="divide-y divide-white/10">
          {[
            { title: 'Signed in on Chrome (Mac)', time: 'Just now' },
            { title: 'Connected to dApp: DeSwap', time: '2 hours ago' },
            { title: 'API key used by server-01', time: 'Yesterday' },
          ].map((it, idx) => (
            <li key={idx} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-green-400">
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <div>
                  <p className="text-sm">{it.title}</p>
                  <p className="text-xs text-gray-400">{it.time}</p>
                </div>
              </div>
              <button className="text-sm text-gray-400 hover:text-white">Details</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


