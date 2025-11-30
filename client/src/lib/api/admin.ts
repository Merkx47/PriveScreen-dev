// Admin API
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse, PaginatedResponse } from './config';

// Types
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accessLevel: 'super_admin' | 'editor' | 'read_only';
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminInvite {
  id: string;
  email: string;
  accessLevel: 'super_admin' | 'editor' | 'read_only';
  code: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string;
  notes?: string;
  createdById: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalPatients: number;
  totalCenters: number;
  totalSponsors: number;
  totalTests: number;
  totalRevenue: string;
  recentSignups: number;
  activeSubscriptions: number;
  pendingVerifications: number;
}

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'center' | 'sponsor' | 'admin';
  adminAccessLevel?: 'super_admin' | 'editor' | 'read_only';
  emailVerified: boolean;
  suspended: boolean;
  suspendedReason?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
  stackTrace?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Admin Auth Types
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  userId: string;
  message: string;
  otpSent: boolean;
}

export interface OtpVerifyRequest {
  userId: string;
  otp: string;
}

export interface AdminAuthResponse {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
}

export interface ValidateInviteRequest {
  code: string;
  email: string;
}

export interface AdminRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  inviteCode: string;
}

export interface CreateInviteRequest {
  email: string;
  accessLevel: 'super_admin' | 'editor' | 'read_only';
  expiryDays?: number;
  notes?: string;
}

// Admin Auth Functions
export async function adminLogin(data: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>> {
  return apiPost<AdminLoginResponse>('/api/admin/auth/login', data);
}

export async function verifyOtp(data: OtpVerifyRequest): Promise<ApiResponse<AdminAuthResponse>> {
  const response = await apiPost<AdminAuthResponse>('/api/admin/auth/verify-otp', data);
  if (response.success && response.data) {
    const { setAuthTokens } = await import('./config');
    setAuthTokens(response.data.accessToken, response.data.refreshToken);
    // Backend sends adminAccessLevel, frontend type has accessLevel - handle both
    const userAccessLevel = (response.data.user as unknown as { adminAccessLevel?: string }).adminAccessLevel || response.data.user.accessLevel;
    localStorage.setItem('authUser', JSON.stringify({
      id: response.data.user.id,
      email: response.data.user.email,
      name: `${response.data.user.firstName} ${response.data.user.lastName}`,
      role: 'admin',
      provider: 'email',
      accessLevel: userAccessLevel,
      adminAccessLevel: userAccessLevel, // Used by dashboard for access control
    }));
  }
  return response;
}

export async function resendOtp(userId: string): Promise<ApiResponse<AdminLoginResponse>> {
  return apiPost<AdminLoginResponse>(`/api/admin/auth/resend-otp?userId=${userId}`);
}

export async function validateInvite(data: ValidateInviteRequest): Promise<ApiResponse<AdminInvite>> {
  return apiPost<AdminInvite>('/api/admin/auth/validate-invite', data);
}

export interface AdminRegisterResponse {
  email: string;
  message: string;
}

export async function adminRegister(data: AdminRegisterRequest): Promise<ApiResponse<AdminRegisterResponse>> {
  const response = await apiPost<AdminAuthResponse>('/api/admin/auth/register', data);
  if (response.success && response.data) {
    // Don't auto-login - return just the email so frontend can show success message
    // Admin must sign in manually after registration
    return {
      success: true,
      data: {
        email: response.data.user.email || data.email,
        message: 'Account created successfully'
      }
    };
  }
  return response as ApiResponse<AdminRegisterResponse>;
}

// Admin Invite Functions
export async function createInvite(data: CreateInviteRequest): Promise<ApiResponse<AdminInvite>> {
  return apiPost<AdminInvite>('/api/admin/invites', data);
}

export async function getInvites(): Promise<ApiResponse<AdminInvite[]>> {
  return apiGet<AdminInvite[]>('/api/admin/invites');
}

export async function getInviteById(id: string): Promise<ApiResponse<AdminInvite>> {
  return apiGet<AdminInvite>(`/api/admin/invites/${id}`);
}

export async function cancelInvite(id: string): Promise<ApiResponse<AdminInvite>> {
  return apiDelete<AdminInvite>(`/api/admin/invites/${id}`);
}

export async function getMyInvites(): Promise<ApiResponse<AdminInvite[]>> {
  return apiGet<AdminInvite[]>('/api/admin/invites/my-invites');
}

// Dashboard Functions
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return apiGet<DashboardStats>('/api/admin/dashboard/stats');
}

