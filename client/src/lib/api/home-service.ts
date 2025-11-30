// Home Service API
import { apiGet, apiPost, apiPut, ApiResponse, PaginatedResponse } from './config';

// Types
export interface HomeServiceBooking {
  id: string;
  userId: string;
  centerId: string;
  center?: {
    id: string;
    name: string;
    phone: string;
  };
  testId: string;
  testStandard?: {
    id: string;
    name: string;
    testsIncluded: string[];
  };
  assessmentCodeId?: string;
  assessmentCode?: {
    code: string;
  };
  scheduledDate: string;
  scheduledTime?: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price: string;
  currency: string;
  phlebotomistName?: string;
  phlebotomistPhone?: string;
  completedAt?: string;
  resultId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeServicePricing {
  testId: string;
  testName: string;
  basePrice: string;
  homeServiceFee: string;
  totalPrice: string;
  currency: string;
}

export interface HomeServiceSettings {
  centerId: string;
  isActive: boolean;
  radiusKm: number;
  minimumLeadTimeHours: number;
  availableDays: number[];
  availableTimeStart: string;
  availableTimeEnd: string;
}

export interface CreateBookingRequest {
  centerId: string;
  testId: string;
  scheduledDate: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  notes?: string;
}

export interface UpdateBookingStatusRequest {
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  phlebotomistName?: string;
  phlebotomistPhone?: string;
  notes?: string;
}

export interface UpdateSettingsRequest {
  isActive?: boolean;
  radiusKm?: number;
  minimumLeadTimeHours?: number;
  availableDays?: number[];
  availableTimeStart?: string;
  availableTimeEnd?: string;
}

export interface SetHomePricingRequest {
  testId: string;
  homeServiceFee: string;
}

// API Functions - Patient
export async function createBooking(data: CreateBookingRequest): Promise<ApiResponse<HomeServiceBooking>> {
  return apiPost<HomeServiceBooking>('/api/home-service/bookings', data);
}

export async function getMyBookings(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<HomeServiceBooking>>> {
  return apiGet('/api/home-service/bookings/my', { page, size });
}

export async function getBookingById(id: string): Promise<ApiResponse<HomeServiceBooking>> {
  return apiGet<HomeServiceBooking>(`/api/home-service/bookings/${id}`);
}

export async function getCenterHomeServicePricing(centerId: string): Promise<ApiResponse<HomeServicePricing[]>> {
  return apiGet<HomeServicePricing[]>(`/api/home-service/centers/${centerId}/pricing`);
}

export async function getCenterHomeServiceSettings(centerId: string): Promise<ApiResponse<HomeServiceSettings | null>> {
  return apiGet(`/api/home-service/centers/${centerId}/settings`);
}

// API Functions - Center
export async function getCenterBookings(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<HomeServiceBooking>>> {
  return apiGet('/api/home-service/center/bookings', { page, size });
}

export async function getPendingBookingsCount(): Promise<ApiResponse<{ count: number }>> {
  return apiGet('/api/home-service/center/bookings/pending/count');
}

export async function updateBookingStatus(bookingId: string, data: UpdateBookingStatusRequest): Promise<ApiResponse<HomeServiceBooking>> {
  return apiPut<HomeServiceBooking>(`/api/home-service/center/bookings/${bookingId}/status`, data);
}

export async function updateHomeServiceSettings(data: UpdateSettingsRequest): Promise<ApiResponse<HomeServiceSettings>> {
  return apiPut<HomeServiceSettings>('/api/home-service/center/settings', data);
}

export async function setHomeServicePricing(data: SetHomePricingRequest): Promise<ApiResponse<HomeServicePricing>> {
  return apiPost<HomeServicePricing>('/api/home-service/center/pricing', data);
}
