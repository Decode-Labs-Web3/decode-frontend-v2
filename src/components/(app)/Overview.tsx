'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faWallet, faKey, faPlug, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

interface UserOverviewData {
  _id: string;
  user_id: string;
  email: string;
  username: string;
  role: string;
  display_name: string;
  bio?: string;
  avatar_ipfs_hash?: string;
  avatar_fallback_url?: string;
  last_login?: string;
}

interface OverviewProps {
  user?: UserOverviewData;
}

export default function Overview({ user }: OverviewProps) {
  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      {/* Headline */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-gray-400 text-sm">Manage your Decode account, security and Web3 connections.</p>
      </div>

      {/* Profile */}
      {user && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_fallback_url || '/images/icons/user-placeholder.png'}
              alt={user.display_name || user.username}
              className="w-14 h-14 rounded-lg object-cover border border-white/10"
            />
            <div className="min-w-0">
              <p className="text-lg font-semibold truncate">{user.display_name || user.username}</p>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-0.5 rounded bg-white/10">Role: {user.role}</span>
                {user.last_login && (
                  <span className="px-2 py-0.5 rounded bg-white/10">
                    Last login: {new Date(user.last_login).toLocaleString()}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-white/10">User ID: {user.user_id}</span>
              </div>
            </div>
          </div>
          {user.bio && <p className="mt-3 text-sm text-gray-300">{user.bio}</p>}
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
              <FontAwesomeIcon icon={faKey} />
            </div>
            <span className="text-sm text-gray-300">API keys</span>
          </div>
          <p className="text-white font-medium">1 active</p>
          <p className="text-xs text-gray-400 mt-1">Last used 2 days ago</p>
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


