'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import BackgroundAccents from '@/components/BackgroundAccents';
import Logo from '@/components/Logo';
import AuthCard from '@/components/AuthCard';
import BrandLogos from '@/components/BrandLogos';

export default function VerifyEmail() {
    const router = useRouter();
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [verificationType, setVerificationType] = useState<'registration' | 'login' | null>(null);
    const [userInfo, setUserInfo] = useState<{ email?: string; username?: string }>({});

    useEffect(() => {
        // Check verification context
        const hasVerificationContext = sessionStorage.getItem('verification_required') || 
                                     localStorage.getItem('verification_required');
        
        if (!hasVerificationContext) {
            router.push('/login');
            return;
        }

        // Check if this is registration verification
        const registrationData = sessionStorage.getItem('registration_data');
        if (registrationData) {
            try {
                const data = JSON.parse(registrationData);
                setUserInfo({ email: data.email, username: data.username });
                setVerificationType('registration');
            } catch {
                setVerificationType('login');
            }
        } else {
            setVerificationType('login');
        }
    }, [router]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = digits.join('');
        
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (verificationType === 'registration') {
                // TODO: Replace with actual registration verification API call
                // const response = await fetch('/api/auth/verify-registration', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ code, email: userInfo.email })
                // });
                
                // For now, using mock verification
                const expected = typeof window !== 'undefined' ? localStorage.getItem('mockVerificationCode') : null;
                
                if (code === expected) {
                    // Clear verification context
                    sessionStorage.removeItem('verification_required');
                    localStorage.removeItem('verification_required');
                    sessionStorage.removeItem('registration_data');
                    
                    // Success - redirect to login
                    router.push('/login?verified=true');
                } else {
                    setError('Invalid verification code. Please check your email and try again.');
                    setDigits(Array(6).fill(''));
                    inputsRef.current[0]?.focus();
                }
            } else {
                // Login verification flow
                // TODO: Replace with actual login verification API call
                const expected = typeof window !== 'undefined' ? localStorage.getItem('mockResetCode') : null;
                
                if (code === expected) {
                    // Success - redirect to dashboard
                    router.push('/dashboard');
                } else {
                    setError('Invalid verification code. Please check your email and try again.');
                    setDigits(Array(6).fill(''));
                    inputsRef.current[0]?.focus();
                }
            }
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        
        // Clear error when user starts typing
        if (error) setError('');
        
        // Auto-focus next input
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
        
        // Clear error when pasting
        if (error) setError('');
        
        inputsRef.current[Math.min(text.length, 5)]?.focus();
        e.preventDefault();
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            if (verificationType === 'registration') {
                // TODO: Replace with actual resend registration verification API call
                // await fetch('/api/auth/resend-registration-verification', { 
                //     method: 'POST',
                //     body: JSON.stringify({ email: userInfo.email })
                // });
                
                // Mock resend for registration
                if (typeof window !== 'undefined') {
                    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                    localStorage.setItem('mockVerificationCode', newCode);
                    alert(`New verification code sent to ${userInfo.email}: ${newCode}`);
                }
            } else {
                // TODO: Replace with actual resend login verification API call
                // await fetch('/api/auth/resend-verification', { method: 'POST' });
                
                // Mock resend for login
                if (typeof window !== 'undefined') {
                    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                    localStorage.setItem('mockResetCode', newCode);
                    alert(`New verification code sent: ${newCode}`);
                }
            }
        } catch {
            setError('Failed to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    if (!verificationType) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading verification...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <BackgroundAccents />
            
            {/* Logo */}
            <div className="mb-8">
                <Logo />
            </div>

            {/* Main Card */}
            <AuthCard title="Verify Code">
                <p className="text-sm text-gray-400 text-center mb-6">
                    {verificationType === 'registration' 
                        ? `Enter the 6-digit code we sent to ${userInfo.email}`
                        : 'Enter the 6-digit code we sent to your email.'
                    }
                </p>

                <form noValidate onSubmit={handleVerify}>
                    <div className="mb-6 flex items-center justify-center gap-1.5 max-w-full overflow-hidden px-2">
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputsRef.current[i] = el; }}
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={handlePaste}
                                className="w-9 h-9 text-center bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all duration-200 hover:border-gray-500 flex-shrink-0"
                                placeholder=""
                                disabled={loading}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-all shadow-lg flex items-center justify-center gap-2" 
                        type="submit"
                        disabled={loading || digits.join('').length !== 6}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Verifying...
                            </>
                        ) : (
                            'Verify'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-400">
                    Didn&apos;t get the code?{' '}
                    <button
                        type="button"
                        className="text-blue-500 hover:text-blue-400 hover:underline font-medium transition-colors disabled:text-blue-600 disabled:cursor-not-allowed"
                        onClick={handleResend}
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'Sending...' : 'Resend'}
                    </button>
                </p>
            </AuthCard>
            
            <BrandLogos />
        </main>
    );
}
