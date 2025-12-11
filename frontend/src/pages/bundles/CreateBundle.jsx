import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { bundleService } from "../../services/bundleService";
import { videoService } from "../../services/videoService";
import { RiVideoAddLine } from "react-icons/ri";
import SubscriptionLimitModal from "../../components/SubscriptionLimitModal";
import { useAuth } from "../../contexts/AuthContext";

function CreateBundle() {
  const navigate = useNavigate();
  const { userPlan } = useAuth();

  const [bundle, setBundle] = useState({
    name: "",
    description: "",
  });
  const [availableVideos, setAvailableVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState("");
  const [limitModalData, setLimitModalData] = useState({
    limit: 0,
    current: 0,
  });

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const videos = await videoService.getVideos();
        setAvailableVideos(videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast.error("Failed to load videos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBundle((prev) => ({ ...prev, [name]: value }));
  };

  // map for quick order lookup
  const videoOrderMap = useMemo(() => {
    return selectedVideos.reduce((map, video, index) => {
      map[video.videoId] = index + 1; // 1-based index
      return map;
    }, {});
  }, [selectedVideos]);

  const handleVideoToggle = (videoId, fileName, thumbnailUrl) => {
    setSelectedVideos((prev) => {
      if (prev.some((v) => v.videoId === videoId)) {
        // Remove video and reorder remaining
        return prev
          .filter((v) => v.videoId !== videoId)
          .map((video, index) => ({
            ...video,
            order: index, // Update order after removal
          }));
      } else {
        // Add new video at the end
        return [
          ...prev,
          {
            videoId,
            fileName,
            thumbnailUrl, // Store thumbnail URL
            order: prev.length,
          },
        ];
      }
    });
  };
  // Check if a video is selected
  const isSelected = (videoId) => {
    return selectedVideos.some((v) => v.videoId === videoId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedVideos.length === 0) {
      toast.warning("Please select at least one video for the bundle");
      return;
    }

    try {
      setIsSubmitting(true);

      const newBundle = {
        ...bundle,
        videos: selectedVideos.map((video, index) => ({
          ...video,
          order: index,
        })),
      };
      console.log(newBundle);

      const result = await bundleService.createBundle(newBundle);
      toast.success("Bundle created successfully");
      navigate(`/bundles/${result.bundleId}`);
    } catch (error) {
      if (error.response?.data?.upgradeRequired) {
        toast.error("You need to upgrade your plan to create more bundles");
        setLimitModalType("bundleLimit");
        setLimitModalData({
          limit: userPlan?.features?.bundleLimit || 2,
          current: (userPlan?.features?.bundleLimit || 2) + 1,
        });
        setShowLimitModal(true);
        return;
      }
      console.error("Error creating bundle:", error);
      toast.error("Failed to create bundle");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Bundle</h1>
        <button
          onClick={() => navigate("/bundles")}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Bundle Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={bundle.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

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
            rows="4"
            value={bundle.description}
            onChange={handleChange}
            className="mt-1 block w-full h-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          ></textarea>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Select Videos
          </h3>
          {availableVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableVideos.map((video) => (
                <div key={video._id} className="space-y-4 mb-6">
                  <div className="space-y-3">
                    {video.videoUrls?.map((videoUrl) => (
                      <div
                        key={videoUrl._id}
                        className={`relative group border-2 rounded-xl p-3 cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                          isSelected(videoUrl._id)
                            ? "border-primary-500 bg-primary-50/50 shadow-sm"
                            : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          handleVideoToggle(
                            videoUrl._id,
                            videoUrl.fileName,
                            videoUrl.thumbnailUrl
                          )
                        }
                      >
                        {/* Order Badge */}
                        {videoOrderMap[videoUrl._id] && (
                          <span className="absolute -top-3 -left-3 bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md z-10">
                            {videoOrderMap[videoUrl._id]}
                          </span>
                        )}

                        {/* Thumbnail preview */}
                        {videoUrl.thumbnailUrl && (
                          <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={videoUrl.thumbnailUrl}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={!!videoOrderMap[videoUrl._id]}
                            readOnly
                            className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          />

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {videoUrl.fileName ||
                                video.title ||
                                `Video ${videoUrl._id.slice(-4)}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(video.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <RiVideoAddLine className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No videos available
              </h3>
              <p className="text-gray-500 mb-6">Upload videos to get started</p>
              <button
                type="button"
                onClick={() => navigate("/videos/upload")}
                className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <RiVideoAddLine className="mr-2 -ml-1" />
                Upload Videos
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || selectedVideos.length === 0}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Bundle"}
          </button>
        </div>
      </form>
      {/* Subscription Limit Modal */}
      <SubscriptionLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        type={limitModalType}
        limit={limitModalData.limit}
        current={limitModalData.current}
        planName={userPlan?.name || "Free"}
      />
    </div>
  );
}

export default CreateBundle;
