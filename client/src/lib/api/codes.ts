// Assessment Codes API
import { apiGet, apiPost, ApiResponse, PaginatedResponse } from './config';

// Types
export interface AssessmentCode {
  id: string;
  code: string;
  testStandardId: string;
  testStandard?: {
    id: string;
    name: string;
    description: string;
    testsIncluded: string[];
  };
  patientId?: string;
  patientName?: string;
  sponsorId?: string;
  sponsorType?: 'self' | 'employer' | 'ngo' | 'healthcare' | 'insurance' | 'other';
  status: 'pending' | 'used' | 'expired' | 'cancelled';
  validUntil: string;
  usedAt?: string;
  diagnosticCenterId?: string;
  diagnosticCenter?: {
    id: string;
    name: string;
    address: string;
  };
  createdAt: string;
}

export interface GenerateCodeRequest {
  testId: string;
  centerId?: string;
  validityDays?: number;
}

export interface UseCodeRequest {
  code: string;
  centerId: string;
}

export interface ClaimCodeRequest {
  code: string;
}

export interface CodeValidation {
  valid: boolean;
  code: string;
  patientName?: string;
  testStandard?: {
    id: string;
    name: string;
    description: string;
    testsIncluded: string[];
  };
  sponsorType?: string;
  validUntil: string;
  status: string;
  message?: string;
}

// API Functions
export async function generateCode(data: GenerateCodeRequest): Promise<ApiResponse<AssessmentCode>> {
  return apiPost<AssessmentCode>('/api/codes/generate', data);
}

export async function validateCode(code: string): Promise<ApiResponse<CodeValidation>> {
  return apiGet<CodeValidation>(`/api/codes/validate/${code}`);
}

export async function useCode(data: UseCodeRequest): Promise<ApiResponse<AssessmentCode>> {
  return apiPost<AssessmentCode>('/api/codes/use', data);
}

export async function claimCode(data: ClaimCodeRequest): Promise<ApiResponse<AssessmentCode>> {
  return apiPost<AssessmentCode>('/api/codes/claim', data);
}

export async function getMyCodes(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<AssessmentCode>>> {
  return apiGet('/api/codes/my', { page, size });
}

export async function getMyActiveCodes(): Promise<ApiResponse<AssessmentCode[]>> {
  return apiGet<AssessmentCode[]>('/api/codes/my/active');
}
