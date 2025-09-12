'use client';
import Link from 'next/link';
import Auth from '@/components/(auth)';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PasswordValidationService } from '@/app/services/password-validation.service';

export default function Register() {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ username: string, email: string, password: string, confirmPassword: string }>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const { isPasswordValid } = PasswordValidationService.validate(formData.password, formData.confirmPassword);

    useEffect(() => {
        const match = document.cookie.match(/(?:^|; )email_or_username=([^;]+)/);
        const value = match ? decodeURIComponent(match[1]) : "";
        if (value) {
            if (value.includes('@')) {
                setFormData(prev => ({ ...prev, email: value }));
            } else {
                setFormData(prev => ({ ...prev, username: value }));
            }
            document.cookie = "email_or_username=; Max-Age=0; path=/";
        }
    }, []);

    const handleCookie = () => {
        document.cookie = "gate-key-for-login=true; max-age=60; path=/login; samesite=lax";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email.trim() || !formData.username.trim() || !formData.password.trim() || !formData.confirmPassword.trim() || loading) return;
        if (error) setError('');
        setLoading(true);

        try {
            const apiResponse = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'frontend-internal-request': 'true',
                },
                body: JSON.stringify(formData),
                cache: "no-store",
                signal: AbortSignal.timeout(5000),
            });

            const data = await apiResponse.json();

            if (!apiResponse.ok) {
                // Handle specific error cases
                if (data.message === "Email already exists") {
                    setError('This email is already registered. Please use a different email or try logging in.');
                } else {
                    setError(data.message || 'Registration failed. Please try again.');
                }
                return;
            }

            // Check if email verification is required
            if (data.requiresVerification) {
                // Store registration data for verification
                sessionStorage.setItem('registration_data', JSON.stringify({
                    email: formData.email,
                    username: formData.username
                }));
                sessionStorage.setItem('verification_required', 'true');

                // Redirect to verify email page
                router.push('/verify-register');
                return;
            }

            // If no verification needed, redirect to login
            router.push('/login?registered=true');

        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : error.message || 'Registration failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <Auth.BackgroundAccents />
            <Auth.Logo />

            <Auth.AuthCard title="Get Started">
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <Auth.TextField
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleChange}
                    />

                    <Auth.TextField
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <Auth.PasswordField
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                    />

                    <Auth.PasswordValidation
                        password={formData.password}
                        confirmPassword={formData.confirmPassword}
                    />

                    <Auth.PasswordField
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                    />

                    <Auth.SubmitButton
                        loading={loading}
                        disabled={!isPasswordValid}
                        loadingText="Creating account..."
                    >
                        Register
                    </Auth.SubmitButton>
                </form>

                {/* Login Link */}
                <p className="text-center text-gray-400">
                    Already have an account?{' '}
                    <a href="/login"
                        onClick={handleCookie}
                        className="text-blue-500 hover:underline font-medium">
                        Log in
                    </a>
                </p>
            </Auth.AuthCard>
            <Auth.BrandLogos />
        </main>
    );
}