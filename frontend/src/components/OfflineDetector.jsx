import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Function to handle online status
    const handleOnline = () => {
      console.log('Application is online');
      setIsOffline(false);
      
      // If we're on the offline page, redirect back to previous page or dashboard
      if (location.pathname === '/offline') {
        const previousPath = sessionStorage.getItem('previousPath') || '/dashboard';
        navigate(previousPath, { replace: true });
      }
    };

    // Function to handle offline status
    const handleOffline = () => {
      console.log('Application is offline');
      setIsOffline(true);
      
      // Store current path before redirecting
      if (location.pathname !== '/offline') {
        sessionStorage.setItem('previousPath', location.pathname);
        navigate('/offline', { replace: true });
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (isOffline && location.pathname !== '/offline') {
      sessionStorage.setItem('previousPath', location.pathname);
      navigate('/offline', { replace: true });
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline, navigate, location.pathname]);

  // This component doesn't render anything
  return null;
}

export default OfflineDetector;