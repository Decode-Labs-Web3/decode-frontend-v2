export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login?: string;
  is_active: boolean;
  __v: number;
  last_account_deactivation?: string;
  primary_wallet?: PrimaryWallet;
  wallets?: Wallet[];
  following_number: number;
  followers_number: number;
  is_online: boolean;
}

export interface PrimaryWallet {
  _id: string;
  address: string;
  user_id: string;
  name_service: string | null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Wallet {
  _id: string;
  address: string;
  user_id: string;
  name_service: string | null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UserContextType {
  user: UserProfile | null;
  refetchUserData: () => Promise<void>;
}
