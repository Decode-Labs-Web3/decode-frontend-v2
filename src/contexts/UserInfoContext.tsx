'use client';

import { createContext } from 'react';
import { UserContextType } from '@/interfaces';

export const UserInfoContext = createContext<UserContextType | null>(null);
