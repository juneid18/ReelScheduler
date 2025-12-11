import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiUser,
  FiActivity,
  FiInfo,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { Badge } from "./components/Badge";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [levelFilter, setLevelFilter] = useState("all");
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page, levelFilter]);

  useEffect(() => {
    // Debounce search to avoid too many API calls
    if (searchTimeout) clearTimeout(searchTimeout);

    setSearchTimeout(
      setTimeout(() => {
        setPage(1); // Reset to first page when search changes
        fetchLogs();
      }, 500)
    );

    return () => clearTimeout(searchTimeout);
  }, [search]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getLogs({
        page,
        search,
        level: levelFilter !== "all" ? levelFilter : undefined,
      });
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async () => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;

    try {
      await adminService.deleteLog();
      fetchLogs(); // Refresh the logs after deletion
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete log");
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "error":
        return "red";
      case "warn":
        return "yellow";
      case "info":
        return "blue";
      case "debug":
        return "gray";
      default:
        return "gray";
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">System Logs</h1>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span className="text-gray-400 hover:text-gray-600">×</span>
            </button>
          )}
        </div>

        <select
          value={levelFilter}
          onChange={(e) => {
            setLevelFilter(e.target.value);
            setPage(1); // Reset to first page when filter changes
          }}
          className="block w-full sm:w-40 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="all">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
        <button
          onClick={() => deleteLog()}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          <FiX className="mr-2" />
          Clear All Logs
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiClock className="mr-2" /> Timestamp
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiUser className="mr-2" /> User
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiActivity className="mr-2" /> Level
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiInfo className="mr-2" /> Message
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No logs found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.meta?.user || "System"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge color={getLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="truncate max-w-xs">{log.message}</div>
                          {log.meta?.method && (
                            <div className="text-xs text-gray-400 mt-1">
                              {log.meta.method} {log.meta.url} -{" "}
                              {log.meta.status} ({log.meta.responseTime}ms)
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded-md border ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FiChevronLeft className="inline mr-1" /> Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || totalPages === 0}
                className={`px-3 py-1 rounded-md border ${
                  page === totalPages || totalPages === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next <FiChevronRight className="inline ml-1" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
