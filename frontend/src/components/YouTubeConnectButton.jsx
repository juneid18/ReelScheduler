import React, { useState, useEffect, useRef } from "react";
import { FiYoutube, FiLoader } from "react-icons/fi";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

const YouTubeConnectButton = ({ onConnect, checkYouTubeConnection }) => {
  const [loading, setLoading] = useState(false);
  const [authWindowOpen, setAuthWindowOpen] = useState(false);
  const authWindowRef = useRef(null);
  const checkAuthIntervalRef = useRef(null);

  // Clean up intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      if (checkAuthIntervalRef.current) {
        clearInterval(checkAuthIntervalRef.current);
      }
    };
  }, []);

  // Check if popup is closed
  const checkPopupClosed = () => {
    if (authWindowRef.current && authWindowRef.current.closed) {
      setAuthWindowOpen(false);
      setLoading(false);
      if (checkAuthIntervalRef.current) {
        clearInterval(checkAuthIntervalRef.current);
      }
      toast.error("Authentication window was closed.");
      return true;
    }
    return false;
  };

  // Handle auth completion via localStorage
  useEffect(() => {
    if (authWindowOpen) {
      checkAuthIntervalRef.current = setInterval(() => {
        // First check if window was manually closed
        if (checkPopupClosed()) return;

        // Then check for auth completion
        const authCompleted = localStorage.getItem("youtubeAuthCompleted");
        if (authCompleted === "true") {
          cleanupAuthProcess();
          if (onConnect) onConnect();
          toast.success("YouTube account connected successfully!");
        }
      }, 1000);

      // Fallback timeout
      const timeoutId = setTimeout(() => {
        cleanupAuthProcess();
        toast.error("Authentication timed out. Please try again.");
      }, 5 * 60 * 1000); // 5 minutes

      return () => {
        clearInterval(checkAuthIntervalRef.current);
        clearTimeout(timeoutId);
      };
    }
  }, [authWindowOpen, onConnect]);

  // Handle auth completion via postMessage
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "YOUTUBE_AUTH_COMPLETE") {
        cleanupAuthProcess();
        if (event.data.success) {
          if (checkYouTubeConnection) checkYouTubeConnection();
          if (onConnect) onConnect();
          toast.success("YouTube account connected successfully!");
        } else {
          toast.error("Failed to connect YouTube account.");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkYouTubeConnection, onConnect]);

  const cleanupAuthProcess = () => {
    localStorage.removeItem("youtubeAuthCompleted");
    setAuthWindowOpen(false);
    setLoading(false);
    if (checkAuthIntervalRef.current) {
      clearInterval(checkAuthIntervalRef.current);
    }
    authWindowRef.current = null;
  };

  const handleConnect = async () => {
    try {
      setLoading(true);

      const userString = localStorage.getItem("user");
      const userId = userString ? JSON.parse(userString).id || JSON.parse(userString)._id : null;

      const response = await authService.getGoogleAuthUrl(userId);

      if (response.data?.url) {
        localStorage.removeItem("youtubeAuthCompleted");
        
        authWindowRef.current = window.open(
          response.data.url,
          "youtube_auth",
          "width=800,height=600,menubar=no,toolbar=no,location=no"
        );

        if (!authWindowRef.current) {
          toast.error("Popup blocked! Please allow popups for this site.");
          setLoading(false);
        } else {
          setAuthWindowOpen(true);
          toast("Please complete the authentication in the popup window.", {
            icon: "ℹ️",
            style: {
              background: "#e0f2fe",
              color: "#0369a1",
              border: "1px solid #bae6fd",
            },
          });

          // Add periodic check for popup closure
          const popupCheckInterval = setInterval(() => {
            if (checkPopupClosed()) {
              clearInterval(popupCheckInterval);
            }
          }, 1000);
        }
      } else {
        throw new Error("No auth URL received");
      }
    } catch (error) {
      console.error("Error connecting YouTube:", error);
      toast.error("Failed to connect YouTube account");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      disabled={loading || authWindowOpen}
    >
      {loading || authWindowOpen ? (
        <>
          <FiLoader className="animate-spin mr-2" />
          {authWindowOpen ? "Awaiting authentication..." : "Connecting..."}
        </>
      ) : (
        <>
          <FiYoutube className="mr-2" />
          Connect YouTube
        </>
      )}
    </button>
  );
};

export default YouTubeConnectButton;