/**
 * Reads a JSON file and returns its parsed content
 * @param {File} file - The JSON file to read
 * @returns {Promise<Object>} - The parsed JSON data
 */
export const readJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        resolve(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        reject(new Error('Invalid JSON format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Extracts YouTube API credentials from a Google Cloud JSON file
 * @param {Object} jsonData - The parsed JSON data
 * @returns {Object} - Object containing extracted credentials
 */
export const extractYouTubeCredentials = (jsonData) => {
  const credentials = {
    clientId: null,
    clientSecret: null,
    apiKey: null
  };

  // Try to extract client ID and secret from web or installed credentials
  if (jsonData.web) {
    credentials.clientId = jsonData.web.client_id;
    credentials.clientSecret = jsonData.web.client_secret;
  } else if (jsonData.installed) {
    credentials.clientId = jsonData.installed.client_id;
    credentials.clientSecret = jsonData.installed.client_secret;
  } else {
    // Try direct properties
    credentials.clientId = jsonData.client_id;
    credentials.clientSecret = jsonData.client_secret;
  }

  // Try to extract API key
  credentials.apiKey = jsonData.api_key;

  return credentials;
};