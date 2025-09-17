'use client';
import { SubmitButtonProps } from '@/interfaces';

export default function SubmitButton({
    loading,
    disabled = false,
    loadingText = 'Loading...',
    children,
    className = '',
    variant = 'primary'
}: SubmitButtonProps) {
    const baseClasses = "w-full text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-all shadow-lg flex items-center justify-center gap-2";
    
    const variantClasses = {
        primary: "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400",
        secondary: "bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400"
    };

    const isDisabled = loading || disabled;

    return (
        <button
            type="submit"
            disabled={isDisabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {loadingText}
                </>
            ) : (
                children
            )}
        </button>
    );
}
