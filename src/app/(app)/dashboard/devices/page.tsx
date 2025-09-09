'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faMobileScreen, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Page() {
  const devices = [
    { name: 'MacBook Pro', type: 'desktop', lastActive: 'Just now' },
    { name: 'iPhone 15 Pro', type: 'mobile', lastActive: '2 days ago' },
  ];

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Devices</h2>
        <p className="text-gray-400 text-sm">Trusted devices that have signed in to your account.</p>
      </div>

      <div className="space-y-3">
        {devices.map((d, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <FontAwesomeIcon icon={d.type === 'mobile' ? faMobileScreen : faLaptop} className="text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-gray-400">Active {d.lastActive}</p>
              </div>
            </div>
            <button className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2">
              <FontAwesomeIcon icon={faTrash} /> Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

 


