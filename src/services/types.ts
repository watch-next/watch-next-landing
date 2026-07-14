/**
 * Authentication Types
 */

export interface User {
  id: string;
  email: string;
  name?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface MessageResponse {
  message: string;
}