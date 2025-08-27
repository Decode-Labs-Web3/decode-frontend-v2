'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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
                <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1>
                
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

                {/* Form Fields */}
                <div className="space-y-4 mb-6">
                    <div>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                    
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="william@decode.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                    
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                    
                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Create Account Button */}
                <button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-4 rounded-lg mb-6 transition-colors">
                    Create Account
                </button>

                {/* Divider */}
                <div className="flex items-center mb-6">
                    <div className="flex-1 border-t border-gray-600"></div>
                    <span className="px-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-1 border-t border-gray-600"></div>
                </div>

                {/* Social Signup Icons */}
                <div className="flex justify-center space-x-4 mb-6">
                    <button className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                        <span className="text-white font-bold text-lg">X</span>
                    </button>
                    <button className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                        <span className="text-blue-500 font-bold text-lg">M</span>
                    </button>
                    <button className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                        <span className="text-red-500 font-bold text-lg">G</span>
                    </button>
                    <button className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                        <span className="text-blue-400 font-bold text-lg">✈</span>
                    </button>
                </div>

                {/* Login Link */}
                <p className="text-center text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-green-500 hover:underline font-medium">
                        Log in
                    </Link>
                </p>

                {/* Terms */}
                <p className="text-xs text-gray-400 text-center mt-6">
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