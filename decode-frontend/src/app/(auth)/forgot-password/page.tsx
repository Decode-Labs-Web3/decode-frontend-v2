'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BrandLogos from '@/components/BrandLogos';
import BackgroundAccents from '@/components/BackgroundAccents';
import Logo from '@/components/Logo';
import AuthCard from '@/components/AuthCard';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');

    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <BackgroundAccents />
            {/* Logo */}
            <div className="mb-8">
                <Logo />
            </div>

            {/* Main Card */}
            <AuthCard title="Forgot Password">
                <p className="text-sm text-gray-400 text-center mb-6">Enter your email and we will send you a reset link.</p>

                <form noValidate onSubmit={(e) => {
                    e.preventDefault();
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('mockResetCode', '123456');
                    }
                    router.push('/verify-email');
                }}>
                    <div className="mb-6">
                        <input
                            required
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-colors" type="submit">
                        Send reset link
                    </button>
                </form>

                <p className="text-center text-gray-400">
                    Remembered your password?{' '}
                    <Link href="/login" className="text-blue-500 hover:underline font-medium">
                        Back to login
                    </Link>
                </p>
            </AuthCard>
            <BrandLogos />
        </main>
    );
}


