'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import BackgroundAccents from '@/components/BackgroundAccents';
import Logo from '@/components/Logo';
import AuthCard from '@/components/AuthCard';
import BrandLogos from '@/components/BrandLogos';
import Head from 'next/head';

export default function VerifyForgot() {
    const router = useRouter();
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = digits.join('');
        
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/auth/verify-forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            
            // For now, using mock verification
            const responseData = await response.json();
            console.log('Response data:', responseData);
            if (responseData.success) {
                // Success - show success message and redirect to change password
                setError(''); // Clear any previous errors
                setSuccess('✅ Code verified! Redirecting to change password...');
                setTimeout(() => {
                    router.push('/change-password');
                }, 1500); // 1.5 second delay to show success message
            } else {
                setError('Invalid verification code. Please check your email and try again.');
                // Clear the form on error
                setDigits(Array(6).fill(''));
                inputsRef.current[0]?.focus();
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index: number, value: string) => {
        if (!/^[a-z0-9]?$/.test(value)) return;
        
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        
        // Clear error when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
        
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
        const pastedText = e.clipboardData.getData('text');
        
        // Check if it's in the format "fingerprint-email-verification:XXXXXX"
        const match = pastedText.match(/fingerprint-email-verification:([a-f0-9]{6})/i);
        let text = '';
        
        if (match) {
            // Extract the 6-character code from the format
            text = match[1];
        } else {
            // Fallback to original behavior - extract only digits/letters
            text = pastedText.replace(/[^a-f0-9]/gi, '').slice(0, 6);
        }
        
        if (!text) return;
        
        const next = Array(6).fill('');
        for (let i = 0; i < text.length; i++) next[i] = text[i];
        setDigits(next);
        
        // Clear error when pasting
        if (error) setError('');
        if (success) setSuccess('');
        
        inputsRef.current[Math.min(text.length, 5)]?.focus();
        e.preventDefault();
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            const response = await fetch('/api/auth/resend-verification-register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ })
            });

            const responseData = await response.json();
            console.log('Response data:', responseData);
        }
        catch (error) {
            console.error('Resend error:', error);
            setError('Failed to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Verify Email - Decode Protocol</title>
                <meta name="robots" content="noindex, nofollow, noarchive" />
                <meta name="googlebot" content="noindex, nofollow" />
                <meta name="description" content="Email verification required" />
                <meta name="keywords" content="" />
                <meta property="og:title" content="Verify Email" />
                <meta property="og:description" content="Email verification required" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="" />
                <meta property="og:image" content="" />
            </Head>
            
            <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
                <BackgroundAccents />
                
                {/* Logo */}
                <div className="mb-8">
                    <Logo />
                </div>

                {/* Main Card */}
                <AuthCard title="Verify Code">
                    <p className="text-sm text-gray-400 text-center mb-6">
                        Enter the 6-digit code we sent to your email.
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

                        {success && (
                            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm text-center">
                                {success}
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
        </>
    );
}


