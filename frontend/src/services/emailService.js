import api from "./api";

export const emailService = {
  sendWelcomeEmail: async (email) => {
    try {
      const response = await api.post("/send-email/welcome", { email });
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to send welcome email");
    }
  },

  // Updated authService.js
  sendForgotPasswordEmail: async (data) => {
    try {
      const email = typeof data === "string" ? data : data.email;

      // Validate email format
      if (!email || typeof email !== "string") {
        throw new Error("Valid email is required");
      }

      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmail)) {
        throw new Error("Please enter a valid email address");
      }

      // Use URLSearchParams to ensure proper formatting
      const formData = new URLSearchParams();
      formData.append("email", cleanEmail);

      const response = await api.post("/send-email/forgot-password", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send forgot password email";
      throw new Error(message);
    }
  },

  sendResetPasswordEmail: async (email) => {
    try {
      // Always expect a plain string email
      const response = await api.post("/send-email/reset-password", { email });
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to send reset password email");
    }
  },

  sendSubscriptionCompletedEmail: async (data) => {
    try {
      const email = typeof data === "string" ? data : data.email;
      const response = await api.post("/send-email/subscription-completed", {
        email,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.message || "Failed to send subscription completed email"
      );
    }
  },

  sendContentLinkEmail: async (data) => {
    try {
      const response = await api.post("/send-email/content-link", data);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to send content link email");
    }
  },
};
