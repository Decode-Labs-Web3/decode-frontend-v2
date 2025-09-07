'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faMobileScreen, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Devices() {
  const devices = [
    { name: 'MacBook Pro', type: 'desktop', browser: 'Chrome', lastActive: 'Just now', location: 'San Francisco, US' },
    { name: 'iPhone 15 Pro', type: 'mobile', browser: 'Safari', lastActive: '2 days ago', location: 'San Francisco, US' },
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
                <p className="text-sm font-medium">{d.name} • {d.browser}</p>
                <p className="text-xs text-gray-400">{d.lastActive} • {d.location}</p>
              </div>
            </div>
            <button className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2">
              <FontAwesomeIcon icon={faTrash} /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


