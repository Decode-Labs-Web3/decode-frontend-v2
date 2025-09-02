'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BackgroundAccents from '@/components/BackgroundAccents';
import Logo from '@/components/Logo';
import AuthCard from '@/components/AuthCard';
import PasswordField from '@/components/PasswordField';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function ChangePassword() {
    const router = useRouter();

    const [formData, setFormData] = useState({ password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!isPasswordValid) {
            setError('Please meet all password requirements.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_password: formData.password })
            });
            const data = await res.json();
            if (!res.ok || !data?.success) {
                throw new Error(data?.message || 'Password change failed');
            }
            router.push('/login');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Password change failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const hasMinLength = formData.password.length >= 8;
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
    const passwordsMatch = formData.password !== '' && formData.password === formData.confirm;
    const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch;
    const showMatchStatus = formData.confirm !== '';
    const matchIsGood = showMatchStatus && passwordsMatch;

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
                    <PasswordField id="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="New password" />
                    <ul className="text-xs space-y-1 mb-4">
                        <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-400' : 'text-red-400'}`}>
                            <FontAwesomeIcon icon={hasMinLength ? faCheck : faXmark} />
                            <span>At least 8 characters</span>
                        </li>
                        <li className={`flex items-center gap-2 ${hasUppercase ? 'text-green-400' : 'text-red-400'}`}>
                            <FontAwesomeIcon icon={hasUppercase ? faCheck : faXmark} />
                            <span>Contains an uppercase letter</span>
                        </li>
                        <li className={`flex items-center gap-2 ${hasNumber ? 'text-green-400' : 'text-red-400'}`}>
                            <FontAwesomeIcon icon={hasNumber ? faCheck : faXmark} />
                            <span>Contains a number</span>
                        </li>
                        <li className={`flex items-center gap-2 ${hasSpecial ? 'text-green-400' : 'text-red-400'}`}>
                            <FontAwesomeIcon icon={hasSpecial ? faCheck : faXmark} />
                            <span>Contains a special character</span>
                        </li>
                    </ul>

                    <PasswordField id="confirm" value={formData.confirm} onChange={(e) => setFormData({ ...formData, confirm: e.target.value })} placeholder="Confirm new password" />
                    <p className={`text-xs mb-4 flex items-center gap-2 ${showMatchStatus ? (matchIsGood ? 'text-green-400' : 'text-red-400') : 'text-gray-400'}`}>
                        <FontAwesomeIcon icon={matchIsGood ? faCheck : faXmark} />
                        <span>{!showMatchStatus ? 'Re-enter your password to confirm' : (matchIsGood ? 'Passwords match' : 'Passwords do not match')}</span>
                    </p>

                    {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                    <button className={`w-full text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-colors ${isPasswordValid && !loading ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-500/50 cursor-not-allowed'}`} disabled={!isPasswordValid || loading} type="submit">
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            'Save and log in'
                        )}
                    </button>
                </form>
            </AuthCard>
        </main>
    );
}


