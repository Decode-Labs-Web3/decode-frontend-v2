'use client';

import { useState } from 'react';
import Auth from '@/components/(auth)';
import { useRouter } from 'next/navigation';
import { PasswordValidationService } from '@/app/services/password-validation.service';

export default function ChangePassword() {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ new_password: string, confirm_new_password: string }>({
        new_password: '',
        confirm_new_password: '',
    });
    const { isPasswordValid } = PasswordValidationService.validate(formData.new_password, formData.confirm_new_password);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.new_password.trim() || !formData.confirm_new_password.trim() || loading) return;
        if (error) setError('');
        setLoading(true);
        if (!isPasswordValid) {
            setError('Please meet all password requirements.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'frontend-internal-request': 'true'
                },
                body: JSON.stringify(formData),
                cache: "no-store",
                signal: AbortSignal.timeout(5000),
            });

            const responseData = await response.json();

            if (responseData.statusCode === 400 || !responseData.success === false) {
                throw new Error(responseData.message);
            }

            router.push('/login');

        } catch (error: any) {
            if (error?.name === "AbortError" || error?.name === "TimeoutError") {
                setError("Request timeout/aborted. Please try again.");
            } else {
                const message = error instanceof Error ? error.message : error?.message || 'Password change failed';
                setError(message);
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
            <Auth.AuthCard title="Change Password">
                <p className="text-sm text-gray-400 text-center mb-6">Enter your new password below.</p>

                <form noValidate onSubmit={handleSubmit}>
                    <Auth.PasswordField
                        id="password"
                        value={formData.new_password}
                        onChange={handleChange}
                        placeholder="New password"
                    />

                    <Auth.PasswordValidation
                        password={formData.new_password}
                        confirmPassword={formData.confirm_new_password}
                    />

                    <Auth.PasswordField
                        id="confirm"
                        value={formData.confirm_new_password}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                    />

                    {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                    <Auth.SubmitButton
                        loading={loading}
                        disabled={!isPasswordValid}
                        loadingText="Saving..."
                    >
                        Save and log in
                    </Auth.SubmitButton>
                </form>
            </Auth.AuthCard>
        </main>
    );
}


