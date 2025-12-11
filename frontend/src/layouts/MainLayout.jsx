import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import { useState, useEffect } from 'react';

function MainLayout() {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [timeoutExpired, setTimeoutExpired] = useState(false);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.log('Loading timeout expired');
        setTimeoutExpired(true);
      }, 5000); // 5 seconds timeout
      
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // Show loading state with timeout fallback
  if (loading) {
    if (timeoutExpired) {
      // If loading takes too long, show an error message
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-600 mb-4">Loading is taking longer than expected.</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Note: We've removed the redirect for non-authenticated users
  // since we're now using ProtectedRoute to handle authentication
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

