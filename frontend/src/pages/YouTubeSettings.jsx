import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import {
  RiYoutubeLine,
  RiRefreshLine,
  RiLinkUnlinkM,
  RiLineChartLine,
  RiBarChartBoxLine,
  RiPieChartLine,
  RiLockLine,
  RiGlobalLine,
  RiUserLine,
  RiEyeLine,
  RiThumbUpLine,
  RiSettings3Line,
  RiLink,
  RiSaveLine,
  RiTimeLine,
  RiLoader5Line,
  RiSettings4Line,
  RiAccountPinBoxFill,
  RiEyeOffLine,
} from "react-icons/ri";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { useYouTube } from "../contexts/YouTubeContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";

function YouTubeSettings() {
  const { isAuthenticated } = useAuth();
  const {
    youtubeConnected,
    youtubeChannelInfo,
    checkYouTubeConnection,
    updateYouTubeSettings,
  } = useYouTube();

  const [loading, setLoading] = useState(false);
  const [defaultPrivacyStatus, setDefaultPrivacyStatus] = useState();
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkYouTubeConnection();
    }
  }, [isAuthenticated, checkYouTubeConnection]);

  // Load default privacy status from user settings
  useEffect(() => {
    if (youtubeConnected && youtubeChannelInfo) {
      const storedSettings = localStorage.getItem("youtubeSettings");
      let parsedSettings = {};
      try {
        if (storedSettings) {
          parsedSettings = JSON.parse(storedSettings);
        }
      } catch (error) {
        console.error("Error parsing stored YouTube settings:", error);
      }

      // Set default privacy status from channel info if available
      setDefaultPrivacyStatus(
        parsedSettings?.defaultPrivacyStatus || "private"
      );
    }
  }, [youtubeConnected, youtubeChannelInfo]);

  const handleSavePrivacyStatus = async () => {
    try {
      setSavingPrivacy(true);

      const response = await authService.updateYoutubeSettings({
        defaultPrivacyStatus,
      });

      if (response.data && response.data.success) {
        toast.success("Default privacy settings updated successfully");

        // Update the YouTube context with new settings
        if (typeof updateYouTubeSettings === "function") {
          updateYouTubeSettings({
            defaultPrivacyStatus,
          });
        }
      } else {
        throw new Error(
          response.data?.message || "Failed to update privacy settings"
        );
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      // Destructure for cleaner code
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      // Early validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("All password fields are required");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }

      if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }

      // Call API to change password
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Reset form on success
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Title section with icon */}
          <div className="flex items-center gap-3">
            <RiSettings4Line
              className="text-2xl text-primary-600"
              aria-hidden="true"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Settings
            </h1>
          </div>
        </div>

        {youtubeConnected && (
          <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MdOutlineSupervisorAccount className="mr-2 text-primary-600" />
              Default Upload Settings
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Default Privacy Status
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    value: "private",
                    icon: <RiLockLine className="mr-2" />,
                    label: "Private",
                    description: "Only visible to you and selected users",
                  },
                  {
                    value: "public",
                    icon: <RiGlobalLine className="mr-2" />,
                    label: "Public",
                    description: "Visible to everyone",
                  },
                  {
                    value: "unlisted",
                    icon: <RiLink className="mr-2" />,
                    label: "Unlisted",
                    description: "Visible with link only",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-start p-4 rounded-lg border transition-all cursor-pointer ${
                      defaultPrivacyStatus === option.value
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name="privacyStatus"
                      value={option.value}
                      checked={defaultPrivacyStatus === option.value}
                      onChange={() => setDefaultPrivacyStatus(option.value)}
                    />
                    <div className="flex items-center h-5">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          defaultPrivacyStatus === option.value
                            ? "border-primary-500 bg-primary-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {defaultPrivacyStatus === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex flex-col">
                      <span className="block text-sm font-medium text-gray-900 flex items-center">
                        {option.icon}
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {option.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSavePrivacyStatus}
                className={`btn ${
                  savingPrivacy
                    ? "bg-primary-400"
                    : "bg-primary-600 hover:bg-primary-700"
                } text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center`}
                disabled={savingPrivacy}
              >
                {savingPrivacy ? (
                  <>
                    <RiLoader5Line className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <RiSaveLine className="mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white mt-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Change Password
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ensure your account is secure with a strong password
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
          <div className="space-y-5">
            <div className="relative">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input pl-10 pr-10 py-3 w-full bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                </button>
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input pl-10 pr-10 py-3 w-full bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showNewPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                </button>
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters
              </p>
            </div>

            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input pl-10 pr-10 py-3 w-full bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                </button>
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className={`btn inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all
          ${
            loading
              ? "bg-blue-100 text-blue-700 cursor-not-allowed"
              : "bg-gradient-to-br from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-sm"
          }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700"
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
                  Updating...
                </>
              ) : (
                <>
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default YouTubeSettings;
