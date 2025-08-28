'use client';
import Link from 'next/link';
import { useState } from 'react';
import BackgroundAccents from '../components/BackgroundAccents';
import Logo from '../components/Logo';
import AuthCard from '../components/AuthCard';
import PasswordField from '../components/PasswordField';
import TextField from '../components/TextField';
import BrandLogos from '../components/BrandLogos';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function Register() {

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
    };

    const hasMinLength = formData.password.length >= 8;
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
    const passwordsMatch = formData.password !== '' && formData.password === formData.confirmPassword;
    const isPasswordValid = hasMinLength && hasUppercase && hasSpecial && passwordsMatch;

    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <BackgroundAccents />
            {/* Logo */}
            <div className="mb-8">
                <Logo />
            </div>

            <AuthCard title="Get Started">
            <form noValidate>
                    <TextField
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleChange}
                    />

                    <TextField
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <PasswordField id="password" value={formData.password} onChange={handleChange} />
                    <ul className="text-xs space-y-1 mb-4">
                        <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-400' : 'text-red-400'}`}>
                            <FontAwesomeIcon icon={hasMinLength ? faCheck : faXmark} />
                            <span>At least 8 characters</span>
                        </li>
                        <li className={`flex items-center gap-2 ${hasUppercase ? 'text-green-400' : 'text-red-400'}`}>
                            <FontAwesomeIcon icon={hasUppercase ? faCheck : faXmark} />
                            <span>Contains an uppercase letter</span>
                        </li>
                        <li className={`flex items-center gap-2 ${hasSpecial ? 'text-green-400' : 'text-red-400'}`}>
                            <FontAwesomeIcon icon={hasSpecial ? faCheck : faXmark} />
                            <span>Contains a special character</span>
                        </li>
                    </ul>

                    <PasswordField id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
                    <p className={`text-xs mb-4 flex items-center gap-2 ${passwordsMatch || formData.confirmPassword === '' ? 'text-green-400' : 'text-red-400'}`}>
                        <FontAwesomeIcon icon={(passwordsMatch && formData.confirmPassword !== '') ? faCheck : (formData.confirmPassword === '' ? faXmark : faXmark)} />
                        <span>{passwordsMatch || formData.confirmPassword === '' ? (formData.confirmPassword === '' ? 'Re-enter your password to confirm' : 'Passwords match') : 'Passwords do not match'}</span>
                    </p>

                    <button disabled={!isPasswordValid} className={`w-full text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-colors ${isPasswordValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-500/50 cursor-not-allowed'}`}>
                        Register
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-500 hover:underline font-medium">
                        Log in
                    </Link>
                </p>
            </AuthCard>
            <BrandLogos />
        </main>
    );
}