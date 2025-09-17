'use client';

import { useRef, useState } from 'react';

interface VerificationCodeInputProps {
  digits: string[];
  setDigits: (digits: string[]) => void;
  onError: (error: string) => void;
  loading: boolean;
  error: string;
}

export default function VerificationCodeInput({
  digits,
  setDigits,
  onError,
  loading,
  error
}: VerificationCodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[a-z0-9]?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    // Clear error when user starts typing
    if (error) onError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');

    // Check if it's in the format "fingerprint-email-verification:XXXXXX"
    const match = pastedText.match(/fingerprint-email-verification:([a-f0-9]{6})/i);
    let text = '';

    if (match) {
      // Extract the 6-character code from the format
      text = match[1];
    } else {
      // Fallback to original behavior - extract only digits/letters
      text = pastedText.replace(/[^a-f0-9]/gi, '').slice(0, 6);
    }

    if (!text) return;

    const next = Array(6).fill('');
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);

    // Clear error when pasting
    if (error) onError('');

    inputsRef.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="mb-6 flex items-center justify-center gap-1.5 max-w-full overflow-hidden px-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-9 h-9 text-center bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all duration-200 hover:border-gray-500 flex-shrink-0"
          placeholder=""
          disabled={loading}
        />
      ))}
    </div>
  );
}
