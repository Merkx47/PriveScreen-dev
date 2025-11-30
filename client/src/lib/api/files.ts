// File Upload API
import { apiUpload, apiGet, apiDelete, ApiResponse, apiUrl, getAuthToken } from './config';

// Types
export interface UploadResult {
  fileKey: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

// API Functions
export async function uploadProfileImage(file: File): Promise<ApiResponse<UploadResult>> {
  return apiUpload<UploadResult>('/api/files/upload/profile', file);
}

export async function uploadCenterLogo(centerId: string, file: File): Promise<ApiResponse<UploadResult>> {
  return apiUpload<UploadResult>(`/api/files/upload/center/${centerId}/logo`, file);
}

export async function uploadCenterCover(centerId: string, file: File): Promise<ApiResponse<UploadResult>> {
  return apiUpload<UploadResult>(`/api/files/upload/center/${centerId}/cover`, file);
}

export async function uploadApplicationDocument(applicationId: string, file: File): Promise<ApiResponse<UploadResult>> {
  return apiUpload<UploadResult>(`/api/files/upload/application/${applicationId}/document`, file);
}

export async function uploadResultAttachment(resultId: string, file: File): Promise<ApiResponse<UploadResult>> {
  return apiUpload<UploadResult>(`/api/files/upload/result/${resultId}/attachment`, file);
}

export async function getPresignedUrl(key: string, expirationMinutes: number = 60): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
  return apiGet('/api/files/presigned', { key, expirationMinutes });
}

export async function deleteFile(key: string): Promise<ApiResponse<void>> {
  return apiDelete(`/api/files?key=${encodeURIComponent(key)}`);
}

// Helper to create an image preview URL
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

// Helper to validate file type
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

// Helper to validate file size (default 5MB)
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

// Helper to validate document type
export function isValidDocumentType(file: File): boolean {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  return validTypes.includes(file.type);
}
