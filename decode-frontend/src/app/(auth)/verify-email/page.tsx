'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import BackgroundAccents from '../components/BackgroundAccents';
import Logo from '../components/Logo';
import AuthCard from '../components/AuthCard';
import BrandLogos from '../components/BrandLogos';

export default function VerifyEmail() {
    const router = useRouter();
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [error, setError] = useState('');

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const code = digits.join('');
        const expected = typeof window !== 'undefined' ? localStorage.getItem('mockResetCode') : null;
        if (code.length === 6 && code === expected) {
            router.push('/change-password');
        } else {
            setError('Invalid code. Please try again.');
        }
    };

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!text) return;
        const next = Array(6).fill('');
        for (let i = 0; i < text.length; i++) next[i] = text[i];
        setDigits(next);
        inputsRef.current[Math.min(text.length, 5)]?.focus();
        e.preventDefault();
    };

    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <BackgroundAccents />
            {/* Logo */}
            <div className="mb-8">
                <Logo />
            </div>

            {/* Main Card */}
            <AuthCard title="Verify Code">
                <p className="text-sm text-gray-400 text-center mb-6">Enter the 6-digit code we sent to your email.</p>

                <form noValidate onSubmit={handleVerify}>
                    <div className="mb-6 flex items-center justify-center gap-3">
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputsRef.current[i] = el; }}
                                inputMode="numeric"
                                maxLength={1}
                                value={d}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={handlePaste}
                                className="w-12 h-12 text-center bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-lg"
                            />
                        ))}
                    </div>
                    {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-colors" type="submit">
                        Verify
                    </button>
                </form>

                <p className="text-center text-gray-400">
                    Didn’t get the code?{' '}
                    <button
                        type="button"
                        className="text-blue-500 hover:underline font-medium"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('mockResetCode', '123456');
                                alert('Code resent (mock): 123456');
                            }
                        }}
                    >
                        Resend
                    </button>
                </p>
            </AuthCard>
            <BrandLogos />
        </main>
    );
}


