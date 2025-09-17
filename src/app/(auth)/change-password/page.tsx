'use client';

import { useState } from 'react';
import Auth from '@/components/(auth)';
import { useRouter } from 'next/navigation';
import { PasswordValidationService } from '@/services/password-validation.service';
import { useLoading } from '@/hooks/useLoading';
import { showSuccess, showError } from '@/utils/toast.utils';
import { apiCallWithTimeout } from '@/utils/api.utils';

export default function ChangePassword() {
    const router = useRouter();
    const { loading, withLoading } = useLoading();
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
    };

    const handleChangePassword = async () => {
        if (!formData.new_password.trim() || !formData.confirm_new_password.trim()) {
            showError('Please fill in all fields');
            return;
        }

        if (!isPasswordValid) {
            showError('Please meet all password requirements.');
            return;
        }

        const responseData = await apiCallWithTimeout('/api/auth/change-password', {
            method: 'POST',
            body: formData
        });

        if (responseData.success) {
            showSuccess('Password changed successfully!');
            router.push('/login');
        } else {
            showError(responseData.message || 'Password change failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        await withLoading(handleChangePassword);
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
                        id="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        placeholder="New password"
                    />

                    <Auth.PasswordValidation
                        password={formData.new_password}
                        confirmPassword={formData.confirm_new_password}
                    />

                    <Auth.PasswordField
                        id="confirm_new_password"
                        value={formData.confirm_new_password}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                    />


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


