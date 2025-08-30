'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BackgroundAccents from '@/components/BackgroundAccents';
import Logo from '@/components/Logo';
import AuthCard from '@/components/AuthCard';
import PasswordField from '@/components/PasswordField';

export default function ChangePassword() {
    const router = useRouter();

    const [form, setForm] = useState({ password: '', confirm: '' });
    const [error, setError] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.password || form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }
        // Mock success → redirect to login
        if (typeof window !== 'undefined') {
            localStorage.removeItem('mockResetCode');
        }
        router.push('/login');
    };

    return (
        <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            <BackgroundAccents />
            {/* Logo */}
            <div className="mb-8">
                <Logo />
            </div>

            {/* Main Card */}
            <AuthCard title="Change Password">
                <p className="text-sm text-gray-400 text-center mb-6">Enter your new password below.</p>

                <form noValidate onSubmit={submit}>
                    <PasswordField id="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="New password" />

                    <PasswordField id="confirm" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm new password" />

                    {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-colors" type="submit">
                        Save and log in
                    </button>
                </form>
            </AuthCard>
        </main>
    );
}


