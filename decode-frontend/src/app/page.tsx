'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/Logo';
import AuthCard from '@/components/AuthCard';
import TextField from '@/components/TextField';
import BrandLogos from '@/components/BrandLogos';
import BackgroundAccents from '@/components/BackgroundAccents';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';

export default function Home() {
    const [formData, setFormData] = useState({
        email_or_username: "",
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            <BackgroundAccents />
            {/* Logo */}
            <div className="mb-8">
                <Logo />
            </div>

            {/* Main Card */}
            <AuthCard title="Get Started">

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
                    <TextField
                        id="email_or_username"
                        type="text"
                        placeholder="Enter username or email"
                        value={formData.email_or_username}
                        onChange={handleChange}
                    />

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500/90 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Exploring...
                            </>
                        ) : (
                            'Explore Decode'
                        )}
                    </button>
                </form>

            </AuthCard>

            <BrandLogos />
        </main>
    );
}