import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { videoService } from "../../services/videoService";
import {
  RiArrowLeftLine,
  RiCloseFill,
  RiSaveLine,
  RiYoutubeLine,
  RiImageLine,
  RiUploadLine,
} from "react-icons/ri";
import toast from "react-hot-toast";

function VideoEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [hasYoutubeVideo, setHasYoutubeVideo] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [updateYoutube, setUpdateYoutube] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await videoService.getVideo(id);
        const video = response.data;
        console.log("Fetched video:", video);

        const videoUrl = video.videoUrls.find((url) => url._id === id);
        if (videoUrl) {
          setFormData((prev) => ({
            ...prev,
            thumbnail: {
              public_id: videoUrl._id,
              url: videoUrl.thumbnailUrl,
              originalUrl: videoUrl.thumbnailUrl,
            },
          }));
        } else if (video.thumbnailUrl) {
          // Fallback to main thumbnail URL if no specific videoUrl found
          setFormData((prev) => ({
            ...prev,
            thumbnail: {
              url: video.thumbnailUrl,
              originalUrl: video.thumbnailUrl,
            },
          }));
        }

        setVideoId(video._id);
        setFormData((prev) => ({
          ...prev,
          title: video.title || "",
          description: video.description || "",
        }));

        // Check if video has been uploaded to YouTube
        if (video.youtubeVideoId) {
          setHasYoutubeVideo(true);
          setYoutubeVideoId(video.youtubeVideoId);
        } else {
          setHasYoutubeVideo(false);
          setYoutubeVideoId(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching video:", err);
        setError("Failed to load video. Please try again later.");
        setLoading(false);
        toast.error("Error loading video");
      }
    };

    fetchVideo();
  }, [id]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB');
        return;
      }

      setThumbnailFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);

      // Update form data to show preview
      setFormData(prev => ({
        ...prev,
        thumbnail: {
          ...prev.thumbnail,
          url: previewUrl,
          isNew: true
        }
      }));
    }
  };

  const uploadThumbnail = async () => {
    if (!thumbnailFile) return null;

    try {
      setUploadingThumbnail(true);

      const formData = new FormData();
      formData.append('thumbnail', thumbnailFile);

      const response = await videoService.updateVideoThumbnail(videoId, formData);

      if (response.success) {
        toast.success('Thumbnail updated successfully');
        return response.thumbnailUrl;
      } else {
        throw new Error('Failed to upload thumbnail');
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Failed to upload thumbnail');
      throw error;
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim()) {
      toast.error("Video title is required");
      return;
    }

    try {
      setSaving(true);

      // Upload thumbnail first if a new one was selected
      let thumbnailUrl = formData.thumbnail?.url;
      if (thumbnailFile && formData.thumbnail?.isNew) {
        try {
          thumbnailUrl = await uploadThumbnail();
        } catch (thumbnailError) {
          // Don't stop the entire update if thumbnail upload fails
          console.error("Thumbnail upload failed, continuing with video update:", thumbnailError);
        }
      }

      const videoData = {
        title: formData.title,
        description: formData.description,
        updateYoutube: hasYoutubeVideo && updateYoutube,
        thumbnailUrl: thumbnailUrl,
      };

      const response = await videoService.updateVideo(videoId, videoData);

      if (response.success) {
        if (hasYoutubeVideo && updateYoutube) {
          toast.success(
            "Video updated successfully in database and on YouTube"
          );
        } else {
          toast.success("Video updated successfully in database");
        }
        navigate(`/videos/${id}`);
      } else {
        toast.error("Failed to update video. Please try again.");
      }
    } catch (err) {
      console.error("Error updating video:", err);
      if (err.response?.status === 401 && hasYoutubeVideo && updateYoutube) {
        toast.error(
          "YouTube authorization expired. Please reconnect your account in settings."
        );
      } else {
        toast.error("Failed to update video. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }
  console.log("formDAta", formData);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
        >
          <RiArrowLeftLine className="text-2xl" />
        </button>
        <h1 className="text-2xl font-bold">Edit Video</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md outline-none border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2"
              placeholder="Enter video title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full outline-none rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2"
              placeholder="Enter video description"
            ></textarea>
          </div>
          {/* Thumbnail Upload */}
          <div>
            <label
              htmlFor="thumbnail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Thumbnail
            </label>
            <div className="mt-1 flex items-center gap-4">
              <div className="relative h-32 w-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                {formData.thumbnail?.url ? (
                  <>
                    <img
                      src={formData.thumbnail.url}
                      alt="Current Thumbnail"
                      className="h-full w-full object-cover rounded-xl"
                    />
                    {formData.thumbnail?.isNew && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                        New
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 text-center">
                    <RiImageLine className="h-8 w-8 mx-auto mb-1" />
                    <span className="text-xs">No Thumbnail</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="thumbnail"
                  className={`cursor-pointer px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow transition-colors duration-200 text-center flex items-center gap-2 ${
                    uploadingThumbnail ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RiUploadLine className="h-4 w-4" />
                  {uploadingThumbnail ? 'Uploading...' : 'Change Thumbnail'}
                </label>
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                  disabled={uploadingThumbnail}
                />
                {formData.thumbnail?.isNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                      setFormData(prev => ({
                        ...prev,
                        thumbnail: {
                          ...prev.thumbnail,
                          url: prev.thumbnail?.originalUrl || prev.thumbnail?.url,
                          isNew: false
                        }
                      }));
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Cancel Change
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Upload a new thumbnail image (JPG, PNG, GIF - max 5MB)
            </p>
          </div>

          {/* YouTube Update Option */}
          {hasYoutubeVideo && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="updateYoutube"
                    name="updateYoutube"
                    type="checkbox"
                    checked={updateYoutube}
                    onChange={() => setUpdateYoutube(!updateYoutube)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="updateYoutube"
                    className="font-medium text-gray-700 flex items-center"
                  >
                    <RiYoutubeLine className="text-red-600 mr-1" />
                    Also update on YouTube
                  </label>
                  <p className="text-gray-500">
                    This video has been uploaded to YouTube. Check this box to
                    update the YouTube video with the new title and description.
                  </p>
                  {youtubeVideoId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 mt-1 inline-block"
                    >
                      View on YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition font-medium shadow-sm"
            >
              <RiCloseFill className="text-xl mr-1" /> Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-sm disabled:opacity-60"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <RiSaveLine className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VideoEdit;
