import React, { useEffect, useState, useCallback } from "react";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";
import {
  FiRefreshCw,
  FiUser,
  FiAlertCircle,
  FiLoader,
  FiUserCheck,
  FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi";

const TeamMemberWorkflow = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);

  const fetchOwners = useCallback(async (isRefresh = false) => {
    const loadingState = isRefresh ? setRefreshing : setLoading;
    loadingState(true);
    setError("");

    try {
      const res = await authService.getOwners();
      setOwners(res.owners || []);
      if (isRefresh) {
        toast.success("Owners list refreshed");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load owners";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error fetching owners:", err);
      setOwners([]);
    } finally {
      loadingState(false);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleRefresh = () => {
    fetchOwners(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRemoveOwner = async (ownerId) => {
    const confirmed = await new Promise((resolve) => {
      const toastId = "remove-owner-confirm";
      let isLoading = false;

      const handleAction = async (shouldRemove) => {
        if (shouldRemove) {
          isLoading = true;
          toast.loading("Processing...", {
            id: toastId,
            position: "top-center",
            className:
              "!bg-white !text-gray-800 !shadow-lg !border !border-gray-200",
          });
        }
        resolve(shouldRemove);
      };

      toast.custom(
        (t) => (
          <div className="bg-white rounded-xl shadow-lg border border-red-100 px-6 py-5 flex flex-col items-center max-w-xl w-full animate-fade-in">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-red-100 rounded-full mr-3">
                <FiTrash2 className="text-red-600 text-xl" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                Remove Owner Access
              </h3>
            </div>

            <div className="w-full text-center mb-4">
              <div className="text-sm text-gray-600">
                You will lose access to this owner's resources
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 w-full">
              <div className="flex items-start">
                <FiAlertTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700">
                  This action{" "}
                  <span className="font-semibold">cannot be undone</span>.
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  isLoading
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 shadow-md"
                } text-white flex items-center justify-center`}
                onClick={() => handleAction(true)}
              >
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Removing...
                  </>
                ) : (
                  "Confirm Removal"
                )}
              </button>
              <button
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 border rounded-lg font-medium transition-all ${
                  isLoading
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-md"
                }`}
                onClick={() => {
                  handleAction(false);
                  toast.dismiss(t.id);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: "top-center",
          id: toastId,
        }
      );
    });

    if (!confirmed) return;

    try {
      setManageLoading(true);
      await authService.SingleRemoveTeamMember(ownerId);
      setOwners((prev) => prev.filter((owner) => owner.id !== ownerId));
      toast.success("Owner access removed successfully");
      fetchOwners();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to remove owner access"
      );
      console.error(err);
    } finally {
      setManageLoading(false);
      toast.dismiss("remove-owner-confirm");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FiUserCheck className="text-2xl text-primary-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Team Member Dashboard
          </h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className={`flex items-center px-4 py-2 rounded-md ${
            loading || refreshing
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          } transition-colors`}
        >
          {refreshing ? (
            <FiLoader className="animate-spin mr-2" />
          ) : (
            <FiRefreshCw className="mr-2" />
          )}
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-center p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700">
          <FiAlertCircle className="mr-3 text-xl" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-700">Your Associated Owners</h3>
          <p className="text-sm text-gray-500 mt-1">
            These are the owners you're currently working with as a team member
          </p>
        </div>

        {loading && !refreshing ? (
          <div className="flex justify-center items-center p-8">
            <FiLoader className="animate-spin text-2xl text-blue-500 mr-3" />
            <span>Loading owners...</span>
          </div>
        ) : owners.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiUser className="mx-auto text-3xl mb-3 text-gray-400" />
            <p>No owners found</p>
            <button
              onClick={handleRefresh}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Try refreshing
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {owners.map((owner) => (
              <li
                key={owner.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{owner.name}</h4>
                    <p className="text-sm text-gray-600">{owner.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(
                        owner.teamMemberStatus
                      )}`}
                    >
                      {owner.teamMemberStatus || "Unknown"}
                    </span>
                    <button
                      onClick={() => handleRemoveOwner(owner.teamMemberId)}
                      className="ml-2 px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      disabled={manageLoading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {owner.lastActive && (
                  <div className="mt-2 text-xs text-gray-500">
                    Last active: {new Date(owner.lastActive).toLocaleString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>
          If you have any questions or need assistance, please contact with our team.
        </p>
        <a
          href={`mailto:${
            import.meta.env.VITE_DEVELOPER_EMAIL || "support@example.com"
          }`}
          className="text-blue-600 hover:text-blue-800"
        >
          {import.meta.env.VITE_DEVELOPER_EMAIL || "support@example.com"}
        </a>
      </div>

    </div>
  );
};

export default TeamMemberWorkflow;
