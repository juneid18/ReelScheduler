import api from "./api";

export const subscriptionService = {
  // Get all subscription plans
  getPlans: async () => {
    try {
      const response = await api.get("/subscriptions/plans");
      return response;
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw error;
    }
  },

  // Get a specific plan by ID
  getPlan: async (planId) => {
    try {
      // Validate planId before making the request
      if (!planId || planId === "undefined" || planId === "null") {
        throw new Error("Invalid plan ID provided");
      }

      const response = await api.get(`/subscriptions/plans/${planId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching plan ${planId}:`, error);
      throw error;
    }
  },

  // Create subscription with card payment
  createSubscription: async (subscriptionData) => {
  try {
    const response = await api.post(
      "/subscriptions", // Simplified path
      subscriptionData
    );
    return response;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
},

  // Create subscription with UPI payment
  createUpiSubscription: async (subscriptionData) => {
  try {
    const response = await api.post(
      "/subscriptions/upi", // Simplified path
      subscriptionData
    );
    return response;
  } catch (error) {
    console.error("Error creating UPI subscription:", error);
    throw error;
  }
},

  // Create UPI payment intent (for UPI payment flow)
  createUpiPayment: async (paymentData) => {
    try {
      const response = await api.post(
        "/subscriptions/upi-payment", // Corrected endpoint
        paymentData
      );
      return response;
    } catch (error) {
      console.error("Error creating UPI payment:", error);
      throw error;
    }
  },

  // Verify checkout session
  verifyCheckoutSession: async (sessionData) => {
    try {
      if (!sessionData?.sessionId) {
        throw new Error("Session ID is required");
      }

      // Clean and validate session ID
      const sessionId = sessionData.sessionId;

      // No need to decode or clean here since it's done in SubscriptionSuccess.jsx
      const response = await api.post(
        "/subscriptions/verify-checkout-session",
        { sessionId }
      );
      return response;
    } catch (error) {
      console.error("Error verifying checkout session:", error);

      // Enhance error message for client
      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data.message || "Invalid session data";
        throw new Error(errorMessage);
      } else if (error.response?.status === 404) {
        throw new Error("Checkout session not found");
      } else if (error.response?.status === 403) {
        // Specifically handle the 403 error for mismatched customer ID
        throw new Error("This checkout session doesn't belong to your account");
      } else {
        // For other errors, use the response message if available
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
    }
  },

  // Check UPI payment status
  checkUpiPaymentStatus: async (paymentIntentId) => {
    try {
      // Corrected endpoint to match backend
      const response = await api.get(
        `/subscriptions/upi/status/${paymentIntentId}` // Corrected endpoint
      );
      return response;
    } catch (error) {
      console.error("Error checking UPI payment status:", error);
      throw error;
    }
  },

  // Save subscription data (for free plans or additional info)
  saveSubscriptionData: async (subscriptionData) => {
    try {
      // Corrected endpoint to match backend
      const response = await api.post(
        "/subscriptions/data",
        subscriptionData
      );
      return response;
    } catch (error) {
      console.error("Error saving subscription data:", error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      // Corrected endpoint to match backend
      const response = await api.post("/subscriptions/cancel");
      return response;
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  },

  // Get subscription details
  getSubscriptionDetails: async () => {
    try {
      // Make sure this path matches your backend route
      const response = await api.get("/subscriptions/details");
      return response;
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      throw error;
    }
  },

  // Get billing history
  getBillingHistory: async () => {
    try {
      // Corrected endpoint to match backend
      const response = await api.get(
        "/subscriptions/billing-history"
      );
      return response;
    } catch (error) {
      console.error("Error fetching billing history:", error);
      throw error;
    }
  },

  // Reactivate a canceled subscription
  reactivateSubscription: async () => {
    try {
      // Corrected endpoint to match backend
      const response = await api.post(
        "/subscriptions/reactivate"
      );
      return response;
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      throw error;
    }
  },

  // Create Stripe Checkout session
  createCheckoutSession: async (checkoutData) => {
    try {
      const response = await api.post(
        "/subscriptions/checkout-session",
        checkoutData
      );
      return response;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  },

  // Add a test debug endpoint
  testDebug: async () => {
    try {
      const response = await api.get("/subscriptions/debug");
      return response;
    } catch (error) {
      console.error("Error testing subscription debug endpoint:", error);
      throw error;
    }
  },
};

export default subscriptionService;
