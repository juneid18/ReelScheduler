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

const InstagramContext = createContext();

export function useInstagram() {
  return useContext(InstagramContext);
}

export function InstagramProvider({ children }) {
  const [checkingInstagram, setCheckingInstagram] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  // Check Instagram connection status
  const checkInstagramConnection = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setCheckingInstagram(true);
      const response = await authService.checkInstagramConnection();

      if (response.data && (response.data.connected || response.data.success)) {
        const isConnected =
          response.data.connected ??
          response.data.isConnected ??
          response.data.success;
        setInstagramConnected(!!isConnected);

        // Store the connection status in localStorage
        localStorage.setItem(
          "instagramConnected",
          isConnected ? "true" : "false"
        );

        return response.data;
      } else {
        setInstagramConnected(false);
        return null;
      }
    } catch (error) {
      console.error("Error checking Instagram connection:", error);
      setInstagramConnected(false);
      return null;
    } finally {
      setCheckingInstagram(false);
    }
  }, [isAuthenticated]);

  const value = {
    checkInstagramConnection,
    checkingInstagram,
    setCheckingInstagram,
    instagramConnected,
    setInstagramConnected,
  };

  return (
    <InstagramContext.Provider value={value}>
      {children}
    </InstagramContext.Provider>
  );
}