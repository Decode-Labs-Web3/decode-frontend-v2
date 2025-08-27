'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Login() {
    const [formData, setFormData] = useState({
        username_or_email: "",
        password: ""
    });

    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <div className="mb-8">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-black rounded-sm"></div>
                    </div>
                    <span className="text-xl font-semibold">decode protocol</span>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-8">Get Started</h1>
                
                {/* Connect Wallet Button */}
                <button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-4 rounded-lg mb-6 flex items-center justify-center space-x-2 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                    <span>Connect Wallet</span>
                </button>

                {/* Divider */}
                <div className="flex items-center mb-6">
                    <div className="flex-1 border-t border-gray-600"></div>
                    <span className="px-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-1 border-t border-gray-600"></div>
                </div>

                {/* Email Input */}
                <div className="mb-6">
                    <input
                        type="email"
                        placeholder="william@decode.org"
                        value={formData.username_or_email}
                        onChange={(e) => setFormData(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                    />
                </div>

                {/* Password Input */}
                <div className="mb-6">
                    <input
                        type="password"
                        placeholder="123456"
                        value={formData.password}
                        onChange={(e) => setFormData(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                    />
                </div>

                {/* Login/Signup Button */}
                <button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-4 rounded-lg mb-6 transition-colors">
                    Log in
                </button>

                {/* Terms */}
                <p className="text-xs text-gray-400 text-center">
                    By continuing, you agree to our{' '}
                    <Link href="/terms" className="text-green-500 hover:underline">Terms</Link>
                    {' '}and acknowledge our{' '}
                    <Link href="/privacy" className="text-green-500 hover:underline">Privacy Policy</Link>
                </p>
            </div>

            {/* Stats */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                    <span className="text-green-500 font-semibold">9,004,346</span> Decode IDs were created since Testnet launch{' '}
                    <span className="text-green-500 font-semibold">331</span> days ago
                </p>
                <div className="flex justify-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
            </div>

            {/* reCAPTCHA Notice */}
            <p className="mt-4 text-xs text-gray-500 text-center">
                This site is protected by reCAPTCHA and the Google{' '}
                <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                {' '}and{' '}
                <Link href="/terms" className="hover:underline">Terms of Service</Link>
                {' '}apply.
            </p>
        </main>
    );
}