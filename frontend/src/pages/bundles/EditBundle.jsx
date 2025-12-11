import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { bundleService } from "../../services/bundleService";
import { FiSave, FiX } from "react-icons/fi";

function EditBundle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState({
    name: "",
    description: "",
    videos: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch bundle details
        const bundleData = await bundleService.getBundle(id);

        // Sort videos by order property
        const sortedVideos = [...bundleData.videos].sort(
          (a, b) => a.order - b.order
        );

        setBundle({
          ...bundleData,
          videos: sortedVideos,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load bundle data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBundle((prev) => ({ ...prev, [name]: value }));
  };

  // Native drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (index) => {
    if (draggedItem === null) return;

    if (draggedItem !== index) {
      const newVideos = [...bundle.videos];
      const [reorderedItem] = newVideos.splice(draggedItem, 1);
      newVideos.splice(index, 0, reorderedItem);

      // Update the order property to match new position
      const videosWithUpdatedOrder = newVideos.map((video, idx) => ({
        ...video,
        order: idx,
      }));

      setBundle((prev) => ({
        ...prev,
        videos: videosWithUpdatedOrder,
      }));
      setDraggedItem(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleRemoveVideo = (index) => {
    const newVideos = [...bundle.videos];
    newVideos.splice(index, 1);

    // Recalculate order after removal
    const videosWithUpdatedOrder = newVideos.map((video, idx) => ({
      ...video,
      order: idx,
    }));

    setBundle((prev) => ({
      ...prev,
      videos: videosWithUpdatedOrder,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // Prepare the updated bundle with videos in current order
      const updatedBundle = {
        name: bundle.name,
        description: bundle.description,
        videos: bundle.videos.map((video) => ({
          videoId: video.videoId,
          order: video.order,
        })),
      };

      await bundleService.updateBundle(id, updatedBundle);

      toast.success("Bundle updated successfully");
      navigate(`/bundles/${id}`);
    } catch (error) {
      console.error("Error updating bundle:", error);
      toast.error("Failed to update bundle");
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
        <h1 className="text-2xl font-bold text-gray-800">Edit Bundle</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={bundle.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
          ></textarea>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Bundle Videos</h3>
          <p className="text-sm text-gray-500">
            Drag and drop to reorder videos | Videos: {bundle.videos.length}
          </p>

          {bundle.videos.length > 0 ? (
            <div className="space-y-2">
              {bundle.videos.map((video, index) => (
                <div
                  key={`${video._id}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={() => handleDragOver(index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-3 bg-white border rounded-md transition-all ${
                    draggedItem === index
                      ? "border-primary-500 bg-primary-50 opacity-70"
                      : "border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="flex items-center space-x-3 flex-grow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 cursor-move"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                      <div className="flex items-center space-x-2">
                        <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium">{video.fileName}</h4>
                          <div className="text-xs text-gray-500">
                            {video.status === "pending" ? (
                              <span className="text-yellow-600">
                                Processing
                              </span>
                            ) : video.status === "completed" ? (
                              <span className="text-green-600">Ready</span>
                            ) : (
                              <span className="text-red-600">Error</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        title="Remove video"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md">
              No videos in this bundle
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/bundles/${id}`)}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
          <FiX className="inline-block mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <FiSave className="h-5 w-5 mr-2" />
                Save Changes
              </span>
            )}
          </button>
        </div>
          
        </div>
      </form>
    </div>
  );
}

export default EditBundle;
