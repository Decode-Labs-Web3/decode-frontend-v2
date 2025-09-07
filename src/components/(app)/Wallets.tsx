'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

export default function Wallets() {
  const wallets = [
    { name: 'MetaMask', address: '0xA2c4...9F1d', network: 'Ethereum', status: 'Connected' },
    { name: 'Ledger Nano X', address: 'bc1q7...k9z3', network: 'Bitcoin', status: 'Connected' },
  ];

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Wallets</h2>
        <p className="text-gray-400 text-sm">Manage linked wallets used across Decode and connected dApps.</p>
      </div>

      <div className="space-y-3">
        {wallets.map((w, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FontAwesomeIcon icon={faWallet} />
              </div>
              <div>
                <p className="text-sm font-medium">{w.name}</p>
                <p className="text-xs text-gray-400">{w.address} • {w.network}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-sm flex items-center gap-1"><FontAwesomeIcon icon={faCircleCheck} /> {w.status}</span>
              <button className="text-sm text-blue-400 hover:text-blue-300">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


