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
  device: string;
  browser: string;
}

/**
 * Extract browser name from user agent string
 * @param req - The incoming request object
 * @returns Browser name (Chrome, Safari, Firefox, etc.)
 */
function getBrowserName(req: Request): string {
  const userAgent = req.headers.get('user-agent') || '';
  
  if (userAgent.includes('Cốc Cốc') || userAgent.includes('CocCoc')) {
    return 'Cốc Cốc';
  }
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'Chrome';
  }
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari';
  }
  if (userAgent.includes('Firefox')) {
    return 'Firefox';
  }
  if (userAgent.includes('Edg')) {
    return 'Edge';
  }
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    return 'Opera';
  }
  if (userAgent.includes('Brave')) {
    return 'Brave';
  }
  
  return 'Unknown';
}

/**
 * Extract operating system from user agent string
 * @param req - The incoming request object
 * @returns Operating system name (macOS, Windows, Linux, iOS, Android, etc.)
 */
function getOperatingSystem(req: Request): string {
  const userAgent = req.headers.get('user-agent') || '';
  
  // Check for mobile devices first
  if (userAgent.includes('iPhone')) {
    return 'iOS';
  }
  if (userAgent.includes('iPad')) {
    return 'iPadOS';
  }
  if (userAgent.includes('Android')) {
    return 'Android';
  }
  
  // Check for desktop operating systems
  if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
    return 'macOS';
  }
  if (userAgent.includes('Windows NT')) {
    return 'Windows';
  }
  if (userAgent.includes('Linux')) {
    return 'Linux';
  }
  if (userAgent.includes('FreeBSD')) {
    return 'FreeBSD';
  }
  if (userAgent.includes('OpenBSD')) {
    return 'OpenBSD';
  }
  if (userAgent.includes('NetBSD')) {
    return 'NetBSD';
  }
  if (userAgent.includes('SunOS')) {
    return 'Solaris';
  }
  
  return 'Unknown';
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
    const browserName = getBrowserName(req).toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    
    // Create a consistent device string using only stable characteristics
    const deviceString = `${deviceType}_${platformShort}_${browserName}_${deviceInfo.userAgent.slice(0, 50)}`;
    
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
      device: getOperatingSystem(req),
      browser: getBrowserName(req),
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
