'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import AuthCard from '@/components/AuthCard';
import TextField from '@/components/TextField';
import BrandLogos from '@/components/BrandLogos';
import PasswordField from '@/components/PasswordField';
import BackgroundAccents from '@/components/BackgroundAccents';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
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
        } catch {}
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }))
    }

    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

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
            <BackgroundAccents />
            {/* Logo */}
            <div className="mb-8">
                <Logo />
            </div>

            {/* Main Card */}
            <AuthCard title="Log in">
                <form onSubmit={handleSubmit} noValidate>
                    <TextField
                        id="email_or_username"
                        type="text"
                        placeholder="Enter username or email"
                        value={formData.email_or_username}
                        onChange={handleChange}
                    />

                    <PasswordField id='password' value={formData.password} onChange={handleChange} placeholder='Enter your password' />

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-5 text-right">
                        <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</Link>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500/90 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Logging in...
                            </>
                        ) : (
                            'Log in'
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <p className="text-center text-gray-400">
                    Don&apos;t have an account yet?{' '}
                    <Link href="/register" className="text-blue-500 hover:underline font-medium">
                        Register
                    </Link>
                </p>

            </AuthCard>

            <BrandLogos />
        </main>
    );
}