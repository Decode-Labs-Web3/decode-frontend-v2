// User-related interfaces

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  display_name?: string;
  bio?: string;
  avatar_ipfs_hash?: string;
  last_login?: string;
}

export interface UserContextType {
  user: UserProfile | null;
  refetchUserData: () => Promise<void>;
}

export interface ProfileData {
  avatar_ipfs_hash?: string;
  display_name?: string;
  bio?: string;
}

export interface RequestBody {
  current: ProfileData;
  original: ProfileData;
}
