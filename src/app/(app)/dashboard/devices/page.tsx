'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faMobileScreen, faTablet, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Fingerprint {
  "_id": string;
  "user_id": string;
  "device": string;
  "browser": string;
  "fingerprint_hashed": string;
  "is_trusted": boolean;
  "createdAt": string;
  "updatedAt": string;
  "__v": number;
  "sessions": Session[];
}

interface Session {
  "_id": string;
  "user_id": string;
  "device_fingerprint_id": string;
  "session_token": string;
  "app": string;
  "expires_at": string;
  "is_active": boolean;
  "last_used_at": string;
  "createdAt": string;
  "updatedAt": string;
  "__v": number;
}

export default function Page() {
  const router = useRouter();
  const [changed, setChanged] = useState(false);
  const [fingerprintsData, setFingerprintsData] = useState<Fingerprint[]>([]);

  useEffect(() => {
    const fetchFingerprints = async () => {
      try {
        const apiResponse = await fetch('/api/auth/fingerprints', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Frontend-Internal-Request': 'true'
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });
        const responseData = await apiResponse.json();
        setFingerprintsData(responseData.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFingerprints();
  }, [changed]);

  const handleRevokeAll = async (deviceFingerprintId: string) => {
    setChanged(true);
    try {
      const apiResponse = await fetch(`/api/auth/revoke-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Frontend-Internal-Request': 'true'
        },
        body: JSON.stringify({deviceFingerprintId}),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      const responseData = await apiResponse.json();
      if(responseData.success || responseData.statusCode === 200 || responseData.message === 'Device fingerprint revoked') {
        router.push('/');
      }
      setChanged(false);
    } catch (error) {
      console.error(error);
    }
  }

  const handleRevoke = async (sessionId: string) => {
    setChanged(true);
    try {
      const apiResponse = await fetch(`/api/auth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Frontend-Internal-Request': 'true'
        },
        body: JSON.stringify({sessionId}),
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      const responseData = await apiResponse.json();
      if(responseData.success || responseData.statusCode === 200 || responseData.message === 'Session revoked') {
        router.refresh();
      }
      setChanged(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:pl-72 lg:pr-8 pt-20 sm:pt-24 pb-8 sm:pb-10">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2">Devices</h2>
        <p className="text-gray-400 text-sm sm:text-base">Trusted devices that have signed in to your account.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {fingerprintsData.map(fingerprint => (
          <div key={fingerprint._id} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={fingerprint.device === 'iOS' || fingerprint.device === 'Android' ? faMobileScreen : fingerprint.device === 'iPadOS' ? faTablet : faLaptop} className="text-gray-300 text-sm" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white"><p className="text-xs sm:text-sm font-medium text-white mb-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="truncate">{fingerprint.device}</span>
                  <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                  <span className="truncate">{fingerprint.browser}</span>
                </p></h3>
              </div>
              {fingerprint.sessions.length > 1 && (
                <button 
                onClick={() => handleRevokeAll(fingerprint._id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors w-full sm:w-auto">
                  Revoke All
                </button>
              )}
            </div>

            <div className="space-y-2 sm:space-y-3">
              {fingerprint.sessions.map(session => (
                <div key={session._id} className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={`/images/logos/${session.app}.png`}
                        alt={`${session.app} logo`}
                        width={32}
                        height={32}
                        className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{session.app.charAt(0).toUpperCase() + session.app.slice(1)}</h3>
                      <p className="text-xs text-gray-400 truncate">
                        Last access: {session.last_used_at}
                      </p>
                    </div>
                    <button 
                    onClick={() => handleRevoke(session._id)}
                    className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex-shrink-0 px-2 py-1 rounded hover:bg-red-400/10">
                      Revoke
                    </button>
                  </div>
                </div>
              ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




