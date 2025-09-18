/**
 * Security-focused error handling utilities
 * Prevents information disclosure and provides consistent error responses
 */

export interface SecurityErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Sanitize error messages for production
 */
export const sanitizeError = (
  error: unknown,
  isProduction: boolean = false
): string => {
  if (isProduction) {
    // In production, return generic error messages
    return "An error occurred. Please try again.";
  }

  // In development, return more detailed error messages
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error occurred";
};

/**
 * Create secure error response
 */
export const createSecurityErrorResponse = (
  statusCode: number,
  message: string,
  isProduction: boolean = false,
  requestId?: string
): SecurityErrorResponse => {
  return {
    success: false,
    statusCode,
    message: sanitizeError(message, isProduction),
    timestamp: new Date().toISOString(),
    requestId,
  };
};

/**
 * Common security error messages
 */
export const SecurityErrorMessages = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Invalid input provided",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later",
  INVALID_TOKEN: "Invalid or expired token",
  MISSING_HEADER: "Required header missing",
  INVALID_FILE: "Invalid file type or size",
  SERVER_ERROR: "Internal server error",
  NETWORK_ERROR: "Network error. Please try again",
  TIMEOUT: "Request timeout. Please try again",
} as const;

/**
 * Log security events (for monitoring)
 */
export const logSecurityEvent = (
  event: string,
  details: Record<string, unknown>,
  severity: "low" | "medium" | "high" | "critical" = "medium"
): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details: {
      ...details,
      // Remove sensitive information
      password: details.password ? "[REDACTED]" : undefined,
      token: details.token ? "[REDACTED]" : undefined,
      signature: details.signature ? "[REDACTED]" : undefined,
    },
  };

  // In production, this would be sent to a security monitoring service
  console.log(`[SECURITY-${severity.toUpperCase()}]`, logEntry);
};

/**
 * Generate request ID for tracking
 */
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate request headers for security
 */
export const validateSecurityHeaders = (
  headers: Headers
): { isValid: boolean; missingHeaders: string[] } => {
  const requiredHeaders = ["user-agent", "content-type"];
  const missingHeaders: string[] = [];

  requiredHeaders.forEach((header) => {
    if (!headers.get(header)) {
      missingHeaders.push(header);
    }
  });

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
  };
};

/**
 * Check for suspicious request patterns
 */
export const detectSuspiciousActivity = (
  request: Request
): { isSuspicious: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  // Check for missing user agent
  if (!request.headers.get("user-agent")) {
    reasons.push("Missing user agent");
  }

  // Check for suspicious user agent patterns
  const userAgent = request.headers.get("user-agent") || "";
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i,
  ];

  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    reasons.push("Suspicious user agent");
  }

  // Check for unusual request size
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    // 10MB
    reasons.push("Unusually large request");
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
};
