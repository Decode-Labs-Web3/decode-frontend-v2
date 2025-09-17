'use client';

import { createContext } from 'react';

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

interface UserContextType {
  user: UserProfile | null;
  refetchUserData: () => Promise<void>;
}

export const UserInfoContext = createContext<UserContextType | null>(null);
