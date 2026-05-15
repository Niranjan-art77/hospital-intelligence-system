import axios from "axios";

// Determine the base URL for the API
// 1. Check VITE_API_URL (Env Var)
// 2. Fallback to your specific Render URL
// 3. Fallback to "/api" (Local Development)
const API_URL = 
  import.meta.env.VITE_API_URL || 
  "http://localhost:5000/api";

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
  async (error) => {
    const { config, response } = error;
    
    // Auto-logout on 401 Unauthorized
    if (response?.status === 401) {
        localStorage.removeItem("nova_user");
        if (window.location.pathname !== "/login") {
            window.location.href = "/login?session=expired";
        }
    }

    const shouldRetry = !response || (response.status >= 500 && response.status <= 504);
    if (shouldRetry && (!config.__retryCount || config.__retryCount < 2)) {
        config.__retryCount = (config.__retryCount || 0) + 1;
        await new Promise(resolve => setTimeout(resolve, 1000 * config.__retryCount));
        return API(config);
    }

    // Extract detailed error message
    const message = response?.data?.message || 
                    response?.data?.error || 
                    error.message || 
                    "System synchronization failure detected";
    
    error.humanMessage = message;
    return Promise.reject(error);
  }
);

export default API;