export async function getUsers(role?: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<UserListItem>>> {
  const params: Record<string, string | number> = { page, size };
  if (role) params.role = role;
  return apiGet('/api/admin/dashboard/users', params);
}

export async function searchUsers(query: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<UserListItem>>> {
  return apiGet('/api/admin/dashboard/users/search', { query, page, size });
}

export async function getUserById(id: string): Promise<ApiResponse<UserListItem>> {
  return apiGet<UserListItem>(`/api/admin/dashboard/users/${id}`);
}

export async function suspendUser(id: string, reason: string): Promise<ApiResponse<UserListItem>> {
  return apiPost<UserListItem>(`/api/admin/dashboard/users/${id}/suspend`, { reason });
}

export async function unsuspendUser(id: string): Promise<ApiResponse<UserListItem>> {
  return apiPost<UserListItem>(`/api/admin/dashboard/users/${id}/unsuspend`);
}

// Center Management
export interface CenterListItem {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  verified: boolean;
  rating?: number;
  ratingCount?: number;
  offersHomeService: boolean;
  createdAt: string;
}

export async function getCenters(status?: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<CenterListItem>>> {
  const params: Record<string, string | number> = { page, size };
  if (status) params.status = status;
  return apiGet('/api/admin/dashboard/centers', params);
}

export async function getPendingCenters(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<CenterListItem>>> {
  return apiGet('/api/admin/dashboard/centers/pending', { page, size });
}

export async function verifyCenter(id: string): Promise<ApiResponse<CenterListItem>> {
  return apiPost(`/api/admin/dashboard/centers/${id}/verify`);
}

export async function suspendCenter(id: string, reason: string): Promise<ApiResponse<CenterListItem>> {
  return apiPost(`/api/admin/dashboard/centers/${id}/suspend`, { reason });
}

// Sponsor Management
export interface SponsorListItem {
  id: string;
  userId: string;
  companyName?: string;
  companyType?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  state?: string;
  status: string;
  createdAt: string;
}

export async function getSponsors(status?: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<SponsorListItem>>> {
  const params: Record<string, string | number> = { page, size };
  if (status) params.status = status;
  return apiGet('/api/admin/dashboard/sponsors', params);
}

export async function getPendingSponsors(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<SponsorListItem>>> {
  return apiGet('/api/admin/dashboard/sponsors/pending', { page, size });
}

export async function verifySponsor(id: string): Promise<ApiResponse<SponsorListItem>> {
  return apiPost(`/api/admin/dashboard/sponsors/${id}/verify`);
}

// Support Ticket Management
export async function getAdminTickets(status?: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const params: Record<string, string | number> = { page, size };
  if (status) params.status = status;
  return apiGet('/api/admin/dashboard/support/tickets', params);
}

export async function getAdminTicketById(id: string): Promise<ApiResponse<unknown>> {
  return apiGet(`/api/admin/dashboard/support/tickets/${id}`);
}

export async function replyToAdminTicket(id: string, message: string): Promise<ApiResponse<unknown>> {
  return apiPost(`/api/admin/dashboard/support/tickets/${id}/reply`, { message });
}

export async function updateTicketStatus(id: string, status: string): Promise<ApiResponse<unknown>> {
  return apiPut(`/api/admin/dashboard/support/tickets/${id}/status`, { status });
}

export async function assignTicket(id: string, adminId: string): Promise<ApiResponse<unknown>> {
  return apiPost(`/api/admin/dashboard/support/tickets/${id}/assign`, { adminId });
}

// Logs
export async function getAuditLogs(userId?: string, action?: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
  const params: Record<string, string | number> = { page, size };
  if (userId) params.userId = userId;
  if (action) params.action = action;
  return apiGet('/api/admin/dashboard/audit-logs', params);
}

export async function getSystemLogs(level?: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<SystemLog>>> {
  const params: Record<string, string | number> = { page, size };
  if (level) params.level = level;
  return apiGet('/api/admin/dashboard/system-logs', params);
}
