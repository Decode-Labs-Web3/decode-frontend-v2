'use client';
import Link from 'next/link';
import Auth from '@/components/(auth)';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ email_or_username: string, password: string }>({
        email_or_username: "",
        password: ""
    });

    useEffect(() => {
        try {
            const match = document.cookie.match(/(?:^|; )email_or_username=([^;]+)/);
            const value = match ? decodeURIComponent(match[1]) : "";
            if (value) {
                setFormData(prev => ({ ...prev, email_or_username: value }));
            }
        } catch { }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }))
        // Clear error when user starts typing
        if (error) setError('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const responseData = await res.json();
            console.log('Login response data:', responseData);

            // Check if the response indicates success
            if (!responseData.success) {
                throw new Error(responseData?.message || "Login failed");
            }

            // Check if verification is required
            if (responseData.requiresVerification) {
                console.log('Device verification required, redirecting to verify-login');
                // Store email for verification and redirect to verify login
                sessionStorage.setItem('login_email', formData.email_or_username);
                localStorage.setItem('login_email', formData.email_or_username);
                router.push("/verify-login");
                return;
            }

            // Normal login success - redirect to dashboard
            router.push("/dashboard");
            router.refresh();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Login failed";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <Auth.BackgroundAccents />
            <Auth.Logo />

            {/* Main Card */}
            <Auth.AuthCard title="Log in">
                <form onSubmit={handleSubmit} noValidate>
                    <Auth.TextField
                        id="email_or_username"
                        type="text"
                        placeholder="Enter username or email"
                        value={formData.email_or_username}
                        onChange={handleChange}
                    />

                    <Auth.PasswordField
                        id='password'
                        value={formData.password}
                        onChange={handleChange}
                        placeholder='Enter your password'
                    />

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-5 text-right">
                        <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</Link>
                    </div>

                    <Auth.SubmitButton
                        loading={loading}
                        loadingText="Logging in..."
                    >
                        Log in
                    </Auth.SubmitButton>
                </form>

                {/* Register Link */}
                <p className="text-center text-gray-400">
                    Don&apos;t have an account yet?{' '}
                    <Link href="/register" className="text-blue-500 hover:underline font-medium">
                        Register
                    </Link>
                </p>

            </Auth.AuthCard>

            <Auth.BrandLogos />
        </main>
    );
}