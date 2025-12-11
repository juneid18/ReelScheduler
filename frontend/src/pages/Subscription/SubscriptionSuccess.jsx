import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiArrowRight,
  FiAlertCircle,
  FiExternalLink,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { subscriptionService } from "../../services/subscriptionService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { emailService } from "../../services/emailService";

const SubscriptionSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Add this function to handle account switching
  const handleAccountSwitch = () => {
    // Store the session ID in localStorage before logging out
    const query = new URLSearchParams(location.search);
    const sessionId = query.get("session_id");
    if (sessionId) {
      localStorage.setItem("pendingCheckoutSession", sessionId);
    }
    
    // Log out and redirect to login
    if (typeof logout === 'function') {
      logout();
    }
    navigate("/login", { 
      state: { 
        from: "/subscription/success",
        message: "Please log in with the account used during checkout."
      } 
    });
  };

  useEffect(() => { 
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const fetchSubscriptionDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the session_id from URL if present
        const query = new URLSearchParams(location.search);
        let rawSessionId = query.get("session_id");
        
        // Handle potential URL encoding issues
        if (rawSessionId && rawSessionId.includes("?session_id=")) {
          // If the value is duplicated, extract the last part
          rawSessionId = rawSessionId.split("?session_id=").pop();
        }
        
        // If there's a session ID, verify the payment
        if (rawSessionId) {
          try {
            // Clean and validate the session ID before sending
            const cleanSessionId = decodeURIComponent(rawSessionId).trim();

            // Validate the session ID format - allow hyphens and underscores
            if (!cleanSessionId.match(/^cs_(test|live)_[a-zA-Z0-9_-]{24,}$/)) {
              console.error("Invalid session ID format:", cleanSessionId);
              throw new Error(
                "Invalid session ID format. Expected format: cs_test_... or cs_live_..."
              );
            }

            const verificationResponse = 
              await subscriptionService.verifyCheckoutSession({
                sessionId: cleanSessionId,
              });
            
            if (verificationResponse?.data?.success) {
              // Refresh the user data to get updated subscription status
              await refreshUser();
              toast.success("Payment successfully verified and subscription activated");
              await emailService.sendSubscriptionCompletedEmail(currentUser.email)
              
              // If the verification response includes subscription data, use it
              if (verificationResponse.data.subscription) {
                setSubscription(verificationResponse.data.subscription);
                setLoading(false);
                return; // Exit early since we already have the subscription data
              }
              
              // Small delay to ensure the user data is refreshed
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              console.error(
                "Verification response indicates failure:",
                verificationResponse
              );
              throw new Error(
                verificationResponse?.data?.message || "Verification failed"
              );
            }
          } catch (error) {
            console.error("Error verifying payment:", error);

            // If it's an invalid session ID, we want to show a user-friendly error
            if (error.message.includes("Invalid session ID")) {
              toast.error(
                "The payment verification link appears to be invalid. Please contact support if this issue persists."
              );
            } else if (error.message.includes("doesn't belong to your account")) {
              // Handle the specific error about session not belonging to user
              toast.error(
                "This payment session doesn't match your account. If you've recently changed accounts, please log in with the account used during checkout."
              );
              setError("This payment session doesn't match your account. Please use the same account that was used during checkout.");
              setLoading(false);
              return;
            } else {
              throw error; // Re-throw other errors to be caught by the outer catch block
            }
          }
        }

        // Get subscription details after verification
        const response = await subscriptionService.getSubscriptionDetails();
        if (response.data?.subscription) {
          setSubscription(response.data.subscription);
        } else {
          throw new Error("No subscription data received");
        }
      } catch (error) {
        console.error("Error verifying subscription:", error);
        // If it's the first error, try once more after 3 seconds
        if (retryCount < 1) {
          setRetryCount((prev) => prev + 1);
          setTimeout(fetchSubscriptionDetails, 3000);
          return;
        }
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to verify subscription. Please contact support.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [
    isAuthenticated,
    navigate,
    location.search,
    location.pathname,
    refreshUser,
    retryCount,
  ]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">
          Verifying your subscription...
          {retryCount > 0 && " This may take a moment..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiAlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Subscription Verification Failed
              </h3>
              <p className="text-red-700 mt-1">{error}</p>
              <div className="mt-4 space-x-3">
                <Link
                  to="/subscription"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Return to Plans
                </Link>
                <a
                  href={`mailto:support@yourdomain.com?subject=Subscription Verification Failed&body=User ID: ${
                    currentUser?._id || "N/A"
                  }%0D%0AError: ${encodeURIComponent(error)}%0D%0ASession ID: ${
                    new URLSearchParams(location.search).get("session_id") || "N/A"
                  }`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Contact Support <FiExternalLink className="ml-2 h-4 w-4" />
                </a>
                {error.includes("doesn't belong to your account") && (
                  <button
                    onClick={handleAccountSwitch}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Switch Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-8 md:p-10 text-center transition-all duration-300 hover:shadow-xl">
    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 animate-bounce-in">
      <FiCheckCircle className="text-green-500 text-4xl" />
    </div>
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-8 mb-4">
      Subscription Activated!
    </h1>
    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
      Thank you for subscribing to our{" "}
      <span className="font-semibold text-primary-600">
        {subscription?.plan?.name || "Premium"}
      </span>{" "}
      plan. Your payment was successful and your subscription is now active.
    </p>

    {subscription && (
      <div className="bg-gray-50 rounded-lg p-6 mb-10 text-left max-w-2xl mx-auto border border-gray-100 transition-all duration-300 hover:border-primary-100">
        <h2 className="text-xl font-semibold mb-4 pb-3 border-b border-gray-200 text-gray-800">
          Subscription Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              label: "Plan Name",
              value: subscription.plan || "Premium Plan",
            },
            {
              label: "Billing Cycle",
              value: subscription.billingCycle || "monthly",
              transform: "capitalize",
            },
            {
              label: "Subscription Status",
              value: subscription.status || "active",
              isStatus: true,
            },
            {
              label: "Next Billing Date",
              value: subscription.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "N/A",
            },
          ].map((item, index) => (
            <div key={index} className="group">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              {item.isStatus ? (
                <p className="text-lg font-semibold mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800 group-hover:bg-green-200"
                        : "bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200"
                    }`}
                  >
                    {item.value}
                  </span>
                </p>
              ) : (
                <p
                  className={`text-lg font-semibold mt-1 text-gray-800 ${
                    item.transform || ""
                  }`}
                >
                  {item.value}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link
        to="/dashboard"
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 transform hover:-translate-y-0.5"
      >
        Go to Dashboard
        <FiArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
      <Link
        to={{
          pathname: "/subscription",
          search: "?subscribed=true"
        }}
        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
      >
        Manage Subscription
      </Link>
    </div>

    <div className="mt-10 text-sm text-gray-500">
      <p>
        Need help?{" "}
        <a
          href="/support"
          className="font-medium text-primary-600 hover:text-primary-500 underline underline-offset-2 transition-colors duration-200"
        >
          Contact our support team
        </a>
      </p>
      <p className="mt-2">
        A receipt has been sent to{" "}
        <span className="font-medium text-gray-600">
          {currentUser?.email || "your email"}
        </span>
      </p>
    </div>
  </div>
</div>
  );
};

export default SubscriptionSuccess;







