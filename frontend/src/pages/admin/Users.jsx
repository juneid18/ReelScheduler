import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    subscriptionStatus: "",
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    searchQuery,
    filters.role,
    filters.status,
    filters.subscriptionStatus,
  ]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Only include filters if they have a value
      const params = { page };
      if (searchQuery) params.search = searchQuery;
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.subscriptionStatus)
        params.subscriptionStatus = filters.subscriptionStatus;
      const res = await adminService.getUsers(params);
      if (res.data?.users) {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError(res.data?.message || "Failed to load users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchTerm);
    setPage(1); // Reset to first page on new search
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1); // Reset to first page when filters change
    setSearchQuery(searchTerm); // Trigger search with current term and new filters
  };

  const resetFilters = () => {
    setFilters({
      role: "",
      status: "",
      subscriptionStatus: "",
    });
    setSearchTerm("");
    setSearchQuery("");
    setPage(1);
  };

  const handleUserAction = async (
    userId,
    action,
    confirmMessage,
    successMessage
  ) => {
    if (!window.confirm(confirmMessage)) return;

    setIsProcessing(true);
    try {
      const res = await adminService.updateUser(userId, action);
      if (res.data?.success) {
        toast.success(successMessage);
        await fetchUsers();
      } else {
        toast.error(res.data?.message || "Action failed");
      }
    } catch (err) {
      console.error("Error performing user action:", err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const isSuspended = (user) =>
    user?.status === "suspend" || user?.subscription?.status === "suspend";

  const [lastActionTime, setLastActionTime] = useState(0);

  const handleSuspend = (userId, user) => {
    const now = Date.now();
    const clickDelay = 2000; // 2 second delay between clicks

    // Check if enough time has passed since last click
    if (now - lastActionTime < clickDelay) {
      const secondsLeft = Math.ceil(
        (clickDelay - (now - lastActionTime)) / 1000
      );
      toast.error(
        `Please wait ${secondsLeft} second${
          secondsLeft !== 1 ? "s" : ""
        } before trying again`
      );
      return;
    }

    setLastActionTime(now);

    const suspended = isSuspended(user);
    handleUserAction(
      userId,
      { suspended: !suspended },
      suspended ? "Unsuspend this user?" : "Suspend this user?",
      suspended
        ? "User unsuspended successfully"
        : "User suspended successfully"
    );
  };

  const handleDelete = (userId, isDeleted) => {
    handleUserAction(
      userId,
      { deleted: !isDeleted },
      isDeleted
        ? "Restore this user?"
        : "Delete this user? This cannot be undone.",
      isDeleted ? "User restored successfully" : "User deleted successfully"
    );
  };

  const formatDate = (dateString, options = {}) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      const defaultOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...options,
      };

      return date.toLocaleDateString(undefined, defaultOptions);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const getSubscriptionStatus = (subscription) => {
    if (!subscription) return "No subscription";
    if (subscription.cancelAtPeriodEnd) return "Cancelling";
    return subscription.status === "active"
      ? "Active"
      : subscription.status || "Inactive";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-red-500">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Search and Filters Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  Search
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Account Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspend">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label
                htmlFor="subscriptionStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subscription
              </label>
              <select
                id="subscriptionStatus"
                name="subscriptionStatus"
                value={filters.subscriptionStatus}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">All Subscriptions</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="cancelling">Cancelling</option>
                <option value="none">No Subscription</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "developer"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getSubscriptionStatus(user.subscription)}
                        {user.subscription?.plan && (
                          <span className="block text-xs text-gray-500">
                            {formatDate(user.subscription.currentPeriodStart)} -{" "}
                            {formatDate(user.subscription.currentPeriodEnd)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${
                          user.deleted
                            ? "bg-red-50 text-red-700 border-red-200"
                            : isSuspended(user)
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {user.deleted ? (
                          <>
                            <svg
                              className="w-3 h-3 mr-1 text-red-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                d="M6 6l8 8M6 14L14 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                            Deleted
                          </>
                        ) : isSuspended(user) ? (
                          <>
                            <svg
                              className="w-3 h-3 mr-1 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <circle
                                cx="10"
                                cy="10"
                                r="8"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              />
                              <circle
                                cx="10"
                                cy="10"
                                r="3"
                                fill="currentColor"
                              />
                            </svg>
                            Suspended
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 mr-1 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <circle
                                cx="10"
                                cy="10"
                                r="8"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              />
                              <circle
                                cx="10"
                                cy="10"
                                r="3"
                                fill="currentColor"
                              />
                            </svg>
                            Active
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setViewUser(user)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          disabled={isProcessing}
                          title="View user details"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleSuspend(user._id, user)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-md border ${
                            isSuspended(user)
                              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                          } transition-colors text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                          disabled={isProcessing || user.deleted}
                          title={
                            isSuspended(user)
                              ? "Unsuspend user"
                              : "Suspend user"
                          }
                        >
                          {isSuspended(user) ? (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                              Unsuspend
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.415-1.414M5 12h14" />
                              </svg>
                              Suspend
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.deleted)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-md border ${
                            user.deleted
                              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          } transition-colors text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400`}
                          disabled={isProcessing}
                          title={user.deleted ? "Restore user" : "Delete user"}
                        >
                          {user.deleted ? (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                              Restore
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* User Details Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">User Details</h2>
              <button
                onClick={() => setViewUser(null)}
                className="text-gray-400 hover:text-gray-700 focus:outline-none"
                title="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <table className="min-w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-semibold pr-4 py-2 text-gray-700">
                      Name:
                    </td>
                    <td>{viewUser.name}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-4 py-2 text-gray-700">
                      Email:
                    </td>
                    <td>{viewUser.email}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-4 py-2 text-gray-700">
                      Role:
                    </td>
                    <td>{viewUser.role}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-4 py-2 text-gray-700">
                      Status:
                    </td>
                    <td>
                      {viewUser.deleted
                        ? "Deleted"
                        : isSuspended(viewUser)
                        ? "Suspended"
                        : "Active"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-4 py-2 text-gray-700">
                      Subscription:
                    </td>
                    <td>{getSubscriptionStatus(viewUser.subscription)}</td>
                  </tr>
                  {viewUser.subscription?.plan && (
                    <>
                      <tr>
                        <td className="font-semibold pr-4 py-2 text-gray-700">
                          Plan:
                        </td>
                        <td>{viewUser.subscription.plan}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2 text-gray-700">
                          Period:
                        </td>
                        <td>
                          {formatDate(viewUser.subscription.currentPeriodStart)}{" "}
                          - {formatDate(viewUser.subscription.currentPeriodEnd)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td className="font-semibold pr-4 py-2 text-gray-700">
                      Created:
                    </td>
                    <td>{formatDate(viewUser.createdAt)}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-4 py-2 text-gray-700">
                      User ID:
                    </td>
                    <td className="font-mono text-xs text-gray-500">
                      {viewUser._id}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
