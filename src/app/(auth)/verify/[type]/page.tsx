'use client';

import Auth from '@/components/(auth)';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useVerification } from '@/hooks/useVerification';
import { showSuccess, showError } from '@/utils/toast.utils';

type VerificationType = 'register' | 'login' | 'forgot';

const VERIFICATION_CONFIG = {
  register: {
    title: 'Verify Code',
    description: 'Enter the 6-digit code we sent to your email.',
    showResend: true,
    resendEndpoint: '/api/auth/resend-verification-register'
  },
  login: {
    title: 'Verify Device',
    description: 'Enter the 6-digit code we sent to your email to verify this device.',
    showResend: false,
    resendEndpoint: null
  },
  forgot: {
    title: 'Verify Code',
    description: 'Enter the 6-digit code we sent to your email.',
    showResend: true,
    resendEndpoint: '/api/auth/resend-verification-register'
  }
};

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as VerificationType;
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  // Validate verification type
  useEffect(() => {
    if (!type || !['register', 'login', 'forgot'].includes(type)) {
      router.push('/');
    }
  }, [type, router]);

  const config = VERIFICATION_CONFIG[type];

  const { loading, digits, setDigits, handleVerify, handleResend } = useVerification({
    type,
    onSuccess: (data) => {
      switch (type) {
        case 'register':
          showSuccess('Account verified successfully! You can now log in.');
          router.push('/login');
          break;
        case 'login':
          if (data.requiresRelogin) {
            showSuccess('Device verified! Please log in again.');
            router.push('/login');
          } else {
            showSuccess('Device verified successfully!');
            router.push('/login');
            router.refresh();
          }
          break;
        case 'forgot':
          showSuccess('Code verified! You can now reset your password.');
          router.push('/change-password');
          break;
        default:
          router.push('/');
      }
    },
    onError: (errorMessage) => {
      showError(errorMessage);
    }
  });

  const handleResendCode = async () => {
    if (!config.resendEndpoint) return;

    setResendLoading(true);
    try {
      await handleResend(config.resendEndpoint);
      showSuccess('Verification code sent! Please check your email.');
    } catch {
      showError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!type || !['register', 'login', 'forgot'].includes(type)) {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <Auth.BackgroundAccents />
      <Auth.Logo />

      <Auth.AuthCard title={config.title}>
        <p className="text-sm text-gray-400 text-center mb-6">
          {config.description}
        </p>

        {/* Back to Home button for login verification */}
        {type === 'login' && (
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        )}

        <form noValidate onSubmit={handleVerify}>
          <Auth.VerificationCodeInput
            digits={digits}
            setDigits={setDigits}
            onError={(errorMessage) => showError(errorMessage)}
            loading={loading}
            error=""
          />

          <Auth.SubmitButton
            loading={loading}
            disabled={digits.join('').length !== 6}
            loadingText="Verifying..."
          >
            Verify
          </Auth.SubmitButton>
        </form>

        {config.showResend && (
          <p className="text-center text-gray-400">
            Didn&apos;t get the code?{' '}
            <button
              type="button"
              className="text-blue-500 hover:text-blue-400 hover:underline font-medium transition-colors disabled:text-blue-600 disabled:cursor-not-allowed"
              onClick={handleResendCode}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend'}
            </button>
          </p>
        )}
      </Auth.AuthCard>

      <Auth.BrandLogos />
    </main>
  );
}
