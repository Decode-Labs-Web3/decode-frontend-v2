'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGaugeHigh, faUserShield, faWallet, faLink, faNewspaper, faBell, faDevice, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  active: string;
  onChange: (key: string) => void;
  onLogout?: () => void;
}

const items = [
  { key: 'overview', label: 'Overview', icon: faGaugeHigh },
  { key: 'security', label: 'Security', icon: faUserShield },
  { key: 'wallets', label: 'Wallets', icon: faWallet },
  { key: 'connections', label: 'Connections', icon: faLink },
  { key: 'news', label: 'News', icon: faNewspaper },
  { key: 'notifications', label: 'Notifications', icon: faBell },
  { key: 'devices', label: 'Devices', icon: faDevice },
];

export default function Sidebar({ active, onChange, onLogout }: SidebarProps) {
  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-black/60 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col">
      <nav className="p-3 space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              active === it.key ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={it.icon} className="w-4 h-4" />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      {onLogout && (
        <div className="mt-auto p-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </aside>
  );
}


