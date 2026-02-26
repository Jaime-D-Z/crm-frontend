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
      const errorCode = error.response?.data?.code;
      
      // Clear token
      localStorage.removeItem("crm_token");
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        // Show user-friendly message based on error code
        const message = errorCode === 'TOKEN_EXPIRED' 
          ? 'Tu sesión ha expirado' 
          : 'Debes iniciar sesión';
        
        // Store message for login page
        sessionStorage.setItem('auth_message', message);
        
        // Redirect to login
        window.location.href = '/login';
      }
    }

    // Log errors only in development
    if (import.meta.env.VITE_ENV === "development") {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        code: error.response?.data?.code,
        message: error.response?.data?.error || error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
