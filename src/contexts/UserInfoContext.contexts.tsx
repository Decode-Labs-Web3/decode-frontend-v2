"use client";

import { createContext } from "react";
import { UserContextType } from "@/interfaces/index.interfaces";

export const UserInfoContext = createContext<UserContextType | null>(null);
