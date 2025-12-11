import React, { useState, useEffect } from 'react';
import { RiWifiLine, RiWifiOffLine } from 'react-icons/ri';
import { registerNetworkCallbacks, checkServerReachable } from '../utils/networkUtils';

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check server reachability on mount
    const checkServer = async () => {
      const reachable = await checkServerReachable('/api/health');
      setIsServerReachable(reachable);
      setShowBanner(!reachable);
    };
    
    checkServer();
    
    // Register callbacks for online/offline events
    const cleanup = registerNetworkCallbacks(
      // Online callback
      async () => {
        setIsOnline(true);
        // When we come back online, check if server is reachable
        const reachable = await checkServerReachable('/api/health');
        setIsServerReachable(reachable);
        setShowBanner(!reachable);
      },
      // Offline callback
      () => {
        setIsOnline(false);
        setIsServerReachable(false);
        setShowBanner(true);
      }
    );
    
    return cleanup;
  }, []);
  
  // Hide banner after 5 seconds if we're online and server is reachable
  useEffect(() => {
    let timer;
    if (isOnline && isServerReachable && showBanner) {
      timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOnline, isServerReachable, showBanner]);
  
  if (!showBanner) return null;
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-2 text-center ${isOnline ? 'bg-yellow-100' : 'bg-red-100'}`}>
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <RiWifiLine className="text-yellow-500" />
            <span className="text-yellow-800">
              {isServerReachable 
                ? 'Connection restored!' 
                : 'Connected to internet, but server is unreachable. Please try again later.'}
            </span>
          </>
        ) : (
          <>
            <RiWifiOffLine className="text-red-500" />
            <span className="text-red-800">
              You are offline. Please check your internet connection.
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default NetworkStatus;