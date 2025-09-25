import { PasswordValidationResult } from "@/interfaces/index.interfaces";

export class PasswordValidationService {
  static validate(
    password: string,
    confirmPassword: string = ""
  ): PasswordValidationResult {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const passwordsMatch = password !== "" && password === confirmPassword;
    const isPasswordValid =
      hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch;
    const showMatchStatus = confirmPassword !== "";
    const matchIsGood = showMatchStatus && passwordsMatch;

    return {
      hasMinLength,
      hasUppercase,
      hasNumber,
      hasSpecial,
      passwordsMatch,
      isPasswordValid,
      showMatchStatus,
      matchIsGood,
    };
  }
}
