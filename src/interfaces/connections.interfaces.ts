import type { Wallet } from "./user.interfaces";

export interface MutualFollower {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
}

export interface UserFollow {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_list: MutualFollower[];
  mutual_followers_number: number;
}

export interface UserData {
  _id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: "user" | string;
  last_login?: string;
  __v: number;
  is_active: boolean;
  last_account_deactivation?: string;
  primary_wallet?: Wallet;
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: MutualFollower[];
  is_online: boolean;
}

export interface UserKeyword {
  user_id: string;
  username: string;
  role: string;
  display_name: string;
  avatar_ipfs_hash: string;
  following_number: number;
  followers_number: number;
  shared_interests_count: number;
  shared_interests: string[];
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_list: MutualFollower[];
  mutual_followers_number: number;
  is_online: boolean;
}

export interface UserSuggestion {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
  suggestion_priority: {
    low: number;
    high: number;
  };
  mutual_connections_count: {
    low: number;
    high: number;
  };
  suggestion_reason: string;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_list: MutualFollower[];
  mutual_followers_number: number;
}

export interface UserSearchProps {
  _id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login: string;
  is_active: boolean;
}
