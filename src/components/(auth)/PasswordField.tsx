'use client';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { usePasswordToggle } from "@/hooks/usePasswordToggle";

export default function PasswordField({
    id,
    value,
    onChange,
    placeholder = "Enter password",
}: {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}) {
    const { inputType, visible, toggleVisibility } = usePasswordToggle();

    return (
        <div className="mb-5 relative">
            <input
                required
                id={id}
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-gray-800/70 border border-white/10 rounded-lg pl-4 pr-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                aria-label={visible ? "Hide password" : "Show password"}
            >
                <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
            </button>
        </div>
    );
}


