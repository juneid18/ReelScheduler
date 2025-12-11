import api from './api';

export const analyticsService = {
  /**
   * Get YouTube analytics data
   * @param {string} timeframe - Time period for analytics (7days, 30days, 90days)
   * @returns {Promise<Object>} Analytics data
   */
  getYouTubeAnalytics: async (timeframe = '7days') => {
    try {
      const response = await api.get(`/analytics/youtube?timeframe=${timeframe}`,{
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching YouTube analytics:', error);
      console.error('Response data:', error.response?.data);
      throw error.response?.data?.message || error.message || 'Failed to fetch analytics data';
    }
  },
  
  /**
   * Get YouTube channel data
   * @param {string} channelId - Optional channel ID
   * @returns {Promise<Object>} Channel data
   */
  getChannelData: async (channelId = null) => {
    try {
      let url = '/auth/youtube/channel';
      if (channelId) {
        url += `?channelId=${channelId}`;
      }
      
      const response = await api.get(url,{
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching channel data:', error);
      console.error('Response data:', error.response?.data);
      throw error.response?.data?.message || error.message || 'Failed to fetch channel data';
    }
  }
};




