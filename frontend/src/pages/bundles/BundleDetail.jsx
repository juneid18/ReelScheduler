import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { bundleService } from "../../services/bundleService";
import {
  FiEdit,
  FiTrash2,
  FiPlay,
  FiCalendar,
  FiPlus,
  FiX,
  FiAlertTriangle,
  FiArrowLeft,
} from "react-icons/fi";
import {
  RiFolderVideoLine,
  RiInformationLine,
  RiVideoAddLine,
  RiVideoLine,
} from "react-icons/ri";
import AddVideoModel from "./components/AddVideoModel";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";

function BundleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchBundle = async () => {
    try {
      setIsLoading(true);
      const data = await bundleService.getBundle(id);
      setBundle(data);
    } catch (error) {
      console.error("Error fetching bundle:", error);
      toast.error("Failed to load bundle details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBundle();
  }, [id]);

  const handleDelete = async () => {
    try {
      await bundleService.deleteBundle(id);
      toast.success("Bundle deleted successfully");
      navigate("/bundles");
    } catch (error) {
      console.error("Error deleting bundle:", error);
      toast.error("Failed to delete bundle");
    }
    setShowDeleteModal(false);
  };

  const handleItemRemove = async (videoId) => {
    try {
      await bundleService.deleteBundleVideo(bundle._id, videoId);
      toast.success("Video removed from bundle successfully");
      await fetchBundle();
    } catch (error) {
      console.error("Error removing video from bundle:", error);
      toast.error("Failed to remove video from bundle");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Bundle not found</h2>
        <p className="mt-2 text-gray-500">
          The bundle you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/bundles"
          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          Back to Bundles
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6 text-gray-700">
        <FiArrowLeft size={24} onClick={() => navigate('/bundles')} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
      </div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <RiFolderVideoLine className="text-2xl text-primary-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {bundle.name}
            </h1>
          </div>
          {bundle.createdAt && (
            <p className="text-sm text-gray-500">
              Created on{" "}
              {new Date(bundle.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate(`/bundles/${id}/edit`)}
            className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FiEdit className="mr-2" /> Edit Bundle
          </button>
          <button
            onClick={() => navigate(`/schedules/create?bundleId=${id}`)}
            className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <FiCalendar className="mr-2" /> Schedule
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <FiTrash2 className="mr-2" /> Delete
          </button>
        </div>
      </div>

      {/* Description Section */}
      {bundle.description && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <RiInformationLine className="text-gray-500" /> Description
          </h2>
          <p className="text-gray-700 whitespace-pre-line">
            {bundle.description}
          </p>
        </div>
      )}

      {/* Videos Section */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <RiVideoLine className="text-gray-500" /> Videos
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-1">
              {bundle.videos?.length || 0}
            </span>
          </h2>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center px-3.5 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="mr-1.5" /> Add Videos
          </button>
        </div>

        {bundle.videos?.length > 0 ? (
          <div className="space-y-4">
            {bundle.videos.map((video, idx) => (
              <div
                key={video.id || idx}
                className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors group relative"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="relative bg-gray-100 rounded-lg p-1 flex-shrink-0 shadow-sm overflow-hidden group-hover:shadow transition-all duration-200">
                      {video.thumbnailUrl ? (
                        <>
                          <Link to={`/videos/${video.videoId}`}>
                            <img
                              src={video.thumbnailUrl}
                              alt={video.fileName || `Video ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <FiPlay className="text-white text-opacity-0 group-hover:text-opacity-100 transition-opacity duration-200" />
                            </div>
                          </Link>
                        </>
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-md">
                          <RiVideoLine className="text-gray-500 text-4xl" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <h3 className="font-medium text-gray-900 truncate">
                        {video.fileName || `Video ${idx + 1}`}
                      </h3>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-auto">
                    <Link
                      to={`/videos/${video.videoId}`}
                      className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center gap-2"
                    >
                      <FiPlay className="text-base" />
                      <span>Play</span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemRemove(video.videoId);
                      }}
                      className="flex items-center px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg transition-all duration-200 bg-white hover:bg-gray-50 w-full sm:w-auto justify-center gap-2"
                    >
                      <FiTrash2 className="text-base" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="max-w-md mx-auto">
              <RiVideoAddLine className="mx-auto text-5xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No videos in this bundle
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by adding videos to create your collection
              </p>
              <button
                onClick={() => navigate(`/bundles/${id}/add-videos`)}
                className="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FiPlus className="mr-2 text-lg" />
                Add Videos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
          bundleName={bundle.name}
        />
      )}

      {/* Add Video Model */}
      <AddVideoModel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        refetch={fetchBundle}
        bundleID={id}
      />
    </div>
  );
}

export default BundleDetail;
