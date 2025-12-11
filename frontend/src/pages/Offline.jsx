import React from 'react';
import { Link } from 'react-router-dom';
import { RiWifiOffLine, RiRefreshLine } from 'react-icons/ri';

function Offline() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-6xl text-primary-600 mb-4">
        <RiWifiOffLine />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Offline</h1>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        It looks like you've lost your internet connection. Please check your connection and try again.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleRefresh}
          className="btn btn-primary flex items-center justify-center gap-2"
        >
          <RiRefreshLine />
          Refresh Page
        </button>
        <Link to="/" className="btn btn-outline">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Offline;