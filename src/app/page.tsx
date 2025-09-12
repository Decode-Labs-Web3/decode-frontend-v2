'use client';
import { useState } from 'react';
import Auth from '@/components/(auth)';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ email_or_username: string }>({
        email_or_username: "",
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email_or_username.trim() || loading) return;
        setError("");
        setLoading(true);
        try {
            const apiResponse = await fetch("/api/auth/login-or-register", {
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

            if (!apiResponse.ok) {
                throw Object.assign(new Error(`HTTP ${apiResponse.status}`), { status: apiResponse.status });
            }

            const responseData = await apiResponse.json();
            console.log('Login or register response data:', responseData);

            if (responseData.success && responseData.statusCode === 200 && responseData.message === "User found") {
                router.push("/login");
            } else if (!responseData.success && responseData.statusCode === 400 && responseData.message === "User not found") {
                router.push("/register");
            } else {
                throw new Error(responseData.message);
            }
        } catch (error: any) {
            if (error?.name === "AbortError" || error?.name === "TimeoutError") {
                console.error("Request timeout/aborted");
                setError("Request timeout/aborted. Please try again.");
            } else {
                console.error(error);
                setError(error.message || "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <Auth.BackgroundAccents />
            <Auth.Logo />

            {/* Main Card */}
            <Auth.AuthCard title="Get Started">

                {/* Connect Wallet Button */}
                <button className="group w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2 transition-all shadow-lg">
                    <FontAwesomeIcon icon={faWallet} className="opacity-90" />
                    <span>Connect Wallet</span>
                    <FontAwesomeIcon icon={faArrowRight} className="opacity-0 -translate-x-2 group-hover:opacity-90 group-hover:translate-x-0 transition-all" />
                </button>

                {/* Divider */}
                <div className="flex items-center mb-6">
                    <div className="flex-1 border-t border-gray-600"></div>
                    <span className="px-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-1 border-t border-gray-600"></div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <Auth.TextField
                        id="email_or_username"
                        type="text"
                        placeholder="Enter username or email"
                        value={formData.email_or_username}
                        onChange={handleChange}
                    />

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <Auth.SubmitButton
                        loading={loading}
                        loadingText="Exploring..."
                    >
                        Explore Decode
                    </Auth.SubmitButton>
                </form>

            </Auth.AuthCard>

            <Auth.BrandLogos />
        </main>
    );
}