export interface Fingerprint {
  "_id": string;
  "user_id": string;
  "device": string;
  "browser": string;
  "fingerprint_hashed": string;
  "is_trusted": boolean;
  "createdAt": string;
  "updatedAt": string;
  "__v": number;
  "sessions": Session[];
}

export interface Session {
  "_id": string;
  "user_id": string;
  "device_fingerprint_id": string;
  "session_token": string;
  "app": string;
  "expires_at": string;
  "is_active": boolean;
  "last_used_at": string;
  "createdAt": string;
  "updatedAt": string;
  "__v": number;
}

export interface VerifyRequest {
  code: string;
  type: 'register' | 'login' | 'forgot';
}

export interface UseVerificationProps {
  type: 'register' | 'login' | 'forgot';
  onSuccess: (data: { success: boolean; message: string; type: string; requiresRelogin?: boolean }) => void;
  onError?: (error: string) => void;
}
