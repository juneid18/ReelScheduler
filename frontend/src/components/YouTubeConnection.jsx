import React, { useState, useEffect } from "react";
import { Button, Card, Alert, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { FiYoutube } from "react-icons/fi";

function YouTubeConnection({ onConnect, onDisconnect }) {
  const [connected, setConnected] = useState(false);
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check YouTube connection status on component mount
  useEffect(() => {
    checkYouTubeConnection();
  }, []);

  const checkYouTubeConnection = async () => {
    try {
      setChecking(true);
      
      const response = await authService.checkYouTubeConnection();
      
      if (response.data) {
        setConnected(response.data.youtubeConnected || false);
        setChannelInfo(response.data.channelInfo || null);
      }
    } catch (error) {
      console.error("Error checking YouTube connection:", error);
    } finally {
      setChecking(false);
    }
  };
  
  const handleConnect = async () => {
    try {
      setLoading(true);
      
      // Get current user ID from localStorage
      const userString = localStorage.getItem("user");
      let userId = null;
      
      if (userString) {
        try {
          const user = JSON.parse(userString);
          userId = user.id || user._id;
        } catch (parseError) {
          console.error("Error parsing user from localStorage:", parseError);
        }
      }
      
      // Get the auth URL directly (no credentials needed)
      const response = await authService.getGoogleAuthUrl(userId);
      
      if (response.data && response.data.url) {
        // Open the auth URL in a new window
        const authWindow = window.open(
          response.data.url, 
          'youtube_auth', 
          'width=800,height=600,menubar=no,toolbar=no,location=no'
        );
        
        // Check if popup was blocked
        if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
          toast.error("Popup blocked! Please allow popups for this site and try again.");
        } else {
          // Set up a listener for when the auth window completes
          const checkWindowClosed = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkWindowClosed);
              
              // Check connection status after window is closed
              checkYouTubeConnection().then(() => {
                if (onConnect) {
                  onConnect();
                }
              });
            }
          }, 500);
        }
      } else {
        toast.error("Failed to get YouTube authentication URL");
      }
    } catch (error) {
      console.error("Error connecting to YouTube:", error);
      toast.error("Failed to connect to YouTube. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      setLoading(true);
      
      const response = await authService.disconnectYoutube();
      
      if (response.data && response.data.success) {
        toast.success("YouTube account disconnected successfully");
        await checkYouTubeConnection();
        
        if (onDisconnect) {
          onDisconnect();
        }
      } else {
        toast.error("Failed to disconnect YouTube account");
      }
    } catch (error) {
      console.error("Error disconnecting YouTube:", error);
      toast.error("Failed to disconnect YouTube account. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (checking) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Checking YouTube connection...</p>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>YouTube Connection</Card.Title>
        
        {connected ? (
          <>
            <Alert variant="success">
              <i className="fas fa-check-circle me-2"></i>
              Your YouTube account is connected
            </Alert>
            
            {channelInfo && (
              <div className="d-flex align-items-center mb-3">
                {channelInfo.thumbnail && (
                  <img 
                    src={channelInfo.thumbnail} 
                    alt="Channel thumbnail" 
                    className="me-3" 
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                  />
                )}
                <div>
                  <h5 className="mb-0">{channelInfo.title}</h5>
                  {channelInfo.customUrl && (
                    <a 
                      href={`https://youtube.com/${channelInfo.customUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      @{channelInfo.customUrl}
                    </a>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              variant="outline-danger" 
              onClick={handleDisconnect}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Disconnecting...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-unlink me-2"></i>
                  Disconnect YouTube
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Alert variant="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Your YouTube account is not connected
            </Alert>
            
            <p>
              Connect your YouTube account to upload videos directly from ReelScheduler.
            </p>
            
            <Button 
              variant="primary" 
              onClick={handleConnect}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Connecting...</span>
                </>
              ) : (
                <>
                  <i className="fab fa-youtube me-2"></i>
                  Connect YouTube
                </>
              )}
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default YouTubeConnection;
