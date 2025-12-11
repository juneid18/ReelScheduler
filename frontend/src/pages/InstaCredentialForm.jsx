import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiInstagram, FiLink, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { authService } from "../services/authService";

const InstaCredentialForm = ({
  isOpen,
  onClose,
  onSubmit: externalOnSubmit,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [isInternalSubmitting, setIsInternalSubmitting] = useState(false);

  const handleFormSubmit = async (data) => {
    const isExternalHandler = typeof externalOnSubmit === "function";
    setIsInternalSubmitting(true);

    try {
      if (isExternalHandler) {
        await externalOnSubmit(data);
      } else {
        // Default internal handling
        const response = await authService.connectInstagram({
          username: data.username,
          password: data.password,
        });

        if (response?.success) {
          setConnectionSuccess(true);
          toast.success("Instagram account connected successfully!");
          reset();
        } else {
          throw new Error(
            response?.message || "Failed to connect Instagram account"
          );
        }
      }
    } catch (error) {
      console.error("Error connecting Instagram:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to connect Instagram account"
      );
    } finally {
      setIsInternalSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setConnectionSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  if (connectionSuccess) {
    return (
      <div className="fixed inset-0 w-full text-center bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FiLink className="text-3xl text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Connection Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your Instagram account is now connected to our service.
          </p>
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-pink-600 hover:to-purple-700 transition duration-300"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full mb-3">
            <FiInstagram className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Connect Instagram
          </h1>
          <p className="text-gray-500 mt-1 text-center">
            Link your Instagram account to access our services
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Instagram Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiInstagram className="text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                {...register("username", {
                  required: "Instagram username is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._]+$/,
                    message: "Invalid Instagram username format",
                  },
                })}
                className={`w-full pl-10 px-4 py-3 rounded-lg border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                placeholder="your_instagram_username"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Instagram Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className={`w-full px-4 pr-10 py-3 rounded-lg border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                placeholder="••••••••"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="h-5 w-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Why connect your Instagram?
                </h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Upload Reels directly to your Instagram account</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Schedule posts for optimal engagement times</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Analyze performance with detailed insights</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms-agreement"
                type="checkbox"
                {...register("terms", {
                  required: "You must accept the terms",
                })}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
            </div>
            <label
              htmlFor="terms-agreement"
              className="ml-3 block text-sm text-gray-700"
            >
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-500 underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-500 underline"
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || isInternalSubmitting}
            className={`w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition duration-300 ${
              isLoading || isInternalSubmitting
                ? "opacity-70 cursor-not-allowed"
                : ""
            }`}
          >
            {isLoading || isInternalSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Connecting...
              </span>
            ) : (
              "Connect Instagram Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            We use Instagram's official API. Your credentials are encrypted and
            never stored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstaCredentialForm;
