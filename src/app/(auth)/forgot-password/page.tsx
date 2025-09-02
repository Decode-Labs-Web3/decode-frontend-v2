'use client';
import { useState } from 'react';
import Auth from '@/components/(auth)';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ email_or_username: string }>({
        email_or_username: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( formData )
            });

            const responseData = await response.json();

            if (!response.ok || !responseData.success) {
                throw new Error(responseData?.message || 'Failed to send reset link. Please try again.');
            }

            router.push('/verify-forgot');

        } catch (error) {
            console.error('Forgot password error:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!formData.email_or_username) {
            setError('Please enter your username or email first.');
            return;
        }
        await handleSubmit(new Event('submit') as any);
    };

    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <Auth.BackgroundAccents />
            <Auth.Logo />

            {/* Main Card */}
            <Auth.AuthCard title="Reset Password">
                {/* Back to Login Button */}
                <Auth.BackButton href="/login" text="Back to Login" />

                {/* Simple Description */}
                <p className="text-sm text-gray-400 text-center mb-8">
                    Enter your email to receive a reset link
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    <Auth.TextField
                        id="email_or_username"
                        type="email"
                        placeholder="Enter username or email"
                        value={formData.email_or_username}
                        onChange={handleChange}
                    />

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <Auth.SubmitButton
                        loading={loading}
                        disabled={!formData.email_or_username}
                        loadingText="Sending..."
                    >
                        Send Reset Link
                    </Auth.SubmitButton>
                </form>
            </Auth.AuthCard>

            <Auth.BrandLogos />
        </main>
    );
}


