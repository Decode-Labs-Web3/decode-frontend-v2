"use client";

import Image from "next/image";
import { useContext } from "react";
import App from "@/components/(app)";
import { UserInfoContext } from "@/contexts/UserInfoContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faWallet,
  faLaptop,
  faPlug,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function OverviewPage() {
  const userContext = useContext(UserInfoContext);
  const user = userContext?.user;
  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      {/* Headline */}
      <App.PageHeader
        title="Overview"
        description="Manage your Decode account, security and Web3 connections."
      />

      {/* Profile */}
      {user && (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 backdrop-blur-sm p-8 mb-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Profile Information
              </h3>
              <p className="text-white font-mono text-sm">User ID: {user.id}</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-80 h-80 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/20 overflow-hidden shadow-xl">
                <Image
                  src={
                    user.avatar_ipfs_hash
                      ? `https://gateway.pinata.cloud/ipfs/${user.avatar_ipfs_hash}`
                      : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={user.username || "Avatar"}
                  width={320}
                  height={320}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-1 space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-white">
                    {user.display_name || user.username || "Your name"}
                  </h2>
                  {user?.role && (
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 text-sm font-medium border border-blue-500/30">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-300">{user.email}</p>
              </div>

              {/* Bio Section */}
              <div className="pt-6 border-t border-white/10">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">About me</h4>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-gray-200 leading-relaxed">
                      {user.bio ||
                        "No bio added yet. Visit the Personal page to add a short description about yourself."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-sm text-gray-400">Followers</span>
                    <p className="text-white text-sm">
                      {user.followers_number}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-gray-400">Following</span>
                    <p className="text-white text-sm">
                      {user.following_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FontAwesomeIcon icon={faShieldHalved} className="text-green-400" />
            <span className="text-sm text-gray-300">Security</span>
          </div>
          <p className="text-white font-medium">Protected</p>
          <p className="text-xs text-gray-400 mt-1">2FA enabled</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FontAwesomeIcon icon={faWallet} className="text-blue-400" />
            <span className="text-sm text-gray-300">Wallets</span>
          </div>
          <p className="text-white font-medium">Primary wallet</p>
          <p className="text-xs text-gray-400 mt-1">
            {user?.primary_wallet?.address.slice(0, 10)}......
            {user?.primary_wallet?.address.slice(-6)}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FontAwesomeIcon icon={faLaptop} className="text-purple-400" />
            <span className="text-sm text-gray-300">Devices</span>
          </div>
          <p className="text-white font-medium">Current device</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(user?.last_login || "").toLocaleString()}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FontAwesomeIcon icon={faPlug} className="text-cyan-400" />
            <span className="text-sm text-gray-300">dApps</span>
          </div>
          <p className="text-white font-medium">5 connected</p>
          <p className="text-xs text-gray-400 mt-1">Active today</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Recent Activity</h3>
          <button className="text-sm text-gray-400 hover:text-white">
            View all
          </button>
        </div>
        <div className="space-y-3">
          {[
            { title: "Signed in on Chrome (Mac)", time: "Just now" },
            { title: "Connected to dApp: DeSwap", time: "2 hours ago" },
            { title: "API key used by server-01", time: "Yesterday" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-green-400 text-sm"
                />
                <div>
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
              <button className="text-xs text-gray-400 hover:text-white">
                Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
