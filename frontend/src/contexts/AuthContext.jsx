import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  // Fetch user plan after authentication state is determined
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPlan();
    }
  }, [isAuthenticated]);

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);

      if (response.success) {
        // Store user and token
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("authToken", response.token);

        setCurrentUser(response.user);
        setIsAuthenticated(true);
      }

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // Refresh User function
  const refreshUser = async () => {
    try {
      const response = await authService.getUser();

      if (response.success) {
        // Update user in localStorage and state
        localStorage.setItem("user", JSON.stringify(response.user));
        setCurrentUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return false;
    }
  };
  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);

      if (response.success) {
        // Store user and token
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("authToken", response.token);

        setCurrentUser(response.user);
        setIsAuthenticated(true);
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Google login function
  const googleLogin = async () => {
    try {
      const response = await authService.getGoogleAuthUrl();

      if (response.data && response.data.url) {
        window.location.href = response.data.url;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return true; // If no token, consider it expired

    try {
      // Simple check for token expiration
      // JWT tokens have three parts separated by dots
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) return true; // Invalid token format

      // The second part contains the payload, which we need to decode
      const payload = JSON.parse(atob(tokenParts[1]));

      // Check if the token has an expiration claim
      if (!payload.exp) return false; // No expiration, consider it valid

      // Compare expiration time with current time
      // exp is in seconds, Date.now() is in milliseconds
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      return currentTime >= expirationTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true; // If there's an error, consider the token expired
    }
  };

  const fetchUserPlan = async () => {
    try {
      const response = await authService.getUserPlan();
      // response.plan is the plan object, fallback to Free if not present
      if (response && response.plan) {
        setUserPlan(response.plan);
        return response.plan;
      }
      // fallback to Free plan object
      setUserPlan({
        name: "Free",
        features: {
          videoUploadsLimit: 5,
          storageLimit: 100,
          maxFileSize: 100,
        },
      });
      return {
        name: "Free",
        features: {
          videoUploadsLimit: 5,
          storageLimit: 100,
          maxFileSize: 100,
        },
      };
    } catch (error) {
      console.error("Error fetching user plan:", error);
      setUserPlan({
        name: "Free",
        features: {
          videoUploadsLimit: 5,
          storageLimit: 100,
          maxFileSize: 100,
        },
      });
      return {
        name: "Free",
        features: {
          videoUploadsLimit: 5,
          storageLimit: 100,
          maxFileSize: 100,
        },
      };
    }
  };

  // Add updateUser function
  const updateUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const value = {
    currentUser,
    refreshUser,
    fetchUserPlan,
    userPlan,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    googleLogin,
    checkTokenExpiration,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

