// Diagnostic Centers API
import { apiGet, apiPost, apiPut, ApiResponse, PaginatedResponse } from './config';

// Types
export interface DiagnosticCenter {
  id: string;
  userId: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: string;
  longitude?: string;
  phone: string;
  email: string;
  hours?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  verified: boolean;
  rating?: string;
  totalRatings?: number;
  offersHomeService: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CenterPricing {
  testId: string;
  testName: string;
  price: string;
  homeServicePrice?: string;
  currency: string;
}

export interface CenterRating {
  id: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  rating: number;
  review?: string;
  createdAt: string;
}

export interface CreateCenterRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  phone: string;
  email: string;
  hours?: string;
  description?: string;
}

export interface UpdateCenterRequest {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: string;
  longitude?: string;
  phone?: string;
  email?: string;
  hours?: string;
  description?: string;
}

export interface SetPricingRequest {
  testId: string;
  price: string;
  homeServicePrice?: string;
}

export interface RateCenterRequest {
  rating: number;
  review?: string;
}

// API Functions - Public
export async function getCenters(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<DiagnosticCenter>>> {
  return apiGet('/api/centers', { page, size });
}

export async function getCenterById(id: string): Promise<ApiResponse<DiagnosticCenter>> {
  return apiGet<DiagnosticCenter>(`/api/centers/${id}`);
}

export async function getCenterBySlug(slug: string): Promise<ApiResponse<DiagnosticCenter>> {
  return apiGet<DiagnosticCenter>(`/api/centers/slug/${slug}`);
}

export async function searchCenters(query: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<DiagnosticCenter>>> {
  return apiGet('/api/centers/search', { query, page, size });
}

export async function getNearbyCenters(latitude: number, longitude: number, radiusKm: number = 10, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<DiagnosticCenter>>> {
  return apiGet('/api/centers/nearby', { latitude, longitude, radiusKm, page, size });
}

export async function getCentersByCity(city: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<DiagnosticCenter>>> {
  return apiGet(`/api/centers/city/${city}`, { page, size });
}

export async function getCentersByState(state: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<DiagnosticCenter>>> {
  return apiGet(`/api/centers/state/${state}`, { page, size });
}

export async function getHomeServiceCenters(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<DiagnosticCenter>>> {
  return apiGet('/api/centers/home-service', { page, size });
}

export async function getCenterPricing(centerId: string): Promise<ApiResponse<CenterPricing[]>> {
  return apiGet<CenterPricing[]>(`/api/centers/${centerId}/pricing`);
}

export async function getCenterRatings(centerId: string, page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<CenterRating>>> {
  return apiGet(`/api/centers/${centerId}/ratings`, { page, size });
}

export async function rateCenter(centerId: string, data: RateCenterRequest): Promise<ApiResponse<CenterRating>> {
  return apiPost<CenterRating>(`/api/centers/${centerId}/rate`, data);
}

// API Functions - Center Owner
export async function getMyCenter(): Promise<ApiResponse<DiagnosticCenter>> {
  return apiGet<DiagnosticCenter>('/api/centers/my');
}

export async function createCenter(data: CreateCenterRequest): Promise<ApiResponse<DiagnosticCenter>> {
  return apiPost<DiagnosticCenter>('/api/centers', data);
}

export async function updateMyCenter(data: UpdateCenterRequest): Promise<ApiResponse<DiagnosticCenter>> {
  return apiPut<DiagnosticCenter>('/api/centers/my', data);
}

export async function setCenterPricing(data: SetPricingRequest): Promise<ApiResponse<CenterPricing>> {
  return apiPost<CenterPricing>('/api/centers/my/pricing', data);
}
