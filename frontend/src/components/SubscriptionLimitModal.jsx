import React from "react";
import { Link } from "react-router-dom";
import {
  RiLockLine,
  RiCloseLine,
  RiArrowRightLine,
  RiCheckLine,
} from "react-icons/ri";

const SubscriptionLimitModal = ({
  isOpen,
  onClose,
  type,
  limit,
  current,
  planName,
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case "videoUploadsLimit":
        return "Monthly Upload Limit Reached";
      case "storageLimit":
        return "Storage Limit Reached";
      case "scheduleLimit":
        return "Active Schedule Limit Reached";
      case "bundleLimit":
        return "Bundle Limit Reached";
      case "bulkUpload":
        return "Bulk Upload Not Available";
      default:
        return "Subscription Limit Reached";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "videoUploadsLimit":
        return `You've reached your monthly limit of ${limit} video uploads on your ${planName} plan.`;
      case "storageLimit":
        return `You've reached your storage limit of ${limit}MB on your ${planName} plan.`;
      case "scheduleLimit":
        return `You've reached your limit of ${limit} active schedules on your ${planName} plan.`;
      case "bundleLimit":
        return `You've reached your limit of ${limit} content bundles on your ${planName} plan.`;
      case "bulkUpload":
        return `Bulk upload is not available on your ${planName} plan.`;
      default:
        return "Your current plan does not allow this action.";
    }
  };

  const getFeatureComparison = () => {
    switch (type) {
      case "videoUploadsLimit":
        return [
          { plan: "Free", feature: "5 uploads" },
          { plan: "Creator", feature: "60 uploads per month" },
          { plan: "Professional", feature: "Unlimited uploads" },
        ];
      case "storageLimit":
        return [
          { plan: "Free", feature: "250MB storage" },
          { plan: "Creator", feature: "50GB storage" },
          { plan: "Professional", feature: "500GB storage" },
        ];
      case "scheduleLimit":
        return [
          { plan: "Free", feature: "1 active schedule" },
          { plan: "Creator", feature: "5 active schedules" },
          { plan: "Professional", feature: "Unlimited schedules" },
        ];
      case "bundleLimit":
        return [
          { plan: "Free", feature: "2 content bundles" },
          { plan: "Creator", feature: "10 content bundles" },
          { plan: "Professional", feature: "Unlimited bundles" },
        ];
      case "bulkUpload":
        return [
          { plan: "Free", feature: "Bulk upload up to 5 videos" },
          { plan: "Creator", feature: "Bulk upload up to 20 videos" },
          { plan: "Professional", feature: "Bulk upload up to 50 videos" },
        ];
      default:
        return [
          { plan: "Free", feature: "Enhanced features" },
          { plan: "Creator", feature: "Advanced features" },
          { plan: "Professional", feature: "All premium features" },
        ];
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelled="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <RiCloseLine className="h-6 w-6" />
          </button>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <RiLockLine className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  {getTitle()}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{getMessage()}</p>

                  {/* Progress bar if applicable */}
                  {current !== undefined &&
                    limit !== undefined &&
                    limit !== -1 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">
                            {current > limit ? limit : current} / {limit}
                            {current > limit && (
                              <span className="text-red-500 ml-2">
                                (limit exceeded)
                              </span>
                            )}
                          </span>
                          <span className="font-medium text-red-600">
                            {Math.min(Math.round((current / limit) * 100), 100)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                Math.round((current / limit) * 100),
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Plan comparison */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Upgrade to get more:
              </h4>
              <div className="mb-2 p-2 bg-blue-50 rounded text-blue-700 text-sm">
                Unlock more uploads, schedules, and storage instantly. Enjoy advanced features and priority support with a higher plan!
              </div>
              <ul className="space-y-3">
                {getFeatureComparison().map((item, index) => (
                  <li key={index} className="flex items-start">
                    <RiCheckLine className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <span className="font-medium">{item.plan}:</span>{" "}
                      {item.feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Link
              to="/subscription"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-lg px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-base font-bold text-white hover:from-primary-600 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-150"
            >
              Upgrade Plan <RiArrowRightLine className="ml-1" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
          <div className="px-4 pb-4 text-xs text-gray-500 text-center">
            Upgrading your plan will immediately unlock more features and higher limits. You can manage or downgrade anytime from your account settings.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionLimitModal;
