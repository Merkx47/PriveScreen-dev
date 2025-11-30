// Test Results API
import { apiGet, apiPost, apiPut, ApiResponse, PaginatedResponse } from './config';

// Types
export interface TestResultParameter {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
  status: 'normal' | 'abnormal' | 'borderline';
}

export interface TestResult {
  id: string;
  resultNumber: string;
  assessmentCodeId: string;
  assessmentCode?: {
    code: string;
    testStandardId: string;
  };
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  diagnosticCenterId: string;
  diagnosticCenter?: {
    id: string;
    name: string;
    address: string;
  };
  testStandardId: string;
  testStandard?: {
    id: string;
    name: string;
    testsIncluded: string[];
  };
  results: TestResultParameter[];
  overallStatus: 'normal' | 'abnormal' | 'requires_attention';
  notes?: string;
  viewed: boolean;
  viewedAt?: string;
  sponsorNotified: boolean;
  sponsorNotifiedAt?: string;
  testedAt: string;
  uploadedAt: string;
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
}

export interface SubmitResultRequest {
  assessmentCodeId: string;
  testData: Record<string, TestResultParameter>;
  overallStatus: 'normal' | 'abnormal' | 'requires_attention';
  notes?: string;
}

export interface UpdateResultRequest {
  testData?: Record<string, TestResultParameter>;
  overallStatus?: 'normal' | 'abnormal' | 'requires_attention';
  notes?: string;
}

// API Functions - Patient
export async function getMyResults(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<TestResult>>> {
  return apiGet('/api/results/my', { page, size });
}

export async function getResultById(id: string): Promise<ApiResponse<TestResult>> {
  return apiGet<TestResult>(`/api/results/${id}`);
}

export async function getResultByNumber(resultNumber: string): Promise<ApiResponse<TestResult>> {
  return apiGet<TestResult>(`/api/results/number/${resultNumber}`);
}

// API Functions - Center
export async function submitResult(data: SubmitResultRequest): Promise<ApiResponse<TestResult>> {
  return apiPost<TestResult>('/api/results/submit', data);
}

export async function getCenterResults(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<TestResult>>> {
  return apiGet('/api/results/center', { page, size });
}

export async function updateResult(id: string, data: UpdateResultRequest): Promise<ApiResponse<TestResult>> {
  return apiPut<TestResult>(`/api/results/${id}`, data);
}
