// React Query Hooks for API calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from './auth';
import * as usersApi from './users';
import * as walletApi from './wallet';
import * as codesApi from './codes';
import * as resultsApi from './results';
import * as centersApi from './centers';
import * as testsApi from './tests';
import * as sponsorsApi from './sponsors';
import * as homeServiceApi from './home-service';
import * as primeApi from './prime';
import * as notificationsApi from './notifications';
import * as supportApi from './support';
import * as adminApi from './admin';
import { getAuthToken } from './config';

// ==================== AUTH HOOKS ====================

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => usersApi.getMe(),
    enabled: !!getAuthToken(),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useGoogleAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.googleAuth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

// ==================== USER HOOKS ====================

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: usersApi.changePassword,
  });
}

// ==================== WALLET HOOKS ====================

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet(),
    enabled: !!getAuthToken(),
    staleTime: 30 * 1000,
    select: (data) => data.data,
  });
}

export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => walletApi.getWalletBalance(),
    enabled: !!getAuthToken(),
    staleTime: 30 * 1000,
    select: (data) => data.data,
  });
}

export function useTransactions(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['transactions', { page, size }],
    queryFn: () => walletApi.getTransactions(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useFundWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.fundWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useInitializePayment() {
  return useMutation({
    mutationFn: walletApi.initializePayment,
  });
}

// ==================== ASSESSMENT CODES HOOKS ====================

export function useMyCodes(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['codes', 'my', { page, size }],
    queryFn: () => codesApi.getMyCodes(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useMyActiveCodes() {
  return useQuery({
    queryKey: ['codes', 'my', 'active'],
    queryFn: () => codesApi.getMyActiveCodes(),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useValidateCode(code: string) {
  return useQuery({
    queryKey: ['codes', 'validate', code],
    queryFn: () => codesApi.validateCode(code),
    enabled: !!code,
    select: (data) => data.data,
  });
}

export function useGenerateCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: codesApi.generateCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useClaimCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: codesApi.claimCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
  });
}

export function useUseCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: codesApi.useCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
  });
}

export function useActivateCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => codesApi.claimCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
  });
}

export function useVerifyIdentity() {
  return useMutation({
    mutationFn: ({ code, idType, idNumber }: { code: string; idType: string; idNumber: string }) =>
      codesApi.useCode(code),
  });
}

