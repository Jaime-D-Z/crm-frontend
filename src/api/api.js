import axios from "axios";

/**
 * Axios instance pre-configured for the CRM backend.
 * Uses environment variables for API URL configuration
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, // Required for session cookie auth
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("crm_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (import.meta.env.VITE_ENV === "development") {
      console.error("Request error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 globally and log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("crm_token");
      // AuthContext/PrivateRoutes will handle redirect
    }

    // Log errors only in development
    if (import.meta.env.VITE_ENV === "development") {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
