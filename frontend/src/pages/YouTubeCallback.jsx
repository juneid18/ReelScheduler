import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from "react-hot-toast";

function YouTubeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing YouTube connection...');
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const channelInfoParam = searchParams.get('channelInfo');
        
        setStatus(success === 'true' 
          ? 'Connection successful! Redirecting...'
          : 'Connection failed! Redirecting...');
        
        // Add small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (success === 'true') {
          // Set connection status in localStorage
          localStorage.setItem('youtubeConnected', 'true');
          
          // If channel info was passed, store it
          if (channelInfoParam) {
            try {
              const channelInfo = JSON.parse(decodeURIComponent(channelInfoParam));
              localStorage.setItem('youtubeChannelInfo', JSON.stringify(channelInfo));
            } catch (e) {
              console.error('Error parsing channel info:', e);
            }
          }
          
          // Set a flag to trigger refresh on dashboard
          localStorage.setItem('youtubeJustConnected', 'true');
          
          toast.success('Successfully connected to YouTube!');
          
          // Close this window and signal the opener
          if (window.opener) {
            // Signal the opener window that auth is complete
            window.opener.postMessage({ type: 'YOUTUBE_AUTH_COMPLETE', success: true }, '*');
            window.close();
          } else {
            // If no opener, navigate to dashboard with success param
            navigate('/dashboard?youtube=connected');
            window.close();
          }
        } else {
          const errorMessage = error || 'Unknown error occurred';
          toast.error(`Failed to connect to YouTube: ${errorMessage}`);
          console.error('YouTube connection error:', errorMessage);
          
          if (window.opener) {
            // Signal the opener window that auth failed
            window.opener.postMessage({ type: 'YOUTUBE_AUTH_COMPLETE', success: false }, '*');
            window.close();
          } else {
            // If no opener, navigate to dashboard with error param
            navigate('/dashboard?youtube=error');
          }
        }
      } catch (err) {
        console.error('Callback handling error:', err);
        toast.error('An unexpected error occurred');
        setStatus('Error occurred! Redirecting...');
        
        if (window.opener) {
          window.close();
        } else {
          navigate('/dashboard');
        }
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleCallback();
  }, [searchParams, navigate]);
  
  return (
    <div className="fixed right-0 top-0 h-screen w-screen z-50 flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{status}</h2>
        <p className="text-gray-600 mb-8">
          {isProcessing ? 'Please wait while we complete the connection...' : 'Redirecting to dashboard...'}
        </p>
        {isProcessing && (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        )}
      </div>
    </div>
  );
}

export default YouTubeCallback;
