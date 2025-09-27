export interface UserProfile {
  last_username_change?: string;
  last_email_change?: string;
  id: string;
  email: string;
  username: string;
  role: string;
  display_name?: string;
  bio?: string;
  avatar_ipfs_hash?: string;
  last_login?: string;
  primary_wallet?: PrimaryWallet;
  following_number: number;
  followers_number: number;
}

export interface PrimaryWallet {
  id: string;
  address: string;
  user_id: string;
  name_service: string;
  is_primary: boolean;
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
