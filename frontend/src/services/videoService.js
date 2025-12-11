import toast from "react-hot-toast";
import api from "./api";

// Direct upload to ImageKit
const uploadToImageKit = async (file, onProgress) => {
  try {
    // First, get upload authentication parameters from your backend
    const authResponse = await api.get("/videos/upload-auth");
    const { signature, token, expire, publicKey } = authResponse.data;

    if (!signature || !token || !expire || !publicKey) {
      console.error("Invalid auth params:", authResponse.data);
      throw new Error("Invalid authentication parameters from server");
    }

    // Create FormData for ImageKit upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("publicKey", publicKey);
    formData.append("signature", signature);
    formData.append("token", token);
    formData.append("expire", expire);
    formData.append("fileName", `video-${Date.now()}-${file.name}`);
    formData.append("folder", "/videos");



    // Use XMLHttpRequest to track progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Setup progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.url,
            path: response.filePath || response.name,
            size: file.size,
            fileId: response.fileId,
          });
        } else {
          // Try to parse error response
          let errorMessage = "Upload failed";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage =
              errorResponse.message || errorResponse.error || "Upload failed";
          } catch (e) {
            console.error("Raw error response:", xhr.responseText);
          }
          reject(new Error(errorMessage));
        }
      };

      // Handle errors
      xhr.onerror = function () {
        console.error("Network error during upload");
        reject(new Error("Network error during upload"));
      };

      // Send the request
      xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
      xhr.send(formData);
    });
  } catch (error) {
    console.error("Error in ImageKit upload:", error);
    throw error;
  }
};

