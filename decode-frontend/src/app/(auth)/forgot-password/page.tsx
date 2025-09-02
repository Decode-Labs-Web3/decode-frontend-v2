'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BrandLogos from '@/components/BrandLogos';
import BackgroundAccents from '@/components/BackgroundAccents';
import Logo from '@/components/Logo';
import AuthCard from '@/components/AuthCard';
import BackButton from '@/components/BackButton';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function ForgotPassword() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username_or_email: "",
    });    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( formData )
            });

            const responseData = await response.json();
            console.log('Response data:', responseData);
            
            if (responseData.success) {
                setSuccess('Reset link sent! Check your email.');
                setTimeout(() => {
                    router.push('/verify-forgot');
                }, 2000);
            } else {
                setError(responseData.message || 'Failed to send reset link. Please try again.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!formData.username_or_email) {
            setError('Please enter your username or email first.');
            return;
        }
        await handleSubmit(new Event('submit') as any);
    };

    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <BackgroundAccents />
            
            {/* Logo */}
            <div className="mb-8">
                <Logo />
            </div>

            {/* Main Card */}
            <AuthCard title="Reset Password">
                {/* Back to Login Button */}
                <BackButton href="/login" text="Back to Login" />
                
                {/* Simple Description */}
                <p className="text-sm text-gray-400 text-center mb-8">
                    Enter your email to receive a reset link
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Email Input */}
                    <div className="mb-6">
                        <input
                            required
                            id="email"
                            type="email"
                            placeholder="Email address"
                            value={formData.username_or_email}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, username_or_email: e.target.value }));
                                if (error) setError('');
                                if (success) setSuccess('');
                            }}
                            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                            disabled={loading}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm text-center">
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={loading || !formData.username_or_email}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>
            </AuthCard>
            
            <BrandLogos />
        </main>
    );
}


