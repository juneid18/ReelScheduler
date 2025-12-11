import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import toast from "react-hot-toast";
import { authService } from "../services/authService";

function Account({userId}) {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ownerUser, setOwnerUser] = useState(null);

  useEffect(() => {
    // Fetch owner user data if team member
    const fetchOwnerUser = async () => {
      try {
        setLoading(true);
        const res = await authService.getUser();
        if (res && res.user) {
          setOwnerUser(res.user);
        }
      } catch (err) {
        console.error('Error fetching owner user data:', err);
        toast.error('Failed to load account information');
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerUser();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Account</h1>
          <p className="mb-4">You are not logged in.</p>
          <Link to="/auth/login" className="btn btn-primary">
            Log In
          </Link>
        </div>
      </div>
    );
  }
  
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Information</h1>
            <p className="text-gray-500 mt-1">Manage your account details and settings</p>
          </div>
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold select-none">
            {(() => {
              const displayName = ownerUser?.name || currentUser?.name;
              return (typeof displayName === 'string' && displayName.length > 0)
                ? displayName.charAt(0).toUpperCase()
                : 'U';
            })()}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{ownerUser?.name || currentUser?.name || 'User'}</h2>
            <p className="text-gray-600">{ownerUser?.email || currentUser?.email || 'No email provided'}</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">User ID</p>
                  <p className="font-mono text-sm text-gray-800 break-all select-none">
                    {currentUser?.id || 'Unknown'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Account Status</p>
                  <div className="flex items-center">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-gray-800">Active</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Session Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Authentication</p>
                  <div className="flex items-center">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-gray-800">Authenticated</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Token Status</p>
                  <div className="flex items-center">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-gray-800">Valid</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing out...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;