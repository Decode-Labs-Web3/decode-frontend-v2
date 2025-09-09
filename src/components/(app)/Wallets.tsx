'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faCircleCheck, faPlus, faTrash, faGripVertical } from '@fortawesome/free-solid-svg-icons';

export default function Wallets() {
  const initialWallets = [
    { name: 'MetaMask', address: '0xA2c4...9F1d', network: 'Ethereum', status: 'Connected' },
    { name: 'Ledger Nano X', address: 'bc1q7...k9z3', network: 'Bitcoin', status: 'Connected' },
  ];

  const [wallets, setWallets] = React.useState(initialWallets);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => () => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setWallets(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleRemove = (index: number) => () => {
    setWallets(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Wallets</h2>
          <p className="text-gray-400 text-sm">Drag to reorder. Top wallet is treated as primary.</p>
        </div>
        <button className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-colors">
          <FontAwesomeIcon icon={faPlus} />
          Add wallet
        </button>
      </div>

      <div className="space-y-3">
        {wallets.map((w, i) => (
          <div
            key={i}
            className={`rounded-xl p-4 flex items-center justify-between cursor-move transition shadow-sm border ${
              overIndex === i ? 'bg-white/[0.08] border-blue-400/30 ring-2 ring-blue-400/30' : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
            }`}
            draggable
            onDragStart={handleDragStart(i)}
            onDragOver={handleDragOver}
            onDragEnter={() => setOverIndex(i)}
            onDragLeave={() => setOverIndex(null)}
            onDrop={handleDrop(i)}
          >
            <div className="flex items-center gap-3">
              <div
                className="text-gray-400/70 hover:text-gray-200 transition cursor-grab active:cursor-grabbing"
                aria-label="Drag to reorder"
                title="Drag to reorder"
              >
                <FontAwesomeIcon icon={faGripVertical} />
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center ring-1 ring-white/10">
                <FontAwesomeIcon icon={faWallet} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium tracking-tight">{w.name}</p>
                  {i === 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">Primary</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{w.address} • {w.network}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-sm flex items-center gap-1"><FontAwesomeIcon icon={faCircleCheck} /> {w.status}</span>
              <button onClick={handleRemove(i)} className="inline-flex items-center gap-1 text-sm text-red-300 hover:text-red-200">
                <FontAwesomeIcon icon={faTrash} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


