'use client';

import App from '@/components/(app)';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle } from '@fortawesome/free-solid-svg-icons';

export default function NotificationsPage() {
  const notifications = [
    { title: 'New login from Chrome (Mac)', time: 'Just now' },
    { title: 'Wallet MetaMask linked', time: '2 hours ago' },
    { title: 'API key created', time: 'Yesterday' },
  ];

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <App.PageHeader 
        title="Notifications" 
        description="Security and account events." 
      />

      <div className="bg-white/5 border border-white/10 rounded-xl">
        <ul className="divide-y divide-white/10">
          {notifications.map((n, i) => (
            <li key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faBell} className="text-yellow-400" />
                <div>
                  <p className="text-sm">{n.title}</p>
                  <p className="text-xs text-gray-400">{n.time}</p>
                </div>
              </div>
              <FontAwesomeIcon icon={faCircle} className="text-blue-400 text-[8px]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

 


