/**
 * Network utility functions for handling online/offline status
 */

// Check if the application is online
export const isOnline = () => {
  return navigator.onLine;
};

// Check if the server is reachable
export const checkServerReachable = async (url) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(import.meta.VITE_API_URL + url, { 
      method: 'GET',
      signal: controller.signal,
      // Cache: 'no-store' ensures we're not getting a cached response
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Server reachability check failed:', error);
    return false;
  }
};

// Register callbacks for online/offline events
export const registerNetworkCallbacks = (onlineCallback, offlineCallback) => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};

// Ping the server periodically to check connectivity
export const startServerPing = (url = '/api/health', interval = 30000, callback) => {
  const pingId = setInterval(async () => {
    const isReachable = await checkServerReachable(url);
    if (callback) {
      callback(isReachable);
    }
  }, interval);
  
  // Return a cleanup function
  return () => {
    clearInterval(pingId);
  };
};
