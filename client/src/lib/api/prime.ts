// Prime Subscription API
import { apiGet, apiPost, ApiResponse } from './config';

// Types
export interface PrimePlan {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  durationMonths: number;
  features: string[];
  discountPercentage?: number;
  popular?: boolean;
  active: boolean;
  createdAt: string;
}

export interface PrimeSubscription {
  id: string;
  userId: string;
  planId: string;
  plan?: PrimePlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  subscription?: PrimeSubscription;
  daysRemaining?: number;
  benefits: {
    freeTests: number;
    freeTestsUsed: number;
    discountPercentage: number;
    prioritySupport: boolean;
    homeServiceDiscount: number;
  };
}

export interface BenefitsUsage {
  freeTests: {
    total: number;
    used: number;
    remaining: number;
  };
  savings: {
    totalSaved: string;
    currency: string;
  };
  lastUsed?: string;
}

export interface SubscribeRequest {
  planId: string;
  autoRenew?: boolean;
}

// API Functions
export async function getPrimePlans(): Promise<ApiResponse<PrimePlan[]>> {
  return apiGet<PrimePlan[]>('/api/prime/plans');
}

export async function getPrimePlanById(id: string): Promise<ApiResponse<PrimePlan>> {
  return apiGet<PrimePlan>(`/api/prime/plans/${id}`);
}

export async function getMySubscription(): Promise<ApiResponse<PrimeSubscription | null>> {
  return apiGet('/api/prime/subscription');
}

export async function getSubscriptionStatus(): Promise<ApiResponse<SubscriptionStatus>> {
  return apiGet<SubscriptionStatus>('/api/prime/status');
}

export async function subscribeToPlan(data: SubscribeRequest): Promise<ApiResponse<PrimeSubscription>> {
  return apiPost<PrimeSubscription>('/api/prime/subscribe', data);
}

export async function cancelSubscription(): Promise<ApiResponse<PrimeSubscription>> {
  return apiPost<PrimeSubscription>('/api/prime/cancel');
}

export async function getBenefitsUsage(): Promise<ApiResponse<BenefitsUsage>> {
  return apiGet<BenefitsUsage>('/api/prime/benefits/usage');
}
