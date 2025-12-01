// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.privescreen.com';

// Helper to build full API URL
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

// API Response wrapper type (matches backend ApiResponse)
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Pagination response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Common error handling
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

// Set auth tokens
export function setAuthTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

// Clear auth tokens
export function clearAuthTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('authUser');
}

// Base fetch function with auth
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry the request with new token
        const newToken = getAuthToken();
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(apiUrl(path), {
          ...options,
          headers,
        });
        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }
      clearAuthTokens();
      window.location.href = '/auth/patient';
      throw new ApiError('Session expired', 401);
    }

    const errorText = await response.text();
    let errorMessage = 'An error occurred';
    try {
      const errorJson = JSON.parse(errorText);
      // Backend returns ApiResponse with error.message format
      // Structure: { success: false, error: { code: "...", message: "..." } }
      errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || response.statusText;
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

// Try to refresh the access token
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch(apiUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await response.json();
      if (data.success) {
        setAuthTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
    }
  } catch {
    // Refresh failed
  }

  return false;
}

// HTTP method helpers
export async function apiGet<T>(path: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
  let url = path;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return apiFetch<T>(url, { method: 'GET' });
}

export async function apiPost<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiPut<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, { method: 'DELETE' });
}

// Multipart form data upload
export async function apiUpload<T>(path: string, file: File, fieldName: string = 'file'): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append(fieldName, file);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || response.statusText, response.status);
  }

  return response.json();
}
