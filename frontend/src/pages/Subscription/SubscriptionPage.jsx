import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiCheck, FiX, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { subscriptionService } from "../../services/subscriptionService";
import SEO from "../../components/SEO";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SubscriptionPage = () => {
  const { isAuthenticated } = useAuth();
  const [selectedBillingCycle, setSelectedBillingCycle] = useState("monthly");
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch plans
        const plansResponse = await subscriptionService.getPlans();

        if (!plansResponse.data || !plansResponse.data.success) {
          toast.error("Failed to load plans");
          setPlans([]);
        } else {
          setPlans(plansResponse.data.plans || []);
        }

        // Fetch current subscription if authenticated
        if (isAuthenticated) {
          try {
            const subscriptionResponse =
              await subscriptionService.getSubscriptionDetails();

            if (
              subscriptionResponse.data &&
              subscriptionResponse.data.success
            ) {
              setCurrentPlan(subscriptionResponse.data.subscription.plan);
            }
          } catch (subError) {
            console.error("Error fetching subscription:", subError);
            // Don't show error toast for subscription errors to avoid spamming
          }
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast.error("Failed to load subscription information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    // Auto-reload subscription status if redirected from success
    if (
      location.state?.subscribed ||
      new URLSearchParams(location.search).get("subscribed") === "true"
    ) {
      // Refetch subscription details
      if (isAuthenticated) {
        subscriptionService.getSubscriptionDetails().then((subscriptionResponse) => {
          if (
            subscriptionResponse.data &&
            subscriptionResponse.data.success
          ) {
            setCurrentPlan(subscriptionResponse.data.subscription.plan);
            toast.success("Subscription updated!");
          }
        });
      }
      // Optionally clear the state to avoid repeated reloads
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [isAuthenticated, location.state, location.search]);

  const isCurrentPlan = (planName) => {
    if (!currentPlan) return planName === "Free";
    return currentPlan.name === planName;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleSelectPlan = (plan) => {
    if (!plan || !plan._id) {
      toast.error("Invalid plan selected. Please try again.");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/subscription` } });
      return;
    }

    // Check if this is already the user's current plan
    if (isCurrentPlan(plan.name)) {
      toast(`You are already subscribed to the ${plan.name} plan.`, {
        icon: "ℹ️",
      });
      navigate("/subscription/details");
      return;
    }

    // Navigate to checkout with the selected plan
    navigate(`/subscription/checkout/${plan._id}`, {
      state: { billingCycle: selectedBillingCycle },
    });
  };

  return (
    <>
      <SEO 
        title="Subscription Plans"
        description="Choose the perfect subscription plan for your content creation needs. From free to premium plans with advanced features for social media management."
        keywords="subscription plans, pricing, premium features, social media management, content scheduling plans, paid plans"
        ogTitle="Subscription Plans - Choose Your Perfect Plan"
        ogDescription="Choose the perfect subscription plan for your content creation needs. From free to premium plans with advanced features."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "ReelScheduler Subscription Plans",
          "description": "Social media content management subscription plans",
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }}
      />
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the plan that best fits your content creation needs. Upgrade
            or downgrade anytime.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center mt-8">
            <span
              className={`text-sm ${
                selectedBillingCycle === "monthly"
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <button
              className="relative mx-4 rounded-full w-14 h-7 bg-primary-100 flex items-center transition-colors focus:outline-none"
              onClick={() =>
                setSelectedBillingCycle(
                  selectedBillingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
            >
              <span
                className={`absolute left-1 top-1 bg-primary-600 w-5 h-5 rounded-full transition-transform transform ${
                  selectedBillingCycle === "yearly" ? "translate-x-7" : ""
                }`}
              />
            </button>
            <span
              className={`text-sm ${
                selectedBillingCycle === "yearly"
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              Yearly{" "}
              <span className="text-green-500 font-medium">(Save 17%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isCurrent = isCurrentPlan(plan.name);
            const isHighlighted = plan.name === "Creator";

            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-all ${
                  isHighlighted
                    ? "md:-translate-y-4 ring-2 ring-primary-500"
                    : ""
                }`}
              >
                {isHighlighted && (
                  <div className="bg-primary-500 text-white text-center py-1.5 text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-end">
                    <span className="text-4xl font-bold text-gray-900">
                      {selectedBillingCycle === "monthly"
                        ? `$${plan.monthlyPrice}`
                        : `$${plan.yearlyPrice}`}
                    </span>
                    <span className="text-gray-500 ml-1 mb-1">
                      /{selectedBillingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    {isCurrent ? (
                      <div className="w-full py-3 rounded-lg font-medium text-center bg-green-100 text-green-800">
                        Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-3 rounded-lg font-medium text-center transition-colors ${
                          isHighlighted
                            ? "bg-primary-600 text-white hover:bg-primary-700"
                            : "border border-primary-600 text-primary-600 hover:bg-primary-50"
                        }`}
                      >
                        {plan.name === "Free" ? "Get Started" : "Subscribe Now"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Features</h4>
                  <ul className="space-y-3">
                    {Object.entries(plan.features || {}).map(
                      ([key, value], i) => {
                        let displayText;
                        let included = true;

                        switch (key) {
                          case "videoUploadsLimit":
                            displayText =
                              value === -1
                                ? "Unlimited video uploads"
                                : `${value} video uploads per month`;
                            break;
                          case "videoStorageDays":
                            displayText = `${value}-day video storage`;
                            break;
                          case "storageLimit":
                            displayText =
                              value >= 1000
                                ? `${value / 1000}GB storage limit`
                                : `${value}MB storage limit`;
                            break;
                          case "bundleLimit":
                            displayText =
                              value === -1
                                ? "Unlimited content bundles"
                                : `${value} content bundles`;
                            break;
                          case "scheduleLimit":
                            displayText =
                              value === -1
                                ? "Unlimited active schedules"
                                : `${value} active schedule${
                                    value !== 1 ? "s" : ""
                                  }`;
                            break;
                          case "schedulingOptions":
                            displayText = Array.isArray(value)
                              ? `${
                                  value.length === 3 ? "All" : value.join(", ")
                                } scheduling options`
                              : "Basic scheduling";
                            break;
                          case "prioritySupport":
                            displayText = value
                              ? "Priority support"
                              : "Standard support";
                            included = value;
                            break;
                          case "bulkUpload":
                            displayText = "Bulk upload feature";
                            included = value;
                            break;
                          default:
                            displayText = `${key}: ${value}`;
                        }

                        return (
                          <li key={i} className="flex items-start">
                            {included ? (
                              <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                            ) : (
                              <FiX className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                            )}
                            <span
                              className={
                                included ? "text-gray-700" : "text-gray-400"
                              }
                            >
                              {displayText}
                            </span>
                          </li>
                        );
                      }
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need a custom plan?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            If you have specific requirements or need a tailored solution for
            your team or enterprise, we're here to help.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Contact Us <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default SubscriptionPage;
