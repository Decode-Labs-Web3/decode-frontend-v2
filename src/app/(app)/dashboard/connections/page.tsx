'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserCheck } from '@fortawesome/free-solid-svg-icons';

type User = {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  following: boolean;
};

const initialSuggestions: User[] = [
  { id: 1, name: 'Alice Johnson', handle: 'alice', avatar: 'https://i.pravatar.cc/80?img=1', following: false },
  { id: 2, name: 'Bob Lee', handle: 'boblee', avatar: 'https://i.pravatar.cc/80?img=2', following: false },
  { id: 3, name: 'Carter Kim', handle: 'ckim', avatar: 'https://i.pravatar.cc/80?img=3', following: true },
  { id: 4, name: 'Daria Cruz', handle: 'daria', avatar: 'https://i.pravatar.cc/80?img=4', following: false },
  { id: 5, name: 'Evan Brooks', handle: 'evan', avatar: 'https://i.pravatar.cc/80?img=5', following: false },
  { id: 6, name: 'Fiona Park', handle: 'fiona', avatar: 'https://i.pravatar.cc/80?img=6', following: true },
];

export default function Page() {
  const [people, setPeople] = useState<User[]>(initialSuggestions);

  const toggleFollow = (id: number) => {
    setPeople(prev => prev.map(p => (p.id === id ? { ...p, following: !p.following } : p)));
  };

  const following = people.filter(p => p.following);
  const suggestions = people.filter(p => !p.following);

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Connections</h2>
          <p className="text-gray-400 text-sm">Discover people and manage who you follow.</p>
        </div>
        <div className="hidden sm:block">
          <div className="relative">
            <input
              placeholder="Search people"
              className="w-64 bg-white/5 border border-white/10 rounded-lg pl-3 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Suggestions for you</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {suggestions.map(u => (
            <div
              key={u.id}
              className="group bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between transition hover:bg-white/7.5 hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image src={u.avatar} alt={u.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" unoptimized />
                </div>
                <div>
                  <p className="text-sm font-medium tracking-tight">{u.name}</p>
                  <p className="text-xs text-gray-400">@{u.handle}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(u.id)}
                className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2 shadow-sm hover:from-blue-500 hover:to-indigo-500"
              >
                <FontAwesomeIcon icon={faUserPlus} /> Follow
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300">Following</h3>
          {following.length > 0 && (
            <span className="text-[11px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300">
              {following.length} following
            </span>
          )}
        </div>
        {following.length === 0 ? (
          <div className="text-sm text-gray-400 bg-white/5 border border-white/10 rounded-xl p-4">
            You aren't following anyone yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {following.map(u => (
              <div key={u.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image src={u.avatar} alt={u.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" unoptimized />
                  <div>
                    <p className="text-sm font-medium tracking-tight">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(u.id)}
                  className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center gap-2 border border-white/10"
                >
                  <FontAwesomeIcon icon={faUserCheck} /> Following
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

 


