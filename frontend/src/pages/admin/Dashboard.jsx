import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError("Failed to load stats. Please try again.");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatMonthYear = (dateString) => {
    if (!dateString) return "";
    const [year, month] = dateString.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded shadow h-24 animate-pulse"></div>
          ))}
        </div>
        <div className="bg-white p-6 rounded shadow h-80 animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const peakUsers = Math.max(...stats.userGrowth.map((item) => item.users));
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthData = stats.userGrowth.find(item => item.date === currentMonth)?.users || 0;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow text-center border-l-4 border-indigo-500">
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
          <div className="text-gray-500">Total Users</div>
          <div className="text-sm text-indigo-600 mt-2">
            {currentMonthData} new this month
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center border-l-4 border-blue-500">
          <div className="text-3xl font-bold">{stats.totalVideos}</div>
          <div className="text-gray-500">Total Videos</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center border-l-4 border-green-500">
          <div className="text-3xl font-bold">{stats.totalBundles}</div>
          <div className="text-gray-500">Total Bundles</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center border-l-4 border-purple-500">
          <div className="text-3xl font-bold">{stats.totalPlans}</div>
          <div className="text-gray-500">Total Plans</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center border-l-4 border-yellow-500">
          <div className="text-3xl font-bold">{stats.totalSchedules}</div>
          <div className="text-gray-500">Total Schedules</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center border-l-4 border-red-500">
          <div className="text-3xl font-bold">{stats.totalTeamMembers}</div>
          <div className="text-gray-500">Total Team Members</div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">User Growth</h2>
        {stats.userGrowth?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={stats.userGrowth}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#666", fontSize: 12 }}
                tickFormatter={formatMonthYear}
                axisLine={{ stroke: "#ccc" }}
              />
              <YAxis
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={{ stroke: "#ccc" }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => [value, "Users"]}
                labelFormatter={formatMonthYear}
              />
              <Area
                type="monotone"
                dataKey="users"
                fill="#6366f1"
                fillOpacity={0.1}
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{
                  stroke: "#6366f1",
                  strokeWidth: 2,
                  fill: "#fff",
                  r: 4,
                }}
                activeDot={{
                  stroke: "#6366f1",
                  strokeWidth: 2,
                  fill: "#fff",
                  r: 6,
                }}
              />
              {peakUsers > 0 && (
                <ReferenceLine
                  y={peakUsers}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: `Peak: ${peakUsers}`,
                    position: "top",
                    fill: "#ef4444",
                    fontSize: 12,
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-400">
            No user growth data available.
          </div>
        )}
      </div>

      {/* Database Storage */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Database Storage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Collections</h3>
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between mb-2">
                <span>Collections:</span>
                <span>{stats.DB_Storage.collections}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Objects:</span>
                <span>{stats.DB_Storage.objects.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Indexes:</span>
                <span>{stats.DB_Storage.indexes}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Storage</h3>
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between mb-2">
                <span>Data Size:</span>
                <span>{(stats.DB_Storage.dataSize / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Storage Size:</span>
                <span>{(stats.DB_Storage.storageSize / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between">
                <span>Total Size:</span>
                <span>{(stats.DB_Storage.totalSize / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}