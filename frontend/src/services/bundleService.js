import api from "./api";

export const bundleService = {
  getBundles: async () => {
    try {
      const ownerId = localStorage.getItem("ownerId");
      const response = await api.get("/bundles", {
        params: { ownerId: ownerId || undefined },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching bundles:", error);
      throw error;
    }
  },

  getBundle: async (id) => {
    try {
      const response = await api.get(`/bundles/${id}`, {
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching bundle ${id}:`, error);
      throw error;
    }
  },

  createBundle: async (bundleData) => {
    try {
      const response = await api.post("/bundles", bundleData, {
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating bundle:", error);
      throw error;
    }
  },

  addVideoToBundle: async (id, videoId) => {
    try {
      const response = await api.post(`/bundles/${id}/videos`, {videoId}, {
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error Adding Video to bundle ${id}:`, error);
      throw error;
    }
  },

  updateBundle: async (id, bundleData) => {
    try {
      const response = await api.put(`/bundles/${id}`, bundleData, {
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating bundle ${id}:`, error);
      throw error;
    }
  },

  deleteBundle: async (id) => {
    try {
      const response = await api.delete(`/bundles/${id}`, {
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting bundle ${id}:`, error);
      throw error;
    }
  },

  deleteBundleVideo: async (id, videoId) => {
    try {
      const response = await api.delete(`/bundles/${id}/videos/${videoId}`, {
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting bundle video ${id}:`, error);
      throw error;
    }
  },
};
