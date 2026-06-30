// ============================================
// API CLIENT — Axios Instance
// ============================================

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getIdToken } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- Request Interceptor: Attach Firebase Auth Token ----
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Silently fail — user may not be logged in
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor: Handle Errors ----
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        'An error occurred';

      if (status === 401) {
        // Token expired or invalid — redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

export default api;

// ---- Type-safe API helpers ----

export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const { data } = await api.get<{ success: boolean; data: T }>(url, { params });
  return data.data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await api.post<{ success: boolean; data: T }>(url, body);
  return data.data;
}

export async function apiPut<T>(url: string, body?: unknown) {
  const { data } = await api.put<{ success: boolean; data: T }>(url, body);
  return data.data;
}

export async function apiDelete<T>(url: string) {
  const { data } = await api.delete<{ success: boolean; data: T }>(url);
  return data.data;
}

export async function apiUpload<T>(url: string, formData: FormData) {
  const { data } = await api.post<{ success: boolean; data: T }>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // 2 minutes for uploads
  });
  return data.data;
}
