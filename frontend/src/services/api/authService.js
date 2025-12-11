import api from "../api";

const checkYouTubeConnection = async () => {
  try {
    const response = await api.get('/auth/youtube/check');
    return response;
  } catch (error) {
    console.error('Error in checkYouTubeConnection:', error);
    throw error;
  }
};

// For backward compatibility
const checkGoogleAuth = async () => {
  return checkYouTubeConnection();
};

// Make sure this is exported
export default {
  // Other methods...
  checkYouTubeConnection,
  checkGoogleAuth,
};
