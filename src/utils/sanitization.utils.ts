/**
 * Input sanitization utilities for security
 * Prevents XSS, injection attacks, and validates user input
 */

export interface SanitizationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
}

export interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowSpecialChars?: boolean;
  allowNumbers?: boolean;
  allowLetters?: boolean;
  required?: boolean;
}

/**
 * Sanitize and validate text input
 */
export const sanitizeText = (
  input: string,
  options: ValidationOptions = {}
): SanitizationResult => {
  const {
    maxLength = 1000,
    minLength = 1,
    allowSpecialChars = false,
    allowNumbers = true,
    allowLetters = true,
    required = true,
  } = options;

  const errors: string[] = [];
  let sanitizedValue = input;

  // Check if required and empty
  if (required && (!input || input.trim().length === 0)) {
    errors.push("This field is required");
    return { isValid: false, sanitizedValue: "", errors };
  }

  // Trim whitespace
  sanitizedValue = input.trim();

  // Check length
  if (sanitizedValue.length < minLength) {
    errors.push(`Minimum length is ${minLength} characters`);
  }
  if (sanitizedValue.length > maxLength) {
    errors.push(`Maximum length is ${maxLength} characters`);
    sanitizedValue = sanitizedValue.slice(0, maxLength);
  }

  // Remove potentially dangerous characters
  sanitizedValue = sanitizedValue
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .replace(/[&]/g, "&amp;") // Escape ampersands
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, ""); // Remove vbscript: protocol

  // Validate character set
  if (allowLetters && allowNumbers && !allowSpecialChars) {
    const validPattern = /^[a-zA-Z0-9\s]*$/;
    if (!validPattern.test(sanitizedValue)) {
      errors.push("Only letters, numbers, and spaces are allowed");
    }
  } else if (allowLetters && !allowNumbers && !allowSpecialChars) {
    const validPattern = /^[a-zA-Z\s]*$/;
    if (!validPattern.test(sanitizedValue)) {
      errors.push("Only letters and spaces are allowed");
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors,
  };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): SanitizationResult => {
  const errors: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push("Email is required");
    return { isValid: false, sanitizedValue: "", errors };
  }

  const sanitizedEmail = email.trim().toLowerCase();

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitizedEmail)) {
    errors.push("Invalid email format");
  }

  if (sanitizedEmail.length > 254) {
    errors.push("Email is too long");
  }

  // Check for dangerous patterns
  if (sanitizedEmail.includes("<") || sanitizedEmail.includes(">")) {
    errors.push("Email contains invalid characters");
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: sanitizedEmail,
    errors,
  };
};

/**
 * Validate username
 */
export const validateUsername = (username: string): SanitizationResult => {
  const errors: string[] = [];

  if (!username || username.trim().length === 0) {
    errors.push("Username is required");
    return { isValid: false, sanitizedValue: "", errors };
  }

  const sanitizedUsername = username.trim();

  // Username validation: 3-20 characters, alphanumeric and underscore/hyphen only
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

  if (!usernameRegex.test(sanitizedUsername)) {
    errors.push(
      "Username must be 3-20 characters long and contain only letters, numbers, underscores, and hyphens"
    );
  }

  // Check for reserved usernames
  const reservedUsernames = [
    "admin",
    "root",
    "user",
    "test",
    "api",
    "www",
    "mail",
    "ftp",
  ];
  if (reservedUsernames.includes(sanitizedUsername.toLowerCase())) {
    errors.push("This username is reserved");
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: sanitizedUsername,
    errors,
  };
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string,
  confirmPassword?: string
): SanitizationResult => {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push("Password is required");
    return { isValid: false, sanitizedValue: "", errors };
  }

  // Password requirements
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  if (password.length > 128) {
    errors.push("Password is too long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /login/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    errors.push("Password contains common patterns and is not secure");
  }

  // Check for repeated characters
  if (/(.)\1{3,}/.test(password)) {
    errors.push("Password contains too many repeated characters");
  }

  // Confirm password match
  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: password,
    errors,
  };
};

/**
 * Sanitize HTML content (basic)
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .replace(/data:/gi, ""); // Remove data: protocol
};

/**
 * Validate verification code
 */
export const validateVerificationCode = (code: string): SanitizationResult => {
  const errors: string[] = [];

  if (!code || code.length === 0) {
    errors.push("Verification code is required");
    return { isValid: false, sanitizedValue: "", errors };
  }

  // Remove any non-alphanumeric characters and convert to lowercase
  const sanitizedCode = code.replace(/[^a-f0-9]/gi, "").toLowerCase();

  if (sanitizedCode.length !== 6) {
    errors.push("Verification code must be exactly 6 characters");
  }

  // Check if it's valid hex
  const hexRegex = /^[a-f0-9]{6}$/;
  if (!hexRegex.test(sanitizedCode)) {
    errors.push(
      "Verification code must contain only letters a-f and numbers 0-9"
    );
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: sanitizedCode,
    errors,
  };
};

/**
 * Sanitize file name
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace invalid characters with underscore
    .replace(/\.{2,}/g, ".") // Replace multiple dots with single dot
    .replace(/^\.+/, "") // Remove leading dots
    .replace(/\.+$/, "") // Remove trailing dots
    .slice(0, 255); // Limit length
};

/**
 * Validate file type for uploads
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex !== -1
    ? fileName.slice(lastDotIndex + 1).toLowerCase()
    : "";
};

/**
 * Check if file extension is allowed
 */
export const isAllowedFileExtension = (
  fileName: string,
  allowedExtensions: string[]
): boolean => {
  const extension = getFileExtension(fileName);
  return allowedExtensions.includes(extension);
};
