'use client';

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

export default function Connections() {
  const [people, setPeople] = useState<User[]>(initialSuggestions);

  const toggleFollow = (id: number) => {
    setPeople(prev => prev.map(p => (p.id === id ? { ...p, following: !p.following } : p)));
  };

  const following = people.filter(p => p.following);
  const suggestions = people.filter(p => !p.following);

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Connections</h2>
        <p className="text-gray-400 text-sm">Discover people and manage who you follow.</p>
      </div>

      {/* Suggestions */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Suggestions for you</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {suggestions.map(u => (
            <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-gray-400">@{u.handle}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(u.id)}
                className="text-xs px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUserPlus} /> Follow
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Following */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Following</h3>
        {following.length === 0 ? (
          <p className="text-sm text-gray-400">You aren't following anyone yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {following.map(u => (
              <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(u.id)}
                  className="text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center gap-2"
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


