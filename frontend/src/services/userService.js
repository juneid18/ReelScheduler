import api from "./api";

export const userService = {
  // Get current user's plan details
  getCurrentUserPlan: async () => {
    try {
      const response = await api.post("/auth/user-plan");
      return response.data;
    } catch (error) {
      console.error("Error fetching user plan:", error);
      // Return default free plan if API call fails
      return {
        plan: {
          name: "Free",
          features: {
            videoUploadsLimit: 5,
            storageLimit: 100, // 100MB (matching seedPlans.js)
            maxFileSize: 100 // 100MB per file
          }
        }
      };
    }
  },
  // Send Feedback Email
  sendFeedbackEmail: async (email, subject, message) => {
    try {
      const response = await api.post("/send-email/feedback", {
        email,
        subject,
        message
      });
      return response.data;
    } catch (error) {
      console.error("Error sending feedback email:", error);
      throw error;
    }
  },
  // Send Contact Us Email
  sendContactUsEmail: async (email, subject, message) => {
    try {
      const response = await api.post("/send-email/contact-us", {
        email,
        subject,
        message
      });
      return response.data;
    } catch (error) {
      console.error("Error sending contact us email:", error);
      throw error;
    }
  },
  // Get Owner Profile
  getOwnerProfile: async () => {
    const response = await api.get("/users/owner-profile");
    return response.data;
  },
  // Update Owner Profile
  updateOwnerProfile: async (profileData) => {
    const response = await api.put("/users/owner-profile", profileData);
    return response.data;
  }
};

export default userService;

