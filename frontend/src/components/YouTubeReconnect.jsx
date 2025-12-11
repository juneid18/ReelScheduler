import React from 'react';
import { RiYoutubeLine, RiRefreshLine } from 'react-icons/ri';
import toast from "react-hot-toast";
import { useYouTube } from '../contexts/YouTubeContext';

const YouTubeReconnect = ({ onReconnected }) => {
  const { connectYouTube, isConnecting } = useYouTube();
  
  const handleReconnect = async () => {
    try {
      const success = await connectYouTube();
      
      if (success) {
        toast.success('YouTube reconnection initiated. Please complete the authentication in the popup window.');
        
        // Set up a listener for when the auth window completes
        const checkInterval = setInterval(() => {
          // Check if YouTube is connected every second
          const youtubeStatus = localStorage.getItem('youtubeConnected');
          if (youtubeStatus === 'true') {
            clearInterval(checkInterval);
            toast.success('YouTube reconnected successfully!');
            
            if (onReconnected) {
              onReconnected();
            }
          }
        }, 1000);
        
        // Clear interval after 2 minutes to prevent memory leaks
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 120000);
      }
    } catch (error) {
      console.error('Error reconnecting YouTube:', error);
      toast.error('Failed to reconnect YouTube account');
    }
  };
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <RiYoutubeLine className="h-6 w-6 text-red-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-red-800">YouTube Authentication Required</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              Your YouTube authentication has expired or is invalid. Please reconnect your YouTube account to continue.
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleReconnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="animate-spin mr-2">
                    <RiRefreshLine className="h-5 w-5" />
                  </span>
                  Connecting...
                </>
              ) : (
                <>
                  <RiYoutubeLine className="mr-2 h-5 w-5" />
                  Reconnect YouTube
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeReconnect;