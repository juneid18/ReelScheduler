import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RiVideoAddLine,
  RiSearchLine,
  RiFilterLine,
  RiVideoLine,
} from "react-icons/ri";
import { bundleService } from "../../services/bundleService";
import {
  FiArrowRight,
  FiCalendar,
  FiDelete,
  FiEdit2,
  FiFolder,
  FiInfo,
  FiPlus,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";

function BundleList() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const getBundles = await bundleService.getBundles();
        setBundles(getBundles);
      } catch (error) {
        if (error.response?.data?.permission === false) {
          setError("Permission denied. You cannot view this owner's bundles.");
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
          return;
        }
        console.error("Error fetching bundles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  const filteredBundles = bundles.filter(
    (bundle) =>
      bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBundles = [...filteredBundles].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "videoCount") {
      return sortOrder === "asc"
        ? a.videoCount - b.videoCount
        : b.videoCount - a.videoCount;
    } else {
      return sortOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const handleSort = useCallback(
    (field) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder("desc");
      }
    },
    [sortBy]
  );

  const openDeleteModal = useCallback((bundle) => {
    setBundleToDelete(bundle);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!bundleToDelete) return;
    setDeleting(true);
    try {
      await bundleService.deleteBundle(bundleToDelete._id);
      toast.success("Bundle deleted successfully");
      setBundles((prev) => prev.filter((b) => b._id !== bundleToDelete._id));
      setShowDeleteModal(false);
      setBundleToDelete(null);
    } catch (error) {
      console.error("Error deleting bundle:", error);
      toast.error("Failed to delete bundle");
    } finally {
      setDeleting(false);
    }
  }, [bundleToDelete]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <RiVideoLine
            className="text-2xl text-primary-600"
            aria-hidden="true"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Video Bundles
          </h1>
          <span className="hidden sm:inline-block ml-2 px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
            {bundles?.length || 0}{" "}
            {bundles?.length === 1 ? "bundle" : "bundles"}
          </span>
        </div>
        <Link
          to="/bundles/create"
          className="btn btn-primary flex items-center gap-2 px-4 py-2.5 text-sm sm:text-base font-medium rounded-lg transition-all hover:shadow-md hover:bg-primary-600 focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
          aria-label="Create new video bundle"
        >
          <RiVideoAddLine className="text-lg" />
          <span className="hidden xs:inline">Create Bundle</span>
          <span className="xs:hidden">New</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <RiSearchLine className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search bundles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="input appearance-none pr-8"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="createdAt">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="videoCount">Sort by Videos</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <RiFilterLine className="text-gray-400" />
            </div>
          </div>
          <button
            className="btn btn-outline"
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            aria-label="Toggle sort order"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedBundles.length > 0 ? (
            sortedBundles.map((bundle) => (
              <div
                key={bundle._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      {bundle.name || "Untitled Bundle"}
                    </h2>
                    <span
                      className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ${
                        bundle.videos.some((v) => v.status === "pending")
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {bundle.videos.some((v) => v.status === "pending")
                        ? "Processing"
                        : "Ready"}
                    </span>
                  </div>
                  {bundle.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {bundle.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <FiFolder className="mr-2" />
                    {bundle.videos.length}{" "}
                    {bundle.videos.length === 1 ? "video" : "videos"}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <FiCalendar className="mr-2" />
                    {new Date(bundle.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <Link
                    to={`/bundles/${bundle._id}`}
                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    View details
                    <FiArrowRight className="ml-2" />
                  </Link>
                  <div className="flex space-x-2">
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => navigate(`/bundles/${bundle._id}/edit`)}
                      aria-label="Edit bundle"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => openDeleteModal(bundle)}
                      aria-label="Delete bundle"
                    >
                      <FiDelete />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No bundles found
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md text-center">
                Get started by creating a new video bundle to organize your
                content.
              </p>
              <div className="mt-6">
                <Link
                  to="/bundles/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Bundle
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
      {showDeleteModal && bundleToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setBundleToDelete(null);
          }}
          onDelete={handleDelete}
          bundleName={bundleToDelete.name || "Untitled Bundle"}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default BundleList;
