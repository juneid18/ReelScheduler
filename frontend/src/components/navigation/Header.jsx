import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { subscriptionService } from "../../services/subscriptionService";
import toast from "react-hot-toast";
import {
  RiVipCrownLine,
  RiUser3Line,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiAdminLine,
} from "react-icons/ri";

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Create refs for dropdown menus
  const dropdownRef = useRef(null);
  const planDropdownRef = useRef(null);

  // Toggle dropdown functions
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const togglePlanDropdown = () => setPlanDropdownOpen(!planDropdownOpen);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        planDropdownRef.current &&
        !planDropdownRef.current.contains(event.target)
      ) {
        setPlanDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch subscription info
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      const fetchSubscriptionInfo = async () => {
        try {
          setLoading(true);
          const response = await subscriptionService.getSubscriptionDetails();

          if (response.data.success) {
            setSubscriptionInfo(response.data.subscription);
          } else {
            console.error(
              "Subscription API returned success: false",
              response.data
            );
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
          console.error(
            "Error details:",
            error.response?.data || error.message
          );

          // Don't show error toast for auth errors to avoid spamming the user
          if (
            error.response?.status !== 401 &&
            error.response?.status !== 404
          ) {
            toast.error("Failed to load subscription information");
            console.error(
              "Error details:",
              error.response?.data || error.message
            );
          }

          // If no subscription exists yet, set a default free plan
          setSubscriptionInfo({
            plan: { name: "Free" },
            isFree: true,
            status: "active",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchSubscriptionInfo();
    }
  }, [currentUser, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  // Get plan display name
  const getPlanDisplayName = () => {
    if (!subscriptionInfo) return "Free Plan";
    return subscriptionInfo.plan?.name
      ? `${subscriptionInfo.plan.name} Plan`
      : "Free Plan";
  };

  // Get plan badge color
  const getPlanBadgeColor = () => {
    if (!subscriptionInfo || subscriptionInfo.isFree) {
      return "bg-gray-100 text-gray-800";
    }

    switch (subscriptionInfo.plan?.name) {
      case "Creator":
        return "bg-primary-100 text-primary-800";
      case "Professional":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-gray-900">
              ReelScheduler
            </Link>
          </div>

          <div className="flex items-center">
            {currentUser ? (
              <>
                {/* Subscription Status */}
                {!loading && (
                  <div className="relative mr-4" ref={planDropdownRef}>
                    <button
                      onClick={togglePlanDropdown}
                      className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-gray-50"
                    >
                      <RiVipCrownLine
                        className={`mr-1.5 ${
                          subscriptionInfo?.isFree
                            ? "text-gray-500"
                            : "text-yellow-500"
                        }`}
                      />
                      <span
                        className={`${getPlanBadgeColor()} px-2 py-0.5 rounded-full`}
                      >
                        {getPlanDisplayName()}
                      </span>
                    </button>

                    {/* Plan dropdown */}
                    {planDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            Subscription
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {subscriptionInfo?.isFree
                              ? "You are on the Free plan"
                              : `Active until ${new Date(
                                  subscriptionInfo?.currentPeriodEnd
                                ).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="border-t border-gray-100">
                          <Link
                            to="/subscription"
                            className="block px-4 py-2 text-sm text-primary-600 hover:bg-gray-100"
                            onClick={() => setPlanDropdownOpen(false)}
                          >
                            View all plans
                          </Link>

                          {!subscriptionInfo?.isFree && (
                            <button
                              onClick={async () => {
                                try {
                                  await subscriptionService.cancelSubscription();
                                  toast.success(
                                    "Subscription will be canceled at the end of the billing period"
                                  );
                                  setPlanDropdownOpen(false);
                                  // Refresh subscription info
                                  const response =
                                    await subscriptionService.getSubscriptionDetails();
                                  setSubscriptionInfo(
                                    response.data.subscription
                                  );
                                } catch (error) {
                                  toast.error("Failed to cancel subscription");
                                  console.error(error);
                                }
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Cancel subscription
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User dropdown */}
                <div className="flex items-center relative" ref={dropdownRef}>
                  <span className="mr-4 text-sm text-gray-700 hidden md:inline-block">
                    Welcome, {currentUser.name || "User"}
                  </span>

                  <button
                    className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={toggleDropdown}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 select-none">
                      {currentUser.name
                        ? currentUser.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-10 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="flex items-center">
                          <RiUser3Line className="mr-2" />
                          Profile
                        </div>
                      </Link>

                      <Link
                        to="/youtube-settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="flex items-center">
                          <RiSettings4Line className="mr-2" />
                          YouTube Settings
                        </div>
                      </Link>
                      {currentUser && currentUser.role === "developer" && (
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => navigate("/admin")}
                        >
                          <div className="flex items-center">
                            <RiAdminLine className="mr-2" />
                            Admin Panel
                          </div>
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <RiLogoutBoxRLine className="mr-2" />
                          Logout
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* User is not logged in */}
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
