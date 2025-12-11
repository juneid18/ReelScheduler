import React from 'react';
import { FaFacebook } from 'react-icons/fa';

const FacebookConnectButton = ({ connected, onConnect }) => {
  return (
    <div className="flex items-center gap-3">
      <FaFacebook className={`text-2xl ${connected ? 'text-blue-600' : 'text-gray-400'}`} />
      {connected ? (
        <span className="text-green-600 font-medium">Facebook Connected</span>
      ) : (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={onConnect}
        >
          Connect Facebook
        </button>
      )}
    </div>
  );
};

export default FacebookConnectButton; 