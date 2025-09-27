import { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export interface SidebarProps {
  active: string;
  onChange: (key: string) => void;
}

export interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  text: string;
}

export interface SubmitButtonProps {
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}

export interface VerificationCodeInputProps {
  digits: string[];
  setDigits: (digits: string[]) => void;
  onError: (error: string) => void;
  loading: boolean;
  error: string;
}
