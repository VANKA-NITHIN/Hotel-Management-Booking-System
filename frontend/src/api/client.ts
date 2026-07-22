import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hotel-management-booking-system-6sgu.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Set the Clerk JWT token for API requests.
 * Call this from a component that has access to Clerk's getToken().
 */
let getTokenFn: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

// Request interceptor to add Clerk JWT token and Accept-Language header
api.interceptors.request.use(
  async (config) => {
    // Add Accept-Language header
    const lang = localStorage.getItem('luxurystay_language');
    if (lang) {
      config.headers['Accept-Language'] = lang;
    }

    if (getTokenFn) {
      try {
        const token = await getTokenFn();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Token retrieval failed, continue without auth
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

import toast from 'react-hot-toast';

// Debounce state for network errors
let lastNetworkErrorTime = 0;
const NETWORK_ERROR_COOLDOWN = 5000; // 5 seconds

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors - Clerk token may have expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (getTokenFn) {
        try {
          const newToken = await getTokenFn();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch {
          // Token refresh failed
        }
      }
    }

    // Global Error Handling
    if (error.response) {
      const { status, data } = error.response;
      
      // Do not toast for 401s as they are handled by auth state changes typically
      // Do not toast 404s globally if they might be intentional (e.g. checking if something exists)
      if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (status === 403) {
        if (originalRequest.method !== 'get') {
          toast.error('You do not have permission to perform this action.');
        }
      } else if (status >= 400 && status < 500 && status !== 401 && status !== 404) {
        // Show specific error message from backend if available
        const message = data?.message || 'An error occurred. Please try again.';
        toast.error(message);
      }
    } else if (error.request) {
      // Network errors
      const now = Date.now();
      if (now - lastNetworkErrorTime > NETWORK_ERROR_COOLDOWN) {
        toast.error('Network error. Please check your connection or wait for the server to wake up.');
        lastNetworkErrorTime = now;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
