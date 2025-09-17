// Component-related interfaces

import { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export interface SidebarProps {
  active: string;
  onChange: (key: string) => void;
}

export interface NavbarProps {
  user: { 
    username: string; 
    email: string;
  };
  onLogout?: () => void;
}

export interface PasswordValidationProps {
  password: string;
  confirmPassword?: string;
  showConfirm?: boolean;
}

export interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  text: string;
}

export interface SubmitButtonProps {
  loading: boolean;
  disabled?: boolean;
  loadingText?: string;
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export interface VerificationCodeInputProps {
  digits: string[];
  setDigits: (digits: string[]) => void;
  onError: (error: string) => void;
  loading: boolean;
  error: string;
}
