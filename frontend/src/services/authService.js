import api from "./api";

export const authService = {
  // Get User
  getUser: async () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  },

  // Login function
  login: async (credentials) => {
    try {
      // Make sure we're sending a proper JSON object, not a string
      const response = await api.post("/auth/login", credentials);

      // Store tokens properly
      if (response.data.success && response.data.accessToken) {
        localStorage.setItem("authToken", response.data.accessToken);

        // If there's a refreshToken, store it too
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        // If there's user data, store it
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      if (error.status === 429) {
        // Handle rate limit error specifically
        window.location.href = "/rate-limit-exceeded";
        return { success: false, message: "Rate limit exceeded. Please try again later." };
      }
      throw error;
    }
  },

  // Register function
  register: async (userData) => {
    try {
      // Make sure we're sending a proper JSON object, not a string
      const response = await api.post("/auth/register", userData);

      // Store tokens properly
      if (response.data.success && response.data.accessToken) {
        localStorage.setItem("authToken", response.data.accessToken);

        // If there's a refreshToken, store it too
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        // If there's user data, store it
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      }

      return response.data;
    } catch (error) {
      // If user already exists, return a consistent error object
      if (
        error.response?.data?.message?.toLowerCase().includes("already exists")
      ) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }
      if (error.status === 429) {
        // Handle rate limit error specifically
        window.location.href = "/rate-limit-exceeded";
        return { success: false, message: "Rate limit exceeded. Please try again later." };
      }
      console.error("Register error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Refresh token function
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/auth/refresh-token", { refreshToken });

      if (response.data.accessToken) {
        localStorage.setItem("authToken", response.data.accessToken);

        // If a new refresh token is provided, update it
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
      }

      return response.data;
    } catch (error) {
      console.error(
        "Token refresh error:",
        error.response?.data || error.message
      );
      // If refresh fails, clear tokens and force re-login
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      throw error;
    }
  },

  // Logout function
  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get Google Auth URL - simplified
  getGoogleAuthUrl: async (userId) => {
    try {
      // Add userId as query parameter if provided
      const url = userId
        ? `/auth/youtube/url?userId=${userId}`
        : "/auth/youtube/url";

      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error(
        "Get Google auth URL error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Handle Google callback
  handleGoogleCallback: async (code) => {
    try {
      const response = await api.get(`/auth/google/callback?code=${code}`);
      return response.data;
    } catch (error) {
      console.error(
        "Google callback error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Save YouTube credentials
  saveCredentials: async (credentials) => {
    try {
      const response = await api.post("/auth/save-credentials", credentials);
      return response.data;
    } catch (error) {
      console.error(
        "Save credentials error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Google Auth for YouTube
  GoogleAuth: async () => {
    try {
      const response = await api.get("/auth/youtube/url");
      return response;
    } catch (error) {
      console.error(
        "YouTube auth error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Check YouTube connection
  checkYouTubeConnection: async () => {
    try {
      const response = await api.get("/auth/youtube/check");
      return response;
    } catch (error) {
      console.error(
        "Check YouTube connection error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // For backward compatibility, add this alias
  checkGoogleAuth: async () => {
    try {
      const response = await api.get("/auth/youtube/check");
      return response;
    } catch (error) {
      console.error(
        "Check Google auth error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Update YouTube channel
  updateYoutubeChannel: async () => {
    try {
      const response = await api.get("/auth/youtube/update-channel");
      return response.data; // Return the data directly
    } catch (error) {
      console.error(
        "Update YouTube channel error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Disconnect YouTube
  disconnectYoutube: async () => {
    try {
      const response = await api.post("/auth/youtube/disconnect");
      return response;
    } catch (error) {
      console.error(
        "Disconnect YouTube error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (formData) => {
    try {
      const response = await api.post("/send-email/forgot-password", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // The server responded with an error status
        throw new Error(
          error.response.data?.message || "Failed to send reset email"
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("Network error. Please check your connection.");
      } else {
        // Something happened in setting up the request
        throw new Error(error.message || "Failed to send reset email");
      }
    }
  },

  // Reset password
  resetPassword: async (data) => {
    try {
      const response = await api.post("/auth/reset-password", data);
      return response.data;
    } catch (error) {
      console.error(
        "Reset password error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Change password
  changePassword: async (data) => {
    try {
      const response = await api.post("/auth/change-password", data);
      return response.data;
    } catch (error) {
      console.error(
        "Change password error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Update YouTube settings
  updateYoutubeSettings: async (settings) => {
    try {
      const response = await api.post("/auth/youtube/settings", settings);
      return response;
    } catch (error) {
      console.error(
        "Update YouTube settings error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Update User Profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);

      // Update local storage with new user data if provided
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error(
        "Update profile error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get user plan
  getUserPlan: async () => {
    try {
      const response = await api.post("/auth/user-plan");
      return response.data;
    } catch (error) {
      if (error.status === 429) {
        // Handle rate limit error specifically
        window.location.href = "/rate-limit-exceeded";
        return { success: false, message: "Rate limit exceeded. Please try again later." };
      }
      console.error(
        "Get user plan error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Check Instagram connection
  checkInstagramConnection: async () => {
    try {
      const response = await api.get("/auth/check-instagram");
      return response;
    } catch (error) {
      console.error(
        "Check Instagram connection error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Connect Instagram
  connectInstagram: async (credentials) => {
    try {
      const response = await api.post("/auth/connect-instagram", credentials);
      return response;
    } catch (error) {
      console.error(
        "Connect Instagram error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Disconnect Instagram
  disconnectInstagram: async () => {
    try {
      const response = await api.post("/auth/instagram-disconnect");
      return response;
    } catch (error) {
      console.error(
        "Disconnect Instagram error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Connect Facebook (get OAuth URL)
  connectFacebook: async () => {
    try {
      const response = await api.get("/auth/facebook");
      return response;
    } catch (error) {
      console.error(
        "Connect Facebook error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Disconnect Facebook
  disconnectFacebook: async () => {
    try {
      const response = await api.post("/auth/facebook-disconnect");
      return response;
    } catch (error) {
      console.error(
        "Disconnect Facebook error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Check Facebook connection
  checkFacebookConnection: async () => {
    try {
      const response = await api.get("/auth/check-facebook");
      return response;
    } catch (error) {
      console.error(
        "Check Facebook connection error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get user team members
  getTeamMembers: async () => {
    const res = await api.get("/users/team-members");
    // Filter out removed members just in case
    return {
      ...res.data,
      teamMembers: (res.data.teamMembers || []).filter(
        (tm) => tm.status !== "removed"
      ),
    };
  },
  // Get Team Member Permissions
  getTeamMemberPermissions: async (id) => {
    try {
      const response = await api.get(`/users/team-members/${id}/permissions`);
      return response.data;
    } catch (error) {
      console.error(
        "Get team member permissions error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  inviteTeamMember: async (email) => {
    const res = await api.post("/users/team-members", { email });
    return res.data;
  },
  // Accept team member invitation
  acceptTeamMember: async (teamMemberId) => {
    try {
      const response = await api.post("/users/team/accept", { teamMemberId });
      return response;
    } catch (error) {
      console.error(
        "Accept team member error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  getUserDataById: async (userId) => {
    // Assumes you use axios as api instance
    const res = await api.get(`/users/data?userId=${userId}`);
    return res.data;
  },
  // remove team member
  removeTeamMember: async (teamMemberId) => {
    try {
      const response = await api.delete(`/users/team-members/${teamMemberId}`, {
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Remove team member error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Single remove team member
  SingleRemoveTeamMember: async (teamMemberId) => {
    try {
      const response = await api.delete(
        `/users/single-team-members/${teamMemberId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Remove team member error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  // Change team member permission
  changeTeamMemberPermission: async (teamMemberId, permissions) => {
    try {
      const response = await api.put(
        `/users/team-members/${teamMemberId}/permission`,
        {
          permissions,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Permission update error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to update permission"
      );
    }
  },
  // Get owners
  getOwners: async () => {
    try {
      const response = await api.get("/users/owners");
      return response.data;
    } catch (error) {
      console.error("Get owners error:", error.response?.data || error.message);
      throw error;
    }
  },
  // Get all owners for whom the current user is a team member
  getMyOwners: async () => {
    try {
      const response = await api.get("/users/owners");
      return response.data;
    } catch (error) {
      console.error(
        "Get my owners error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
