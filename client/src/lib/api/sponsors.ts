// Sponsors API
import { apiGet, apiPost, ApiResponse, PaginatedResponse } from './config';

// Types
export interface SponsorProfile {
  id: string;
  userId: string;
  companyName: string;
  companyType: 'employer' | 'ngo' | 'healthcare' | 'insurance' | 'other';
  registrationNumber?: string;
  taxId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  verified: boolean;
  verifiedAt?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SponsorTestRequest {
  id: string;
  sponsorId: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  totalCodes: number;
  usedCodes: number;
  totalAmount: string;
  currency: string;
  validUntil: string;
  createdAt: string;
}

export interface SponsorTestRequestCode {
  id: string;
  code: string;
  testId: string;
  testName: string;
  status: 'pending' | 'claimed' | 'used' | 'expired';
  claimedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  claimedAt?: string;
  usedAt?: string;
  resultId?: string;
  createdAt: string;
}

export interface CreateSponsorProfileRequest {
  companyName: string;
  companyType: 'employer' | 'ngo' | 'healthcare' | 'insurance' | 'other';
  registrationNumber?: string;
  taxId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
}

export interface TestRequestInput {
  testId: string;
  quantity: number;
  pricePerCode: string;
}

export interface CreateTestRequestRequest {
  title: string;
  description?: string;
  tests: TestRequestInput[];
  validityDays?: number;
}

export interface SponsorTestRequestStats {
  totalCodes: number;
  claimedCodes: number;
  usedCodes: number;
  expiredCodes: number;
  pendingCodes: number;
}

export interface PublicCodeInfo {
  code: string;
  sponsorName: string;
  sponsorType: string;
  testName: string;
  testDescription: string;
  testsIncluded: string[];
  validUntil: string;
  status: string;
}

// API Functions
export async function getSponsorProfile(): Promise<ApiResponse<SponsorProfile>> {
  return apiGet<SponsorProfile>('/api/sponsors/profile');
}

export async function createSponsorProfile(data: CreateSponsorProfileRequest): Promise<ApiResponse<SponsorProfile>> {
  return apiPost<SponsorProfile>('/api/sponsors/profile', data);
}

export async function getSponsorTestRequests(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<SponsorTestRequest>>> {
  return apiGet('/api/sponsors/requests', { page, size });
}

export async function getSponsorTestRequestById(id: string): Promise<ApiResponse<SponsorTestRequest>> {
  return apiGet<SponsorTestRequest>(`/api/sponsors/requests/${id}`);
}

export async function createTestRequest(data: CreateTestRequestRequest): Promise<ApiResponse<SponsorTestRequest>> {
  return apiPost<SponsorTestRequest>('/api/sponsors/requests', data);
}

export async function getTestRequestCodes(requestId: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<SponsorTestRequestCode>>> {
  return apiGet(`/api/sponsors/requests/${requestId}/codes`, { page, size });
}

export async function getTestRequestStats(requestId: string): Promise<ApiResponse<SponsorTestRequestStats>> {
  return apiGet<SponsorTestRequestStats>(`/api/sponsors/requests/${requestId}/stats`);
}

export async function redeemSponsoredCode(code: string): Promise<ApiResponse<{ assessmentCode: string; message: string }>> {
  return apiPost('/api/sponsors/redeem', { code });
}

export async function getPublicCodeInfo(code: string): Promise<ApiResponse<PublicCodeInfo>> {
  return apiGet<PublicCodeInfo>(`/api/sponsors/code/${code}`);
}

// Patient-initiated sponsorship request types and API
export interface PatientSponsorRequest {
  id: string;
  code: string;
  patientId: string;
  patientName: string;
  sponsorEmail?: string;
  sponsorPhone?: string;
  sponsorName?: string;
  centerId: string;
  centerName: string;
  centerLocation: string;
  testPackageId: string;
  testPackageName: string;
  testPackageDescription: string;
  testPrice: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export async function getPatientSponsorRequest(code: string): Promise<ApiResponse<PatientSponsorRequest>> {
  return apiGet<PatientSponsorRequest>(`/api/patient-sponsor-requests/${code}`);
}

export async function respondToPatientSponsorRequest(
  code: string,
  action: 'accept' | 'decline'
): Promise<ApiResponse<PatientSponsorRequest>> {
  return apiPost<PatientSponsorRequest>(`/api/patient-sponsor-requests/${code}/${action}`, {});
}
