'use client';
import Link from 'next/link';
import Auth from '@/components/(auth)';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ email_or_username: string, password: string }>({
        email_or_username: "",
        password: ""
    });

    const handleCookie = () => {
        document.cookie = "gate-key-for-register=true; max-age=60; path=/register; samesite=lax";
      };

    const handleCookieForgotPassword = () => {
        document.cookie = "gate-key-for-forgot-password=true; max-age=60; path=/forgot-password; samesite=lax";
    };

    useEffect(() => {
        const match = document.cookie.match(/(?:^|; )email_or_username=([^;]+)/);
        const value = match ? decodeURIComponent(match[1]) : "";
        if (value) {
            setFormData(prev => ({ ...prev, email_or_username: value }));
            document.cookie = "email_or_username=; Max-Age=0; path=/";
        }
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        if (!formData.email_or_username.trim() || !formData.password.trim() || loading) {
            toast.error("Please fill in all fields"); 
            return;
        }
        
        setLoading(true);

        try {
            const apiResponse = await fetch("/api/auth/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "frontend-internal-request": "true",
                },
                body: JSON.stringify(formData),
                cache: "no-store",
                signal: AbortSignal.timeout(5000),
            });

            const responseData = await apiResponse.json();
            if (responseData.success && responseData.statusCode === 200 && responseData.message === "Login successful") {
                toast.success("Login successful!");
                router.push("/dashboard");
            } else if (responseData.success && responseData.statusCode === 400 && responseData.message === "Device fingerprint not trusted, send email verification") {
                router.push("/verify/login");
            } else {
                toast.error(responseData?.message || "Login failed");
                setLoading(false);
                return;
            }
        } catch (error: unknown) {
            if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
                toast.error("Request timeout/aborted. Please try again.");
            } else {
                const errorMessage = error instanceof Error ? error.message : error instanceof Error ? error.message : "Something went wrong. Please try again.";
                toast.error(errorMessage);
            }
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


                    <div className="mb-5 text-right">
                        <a 
                        href="/forgot-password"
                        onClick={handleCookieForgotPassword}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        Forgot password?
                        </a>
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
                    <Link 
                        href="/register"
                        onClick={handleCookie}
                        className="text-blue-500 hover:underline font-medium">
                        Register
                    </Link>
                </p>

            </Auth.AuthCard>

            <Auth.BrandLogos />
        </main >
    );
}