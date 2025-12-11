import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { subscriptionService } from "../../services/subscriptionService";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  FiCreditCard,
  FiSmartphone,
  FiLoader,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PaymentMethodSelector from "./PaymentMethodSelector";

const Checkout = () => {
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingCycle, setBillingCycle] = useState(
    location.state?.billingCycle || "monthly"
  );
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await subscriptionService.getPlan(planId);
        if (!response.data?.plan) {
          throw new Error("The requested subscription plan could not be found. Please check your plan selection or contact support.");
        }
        setPlan(response.data.plan);
      } catch (error) {
        console.error("Error fetching plan:", error);
        setError(
          error.response?.data?.message ||
            "Failed to load plan details. Please try again."
        );
        toast.error("Failed to load plan details");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, isAuthenticated, navigate, location.pathname]);

  const handleCheckout = async () => {
    if (!plan) return;

    setProcessingPayment(true);
    setError(null);

    try {
      const payload = {
        planId: plan._id,
        billingCycle,
        paymentMethod: selectedPaymentMethod,
        successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/subscription?cancelled=true`,
      };

      // Handle different payment methods
      if (selectedPaymentMethod === 'upi') {
        const response = await subscriptionService.createUpiPayment(payload);
        if (response.data?.redirectUrl) {
          navigate(response.data.redirectUrl);
        } else {
          throw new Error("No redirect URL received for UPI payment");
        }
      } else {
        // Default to Stripe Checkout for card payments
        const response = await subscriptionService.createCheckoutSession(payload);
        if (response.data?.url) {
          window.location.href = response.data.url;
        } else {
          throw new Error("No redirect URL received from server");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during checkout. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiShield className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error || "Plan not found"}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {error
                    ? "We encountered an issue loading this plan."
                    : "The requested plan could not be found."}
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/subscription")}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Browse Available Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const price =
    billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const billingPeriod = billingCycle === "monthly" ? "month" : "year";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Complete Your Subscription
        </h1>
        <p className="mt-2 text-gray-600">
          You're almost there! Just one more step to access premium features.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {plan.name} Plan
                </h2>
                <p className="text-gray-600 mt-1">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  ${price}
                  <span className="text-base font-normal text-gray-600">
                    /{billingPeriod}
                  </span>
                </p>
                {billingCycle === "yearly" && (
                  <p className="text-sm text-green-600 mt-1">
                    Save {plan.yearlyDiscount || "16"}%
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="font-medium text-gray-900">Plan Includes:</h3>
              <ul className="space-y-3">
                {/* Features from plan.features array */}
                {Array.isArray(plan.features) && plan.features.length > 0 && plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-2 text-gray-600">{feature}</span>
                  </li>
                ))}
                {/* Features from plan.features object */}
                {plan.features && typeof plan.features === "object" && !Array.isArray(plan.features) && (
                  <>
                    <li className="flex items-start">
                      <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        {plan.features.videoUploadsLimit} video uploads/month
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        {plan.features.videoStorageDays} days video storage
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        {plan.features.storageLimit} MB storage
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        {plan.features.bundleLimit} bundles
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        {plan.features.scheduleLimit} scheduled posts at once
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        Scheduling options: {Array.isArray(plan.features.schedulingOptions) ? plan.features.schedulingOptions.join(", ") : plan.features.schedulingOptions}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        {plan.features.bulkUpload ? "Bulk upload enabled" : "No bulk upload"}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        {plan.features.teamMembers} team members
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        {plan.features.prioritySupport ? "Priority support" : "Standard support"}
                      </span>
                    </li>
                  </>
                )}
                {/* Fallback if no features */}
                {(!plan.features ||
                  (Array.isArray(plan.features) && plan.features.length === 0)) && (
                  <p className="text-gray-500 text-sm">
                    No features listed for this plan
                  </p>
                )}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Billing Cycle</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`py-3 px-4 rounded-lg border transition-all ${
                    billingCycle === "monthly"
                      ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                      : "bg-gray-50 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span className="block font-medium">Monthly</span>
                  <span className="block text-sm text-gray-600 mt-1">
                    ${plan.monthlyPrice}/month
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`py-3 px-4 rounded-lg border transition-all ${
                    billingCycle === "yearly"
                      ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                      : "bg-gray-50 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span className="block font-medium">Yearly</span>
                  <span className="block text-sm text-gray-600 mt-1">
                    ${plan.yearlyPrice}/year
                    <span className="ml-2 text-green-600">
                      Save {plan.yearlyDiscount || "16"}%
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
            />

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FiShield className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Secure Payment
                  </h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Your payment information is processed securely. We don't
                    store any card details.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiShield className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={processingPayment || !plan}
              className={`mt-6 w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                processingPayment || !plan
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } flex items-center justify-center`}
            >
              {processingPayment ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                `Pay $${price} per ${billingPeriod}`
              )}
            </button>

            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
              <p className="mt-1">
                All payments are processed securely through Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


