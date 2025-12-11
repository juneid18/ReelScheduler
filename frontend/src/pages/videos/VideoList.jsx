import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ModeEditOutlineRounded as ModeEditOutlineRoundedIcon,
  DeleteRounded as DeleteRoundedIcon,
  YouTube as YouTubeIcon,
  VideoCallTwoTone as VideoCallTwoToneIcon,
  Instagram as InstagramIcon,
} from "@mui/icons-material";
import { videoService } from "../../services/videoService";
import { IoAlbumsOutline } from "react-icons/io5";
import { RiFacebookCircleLine } from "react-icons/ri"; // Add this import
import { FiInfo } from "react-icons/fi";

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFromYoutube, setDeleteFromYoutube] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await videoService.getVideos();

      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        console.error("Unexpected response format:", data);
        setVideos([]);
        setError("Received invalid data format from server");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching videos:", err);
      if (err.response?.data?.message === "No videos found") {
        setVideos([]);
        setLoading(false);
        return;
      }
      if (
        err.response?.data?.permission === false ||
        err.response?.data?.message === "You do not have permission to view owner's videos"
      ) {
        setError(
          "You do not have permission to view this owner's videos. Contact to your owner to get access."
        );
        // Show a nice alert for permission denied
        toast.custom(
          (t) => (
            <div
              className={`bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded shadow-md flex items-center space-x-3 ${
                t.visible ? "animate-enter" : "animate-leave"
              }`}
            >
              <FiInfo className="text-red-500 w-6 h-6" />
              <div>
                <div className="font-semibold">Permission Denied</div>
                <div className="text-sm">
                  You do not have permission to view this owner's videos.
                </div>
              </div>
            </div>
          ),
          { duration: 6000 }
        );
        toast.dismiss();
        setVideos([]);
        setLoading(false);
        return;
      }
      setError("Failed to load videos. Please try again later.");
      toast.error("Error loading videos");
      setVideos([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDeleteVideo = (video) => {
    if (video.youtubeVideoId) {
      // If video is on YouTube, show modal to ask user
      setVideoToDelete(video);
      setShowDeleteModal(true);
    } else {
      // If not on YouTube, just confirm and delete
      if (!window.confirm("Are you sure you want to delete this video?")) {
        return;
      }

      deleteVideo(video._id, false);
    }
  };

  const deleteVideo = async (id, deleteYoutube) => {
    try {
      setShowDeleteModal(false);
      toast("Deleting video...", {
        icon: "ℹ️",
      });

      // Call the API with the deleteYoutube parameter
      await videoService.deleteVideo(id, deleteYoutube);

      // Update the UI
      setVideos((prev) => prev.filter((video) => video._id !== id));

      toast.success("Video deleted successfully");
    } catch (err) {
      console.error("Error deleting video:", err);

      if (err.response?.status === 401 && err.response?.data?.authRequired) {
        toast.error(
          "YouTube authentication required to delete from YouTube. Please go to settings to reconnect."
        );
      } else {
        toast.error("Failed to delete video. Please try again.");
      }
    }
  };

  const handleUploadToYoutube = async (id) => {
    return toast.promise(videoService.uploadToYoutube(id), {
      loading: "Uploading to YouTube...",
      success: () => {
        fetchVideos();
        return "Video uploaded to YouTube successfully";
      },
      error: (err) => {
        if (err.response?.status === 401) {
          return "YouTube authorization expired. Please reconnect your account in settings.";
        }
        return "Failed to upload to YouTube. Please try again.";
      },
    });
  };

  const handleUploadToInstagram = async (id, videoUrl) => {
    return toast.promise(videoService.uploadToInstagram(id, videoUrl), {
      loading: "Uploading to Instagram...",
      success: (result) => {
        if (result.success) {
          fetchVideos();
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
            fetchVideos();
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

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {showDeleteModal && videoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Video</h3>
            <p className="text-gray-700 mb-4">
              "{videoToDelete.title}" is also uploaded to YouTube. Would you
              like to delete it from YouTube as well?
            </p>

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

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteVideo(videoToDelete._id, deleteFromYoutube)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 px-4 py-3">
        {/* Title with icon */}
        <div className="flex items-center gap-3">
          <IoAlbumsOutline className="text-2xl text-primary-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Videos
          </h1>
          <span className="hidden sm:inline-block ml-2 px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
            {videos.length || 0} videos
          </span>
        </div>

        {/* Upload button with responsive sizing */}
        <Link
          to="/videos/upload"
          className="btn btn-primary flex items-center gap-2 px-4 py-2.5 text-sm sm:text-base font-medium rounded-lg transition-all hover:shadow-md"
          aria-label="Upload new video"
        >
          <VideoCallTwoToneIcon className="text-lg" />
          <span className="hidden xs:inline">Upload Video</span>
          <span className="xs:hidden">Upload</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      ) : !videos || videos.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No videos yet
          </h2>
          <p className="text-gray-500 mb-4">
            Upload your first video to get started
          </p>
          <Link to="/videos/upload" className="btn btn-primary">
            Upload Video
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Video
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    YouTube
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {videos.map((video) => {
                  const hasVideoUrls =
                    Array.isArray(video.videoUrls) && video.videoUrls.length > 0;
                  const primaryVideo =
                    (hasVideoUrls &&
                      video.videoUrls.find(
                        (file) => file && (file.platform === "appwrite" || file.url)
                      )) ||
                    (hasVideoUrls ? video.videoUrls[0] : null);
                  const primaryVideoId = primaryVideo?._id || video._id;
                  const primaryVideoUrl =
                    video.videoUrl ||
                    (typeof primaryVideo === "string" ? primaryVideo : primaryVideo?.url) ||
                    null;
                  const editTargetId =
                    typeof primaryVideo === "object" && primaryVideo?._id
                      ? primaryVideo._id
                      : null;

                  return (
                    <tr key={video._id || primaryVideoId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-20 w-36 relative">
                          {hasVideoUrls ? (
                            video.videoUrls.map((file, index) => (
                              <Link
                                key={index}
                                to={file?._id ? `/videos/${file._id}` : "#"}
                                className="absolute inset-0 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                {file?.thumbnailUrl ? (
                                  <img
                                    src={file.thumbnailUrl}
                                    alt={video?.title}
                                    className="h-full w-full object-cover rounded"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-200 rounded flex items-center justify-center">
                                    <VideoCallTwoToneIcon className="text-gray-400 text-2xl" />
                                  </div>
                                )}
                              </Link>
                            ))
                          ) : (
                            <div className="h-full w-full bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400">No video</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/videos/${video._id || primaryVideoId}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600"
                          >
                            {video.title}
                          </Link>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {video.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <p>Size: {formatFileSize(video.fileSize)}</p>
                        <p>
                          Uploaded:{" "}
                          {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          video.status === "ready"
                            ? "bg-green-100 text-green-800"
                            : video.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : video.status === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {video.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {video.youtubeVideoId ? (
                        <a
                          href={
                            video.youtubeUrl ||
                            `https://www.youtube.com/watch?v=${video.youtubeVideoId}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <YouTubeIcon className="text-red-600 mr-1" />
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">Not uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={editTargetId ? `/videos/${editTargetId}/edit` : "#"}
                          className={`text-blue-500 hover:text-blue-900 transition-colors duration-200 ${
                            editTargetId ? "" : "opacity-50 pointer-events-none"
                          }`}
                        >
                          <ModeEditOutlineRoundedIcon className="text-xl" />
                        </Link>

                        {/* Youtube Button */}
                        {!video.youtubeVideoId && video.status === "ready" && (
                          <button
                            onClick={() =>
                              handleUploadToYoutube(
                                video._id,
                                primaryVideoUrl
                              )
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Upload to YouTube"
                          >
                            <YouTubeIcon className="text-xl" />
                          </button>
                        )}
                        {/* Instagram Button */}
                        {/* {!video.youtubeVideoId && video.status === "ready" && (
                          <button
                            onClick={() =>
                              handleUploadToInstagram(
                                video._id,
                                video.videoUrl ||
                                  (video.videoUrls && video.videoUrls.length > 0
                                    ? video.videoUrls[0].url ||
                                      video.videoUrls[0]
                                    : null)
                        )}
                            className="text-pink-600 hover:text-pink-900" // Changed to Instagram's pink color
                            title="Upload to Instagram"
                            disabled={!video.videoUrl && !video.videoUrls?.[0]}
                          >
                            <InstagramIcon className="text-xl" />
                          </button>
                        )} */}

                        {/* Facebook Button */}
                        {/* {!video.facebookVideoId && video.status === "ready" && (
                          <button
                            onClick={() =>
                              handleUploadToFacebook(
                                video._id,
                                video.videoUrl ||
                                  (video.videoUrls && video.videoUrls.length > 0
                                    ? video.videoUrls[0].url ||
                                      video.videoUrls[0]
                                    : null),
                                video.description,
                                video.title
                              )
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="Upload to Facebook"
                            disabled={!video.videoUrl && !video.videoUrls?.[0]}
                          >
                            <RiFacebookCircleLine className="text-xl" />
                          </button>
                        )} */}

                        <button
                          onClick={() => handleDeleteVideo(video)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete video"
                        >
                          <DeleteRoundedIcon className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoList;
