// Authentication API
import { apiPost, apiGet, setAuthTokens, clearAuthTokens, ApiResponse, apiUrl } from './config';

// Types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'patient' | 'center' | 'sponsor';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'patient' | 'center' | 'sponsor' | 'admin';
    profileImageUrl?: string;
    emailVerified: boolean;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
  requiresVerification: boolean;
}

export interface GoogleAuthRequest {
  code: string;
  role?: 'patient' | 'center' | 'sponsor';
}

export interface MicrosoftAuthRequest {
  code: string;
  role?: 'patient' | 'center' | 'sponsor';
}

export interface AppleAuthRequest {
  identityToken: string;
  user?: {
    name?: {
      firstName?: string;
      lastName?: string;
    };
    email?: string;
  };
  role?: 'patient' | 'center' | 'sponsor';
}

// API Functions
export async function register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
  // Registration now returns a RegisterResponse (no tokens, requires verification)
  return apiPost<RegisterResponse>('/api/auth/register', data);
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const response = await apiPost<AuthResponse>('/api/auth/login', data);
  if (response.success && response.data) {
    setAuthTokens(response.data.accessToken, response.data.refreshToken);
    // Build name from firstName and lastName, with fallback
    const firstName = response.data.user.firstName || '';
    const lastName = response.data.user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'User';
    localStorage.setItem('authUser', JSON.stringify({
      id: response.data.user.id,
      email: response.data.user.email,
      name: fullName,
      phone: response.data.user.phone,
      role: response.data.user.role,
      provider: 'email',
      profileImageUrl: response.data.user.profileImageUrl,
    }));
  }
  return response;
}

export async function logout(): Promise<ApiResponse<void>> {
  try {
    const response = await apiPost<void>('/api/auth/logout');
    return response;
  } finally {
    clearAuthTokens();
  }
}

export async function getCurrentUser(): Promise<ApiResponse<AuthResponse['user']>> {
  return apiGet<AuthResponse['user']>('/api/users/me');
}

// OAuth Functions
export async function getOAuthProviders(): Promise<ApiResponse<{ google: boolean; microsoft: boolean; apple: boolean }>> {
  return apiGet('/api/auth/oauth/providers');
}

export async function googleAuth(data: GoogleAuthRequest): Promise<ApiResponse<AuthResponse & { isNewUser: boolean }>> {
  const response = await apiPost<AuthResponse & { isNewUser: boolean }>('/api/auth/oauth/google', data);
  if (response.success && response.data) {
    setAuthTokens(response.data.accessToken, response.data.refreshToken);
    const firstName = response.data.user.firstName || '';
    const lastName = response.data.user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'User';
    localStorage.setItem('authUser', JSON.stringify({
      id: response.data.user.id,
      email: response.data.user.email,
      name: fullName,
      phone: response.data.user.phone,
      role: response.data.user.role,
      provider: 'google',
      profileImageUrl: response.data.user.profileImageUrl,
    }));
  }
  return response;
}

export async function microsoftAuth(data: MicrosoftAuthRequest): Promise<ApiResponse<AuthResponse & { isNewUser: boolean }>> {
  const response = await apiPost<AuthResponse & { isNewUser: boolean }>('/api/auth/oauth/microsoft', data);
  if (response.success && response.data) {
    setAuthTokens(response.data.accessToken, response.data.refreshToken);
    const firstName = response.data.user.firstName || '';
    const lastName = response.data.user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'User';
    localStorage.setItem('authUser', JSON.stringify({
      id: response.data.user.id,
      email: response.data.user.email,
      name: fullName,
      phone: response.data.user.phone,
      role: response.data.user.role,
      provider: 'microsoft',
      profileImageUrl: response.data.user.profileImageUrl,
    }));
  }
  return response;
}

export async function appleAuth(data: AppleAuthRequest): Promise<ApiResponse<AuthResponse & { isNewUser: boolean }>> {
  const response = await apiPost<AuthResponse & { isNewUser: boolean }>('/api/auth/oauth/apple', data);
  if (response.success && response.data) {
    setAuthTokens(response.data.accessToken, response.data.refreshToken);
    const firstName = response.data.user.firstName || '';
    const lastName = response.data.user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'User';
    localStorage.setItem('authUser', JSON.stringify({
      id: response.data.user.id,
      email: response.data.user.email,
      name: fullName,
      phone: response.data.user.phone,
      role: response.data.user.role,
      provider: 'apple',
      profileImageUrl: response.data.user.profileImageUrl,
    }));
  }
  return response;
}

export async function getLinkedOAuthAccounts(): Promise<ApiResponse<{ provider: string; linkedAt: string }[]>> {
  return apiGet('/api/auth/oauth/linked');
}

export async function unlinkOAuthAccount(providerId: string): Promise<ApiResponse<void>> {
  const { apiDelete } = await import('./config');
  return apiDelete(`/api/auth/oauth/unlink/${providerId}`);
}

// Generate OAuth URL for redirect flow
export function getGoogleOAuthUrl(role: string = 'patient'): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback/google`;
  const scope = 'email profile';
  const state = role;

  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`;
}

export function getMicrosoftOAuthUrl(role: string = 'patient'): string {
  const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback/microsoft`;
  const scope = 'openid email profile';
  const state = role;

  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
}

// Email Verification Functions
export async function verifyEmail(token: string): Promise<ApiResponse<AuthResponse>> {
  const response = await apiGet<AuthResponse>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
  if (response.success && response.data) {
    setAuthTokens(response.data.accessToken, response.data.refreshToken);
    // Build name from firstName and lastName, with fallback
    const firstName = response.data.user.firstName || '';
    const lastName = response.data.user.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'User';
    localStorage.setItem('authUser', JSON.stringify({
      id: response.data.user.id,
      email: response.data.user.email,
      name: fullName,
      phone: response.data.user.phone,
      role: response.data.user.role,
      provider: 'email',
      profileImageUrl: response.data.user.profileImageUrl,
    }));
  }
  return response;
}

export async function resendVerificationEmail(email: string): Promise<ApiResponse<RegisterResponse>> {
  return apiPost<RegisterResponse>('/api/auth/resend-verification', { email });
}

// Password Reset Functions
export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function forgotPassword(email: string): Promise<ApiResponse<ForgotPasswordResponse>> {
  return apiPost<ForgotPasswordResponse>('/api/auth/forgot-password', { email });
}

export async function resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> {
  return apiPost<ResetPasswordResponse>('/api/auth/reset-password', data);
}

export async function validateResetToken(token: string): Promise<ApiResponse<{ valid: boolean }>> {
  return apiGet<{ valid: boolean }>(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
}
