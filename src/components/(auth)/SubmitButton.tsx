"use client";
import { SubmitButtonProps } from "@/interfaces/index.interfaces";

export default function SubmitButton({
  disabled = false,
  children,
  className = "",
  variant = "primary",
}: SubmitButtonProps) {
  const baseClasses =
    "w-full text-white font-semibold py-3 px-4 rounded-lg mb-6 transition-all shadow-lg flex items-center justify-center gap-2";

  const variantClasses = {
    primary: "bg-blue-700 hover:bg-blue-700 disabled:bg-blue-700",
    secondary: "bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400",
  };

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
