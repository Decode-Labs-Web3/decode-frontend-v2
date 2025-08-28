'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from '../components/Logo';
import AuthCard from '../components/AuthCard';
import TextField from '../components/TextField';
import BrandLogos from '../components/BrandLogos';
import PasswordField from '../components/PasswordField';
import BackgroundAccents from '../components/BackgroundAccents';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function Login() {

    const [formData, setFormData] = useState({
        username_or_email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }))
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

                <form noValidate>
                    <TextField
                        id="username_or_email"
                        type="text"
                        placeholder="Enter username or email"
                        value={formData.username_or_email}
                        onChange={handleChange}
                    />

                    <PasswordField id='password' value={formData.password} onChange={handleChange} placeholder='Enter your password' />

                    <div className="mb-5 text-right">
                        <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</Link>
                    </div>

                    <button className="w-full bg-blue-500/90 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-all shadow-lg">
                        Log in
                    </button>
                </form>

                {/* Register Link */}
                <p className="text-center text-gray-400">
                    Don't have an account yet?{' '}
                    <Link href="/register" className="text-blue-500 hover:underline font-medium">
                        Register
                    </Link>
                </p>

            </AuthCard>

            <BrandLogos />
        </main>
    );
}