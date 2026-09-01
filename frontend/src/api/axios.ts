import axios from "axios";

// Using environment variable for base URL, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("decisionhub_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If we receive a 401 Unauthorized, we can optionally attempt token refresh here.
    // Or we just logout the user (clear storage and redirect).
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized access. Token might be expired.");
      // Optional: Add logic to refresh token here.
      
      // If no refresh token logic, or if refresh fails, we can clear token:
      localStorage.removeItem("decisionhub_token");
      localStorage.removeItem("decisionhub_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
