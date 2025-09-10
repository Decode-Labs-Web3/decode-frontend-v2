'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGaugeHigh, faUserShield, faWallet, faLink, faNewspaper, faBell, faLaptop, faUser } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  active: string;
  onChange: (key: string) => void;
}

const items = [
  { key: 'overview', label: 'Overview', icon: faGaugeHigh },
  { key: 'personal', label: 'Personal', icon: faUser },
  { key: 'security', label: 'Security', icon: faUserShield },
  { key: 'wallets', label: 'Wallets', icon: faWallet },
  { key: 'connections', label: 'Connections', icon: faLink },
  { key: 'news', label: 'News', icon: faNewspaper },
  { key: 'notifications', label: 'Notifications', icon: faBell },
  { key: 'devices', label: 'Devices', icon: faLaptop },
];

export default function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-black/60 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col">
      <nav className="p-3 space-y-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              active === item.key ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}


