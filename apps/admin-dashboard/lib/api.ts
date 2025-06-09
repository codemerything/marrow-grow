import axios from "axios";
import { useAdminStore } from "@/store/AdminStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/marrow-grow-backend";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Crucial for sending httpOnly cookies cross-origin
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attach token from zustand to every request
api.interceptors.request.use((config) => {
    const token = useAdminStore.getState().accessToken;
    if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data?.message;

      if (errorMessage === 'Token expired.' && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return api(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // IMPORTANT: Confirm this is your refresh token endpoint path
          const { data } = await api.post('/api/auth/refresh-token'); 
          const newAccessToken = data.accessToken;
          const newAdminUser = data.player; // Assuming 'player' contains user details

          useAdminStore.getState().setAccessToken(newAccessToken);
          if (newAdminUser) {
            useAdminStore.getState().setAdminUser(newAdminUser);
          }
          
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        } catch (refreshError: any) {
          console.error('Token refresh failed:', refreshError);
          processQueue(refreshError, null);
          useAdminStore.getState().setAccessToken(null);
          useAdminStore.getState().setAdminUser(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/'; // Or your specific login page
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (errorMessage === 'User not found.' || errorMessage === 'Invalid token.' || errorMessage === 'No refresh token provided.' || errorMessage === 'Invalid refresh token.' || errorMessage === 'Refresh token verification failed.') {
        // For other auth errors that are not 'Token expired.' or if refresh fails definitively
        console.warn('Authentication error, logging out:', errorMessage);
        useAdminStore.getState().setAccessToken(null);
        useAdminStore.getState().setAdminUser(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/'; // Or your specific login page
        }
        return Promise.reject(error); 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
