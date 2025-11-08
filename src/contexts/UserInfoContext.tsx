"use client";

import { createContext, useContext } from "react";
import { UserProfile } from "@/interfaces/index.interfaces";

export interface UserContextType {
  userInfo: UserProfile | undefined;
  fetchUserInfo: () => Promise<void>;
}

export const UserInfoContext = createContext<UserContextType | undefined>(
  undefined
);

export const useUserInfoContext = () => useContext(UserInfoContext);
