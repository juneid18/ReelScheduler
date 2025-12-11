import { useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  FiSave,
  FiX,
  FiYoutube,
  FiInfo,
  FiUpload,
  FiFile,
} from "react-icons/fi";
import { authService } from "../services/authService";
import { readJsonFile, extractYouTubeCredentials } from "../utils/fileUtils";
import { useYouTube } from '../contexts/YouTubeContext';

function YouTubeCredentialsForm({ onClose, onSuccess }) {
  const { handleYouTubeConnected } = useYouTube();
  const [formData, setFormData] = useState({
    CLIENT_ID: "",
    CLIENT_SECRET: "",
    API_KEY: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const [jsonFile, setJsonFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is JSON
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Please upload a valid JSON file");
      return;
    }

    setJsonFile(file);

    try {
      // Read and parse the JSON file
      const jsonData = await readJsonFile(file);

      // Extract credentials from the JSON file
      const { clientId, clientSecret, apiKey } =
        extractYouTubeCredentials(jsonData);

      if (!clientId && !clientSecret && !apiKey) {
        toast.error("Could not find credentials in the JSON file");
        return;
      }

      // Update form with extracted values
      const newFormData = { ...formData };
      if (clientId) newFormData.CLIENT_ID = clientId;
      if (clientSecret) newFormData.CLIENT_SECRET = clientSecret;
      if (apiKey) newFormData.API_KEY = apiKey;

      setFormData(newFormData);
      toast.success("Credentials extracted from JSON file");
    } catch (error) {
      console.error("Error processing JSON file:", error);
      toast.error(error.message || "Failed to process the JSON file");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.CLIENT_ID.trim()) {
      newErrors.CLIENT_ID = "Client ID is required";
    } else if (!formData.CLIENT_ID.includes(".apps.googleusercontent.com")) {
      newErrors.CLIENT_ID = "Invalid Client ID format";
    }

    if (!formData.CLIENT_SECRET.trim()) {
      newErrors.CLIENT_SECRET = "Client Secret is required";
    }

    if (!formData.API_KEY.trim()) {
      newErrors.API_KEY = "API Key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  try {
    setLoading(true);
    // Get current user ID from localStorage
    const userString = localStorage.getItem("user");
    if (!userString) { toast.error("User session not found. Please log in again."); return; }
    const user = JSON.parse(userString);
    const userId = user.id || user._id;
    if (!userId) { toast.error("User ID not found. Please log in again."); return; }
    // Add user ID to form data
    const dataToSubmit = { ...formData, UserId: userId };
    // Save credentials
    const response = await authService.saveCredentials(dataToSubmit);
    if (response.success) {
      toast.success("YouTube credentials saved successfully");
      onClose();
      // Now initiate YouTube connection
      const authUrlResponse = await authService.getGoogleAuthUrl(userId);
      if (authUrlResponse.data && authUrlResponse.data.url) {
        window.open(authUrlResponse.data.url, 'youtube_auth', 'width=800,height=600,menubar=no,toolbar=no,location=no');
      }
    }
  } finally { setLoading(false); }
};

  const handleAuthClick = async () => {
  try {
    setLoading(true);
    
    // Get current user ID from localStorage
    const userString = localStorage.getItem("user");
    let userId = null;
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        userId = user.id || user._id;
      } catch (parseError) {
        console.error("Error parsing user from localStorage:", parseError);
      }
    }
    
    // Get the auth URL from the backend
    const authUrlResponse = await authService.getGoogleAuthUrl(userId);
    
    if (authUrlResponse.data && authUrlResponse.data.url) {
      // Open the auth URL in a new window
      const authWindow = window.open(
        authUrlResponse.data.url, 
        'youtube_auth', 
        'width=800,height=600,menubar=no,toolbar=no,location=no'
      );
      
      // Check if popup was blocked
      if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
        toast.error("Popup blocked! Please allow popups for this site and try again.");
      } else {
        console.log("Auth window opened successfully");
      }
    } else {
      console.error("Invalid auth URL response:", authUrlResponse);
      toast.error("Failed to get YouTube authentication URL");
    }
  } catch (error) {
    console.error("Error connecting to YouTube:", error);
    console.error("Error details:", error.response?.data || error.message);
    toast.error("Failed to connect to YouTube. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FiYoutube className="text-red-600 text-2xl mr-2" />
          <h2 className="text-xl font-semibold">Connect YouTube Account</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <div className="flex items-start">
          <FiInfo className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">
              How to get your YouTube API credentials
            </h3>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-blue-600 hover:text-blue-800 text-sm underline mt-1"
            >
              {showHelp ? "Hide instructions" : "Show instructions"}
            </button>

            {showHelp && (
              <ol className="mt-2 text-sm text-blue-800 space-y-2 list-decimal pl-4">
                <li>
                  Go to the{" "}
                  <a
                    href="https://console.developers.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Google Cloud Console
                  </a>
                </li>
                <li>Create a new project or select an existing one</li>
                <li>Enable the YouTube Data API v3</li>
                <li>
                  Go to "Credentials" and create an OAuth 2.0 Client ID (Web
                  application type)
                </li>
                <li>
                  Add authorized redirect URIs (including
                  http://localhost:3000/auth/google/callback for testing)
                </li>
                <li>Create an API Key</li>
                <li>
                  Download the JSON file or copy the Client ID, Client Secret,
                  and API Key to the form below
                </li>
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* JSON File Upload Section */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          {jsonFile ? (
            <div className="flex items-center justify-center">
              <FiFile className="text-primary-500 mr-2" />
              <span className="text-gray-700">{jsonFile.name}</span>
              <button
                type="button"
                onClick={triggerFileInput}
                className="ml-3 text-primary-600 hover:text-primary-700 text-sm underline"
              >
                Change file
              </button>
            </div>
          ) : (
            <div>
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Upload your Google API credentials JSON file
              </p>
              <button
                type="button"
                onClick={triggerFileInput}
                className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Select JSON File
              </button>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Or manually enter your credentials below
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="CLIENT_ID"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Client ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="CLIENT_ID"
              name="CLIENT_ID"
              value={formData.CLIENT_ID}
              onChange={handleChange}
              placeholder="123456789-abcdef.apps.googleusercontent.com"
              className={`w-full px-3 py-2 border ${
                errors.CLIENT_ID ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
            {errors.CLIENT_ID && (
              <p className="mt-1 text-sm text-red-500">{errors.CLIENT_ID}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="CLIENT_SECRET"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Client Secret <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="CLIENT_SECRET"
              name="CLIENT_SECRET"
              value={formData.CLIENT_SECRET}
              onChange={handleChange}
              placeholder="GOCSPX-xxxxxxxxxxxxxxxx"
              className={`w-full px-3 py-2 border ${
                errors.CLIENT_SECRET ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
            {errors.CLIENT_SECRET && (
              <p className="mt-1 text-sm text-red-500">
                {errors.CLIENT_SECRET}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="API_KEY"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="API_KEY"
              name="API_KEY"
              value={formData.API_KEY}
              onChange={handleChange}
              placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className={`w-full px-3 py-2 border ${
                errors.API_KEY ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
            {errors.API_KEY && (
              <p className="mt-1 text-sm text-red-500">{errors.API_KEY}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
          >
            <FiSave className="mr-2" />
            {loading ? "Saving..." : "Save Credentials"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default YouTubeCredentialsForm;