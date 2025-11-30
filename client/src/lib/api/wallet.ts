// Wallet & Payment API
import { apiGet, apiPost, ApiResponse, PaginatedResponse } from './config';

// Types
export interface Wallet {
  id: string;
  userId: string;
  balance: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: string;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface FundWalletRequest {
  amount: number;
  email: string;
  paymentMethod?: 'card' | 'bank_transfer' | 'mobile_money' | 'ussd';
}

export interface FundWalletResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaymentVerificationResponse {
  status: 'success' | 'failed' | 'pending';
  amount: string;
  reference: string;
  transactionId?: string;
}

// API Functions
export async function getWallet(): Promise<ApiResponse<Wallet>> {
  return apiGet<Wallet>('/api/wallet');
}

export async function getWalletBalance(): Promise<ApiResponse<{ balance: string; currency: string }>> {
  return apiGet('/api/wallet/balance');
}

export async function getTransactions(page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
  return apiGet('/api/wallet/transactions', { page, size });
}

export async function getTransactionsByType(type: 'credit' | 'debit', page: number = 0, size: number = 20): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
  return apiGet(`/api/wallet/transactions/${type}`, { page, size });
}

export async function fundWallet(data: FundWalletRequest): Promise<ApiResponse<FundWalletResponse>> {
  return apiPost<FundWalletResponse>('/api/wallet/fund', data);
}

export async function verifyPayment(reference: string): Promise<ApiResponse<PaymentVerificationResponse>> {
  return apiGet(`/api/wallet/verify/${reference}`);
}

export interface InitializePaymentRequest {
  amount: string;
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'ussd' | 'card';
  provider?: string;
  bank?: string;
}

export interface InitializePaymentResponse {
  reference: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  ussdCode?: string;
  expiresAt?: string;
}

export async function initializePayment(data: InitializePaymentRequest): Promise<ApiResponse<InitializePaymentResponse>> {
  return apiPost<InitializePaymentResponse>('/api/wallet/initialize', data);
}
