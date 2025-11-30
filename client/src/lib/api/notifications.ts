// Notifications API
import { apiGet, apiPut, ApiResponse, PaginatedResponse } from './config';

// Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'result_ready' | 'code_used' | 'payment' | 'subscription' | 'booking' | 'system' | 'promotion';
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  resultNotifications: boolean;
  paymentNotifications: boolean;
  promotionalNotifications: boolean;
  updatedAt: string;
}

export interface UpdatePreferencesRequest {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  resultNotifications?: boolean;
  paymentNotifications?: boolean;
  promotionalNotifications?: boolean;
}

// API Functions
export async function getNotifications(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<Notification>>> {
  return apiGet('/api/notifications', { page, size });
}

export async function getUnreadNotifications(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<Notification>>> {
  return apiGet('/api/notifications/unread', { page, size });
}

export async function getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
  return apiGet('/api/notifications/unread/count');
}

export async function markAsRead(id: string): Promise<ApiResponse<Notification>> {
  return apiPut<Notification>(`/api/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
  return apiPut('/api/notifications/read-all');
}

export async function getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences | null>> {
  return apiGet('/api/notifications/preferences');
}

export async function updateNotificationPreferences(data: UpdatePreferencesRequest): Promise<ApiResponse<NotificationPreferences>> {
  return apiPut<NotificationPreferences>('/api/notifications/preferences', data);
}
