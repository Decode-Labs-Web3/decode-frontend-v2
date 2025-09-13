'use client';

import App from '@/components/(app)';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faMobileScreen, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function Page() {
  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <App.PageHeader 
        title="Security" 
        description="Protect your Decode account with multi‑factor and device trust." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div>
              <h3 className="font-semibold">2‑Step Verification</h3>
              <p className="text-xs text-gray-400">Add an extra layer of security to your account</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faMobileScreen} className="text-blue-400" />
              <div>
                <p className="text-sm">Authenticator App</p>
                <p className="text-xs text-gray-400">Last verified 3 days ago</p>
              </div>
            </div>
            <span className="text-green-400 text-sm">Enabled</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <div>
              <h3 className="font-semibold">Password</h3>
              <p className="text-xs text-gray-400">A strong password helps keep your account safe</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg p-4">
            <p className="text-sm">Last changed: 2 months ago</p>
            <button className="text-sm text-blue-400 hover:text-blue-300">Change</button>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <div>
              <h3 className="font-semibold">Recovery email</h3>
              <p className="text-xs text-gray-400">Use this email to recover your account</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg p-4">
            <p className="text-sm">john.doe@example.com</p>
            <button className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

 


