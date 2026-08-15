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

// --- Circuit Breaker State ---
let circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
let circuitOpenTime = 0;
const CIRCUIT_COOLDOWN = 30000; // 30 seconds

// Request interceptor to add Clerk JWT token and Accept-Language header
api.interceptors.request.use(
  async (config) => {
    // Circuit Breaker Check
    if (circuitState === 'OPEN') {
      if (Date.now() - circuitOpenTime > CIRCUIT_COOLDOWN) {
        circuitState = 'HALF_OPEN';
      } else {
        return Promise.reject({ isCircuitBreaker: true, message: 'Server is temporarily unavailable.' });
      }
    }
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

// State for Token Refresh Mutex
let isRefreshingToken = false;
let tokenRefreshQueue: Array<{ resolve: Function; reject: Function }> = [];

const processTokenQueue = (error: any = null, token: string | null = null) => {
  tokenRefreshQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  tokenRefreshQueue = [];
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Close circuit if half-open probe succeeded
    if (circuitState === 'HALF_OPEN') {
      circuitState = 'CLOSED';
    }
    return response;
  },
  async (error) => {
    // Handle Circuit Breaker short-circuit rejections
    if (error.isCircuitBreaker) {
      return Promise.reject(new Error(error.message));
    }

    const originalRequest = error.config as any;

    // Record probe failure if circuit is HALF_OPEN
    const isNetworkError = !error.response && error.request;
    const is50xError = error.response && [502, 503, 504].includes(error.response.status);
    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';

    if (circuitState === 'HALF_OPEN' && (isNetworkError || is50xError || isTimeout)) {
      circuitState = 'OPEN';
      circuitOpenTime = Date.now();
    }

    // Handle 401 errors - Clerk token may have expired
    if (error.response?.status === 401 && !originalRequest._retryAuth) {
      originalRequest._retryAuth = true;

      if (isRefreshingToken) {
        return new Promise((resolve, reject) => {
          tokenRefreshQueue.push({ resolve, reject });
        }).then((token) => {
          if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      if (getTokenFn) {
        isRefreshingToken = true;
        try {
          const newToken = await getTokenFn();
          isRefreshingToken = false;
          processTokenQueue(null, newToken);
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (err) {
          isRefreshingToken = false;
          processTokenQueue(err);
        }
      }
    }

    // Determine if we should retry
    // (Variables already declared above)

    if (isNetworkError || is50xError || isTimeout) {
      const isGet = (originalRequest?.method || 'get').toLowerCase() === 'get';
      const shouldToast = originalRequest?.showToast === true || (!isGet && originalRequest?.showToast !== false);
      if (shouldToast) {
        const now = Date.now();
        if (now - lastNetworkErrorTime > NETWORK_ERROR_COOLDOWN) {
          toast.error('We are unable to reach the server. Please check your connection.');
          lastNetworkErrorTime = now;
        }
      }
      return Promise.reject(error);
    }

    // Global Error Handling (if not retrying)
    if (error.response) {
      const { status, data } = error.response;
      
      // Do not toast for 401s as they are handled by auth state changes typically
      // Do not toast 404s globally if they might be intentional
      if (status === 403) {
        if (originalRequest.method !== 'get') {
          toast.error('You do not have permission to perform this action.');
        }
      } else if (status >= 400 && status !== 401 && status !== 404) {
        const isGet = (originalRequest?.method || 'get').toLowerCase() === 'get';
        const shouldToast = originalRequest?.showToast === true || (!isGet && originalRequest?.showToast !== false);
        if (shouldToast) {
          const message = data?.detail || data?.message || (status === 500 ? 'The service is temporarily unavailable. Please try again.' : 'An error occurred. Please try again.');
          toast.error(message);
        }
      }
    } else if (error.request && !originalRequest._isRetrying) {
      // General network error fallback if retry logic wasn't triggered
      const isGet = (originalRequest?.method || 'get').toLowerCase() === 'get';
      const shouldToast = originalRequest?.showToast === true || (!isGet && originalRequest?.showToast !== false);
      if (shouldToast) {
        const now = Date.now();
        if (now - lastNetworkErrorTime > NETWORK_ERROR_COOLDOWN) {
          toast.error('We are unable to reach the server. Please try again in a moment.');
          lastNetworkErrorTime = now;
        }
      }
    }

    return Promise.reject(error);
  }
);

// --- Request Deduplication ---
const pendingRequests = new Map<string, Promise<any>>();
const originalGet = api.get;

api.get = function (url: string, config?: any) {
  // Only deduplicate if not explicitly disabled
  if (config?.dedupe === false) {
    return originalGet.apply(this, [url, config]);
  }

  const key = `GET:${url}?${JSON.stringify(config?.params || {})}`;
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = originalGet.apply(this, [url, config]).finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
};

export default api;
