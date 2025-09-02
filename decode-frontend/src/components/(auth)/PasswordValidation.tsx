'use client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { PasswordValidationService } from "@/app/services/password-validation.service";

interface PasswordValidationProps {
    password: string;
    confirmPassword?: string;
    showConfirm?: boolean;
}

export default function PasswordValidation({ 
    password, 
    confirmPassword = '', 
    showConfirm = true 
}: PasswordValidationProps) {
    const validation = PasswordValidationService.validate(password, confirmPassword);
    const { hasMinLength, hasUppercase, hasNumber, hasSpecial, passwordsMatch, showMatchStatus, matchIsGood } = validation;

    return (
        <>
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

            {showConfirm && (
                <p className={`text-xs mb-4 flex items-center gap-2 ${showMatchStatus ? (matchIsGood ? 'text-green-400' : 'text-red-400') : 'text-gray-400'}`}>
                    <FontAwesomeIcon icon={matchIsGood ? faCheck : faXmark} />
                    <span>{!showMatchStatus ? 'Re-enter your password to confirm' : (matchIsGood ? 'Passwords match' : 'Passwords do not match')}</span>
                </p>
            )}
        </>
    );
}

// Re-export for backward compatibility
export const getPasswordValidation = PasswordValidationService.validate;
