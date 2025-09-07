'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faCopy } from '@fortawesome/free-solid-svg-icons';

export default function ApiKeys() {
  const keys = [
    { name: 'Server Key', lastUsed: '2 days ago', prefix: 'dc_live_3f9a...' },
    { name: 'Local Dev', lastUsed: 'a month ago', prefix: 'dc_test_b12c...' },
  ];

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">API Keys</h2>
        <p className="text-gray-400 text-sm">Programmatic access to Decode APIs.</p>
      </div>

      <div className="space-y-3">
        {keys.map((k, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <FontAwesomeIcon icon={faKey} />
              </div>
              <div>
                <p className="text-sm font-medium">{k.name}</p>
                <p className="text-xs text-gray-400">{k.prefix} • Last used {k.lastUsed}</p>
              </div>
            </div>
            <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2">
              <FontAwesomeIcon icon={faCopy} /> Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


