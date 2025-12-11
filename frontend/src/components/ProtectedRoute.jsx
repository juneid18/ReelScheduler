import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

function ProtectedRoute() {
  const { isAuthenticated, loading, checkTokenExpiration } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check token expiration when route is accessed
  useEffect(() => {
    if (isAuthenticated) {
      const isExpired = checkTokenExpiration();
      if (isExpired) {
        navigate('/login', { state: { tokenExpired: true } });
      }
    }
  }, [isAuthenticated, checkTokenExpiration, navigate]);

  // If authentication is still loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page with the return url
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;