export function useOrderTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testStandardId, centerId, addOns }: { testStandardId: string; centerId: string; addOns?: string[] }) =>
      codesApi.generateCode({ testStandardId, centerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

// ==================== TEST RESULTS HOOKS ====================

export function useMyResults(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['results', 'my', { page, size }],
    queryFn: () => resultsApi.getMyResults(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useResult(id: string) {
  return useQuery({
    queryKey: ['results', id],
    queryFn: () => resultsApi.getResultById(id),
    enabled: !!id && !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useCenterResults(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['results', 'center', { page, size }],
    queryFn: () => resultsApi.getCenterResults(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useSubmitResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resultsApi.submitResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
  });
}

// ==================== DIAGNOSTIC CENTERS HOOKS ====================

export function useCenters(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['centers', { page, size }],
    queryFn: () => centersApi.getCenters(page, size),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useCenter(id: string) {
  return useQuery({
    queryKey: ['centers', id],
    queryFn: () => centersApi.getCenterById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useSearchCenters(query: string, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['centers', 'search', { query, page, size }],
    queryFn: () => centersApi.searchCenters(query, page, size),
    enabled: !!query,
    staleTime: 60 * 1000,
    select: (data) => data.data,
  });
}

export function useNearbyCenters(latitude: number, longitude: number, radiusKm: number = 10) {
  return useQuery({
    queryKey: ['centers', 'nearby', { latitude, longitude, radiusKm }],
    queryFn: () => centersApi.getNearbyCenters(latitude, longitude, radiusKm),
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useHomeServiceCenters(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['centers', 'home-service', { page, size }],
    queryFn: () => centersApi.getHomeServiceCenters(page, size),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useCenterPricing(centerId: string) {
  return useQuery({
    queryKey: ['centers', centerId, 'pricing'],
    queryFn: () => centersApi.getCenterPricing(centerId),
    enabled: !!centerId,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useMyCenter() {
  return useQuery({
    queryKey: ['centers', 'my'],
    queryFn: () => centersApi.getMyCenter(),
    enabled: !!getAuthToken(),
    staleTime: 60 * 1000,
    select: (data) => data.data,
  });
}

export function useRateCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ centerId, data }: { centerId: string; data: centersApi.RateCenterRequest }) =>
      centersApi.rateCenter(centerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['centers', variables.centerId] });
    },
  });
}

// Alias for useCenters - used by some components
export function useDiagnosticCenters(page: number = 0, size: number = 20) {
  return useCenters(page, size);
}

// ==================== TEST STANDARDS HOOKS ====================

export function useTests(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['tests', { page, size }],
    queryFn: () => testsApi.getTests(page, size),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useAllTests() {
  return useQuery({
    queryKey: ['tests', 'all'],
    queryFn: () => testsApi.getAllTests(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function usePopularTests() {
  return useQuery({
    queryKey: ['tests', 'popular'],
    queryFn: () => testsApi.getPopularTests(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useWellnessAddons() {
  return useQuery({
    queryKey: ['tests', 'addons'],
    queryFn: () => testsApi.getWellnessAddons(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.data,
  });
}

// Alias for useTests - used by some components
export function useTestStandards(page: number = 0, size: number = 20) {
  return useTests(page, size);
}

// ==================== SPONSORS HOOKS ====================

export function useSponsorProfile() {
  return useQuery({
    queryKey: ['sponsor', 'profile'],
    queryFn: () => sponsorsApi.getSponsorProfile(),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useSponsorTestRequests(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['sponsor', 'requests', { page, size }],
    queryFn: () => sponsorsApi.getSponsorTestRequests(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useCreateTestRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sponsorsApi.createTestRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function usePublicCodeInfo(code: string) {
  return useQuery({
    queryKey: ['sponsor', 'code', code],
    queryFn: () => sponsorsApi.getPublicCodeInfo(code),
    enabled: !!code,
    select: (data) => data.data,
  });
}

// ==================== HOME SERVICE HOOKS ====================

export function useMyBookings(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['bookings', 'my', { page, size }],
    queryFn: () => homeServiceApi.getMyBookings(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: homeServiceApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useCenterBookings(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['bookings', 'center', { page, size }],
    queryFn: () => homeServiceApi.getCenterBookings(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: homeServiceApi.UpdateBookingStatusRequest }) =>
      homeServiceApi.updateBookingStatus(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Alias for useMyBookings - used by history page
export function useHomeServiceBookings() {
  return useMyBookings(0, 50);
}

// ==================== PRIME HOOKS ====================

export function usePrimePlans() {
  return useQuery({
    queryKey: ['prime', 'plans'],
    queryFn: () => primeApi.getPrimePlans(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.data,
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: ['prime', 'subscription'],
    queryFn: () => primeApi.getMySubscription(),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['prime', 'status'],
    queryFn: () => primeApi.getSubscriptionStatus(),
    enabled: !!getAuthToken(),
    staleTime: 60 * 1000,
    select: (data) => data.data,
  });
}

export function useSubscribeToPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: primeApi.subscribeToPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prime'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: primeApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prime'] });
    },
  });
}

// ==================== NOTIFICATIONS HOOKS ====================

export function useNotifications(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['notifications', { page, size }],
    queryFn: () => notificationsApi.getNotifications(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: !!getAuthToken(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    select: (data) => data.data?.count ?? 0,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ==================== SUPPORT HOOKS ====================

export function useMyTickets(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['support', 'tickets', { page, size }],
    queryFn: () => supportApi.getMyTickets(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supportApi.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
    },
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: supportApi.ReplyTicketRequest }) =>
      supportApi.replyToTicket(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
    },
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supportApi.createFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'feedback'] });
    },
  });
}

// ==================== ADMIN HOOKS ====================

export function useAdminLogin() {
  return useMutation({
    mutationFn: adminApi.adminLogin,
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.verifyOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
    enabled: !!getAuthToken(),
    staleTime: 60 * 1000,
    select: (data) => data.data,
  });
}

export function useAdminUsers(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['admin', 'users', { page, size }],
    queryFn: () => adminApi.getUsers(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function usePendingCenters(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['admin', 'centers', 'pending', { page, size }],
    queryFn: () => adminApi.getPendingCenters(page, size),
    enabled: !!getAuthToken(),
    select: (data) => data.data,
  });
}

export function useVerifyCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.verifyCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'centers'] });
    },
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] });
    },
  });
}
