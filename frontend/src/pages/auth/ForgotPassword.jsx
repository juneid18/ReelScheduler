import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/SEO";
import { RiMailLine, RiLoader4Line } from "react-icons/ri";
import toast from "react-hot-toast";
import { authService } from "../../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    toast.error("Please enter your email address");
    return;
  }
  
  if (!emailRegex.test(trimmedEmail)) {
    toast.error("Please enter a valid email address");
    return;
  }

  try {
    setLoading(true);
    
    // Use URLSearchParams to ensure proper formatting
    const formData = new URLSearchParams();
    formData.append('email', trimmedEmail);
    
    // Update your authService.forgotPassword to accept form data
    const response = await authService.forgotPassword(formData);
    
    if (response.success) {
      setSuccess(true);
      toast.success("Password reset email sent successfully!");
    } else {
      toast.error(response.message || "Failed to send reset email");
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    
    // More specific error handling
    if (error.response) {
      // Server responded with error status
      toast.error(
        error.response.data?.message || 
        error.response.data?.error || 
        "Failed to send reset email. Please try again later."
      );
    } else if (error.request) {
      // Request was made but no response received
      toast.error("Network error. Please check your connection.");
    } else {
      // Something else happened
      toast.error("An unexpected error occurred.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <SEO 
        title="Forgot Password"
        description="Reset your ReelScheduler password. Enter your email address and we'll send you a link to create a new password."
        keywords="forgot password, reset password, password recovery, account recovery, social media management"
        noIndex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 py-4 px-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Reset Password
            </h1>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {!success ? (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Forgot your password?
                  </h2>
                  <p className="text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <RiLoader4Line className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RiMailLine className="mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-lg mb-4">
                  <RiMailLine className="text-green-600 text-2xl mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Check your email
                  </h3>
                  <p className="text-green-700">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    try again
                  </button>
                </p>
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  ← Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
