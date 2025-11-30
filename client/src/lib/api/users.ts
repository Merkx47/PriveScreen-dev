// User & Profile API
import { apiGet, apiPut, apiPost, ApiResponse, apiUpload } from './config';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'patient' | 'center' | 'sponsor' | 'admin';
  profileImageUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// API Functions
export async function getMe(): Promise<ApiResponse<User>> {
  return apiGet<User>('/api/users/me');
}

export async function updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
  return apiPut<User>('/api/users/me', data);
}

export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
  return apiPut<void>('/api/users/me/password', data);
}

export async function updateProfilePicture(pictureUrl: string): Promise<ApiResponse<User>> {
  return apiPut<User>('/api/users/me/profile-picture', { pictureUrl });
}

export async function uploadProfilePicture(file: File): Promise<ApiResponse<{ url: string }>> {
  return apiUpload<{ url: string }>('/api/files/upload/profile', file);
}

export async function deactivateAccount(): Promise<ApiResponse<void>> {
  return apiPost<void>('/api/users/me/deactivate');
}

export async function getUserById(id: string): Promise<ApiResponse<{ id: string; firstName: string; lastName: string; profileImageUrl?: string }>> {
  return apiGet(`/api/users/${id}`);
}
