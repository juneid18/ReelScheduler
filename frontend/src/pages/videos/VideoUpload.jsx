import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { videoService } from "../../services/videoService";
import {
  RiUploadCloud2Line,
  RiCloseLine,
  RiVideoLine,
  RiInformationLine,
  RiAddLine,
  RiUpload2Line,
  RiFileInfoFill,
} from "react-icons/ri";
import { IoCloudUploadOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import SubscriptionLimitModal from "../../components/SubscriptionLimitModal";
import { useMemo } from "react";
import userService from "../../services/userService";

function VideoUpload({ onUploadComplete, data }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Subscription data
  const [userPlan, setUserPlan] = useState({
    name: "Free",
    features: {
      videoUploadsLimit: 5,
      storageLimit: 500, // 500MB
    },
  });
  const [usageStats, setUsageStats] = useState({
    uploadedThisMonth: 0,
    storageUsed: 0, // in bytes
  });

  // Modal state
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState("");
  const [limitModalData, setLimitModalData] = useState({
    limit: 0,
    current: 0,
  });

  // Fetch user's plan and usage data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // You would replace this with actual API calls to get user's plan and usage
        // For now, we'll use mock data
        setUserPlan({
          name: "Free",
          features: {
            videoUploadsLimit: 5,
            storageLimit: 500, // 500MB
          },
        });

        setUsageStats({
          uploadedThisMonth: 3,
          storageUsed: 250 * 1024 * 1024, // 250MB in bytes
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  };
  // Fetch owner team member permissions
  const [ownerPermissions, setOwnerPermissions] = useState(null);

  useEffect(() => {
    const fetchOwnerPermissions = async () => {
      try {
        const response = await userService.getOwnerProfile();

        const perms = {
          canUpload: response.canUpload,
          canEdit: response.canEdit,
          canDelete: response.canDelete,
        };
        setOwnerPermissions(perms);
      } catch (err) {
        console.error("Error fetching owner permissions:", err);
        setOwnerPermissions(null);
      }
    };

    fetchOwnerPermissions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    const validFiles = [];

    // Calculate total size of new files
    const newFilesSize = newFiles.reduce((total, file) => total + file.size, 0);

    // Check if adding these files would exceed storage limit
    const currentStorageMB = Math.round(usageStats.storageUsed / (1024 * 1024));
    const newStorageMB = Math.round(
      (usageStats.storageUsed + newFilesSize) / (1024 * 1024)
    );
    const storageLimitMB = userPlan.features.storageLimit;

    if (storageLimitMB !== -1 && newStorageMB > storageLimitMB) {
      // Show storage limit modal
      setLimitModalType("storageLimit");
      setLimitModalData({
        limit: storageLimitMB,
        current: currentStorageMB,
      });
      setShowLimitModal(true);
      return;
    }

    // Check if adding these files would exceed upload limit
    const uploadLimit = userPlan.features.videoUploadsLimit;
    const newTotalUploads =
      usageStats.uploadedThisMonth + files.length + newFiles.length;

    if (uploadLimit !== -1 && newTotalUploads > uploadLimit) {
      // Show upload limit modal
      setLimitModalType("videoUploadsLimit");
      setLimitModalData({
        limit: uploadLimit,
        current: usageStats.uploadedThisMonth + files.length,
      });
      setShowLimitModal(true);
      return;
    }

    // Validate each file
    newFiles.forEach((file) => {
      // Validate file type
      const validTypes = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          `Invalid file type: ${file.name}. Only video files are allowed.`
        );
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 100MB.`);
        return;
      }

      // Add unique ID to each file for tracking
      validFiles.push({
        id: Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      });
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);

      // Auto-fill title if empty and only one file is selected
      if (!formData.title && validFiles.length === 1 && files.length === 0) {
        setFormData((prev) => ({
          ...prev,
          title: validFiles[0].title,
        }));
      }
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));

    // Remove progress for this file
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Video title is required";
    }

    if (files.length === 0) {
      newErrors.files = "Please select at least one video file to upload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      // Initialize progress for each file
      const initialProgress = {};
      files.forEach((file) => {
        initialProgress[file.id] = 0;
      });
      setUploadProgress(initialProgress);

      // Create common data for all uploads
      const commonData = {
        title: formData.title,
        description: formData.description,
        bundleId: formData.bundleId || null,
      };

      // Use toast.promise for the entire upload process
      await toast.promise(
        videoService.uploadMultipleVideos(
          files,
          commonData,
          (fileId, progressEvent) => {
            // Update progress for this specific file
            setUploadProgress((prev) => ({
              ...prev,
              [fileId]: Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              ),
            }));
          }
        ),
        {
          loading:
            files.length === 1 ? "Uploading video..." : "Uploading videos...",
          success: (results) => {
            // Check if any result indicates a limit reached
            const limitReached = results.find(
              (result) =>
                result.upgradeRequired && result.feature === "videoUploadsLimit"
            );

            const MemberPermission = results.find(
              (result) => result.permission === false
            );

            if (MemberPermission) {
              setError(
                "You do not have permission to upload videos for this owner. Contact your owner for access."
              );
              toast.custom(
                (t) => (
                  <div
                    className={`bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded shadow-md flex items-center space-x-3 ${
                      t.visible ? "animate-enter" : "animate-leave"
                    }`}
                  >
                    <RiFileInfoFill className="text-red-500 w-6 h-6" />
                    <div>
                      <div className="font-semibold">Permission Denied</div>
                      <div className="text-sm">
                        You do not have permission to upload videos for this
                        owner.
                      </div>
                    </div>
                  </div>
                ),
                { duration: 6000 }
              );
              return;
            }

            if (limitReached) {
              setLimitModalType("videoUploadsLimit");
              setLimitModalData({
                limit: userPlan.features.videoUploadsLimit,
                current: usageStats.uploadedThisMonth + files.length + 1,
              });
              setShowLimitModal(true);
              return "Upload complete but limit reached";
            }

            // Check for successful uploads
            const allSuccessful = results.every((result) => result.success);

            if (allSuccessful) {
              onUploadComplete(true);
              data(results);
              // Reset form
              setFiles([]);
              setFormData({
                title: "",
                description: "",
                bundleId: "",
              });
              setErrors({});

              // Redirect to videos list
              if (location.pathname === "/videos/upload") {
                navigate("/videos");
              }
              return `Successfully uploaded ${results.length} video(s)!`;
            } else {
              setError(
                results[0].message ||
                  "Failed to upload videos. Please try again."
              );
              setLimitModalType("videoUploadsLimit");
              setLimitModalData({
                limit: userPlan.features.videoUploadsLimit,
                current: usageStats.uploadedThisMonth + files.length + 1,
              });
              setShowLimitModal(true);
              toast.error("Upload process failed.");
              // return results[0].message || "Upload failed";
            }
          },
          error: (error) => {
            console.error("Error in upload process:", error);
            setError("Failed to upload videos. Please try again.");
            return "Upload process failed";
          },
        }
      );
    } catch (error) {
      // This will only be reached if something throws outside the promise
      console.error("Unexpected error:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  // Calculate total size of all files
  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6 px-4 py-3">
        <IoCloudUploadOutline
          className="text-2xl text-primary-600"
          aria-hidden="true"
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Upload Videos</h1>
          <span className="text-sm text-gray-500 mt-1 sm:mt-0">
            Supported formats: MP4, MOV, AVI
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Files *
            </label>

            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 ${
                errors.files ? "border-red-300" : "border-gray-300"
              }${isDragging ? "border-blue-500 bg-blue-50" : ""}`}
              onClick={() => document.getElementById("video-upload").click()}
            >
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <RiUploadCloud2Line className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                MP4, MOV, AVI, or WEBM (max. 100MB per file)
              </p>
            </div>

            {errors.files && (
              <p className="mt-1 text-sm text-red-600">{errors.files}</p>
            )}

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Selected Files ({files.length})
                </h3>

                {files.map((fileObj) => (
                  <div key={fileObj.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RiVideoLine className="text-lg text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {fileObj.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(fileObj.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <RiCloseLine className="text-lg" />
                      </button>
                    </div>

                    {/* File size information */}
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <RiInformationLine className="mr-1" />
                        <span>Size: {formatFileSize(fileObj.size)}</span>
                      </div>

                      {/* Custom title input for each file */}
                      <div className="flex items-center">
                        <input
                          type="text"
                          placeholder="Custom title (optional)"
                          value={fileObj.title || ""}
                          onChange={(e) => {
                            setFiles((prev) =>
                              prev.map((f) =>
                                f.id === fileObj.id
                                  ? { ...f, title: e.target.value }
                                  : f
                              )
                            );
                          }}
                          className="text-sm p-1 border rounded"
                        />
                      </div>
                    </div>

                    {/* Upload progress for this file */}
                    {uploading && uploadProgress[fileObj.id] !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress[fileObj.id]}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full"
                            style={{ width: `${uploadProgress[fileObj.id]}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add more files button */}
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("video-upload").click()
                  }
                  className="flex items-center justify-center w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  disabled={uploading}
                >
                  <RiAddLine className="mr-1" />
                  Add More Files
                </button>
              </div>
            )}
          </div>

          {/* Common Title (for all videos) */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Default Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input ${errors.title ? "border-red-300" : ""}`}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be used as the default title for all videos unless a
              custom title is provided
            </p>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Video Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (applies to all videos)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="input"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 text-white bg-primary-600 rounded-lg hover:bg-primary-700 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 
                flex items-center justify-center space-x-2 font-medium shadow-sm"
            disabled={uploading || files.length === 0}
          >
            {uploading ? (
              <>
                <span className="animate-spin">⌛</span>
                <span>Uploading...</span>
              </>
            ) : (
              `Upload ${files.length} Video${files.length !== 1 ? "s" : ""}`
            )}
          </button>

          {/* Total file size information at the bottom */}
          {files.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RiInformationLine className="text-gray-500 mr-2" />
                  <span className="text-sm font-medium">Total Upload Size</span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatFileSize(totalSize)} ({files.length} file
                  {files.length !== 1 ? "s" : ""})
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
      {/* Subscription Limit Modal */}
      <SubscriptionLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        type={limitModalType}
        limit={limitModalData.limit}
        current={limitModalData.current}
        planName={userPlan.name}
      />
    </div>
  );
}
export default VideoUpload;
