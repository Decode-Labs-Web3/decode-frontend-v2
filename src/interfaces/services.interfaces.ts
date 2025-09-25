export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  passwordsMatch: boolean;
  isPasswordValid: boolean;
  showMatchStatus: boolean;
  matchIsGood: boolean;
}

export interface FingerprintResult {
  fingerprint_hashed: string;
  browser: string;
  device: string;
}

export interface UserAgentData {
  brands: Array<{ brand: string; version: string }>;
}

export interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: UserAgentData;
}
