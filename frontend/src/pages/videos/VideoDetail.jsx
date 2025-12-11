import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { videoService } from "../../services/videoService";
import {
  RiArrowLeftLine,
  RiDeleteBin6Line,
  RiYoutubeLine,
  RiDownloadLine,
  RiRefreshLine,
  RiEdit2Line,
  RiInstagramLine,
  RiFacebookCircleLine,
} from "react-icons/ri";
import { PiDatabase } from "react-icons/pi";
import { MdModeEdit } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";

function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [youtubeAuthRequired, setYoutubeAuthRequired] = useState(false);
  const [isReconnectingYoutube, setIsReconnectingYoutube] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFromYoutube, setDeleteFromYoutube] = useState(false);
  const [useBackupPlayer, setUseBackupPlayer] = useState(false);
  const videoRef = useRef(null);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      const response = await videoService.getVideo(id);

      if (response && response.data) {
        setVideo(response.data);

        // Handle video URL extraction
        if (response.data.videoUrls && response.data.videoUrls.length > 0) {
          // Check if videoUrls is an array of objects or strings
          let url;
          const firstVideoUrl = response.data.videoUrls[0];

          if (typeof firstVideoUrl === "string") {
            url = firstVideoUrl;
          } else if (firstVideoUrl && firstVideoUrl.url) {
            url = firstVideoUrl.url;
          } else {
            // Fallback to direct URL if available
            url = response.data.videoUrl || "";
          }

          setVideoUrl(url);
        } else {
          console.warn("No video URLs found in response");
          setError("Video has no playable sources");
        }
      } else if (response && response.status === 404) {
        setNotFound(true);
      } else {
        setNotFound(true);
        console.error("Invalid response format:", response);
      }
    } catch (err) {
      console.error("Error fetching video:", err);
      if (err.response && err.response.status === 404) {
        setNotFound(true);
      } else {
        setError("Failed to load video. Please try again later.");
        toast.error("Error loading video");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const handleVideoError = (e) => {
    console.error("Video error:", e);
    setUseBackupPlayer(true);
    toast.error("Error playing video. Switching to backup player.");
  };

  const handleDownload = () => {
    if (!videoUrl) {
      toast.error("No video URL available for download");
      return;
    }

    // Create a temporary anchor element
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = video?.title || "video";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteVideo = async () => {
    setShowDeleteModal(true);
  };

  // New delete function that takes a boolean parameter
  const deleteVideo = async (deleteYoutube) => {
    try {
      if (!video || !video._id) {
        toast.error("Cannot delete: Video ID not found");
        return;
      }

      setShowDeleteModal(false);
      toast("Deleting video...", {
        icon: "ℹ️",
      });

      // Call the API with the deleteYoutube parameter
      await videoService.deleteVideo(video._id, deleteYoutube);

      toast.success("Video deleted successfully");
      navigate("/videos");
    } catch (err) {
      console.error("Error deleting video:", err);

      if (err.response?.status === 401 && err.response?.data?.authRequired) {
        setYoutubeAuthRequired(true);
        toast.error("YouTube authentication required to delete from YouTube");
      } else {
        toast.error("Failed to delete video. Please try again.");
      }
    }
  };

  const handleUploadToYoutube = async (id, videoUrl) => {
    try {
      setYoutubeAuthRequired(false);
      toast("Uploading to YouTube...", {
        icon: "ℹ️",
      });

      // Get user's default privacy setting from localStorage or context
      let privacyStatus = null;
      try {
        const youtubeSettings = JSON.parse(
          localStorage.getItem("youtubeSettings") || "{}"
        );
        if (youtubeSettings.defaultPrivacyStatus) {
          privacyStatus = youtubeSettings.defaultPrivacyStatus;
        }
      } catch (e) {
        console.error("Error parsing YouTube settings:", e);
      }

      const result = await videoService.uploadToYoutube(
        id,
        videoUrl,
        privacyStatus
      );

      if (result.success) {
        toast.success("Video uploaded to YouTube successfully");
        // Refresh video data
        fetchVideo();
      } else {
        toast.error(result.message || "Failed to upload to YouTube");
      }
    } catch (err) {
      console.error("YouTube upload error:", err);

      if (err.isAuthError) {
        setYoutubeAuthRequired(true);
      } else {
        toast.error("Failed to upload to YouTube. Please try again.");
      }
    }
  };

  const handleUploadToInstagram = async (id, videoUrl) => {
    return toast.promise(videoService.uploadToInstagram(id, videoUrl), {
      loading: "Uploading to Instagram...",
      success: (result) => {
        if (result.success) {
          fetchVideo();
          return "Video uploaded to Instagram successfully";
        }
        throw new Error(result.message || "Upload failed");
      },
      error: (err) => {
        console.error("Instagram upload error:", err);
        if (err.isAuthError) {
          // Handle auth error specifically if needed
          return "Instagram authentication required";
        }
        return "Failed to upload to Instagram";
      },
    });
  };

  const handleUploadToFacebook = async (id, videoUrl, description, title) => {
    return toast.promise(
      videoService.uploadToFacebook(id, videoUrl, description, title),
      {
        loading: "Uploading to Facebook...",
        success: (result) => {
          if (result.success) {
            fetchVideo();
            return "Video uploaded to Facebook successfully";
          }
          throw new Error(result.message || "Upload failed");
        },
        error: (err) => {
          console.error("Facebook upload error:", err);
          if (err.response?.data?.authRequired) {
            return "Facebook authentication required";
          }
          return "Failed to upload to Facebook";
        },
      }
    );
  };

  const handleReconnectYoutube = async () => {
    try {
      setIsReconnectingYoutube(true);

      // Redirect to the YouTube auth page
      const response = await fetch("/api/auth/youtube/url");
      const data = await response.json();

      if (data.url) {
        // Store the current page URL to redirect back after auth
        localStorage.setItem("youtubeAuthRedirect", window.location.pathname);

        // Open the auth URL in a new window
        window.open(data.url, "youtube-auth", "width=600,height=600");

        // Set up a listener to check when auth is complete
        const checkAuthInterval = setInterval(() => {
          const authComplete = localStorage.getItem("youtubeAuthComplete");
          if (authComplete === "true") {
            clearInterval(checkAuthInterval);
            localStorage.removeItem("youtubeAuthComplete");

            // Refresh the page to get new tokens
            window.location.reload();
          }
        }, 1000);

        // Clear interval after 2 minutes to prevent memory leaks
        setTimeout(() => {
          clearInterval(checkAuthInterval);
          setIsReconnectingYoutube(false);
        }, 120000);
      } else {
        toast.error("Failed to get YouTube authentication URL");
        setIsReconnectingYoutube(false);
      }
    } catch (error) {
      console.error("Error reconnecting YouTube:", error);
      toast.error("Failed to reconnect YouTube account");
      setIsReconnectingYoutube(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Video Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The video you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/videos" className="text-primary-600 hover:text-primary-800">
          Back to Videos
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchVideo}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="space-y-6">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Video</h3>
            <p className="text-gray-700 mb-4">
              {video.youtubeVideoId
                ? "This video is also uploaded to YouTube. Would you like to delete it from YouTube as well?"
                : "Are you sure you want to delete this video?"}
            </p>

            {video.youtubeVideoId && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deleteFromYoutube}
                    onChange={() => setDeleteFromYoutube(!deleteFromYoutube)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">
                    Also delete from YouTube
                  </span>
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteVideo(deleteFromYoutube)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header with back button */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
        >
          <RiArrowLeftLine className="text-2xl" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {video?.title}
        </h1>
      </div>
      {youtubeAuthRequired && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 flex items-center">
            <RiYoutubeLine className="text-red-600 mr-2" />
            YouTube Authentication Required
          </h3>
          <p className="mt-2 text-sm text-red-700">
            Your YouTube authentication has expired or is invalid. Please
            reconnect your YouTube account to continue.
          </p>
          <button
            onClick={handleReconnectYoutube}
            disabled={isReconnectingYoutube}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {isReconnectingYoutube ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Connecting...
              </>
            ) : (
              <>
                <RiYoutubeLine className="mr-2" />
                Reconnect YouTube
              </>
            )}
          </button>
        </div>
      )}
      {/* Video Container */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Video Player */}
        <div className="relative pt-[56.25%] bg-black">
          {!useBackupPlayer ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                poster={video?.thumbnailUrl}
                className="absolute top-0 left-0 w-full h-full object-contain"
                onError={handleVideoError}
                onLoadStart={() => console.log("Video load started:", videoUrl)}
                onLoadedData={() =>
                  console.log("Video data loaded successfully")
                }
                onCanPlay={() => console.log("Video can play now")}
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="p-2 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-opacity-100 transition-all"
                  title="Download video"
                >
                  <RiDownloadLine className="text-xl" />
                </button>
              </div>
            </>
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-900 p-6">
              <p className="text-white mb-4 text-lg">
                Video player encountered an error
              </p>
              <p className="text-gray-300 mb-6 text-sm text-center">
                This may be because the video is in a private bucket or the URL
                is invalid. Try downloading the video instead.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center"
                  download={video?.title || "video"}
                >
                  <RiDownloadLine className="mr-2" />
                  Download Video
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                {video.title}
              </h2>
              <p className="text-gray-600 mt-2 flex items-center">
                <CiCalendarDate className="mr-1" />
                Uploaded on {formatDate(video.createdAt)}{" "}
                <PiDatabase className="ml-2 mr-1" />
                {formatFileSize(video.fileSize)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <Link
                to={`/videos/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <MdModeEdit className="mr-2" />
                Edit
              </Link>

              {!video.youtubeVideoId && video.status === "ready" && (
                <button
                  onClick={() =>
                    handleUploadToYoutube(
                      video._id,
                      video.videoUrl ||
                        (video.videoUrls && video.videoUrls.length > 0
                          ? video.videoUrls[0].url || video.videoUrls[0]
                          : null)
                    )
                  }
                  disabled={!video._id}
                  className="inline-flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <RiYoutubeLine className="mr-2" />
                  YouTube
                </button>
              )}

              {/* Instagram Upload Button (only if not already uploaded) */}
              {/* {!video.instagramVideoId && video.status === "ready" && (
                <button
                  onClick={() =>
                    handleUploadToInstagram(
                      video._id,
                      video.videoUrl ||
                        (video.videoUrls && video.videoUrls.length > 0
                          ? video.videoUrls[0].url || video.videoUrls[0]
                          : null)
                    )
                  }
                  disabled={!video._id}
                  className="inline-flex items-center px-4 py-2 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <RiInstagramLine className="mr-2" />
                  Instagram
                </button>
              )} */}

              {/* Facebook Upload Button (only if not already uploaded) */}
              {/* {!video.facebookVideoId && video.status === "ready" && (
                <button
                  onClick={() =>
                    handleUploadToFacebook(
                      video._id,
                      video.videoUrl ||
                        (video.videoUrls && video.videoUrls.length > 0
                          ? video.videoUrls[0].url || video.videoUrls[0]
                          : null),
                      video.description,
                      video.title
                    )
                  }
                  disabled={!video._id}
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <RiFacebookCircleLine className="mr-2" />
                  Facebook
                </button>
              )} */}

              <button
                onClick={handleDeleteVideo}
                className="inline-flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <RiDeleteBin6Line className="mr-2" />
                Delete
              </button>
            </div>
          </div>

          {/* YouTube Link */}
          {video.youtubeVideoId && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start">
                <RiYoutubeLine className="text-red-600 text-2xl mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    Published on YouTube
                  </p>
                  <a
                    href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 text-red-600 hover:text-red-800 hover:underline transition-colors duration-200"
                  >
                    View on YouTube
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mt-8">
            <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-3">
              Description
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {video.description || (
                <span className="text-gray-400 italic">
                  No description provided.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoDetail;