export const videoService = {
  getVideos: async () => {
    try {
      // The API interceptor should automatically add the auth token
      // Fetch ownerId from localStorage
      const ownerId = localStorage.getItem("ownerId");
      const response = await api.get("/videos", {
        params: { ownerId: ownerId || undefined },
      });

      // Check if we got a valid response
      if (!response.data) {
        console.warn("Empty response from videos endpoint");
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching videos:", error);
      throw error;
    }
  },

  getVideo: async (id) => {
    try {
      const ownerId = localStorage.getItem("ownerId");
      const response = await api.get(`/videos/${id}`, {
        params: { ownerId: ownerId || undefined },
      });
      return response;
    } catch (error) {
      console.error(`Error fetching video ${id}:`, error);
      // Log more details about the error
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      }
      throw error;
    }
  },

  uploadVideo: async (videoData, config) => {
    try {

      // Make sure the file is being sent with the key 'file'
      const file = videoData.get("file");
      if (!file) {
        console.error("No file found in FormData");
        throw new Error("No file found in FormData");
      }

      // Upload to Appwrite through the backend
      const response = await api.post("/videos/direct-upload", videoData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (config?.onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            config.onUploadProgress(percentCompleted);
          }
        },
        timeout: 300000, // 5 minutes timeout for large uploads
        params: { ownerId: localStorage.getItem("ownerId") || undefined },
      });

      return response;
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  },

  // Upload multiple videos
  uploadMultipleVideos: async (files, commonData, progressCallback) => {
    try {
      const results = [];
      const ownerId = localStorage.getItem("ownerId");

      // Process files sequentially to avoid overwhelming the server
      for (const fileObj of files) {
        try {
          // Create FormData for this file
          const formDataWithFile = new FormData();

          // Add the file with key 'file' (important - must match backend expectation)
          formDataWithFile.append("file", fileObj.file);

          // Add common data
          if (commonData.title) {
            formDataWithFile.append("title", fileObj.title || commonData.title);
          }

          if (commonData.description) {
            formDataWithFile.append("description", commonData.description);
          }

          if (commonData.bundleId) {
            formDataWithFile.append("bundleId", commonData.bundleId);
          }


          // Upload to Appwrite with progress tracking
          const response = await api.post(
            "/videos/direct-upload",
            formDataWithFile,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                if (progressCallback) {
                  progressCallback(fileObj.id, progressEvent);
                }
              },
              timeout: 300000, // 5 minutes
              params: { ownerId: ownerId || undefined },
            }
          );

          results.push({
            fileId: fileObj.id,
            success: true,
            data: response.data,
          });
        } catch (error) {
          console.error(`Error uploading file ${fileObj.id}:`, error);

          const isPermissionError =
            error?.response?.data?.permission === false ||
            error?.response?.data?.message ===
              "You do not have permission to upload videos for this owner.";

          results.push({
            fileId: fileObj.id,
            success: false,
            error: error.message || "Upload failed",
            permission: isPermissionError ? false : undefined,
            upgradeRequired: error?.response?.data?.upgradeRequired || false,
            feature: error?.response?.data?.feature || null,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Error in multiple upload process:", error);
      throw error;
    }
  },

  updateVideo: async (id, videoData) => {
    try {
      const ownerId = localStorage.getItem("ownerId");
      const response = await api.put(`/videos/${id}`, videoData, {
        params: { ownerId: ownerId || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating video ${id}:`, error);
      // Log more detailed error information
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Status code:", error.response.status);
      }
      throw error;
    }
  },

  updateVideoThumbnail: async (id, formData) => {
    try {
      const ownerId = localStorage.getItem("ownerId");
      const response = await api.put(`/videos/${id}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { ownerId: ownerId || undefined },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating video thumbnail ${id}:`, error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Status code:", error.response.status);
      }
      throw error;
    }
  },

  deleteVideo: async (id, deleteFromYoutube = false) => {
    try {
      // Check if id is valid before making the request
      if (!id) {
        console.error("Invalid video ID for deletion:", id);
        throw new Error("Invalid video ID");
      }

      const response = await api.delete(`/videos/${id}`, {
        params: {
          deleteFromYoutube,
          ownerId: localStorage.getItem("ownerId") || undefined,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error deleting video ${id}:`, error);

      // Check if it's a YouTube auth error
      if (
        error.response?.status === 401 &&
        error.response?.data?.authRequired
      ) {
        // Add authRequired flag to the error
        error.authRequired = true;
      }

      throw error;
    }
  },

  uploadToYoutube: async (id, videoUrl, privacyStatus) => {
    try {
      // Get user's default privacy setting from localStorage
      let defaultPrivacyStatus = "private";
      try {
        const youtubeSettings = JSON.parse(
          localStorage.getItem("youtubeSettings") || "{}"
        );
        if (youtubeSettings.defaultPrivacyStatus) {
          defaultPrivacyStatus = youtubeSettings.defaultPrivacyStatus;
        }
      } catch (e) {
        console.error("Error parsing YouTube settings:", e);
      }

      const response = await api.post(
        `/videos/${id}/youtube`,
        {
          videoUrl,
          privacyStatus: privacyStatus || defaultPrivacyStatus,
        },
        {
          params: { ownerId: localStorage.getItem("ownerId") || undefined },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error uploading video ${id} to YouTube:`, error);

      // Check if it's an auth error
      if (
        error.response?.status === 401 ||
        error.response?.data?.authRequired
      ) {
        // Set a flag in localStorage to indicate YouTube auth is required
        localStorage.setItem("youtubeAuthRequired", "true");

        // Throw a specific error for auth issues
        const authError = new Error("YouTube authentication required");
        authError.isAuthError = true;
        throw authError;
      }

      throw error;
    }
  },

  uploadToInstagram: async (id, videoUrl) => {
    try {
      const response = await api.post(
        `/videos/${id}/instagram`,
        {
          videoUrl,
        },
        {
          params: { ownerId: localStorage.getItem("ownerId") || undefined },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error uploading video ${id} to Instagram:`, error);
      throw error;
    }
  },

  // Add this method to your videoService
  getStreamUrl: async (videoId) => {
    // This returns a URL to our backend streaming endpoint
    return `${api.defaults.baseURL}/videos/${videoId}/stream`;
  },

  uploadToFacebook: async (id, videoUrl, description, title) => {
    try {
      const response = await api.post(
        `/videos/${id}/facebook`,
        {
          videoUrl,
          description,
          title,
        },
        {
          params: { ownerId: localStorage.getItem("ownerId") || undefined },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading to Facebook:", error);
      throw error;
    }
  },
};

// Upload multiple videos
export const uploadMultipleVideos = async (
  files,
  commonData,
  progressCallback
) => {
  try {
    const results = [];

    for (const fileObj of files) {
      try {
        // Create FormData for this file
        const formDataWithFile = new FormData();
        formDataWithFile.append("title", fileObj.title || commonData.title);
        formDataWithFile.append("description", commonData.description);
        formDataWithFile.append("video", fileObj.file);

        if (commonData.bundleId) {
          formDataWithFile.append("bundleId", commonData.bundleId);
        }

        // Upload to ImageKit with progress tracking
        const response = await videoService.uploadVideo(
          formDataWithFile,
          {
            onUploadProgress: (progressEvent) => {
              if (progressCallback) {
                progressCallback(fileObj.id, progressEvent);
              }
            },
            timeout: 300000, // 5 minutes
          },
          {
            params: { ownerId: localStorage.getItem("ownerId") || undefined },
          }
        );

        results.push({
          fileId: fileObj.id,
          success: true,
          data: response.data,
        });
      } catch (error) {
        results.push({
          fileId: fileObj.id,
          success: false,
          error,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in batch upload:", error);
    throw error;
  }
};
