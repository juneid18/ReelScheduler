import axios from 'axios';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: 'https://reelscheduler-backend-2.onrender.com/api' || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});   

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Call refresh token endpoint
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || '/api'}/auth/refresh-token`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          // If successful, update tokens
          if (response.data.accessToken) {
            localStorage.setItem('authToken', response.data.accessToken);
            
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            
            // Retry the original request
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens on refresh failure
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login if in browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;



