'use client';
import { useState } from 'react';
import Auth from '@/components/(auth)';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
    const router = useRouter();
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
        setLoading(true);
        try {
            const response = await fetch("/api/auth/login-or-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();
            console.log(responseData);

            if (responseData.success) {
                router.push("/login");
            } else {
                router.push("/register");
            }
        } catch (error) {
            console.error(error);
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