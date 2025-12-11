import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const YouTubeContext = createContext();

export function useYouTube() {
  return useContext(YouTubeContext);
}

export function YouTubeProvider({ children }) {
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeChannelInfo, setYoutubeChannelInfo] = useState(null);
  const [checkingYouTube, setCheckingYouTube] = useState(false);
  const [tokenNeedsRefresh, setTokenNeedsRefresh] = useState(false);
  const [youtubeSettings, setYoutubeSettings] = useState({
    defaultPrivacyStatus: "private",
  });
  const { isAuthenticated } = useAuth();

  // Initialize state from localStorage
  useEffect(() => {
    const storedYoutubeConnected = localStorage.getItem("youtubeConnected");
    const storedChannelInfo = localStorage.getItem("youtubeChannelInfo");

    if (storedYoutubeConnected === "true") {
      setYoutubeConnected(true);

      if (storedChannelInfo) {
        try {
          setYoutubeChannelInfo(JSON.parse(storedChannelInfo));
        } catch (error) {
          console.error("Error parsing stored channel info:", error);
        }
      }
    }
  }, []);

  // Check YouTube connection status
  const checkYouTubeConnection = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setCheckingYouTube(true);
      
      const response = await authService.checkYouTubeConnection();
      
      if (response.data && response.data.success) {
        const isConnected = response.data.youtubeConnected;
        setYoutubeConnected(isConnected);

        // Store the connection status in localStorage
        localStorage.setItem(
          "youtubeConnected",
          isConnected ? "true" : "false"
        );

        // Check if token needs refresh
        if (response.data.tokenNeedsRefresh) {
          setTokenNeedsRefresh(true);
        } else {
          setTokenNeedsRefresh(false);
        }

        if (isConnected && response.data.channelInfo) {
          setYoutubeChannelInfo(response.data.channelInfo);
          // Store channel info in localStorage
          localStorage.setItem(
            "youtubeChannelInfo",
            JSON.stringify(response.data.channelInfo)
          );
        } else if (!isConnected) {
          setYoutubeChannelInfo(null);
          localStorage.removeItem("youtubeChannelInfo");
        }
        
        return response.data;
      } else {
        console.warn("Unexpected response format:", response.data);
        return null;
      }
    } catch (error) {
      console.error("Error checking YouTube connection:", error);
      return null;
    } finally {
      setCheckingYouTube(false);
    }
  }, [isAuthenticated]);

  // Handle successful connection
  const handleYouTubeConnected = useCallback(
    (channelInfo) => {
      setYoutubeConnected(true);

      // Store connection status in localStorage
      localStorage.setItem("youtubeConnected", "true");

      if (channelInfo) {
        setYoutubeChannelInfo(channelInfo);
        // Store channel info in localStorage
        localStorage.setItem("youtubeChannelInfo", JSON.stringify(channelInfo));
      }

      // Refresh connection status to get the latest data
      checkYouTubeConnection();
    },
    [checkYouTubeConnection]
  );

  // Check connection status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      checkYouTubeConnection();
    }
  }, [isAuthenticated, checkYouTubeConnection]);

  // Connect YouTube
  const connectYouTube = async () => {
    try {
      const response = await authService.getGoogleAuthUrl();

      if (response.data && response.data.url) {
        window.open(
          response.data.url,
          "youtube_auth",
          "width=800,height=600,menubar=no,toolbar=no,location=no"
        );
        return true;
      } else {
        toast.error("Failed to get YouTube authentication URL");
        return false;
      }
    } catch (error) {
      console.error("Error connecting YouTube:", error);
      toast.error("Failed to connect YouTube account");
      return false;
    }
  };

  // Disconnect YouTube
  const disconnectYouTube = async () => {
    try {
      await authService.disconnectYoutube();
      setYoutubeConnected(false);
      setYoutubeChannelInfo(null);

      // Clear connection status in localStorage
      localStorage.setItem("youtubeConnected", "false");
      localStorage.removeItem("youtubeChannelInfo");

      toast.success("YouTube account disconnected successfully");
      return true;
    } catch (error) {
      console.error("Error disconnecting YouTube:", error);
      toast.error("Failed to disconnect YouTube account");
      return false;
    }
  };

  // Update YouTube settings
  const updateYouTubeSettings = useCallback(async (settings) => {
    setYoutubeSettings((prev) => ({
      ...prev,
      ...settings,
    }));

    // Store settings in localStorage
    const storedSettings = localStorage.getItem("youtubeSettings");
    let parsedSettings = {};

    try {
      if (storedSettings) {
        parsedSettings = JSON.parse(storedSettings);
      }
    } catch (error) {
      console.error("Error parsing stored YouTube settings:", error);
    }

    localStorage.setItem(
      "youtubeSettings",
      JSON.stringify({
        ...parsedSettings,
        ...settings,
      })
    );
  }, []);
  // Initialize settings from localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem("youtubeSettings");

    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setYoutubeSettings((prev) => ({
          ...prev,
          ...parsedSettings,
        }));
      } catch (error) {
        console.error("Error parsing stored YouTube settings:", error);
      }
    }
  }, []);

  // Add this useEffect to listen for localStorage changes
  useEffect(() => {
    // Function to handle storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'youtubeConnected' && e.newValue === 'true') {
        // YouTube was just connected in another window/tab
        checkYouTubeConnection();
      }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkYouTubeConnection]);

  const value = {
    youtubeConnected,
    youtubeChannelInfo,
    setYoutubeChannelInfo,
    youtubeSettings,
    checkingYouTube,
    tokenNeedsRefresh,
    checkYouTubeConnection,
    connectYouTube,
    disconnectYouTube,
    handleYouTubeConnected,
    updateYouTubeSettings,
  };

  return (
    <YouTubeContext.Provider value={value}>{children}</YouTubeContext.Provider>
  );
}



