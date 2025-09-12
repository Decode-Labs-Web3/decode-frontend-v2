'use client';
import Auth from '@/components/(auth)';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyRegister() {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const [resendLoading, setResendLoading] = useState<boolean>(false);

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
            const response = await fetch('/api/auth/verify-register', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'frontend-internal-request': 'true' 
                },
                body: JSON.stringify({ code }),
                cache: "no-store",
                signal: AbortSignal.timeout(5000),
            });

            // For now, using mock verification
            const responseData = await response.json();
            console.log('Response data:', responseData);
            if (responseData.success) {
                // Success - show success message and redirect to login
                setError(''); // Clear any previous errors
                router.push('/login');
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

        inputsRef.current[Math.min(text.length, 5)]?.focus();
        e.preventDefault();
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            const response = await fetch('/api/auth/resend-verification-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
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
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <Auth.BackgroundAccents />
            <Auth.Logo />

            <Auth.AuthCard title="Verify Code">
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

                    <Auth.SubmitButton
                        loading={loading}
                        disabled={digits.join('').length !== 6}
                        loadingText="Verifying..."
                    >
                        Verify
                    </Auth.SubmitButton>
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
            </Auth.AuthCard>

            <Auth.BrandLogos />
        </main>
    );
}


