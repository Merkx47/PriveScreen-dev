// Test Standards API
import { apiGet, ApiResponse, PaginatedResponse } from './config';

// Types
export interface TestStandard {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  testsIncluded: string[];
  sampleType: string;
  turnaroundTime: string;
  category?: string;
  active: boolean;
  isDefault?: boolean;
  hasWindowPeriodInfo?: boolean;
  windowPeriodDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WellnessAddon {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  turnaroundTime: string;
  category?: string;
  active: boolean;
  createdAt: string;
}

// API Functions
export async function getTests(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<TestStandard>>> {
  return apiGet('/api/tests', { page, size });
}

export async function getAllTests(): Promise<ApiResponse<TestStandard[]>> {
  return apiGet<TestStandard[]>('/api/tests/all');
}

export async function getPopularTests(): Promise<ApiResponse<TestStandard[]>> {
  return apiGet<TestStandard[]>('/api/tests/popular');
}

export async function searchTests(query: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<TestStandard>>> {
  return apiGet('/api/tests/search', { query, page, size });
}

export async function getTestsByCategory(category: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<TestStandard>>> {
  return apiGet(`/api/tests/category/${category}`, { page, size });
}

export async function getTestById(id: string): Promise<ApiResponse<TestStandard>> {
  return apiGet<TestStandard>(`/api/tests/${id}`);
}

export async function getTestBySlug(slug: string): Promise<ApiResponse<TestStandard>> {
  return apiGet<TestStandard>(`/api/tests/slug/${slug}`);
}

export async function getWellnessAddons(): Promise<ApiResponse<WellnessAddon[]>> {
  return apiGet<WellnessAddon[]>('/api/tests/addons');
}

export async function getWellnessAddonById(id: string): Promise<ApiResponse<WellnessAddon>> {
  return apiGet<WellnessAddon>(`/api/tests/addons/${id}`);
}
