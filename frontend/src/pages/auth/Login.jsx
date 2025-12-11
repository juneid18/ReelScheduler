import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SEO from "../../components/SEO";
import {
  RiErrorWarningFill,
  RiGoogleFill,
  RiLoader2Fill,
  RiLoader5Line,
  RiLoginBoxLine,
  RiEyeLine,
  RiEyeOffLine
} from "react-icons/ri";
import toast from "react-hot-toast";
// import { debugApiConfig } from '../../services/api';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to root path

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Validate form
      if (!email.trim() || !password.trim()) {
        setError("Email and password are required");
        setLoading(false);
        return;
      }

      // Create a clean data object
      const loginData = {
        email: email.trim(),
        password: password,
      };

      // Make sure we're sending a proper JavaScript object, not a string
      const result = await login(loginData);

      if (result.success) {
        handleLoginSuccess();
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkApiHealth = async () => {
    try {
      setApiStatus("checking");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`);

      if (response.ok) {
        const data = await response.json();
        setApiStatus("online");
        toast.success("API is online");
        console.log("API health check:", data);
      } else {
        setApiStatus("error");
        toast.error(`API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setApiStatus("offline");
      toast.error(`API is offline: ${error.message}`);
      console.error("API health check failed:", error);
    }
  };

  const debugApiConfig = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "Not set";
    toast.success(`API URL: ${apiUrl}`);

    // Check if we can reach the API
    fetch(`${apiUrl}/health`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(`Status: ${response.status}`);
      })
      .then((data) => {
        console.log("API health check:", data);
        toast.success("API is reachable");
      })
      .catch((error) => {
        console.error("API health check failed:", error);
        toast.error(`API is not reachable: ${error.message}`);
      });
  };

  useEffect(() => {
    // Check if there's a message from the redirect
    if (location.state?.message) {
      toast.success(location.state.message);
    }

    // Check if there's a pending checkout session
    const pendingSession = localStorage.getItem("pendingCheckoutSession");
    if (pendingSession) {
      // We'll handle this after successful login
      console.log("Found pending checkout session:", pendingSession);
    }
  }, [location]);

  const handleLoginSuccess = () => {
    // Check for pending checkout session
    const pendingSession = localStorage.getItem("pendingCheckoutSession");

    if (pendingSession) {
      // Clear the pending session
      localStorage.removeItem("pendingCheckoutSession");

      // Redirect to success page with the session ID
      navigate(`/subscription/success?session_id=${pendingSession}`);
    } else if (location.state?.from) {
      // Otherwise use the normal redirect
      navigate(location.state.from);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <SEO 
        title="Sign In"
        description="Sign in to your ReelScheduler account to access your social media content management dashboard. Manage videos, schedules, and social media accounts."
        keywords="login, sign in, authentication, social media management, content scheduling"
        noIndex={true}
      />
      {/* Logo */}
      <Link to="/" className="flex items-center p-4 fixed">
        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          ReelScheduler
        </span>
      </Link>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with decorative accent */}
        <div className="bg-primary-600 py-4 px-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Welcome Back👋
          </h1>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Sign-in options */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3"
              role="alert"
            >
              <RiErrorWarningFill className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <RiEyeOffLine className="h-5 w-5" />
                    ) : (
                      <RiEyeLine className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RiLoader2Fill className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <RiLoginBoxLine className="h-5 w-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* API Status Warning */}
          {apiStatus === "error" || apiStatus === "offline" ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-start gap-3">
              <RiWifiOffLine className="flex-shrink-0 h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 mb-1">
                  Connection Issue
                </h3>
                <p className="text-xs text-yellow-700 mb-2">
                  We're having trouble connecting to our servers.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={checkApiHealth}
                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2.5 py-1 rounded transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={debugApiConfig}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded transition-colors"
                  >
                    Debug
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>
              © {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || ""}
              . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
    
  );
}

export default Login;
