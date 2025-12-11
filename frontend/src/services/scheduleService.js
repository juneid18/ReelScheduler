import api from './api';

export const scheduleService = {
  // Get all schedules
  getSchedules: async () => {
    try {
      const response = await api.get('/schedules', {
        params: { ownerId: localStorage.getItem('ownerId') || undefined },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },
  
  // Get a single schedule by ID
  getSchedule: async (id) => {
    try {
      const response = await api.get(`/schedules/${id}`, {
        params: { ownerId: localStorage.getItem('ownerId') || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new schedule
  createSchedule: async (scheduleData) => {
    try {
      const response = await api.post('/schedules', scheduleData, {
        params: { ownerId: localStorage.getItem('ownerId') || undefined },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },
  
  // Update a schedule
  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await api.put(`/schedules/${id}`, scheduleData, {
        params: { ownerId: localStorage.getItem('ownerId') || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a schedule
  deleteSchedule: async (id) => {
    try {
      const response = await api.delete(`/schedules/${id}`, {
        params: { ownerId: localStorage.getItem('ownerId') || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting schedule ${id}:`, error);
      throw error;
    }
  },
  
  // Pause a schedule
  pauseSchedule: async (id) => {
    try {
      const response = await api.put(`/schedules/${id}/pause`, {
        params: { ownerId: localStorage.getItem('ownerId') || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error pausing schedule ${id}:`, error);
      throw error;
    }
  },
  
  // Resume a schedule
  resumeSchedule: async (id) => {
    try {
      const response = await api.put(`/schedules/${id}/resume`, {
        params: { ownerId: localStorage.getItem('ownerId') || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error resuming schedule ${id}:`, error);
      throw error;
    }
  }
};

// Also export as default for components that import it that way
export default scheduleService;

