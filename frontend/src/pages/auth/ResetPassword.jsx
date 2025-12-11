import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SEO from "../../components/SEO";
import { authService } from "../../services/authService";
import { emailService } from "../../services/emailService";
import toast from "react-hot-toast";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    
    const tokenFromUrl = queryParams.get("token");
    const emailFromUrl = queryParams.get("email");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
    }

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsSubmitting(true);

      // Call the API to reset password
      const result = await authService.resetPassword({ token, password });

      if (result.success) {
        try {
          await emailService.sendResetPasswordEmail(email);
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Continue even if confirmation email fails
        }
        toast.success("Password has been reset successfully");
        // Send confirmation email if we have the email

        navigate("/login");
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTokenValid) {
    return (
      <>
        <SEO 
          title="Invalid Reset Link"
          description="The password reset link is invalid or has expired. Please request a new password reset link."
          keywords="invalid reset link, expired link, password reset error"
          noIndex={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              The password reset link is invalid or has expired.
            </p>
          </div>
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-primary-600 hover:text-primary-500"
            >
              Request a new password reset link
            </Link>
          </div>
        </div>
      </div>
    </>
    );
  }

  return (
    <>
      <SEO 
        title="Reset Password"
        description="Create a new password for your ReelScheduler account. Enter your new password to complete the password reset process."
        keywords="reset password, new password, password change, account security, social media management"
        noIndex={true}
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSubmitting ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : null}
              Reset Password
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

export default ResetPassword;
