/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with Authorization token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};
