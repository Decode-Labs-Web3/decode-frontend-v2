'use client';

import Image from 'next/image';
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
    <div className="px-4 sm:px-6 lg:pl-72 lg:pr-8 pt-20 sm:pt-24 pb-8 sm:pb-10">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2">Devices</h2>
        <p className="text-gray-400 text-sm sm:text-base">Trusted devices that have signed in to your account.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {Object.entries(deviceCategories).map(([key, category]) => (
          <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={getDeviceIcon(key)} className="text-gray-300 text-sm" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">{category.title}</h3>
              </div>
               {category.devices.length > 0 && (
                 <button className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors w-full sm:w-auto">
                   Revoke All
                 </button>
               )}
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {category.devices.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={getDeviceIcon(key)} className="text-gray-300 text-xl sm:text-2xl" />
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm">No {category.title.toLowerCase()} devices</p>
                </div>
              ) : (
                category.devices.map((device, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Image 
                          src={device.logo} 
                          alt={`${device.type} logo`}
                          width={32}
                          height={32}
                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white mb-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="truncate">{device.device}</span>
                          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                          <span className="truncate">{device.browser}</span>
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          Last access: {device.lastActive}
                        </p>
                      </div>
                      <button className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex-shrink-0 px-2 py-1 rounded hover:bg-red-400/10">
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

 


