import crypto from 'crypto';

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  mobile: string;
  acceptLanguage: string;
  acceptEncoding: string;
  secChUa: string;
  secChUaPlatform: string;
  secChUaMobile: string;
  secChUaArch: string;
  secChUaModel: string;
  secChUaPlatformVersion: string;
  secChUaFullVersion: string;
  secChUaBitness: string;
  secChUaFormFactor: string;
}

export interface FingerprintResult {
  fingerprint_hashed: string;
  deviceInfo: DeviceInfo;
  hashLength: number;
  meetsRequirements: boolean;
}

export class FingerprintService {
  /**
   * Generate a device fingerprint hash from request headers
   * @param req - The incoming request object
   * @returns FingerprintResult with hash and metadata
   */
  static generateFingerprint(req: Request): FingerprintResult {
    // Extract device information from request headers
    const deviceInfo: DeviceInfo = {
      userAgent: req.headers.get('user-agent') || '',
      platform: req.headers.get('sec-ch-ua-platform') || 'unknown',
      mobile: req.headers.get('sec-ch-ua-mobile') || '?0',
      acceptLanguage: req.headers.get('accept-language') || '',
      acceptEncoding: req.headers.get('accept-encoding') || '',
      secChUa: req.headers.get('sec-ch-ua') || '',
      secChUaPlatform: req.headers.get('sec-ch-ua-platform') || '',
      secChUaMobile: req.headers.get('sec-ch-ua-mobile') || '',
      secChUaArch: req.headers.get('sec-ch-ua-arch') || '',
      secChUaModel: req.headers.get('sec-ch-ua-model') || '',
      secChUaPlatformVersion: req.headers.get('sec-ch-ua-platform-version') || '',
      secChUaFullVersion: req.headers.get('sec-ch-ua-full-version') || '',
      secChUaBitness: req.headers.get('sec-ch-ua-bitness') || '',
      secChUaFormFactor: req.headers.get('sec-ch-ua-form-factor') || ''
    };

    // Create a deterministic device string using key characteristics
    const deviceType = deviceInfo.mobile === '?0' ? 'desktop' : 'mobile';
    const platformShort = deviceInfo.platform.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    
    // Create a consistent device string using only stable characteristics
    const deviceString = `${deviceType}_${platformShort}_${deviceInfo.userAgent.slice(0, 50)}`;
    
    // Generate SHA-256 hash of the device info
    const hash = crypto.createHash('sha256');
    hash.update(deviceString);
    const fullHash = hash.digest('hex');
    
    // Backend requires ≤64 characters (not 32-128 as documented)
    // SHA-256 hash is 64 characters, so we'll use first 48 characters to be safe
    const fingerprint_hashed = fullHash.slice(0, 48);
    
    // Validate against backend requirements
    const hashLength = fingerprint_hashed.length;
    const meetsRequirements = hashLength >= 32 && hashLength <= 64;
    
    return {
      fingerprint_hashed,
      deviceInfo,
      hashLength,
      meetsRequirements,
    };
  }

  /**
   * Validate if a fingerprint meets backend requirements
   * @param fingerprint - The fingerprint to validate
   * @returns Validation result
   */
  static validateFingerprint(fingerprint: string): {
    isValid: boolean;
    length: number;
    meetsMinLength: boolean;
    meetsMaxLength: boolean;
    errors: string[];
  } {
    const length = fingerprint.length;
    const meetsMinLength = length >= 32;
    const meetsMaxLength = length <= 64;
    const isValid = meetsMinLength && meetsMaxLength;
    
    const errors: string[] = [];
    if (!meetsMinLength) errors.push(`Fingerprint too short: ${length} chars (minimum: 32)`);
    if (!meetsMaxLength) errors.push(`Fingerprint too long: ${length} chars (maximum: 64)`);
    
    return {
      isValid,
      length,
      meetsMinLength,
      meetsMaxLength,
      errors
    };
  }

  /**
   * Get fingerprint requirements for reference
   * @returns Backend fingerprint requirements
   */
  static getRequirements() {
    return {
      minLength: 32,
      maxLength: 64,
      format: 'SHA-256 hash (truncated to 48 chars)',
      type: 'string',
      algorithm: 'SHA-256'
    };
  }

  /**
   * Generate a test fingerprint for development/testing
   * @returns A consistent test fingerprint
   */
  static generateTestFingerprint(): string {
    return "test_fingerprint_48_chars_long_for_testing_purposes";
  }
}
