'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faMobileScreen, faTablet, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Page() {
  const deviceCategories = {
    mobile: {
      title: 'Mobile',
      devices: [
        {
          device: 'iOS',
          browser: 'Safari',
          lastActive: '15 / 12 / 2024',
          type: 'mobile',
          logo: '/images/logos/DeFuel_logo.png'
        },
        {
          device: 'Android',
          browser: 'Chrome',
          lastActive: '10 / 12 / 2024',
          type: 'mobile',
          logo: '/images/logos/DeHive_logo.png'
        }
      ],
    },
    website: {
      title: 'Desktop',
      devices: [
        {
          device: 'macOS',
          browser: 'Safari',
          lastActive: '02 / 09 / 2025',
          type: 'desktop',
          logo: '/images/logos/DeCareer_logo.png'
        },
        {
          device: 'Windows',
          browser: 'Chrome',
          lastActive: '09 / 09 / 2025',
          type: 'desktop',
          logo: '/images/logos/DeCourse_logo.png'
        }
      ]
    },
    tablet: {
      title: 'Tablet',
      devices: [
        {
          device: 'iPadOS',
          browser: 'Safari',
          lastActive: '09 / 09 / 2025',
          type: 'tablet',
          logo: '/images/logos/DeDao_logo.png'
        }
      ]
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return faMobileScreen;
      case 'tablet':
        return faTablet;
      default:
        return faLaptop;
    }
  };

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Devices</h2>
        <p className="text-gray-400 text-sm">Trusted devices that have signed in to your account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(deviceCategories).map(([key, category]) => (
          <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={getDeviceIcon(key)} className="text-gray-300 text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-white">{category.title}</h3>
              </div>
               {category.devices.length > 0 && (
                 <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                   Revoke All
                 </button>
               )}
            </div>
            
            <div className="space-y-3">
              {category.devices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={getDeviceIcon(key)} className="text-gray-300 text-2xl" />
                  </div>
                </div>
              ) : (
                category.devices.map((device, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img 
                          src={device.logo} 
                          alt={`${device.type} logo`}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                          <span>{device.device}</span>
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-400 align-middle"></span>
                          <span>{device.browser}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Last access: {device.lastActive}
                        </p>
                      </div>
                      <button className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex-shrink-0">
                        Revoke
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

 


