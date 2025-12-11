import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SEO from "../../components/SEO";
import { RiUserAddLine, RiGoogleFill, RiLoader2Fill, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { authService } from "../../services/authService";
import { emailService } from "../../services/emailService";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("unknown");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // Validate form
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.password.trim()
      ) {
        setError("All fields are required");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setLoading(true);

      // Create a clean data object with only the required fields
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      // Try using the register function from useAuth, but fall back to authService if needed
      let result;
      try {
        if (typeof register === "function") {
          result = await register(registrationData);
        } else {
          // Fall back to using authService directly
          result = await authService.register(registrationData);
        }

        if (result.success) {
          await emailService.sendWelcomeEmail(result.user.email);
          toast.success("Registration successful! Redirecting to dashboard...");
          navigate("/dashboard");
        } else {
          // Check if the error is "user already exists"
          if (
            result.message &&
            result.message.toLowerCase().includes("already exists")
          ) {
            toast.error(
              "This email is already registered. Redirecting to login page.",
              {
                onClose: () => {
                  navigate("/login");
                },
              }
            );
          } else {
            setError(result.message || "Registration failed");
          }
        }
      } catch (err) {
        console.error("Registration submission error:", err);

        if (err.response?.status === 404) {
          setApiStatus("error");
          setError(
            "API endpoint not found. Please check server configuration."
          );
          toast.error("Server endpoint not found. Please contact support.");
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to create an account"
          );
        }
      }
    } catch (err) {
      setError(err.message || "Failed to create an account");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkApiHealth = async () => {
    try {
      setApiStatus("checking");
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/health`);

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

  // const handleGoogleLogin = () => {
  //   googleLogin();
  // };

  return (
    <>
      <SEO 
        title="Create Account"
        description="Join ReelScheduler today and start managing your social media content like a pro. Create your free account to access powerful scheduling tools and analytics."
        keywords="sign up, register, create account, social media management, content scheduling, free account"
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
              Join Us Today
            </h1>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header text */}
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Create your account
              </h2>
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Error Messages */}
            {error && (
              <div
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3"
                role="alert"
              >
                <svg
                  className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {apiStatus === "error" || apiStatus === "offline" ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 mb-1">
                    Connection Issue
                  </h3>
                  <p className="text-xs text-yellow-700 mb-2">
                    We're having trouble connecting to our servers.
                  </p>
                  <button
                    onClick={checkApiHealth}
                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2.5 py-1 rounded transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            ) : null}

            {/* Registration Form */}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

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
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 focus:outline-none"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <RiEyeOffLine className="h-5 w-5" />
                      ) : (
                        <RiEyeLine className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    required
                    checked={formData.agreeTerms || null}
                    onChange={handleChange}
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="ml-3 block text-sm text-gray-700"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Terms of Service{" "}
                  </Link>
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <RiLoader2Fill className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Creating account...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </form>
            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>
                © {new Date().getFullYear()}{" "}
                {import.meta.env.VITE_APP_NAME || ""}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
