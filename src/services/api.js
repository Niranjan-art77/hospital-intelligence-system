import axios from "axios";

// Determine the base URL for the API
// 1. Check VITE_API_URL (Env Var)
// 2. Fallback to your specific Render URL
// 3. Fallback to "/api" (Local Development)
const API_URL = import.meta.env.VITE_API_URL || "https://hospital-intelligence-system-2.onrender.com/api" || "/api";

const API = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor (Auth Token)
API.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem("nova_user");
  if (savedUser) {
    try {
      const { token } = JSON.parse(savedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Auth token parse failed", e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor (Error Handling)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Network Synchronization Error";
    
    // Log structured error for debugging
    console.error(`[API Error] ${error.config?.url}:`, {
        status: error.response?.status,
        message: message,
        data: error.response?.data
    });

    // Handle session expiry (401)
    if (error.response?.status === 401) {
        // Potential logout logic here
        console.warn("Unauthorized access - session might be expired");
    }

    // Attach human-readable message to error object
    error.humanMessage = message;
    
    return Promise.reject(error);
  }
);

export default API;