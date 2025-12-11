// Admin service: API calls for admin panel
import api from "./api";

export const adminService = {
  // Dashboard stats
  getDashboardStats: () => api.get("/admin/stats"),
  // Users
  getUsers: (params) => api.get("/admin/users", { params }),
  // Videos
  getVideos: () => api.get("/admin/videos"),
  // Bundles
  getBundles: () => api.get("/admin/bundles"),
  // Plans
  getPlans: () => api.get("/admin/plans"),
  updatePlan: (id, data) => api.put(`/admin/plans/${id}`, data),
  // Schedules
  getSchedules: () => api.get("/admin/schedules"),
  // Team Members
  getTeamMembers: () => api.get("/admin/team-members"),
  // Tokens
  getTokens: () => api.get("/admin/tokens"),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  // Transactions
  getTransactions: () => api.get("/admin/transactions"),
  // Content Moderation
  getFlaggedContent: () => api.get("/admin/content/flagged"),
  moderateContent: (id, action) =>
    api.post(`/admin/content/${id}/moderate`, { action }),
  // Analytics
  getAnalytics: () => api.get("/admin/analytics"),
  // Support
  getSupportTickets: () => api.get("/admin/support"),
  respondToTicket: (id, response) =>
    api.post(`/admin/support/${id}/respond`, { response }),
  // Logs
  getLogs: (params) => api.get("/logs", { params }),
  deleteLog: () => api.delete(`/logs`),
  // Settings
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),
};
