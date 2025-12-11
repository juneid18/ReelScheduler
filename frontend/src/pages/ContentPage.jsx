import React, { useState, useEffect } from "react";
import {
  FiEye,
  FiSearch,
  FiCalendar,
  FiUser,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiHeart,
  FiShare2,
  FiGrid,
  FiList,
  FiX,
  FiFilter,
  FiChevronDown,
} from "react-icons/fi";
import { contentService } from "../services/contentService";
import { emailService } from "../services/emailService";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet";

const ContentPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, title
  const [likedContent, setLikedContent] = useState(new Set()); // Track liked content IDs
  const [likeCounts, setLikeCounts] = useState({}); // Track like counts for each content
  const contentPerPage = 9;

  // Fetch content data
  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contentService.getPublicContent(1, 100, "active");

      if (data.success) {
        setContent(data.data);

        // Initialize like counts from fetched data
        const counts = {};
        const liked = new Set();

        data.data.forEach((item) => {
          counts[item._id] = item.likes ? item.likes.length : 0;
          // Check if current user has liked this content
          if (
            item.likes &&
            item.likes.includes(localStorage.getItem("userId"))
          ) {
            liked.add(item._id);
          }
        });

        setLikeCounts(counts);
        setLikedContent(liked);
      } else {
        setError("Failed to fetch content");
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      if (error.message.includes("Failed to fetch")) {
        setError(
          "Unable to connect to server. Please check your internet connection."
        );
      } else {
        setError("Failed to load content. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Handle like/unlike functionality
  const handleLike = async (contentId, e) => {
    e.stopPropagation();

    // Check if user is authenticated
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Please log in to like content");
      return;
    }

    try {
      const response = await contentService.toggleLike(contentId);

      if (response.success) {
        const isLiked = response.data.isLiked;
        const newCount = response.data.likesCount;

        // Update like state
        setLikedContent((prev) => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.add(contentId);
          } else {
            newSet.delete(contentId);
          }
          return newSet;
        });

        // Update like count
        setLikeCounts((prev) => ({
          ...prev,
          [contentId]: newCount,
        }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to update like. Please try again.");
    }
  };

  // Filter and sort content
  const filteredAndSortedContent = content
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Pagination logic
  const indexOfLastContent = currentPage * contentPerPage;
  const indexOfFirstContent = indexOfLastContent - contentPerPage;
  const currentContent = filteredAndSortedContent.slice(
    indexOfFirstContent,
    indexOfLastContent
  );
  const totalPages = Math.ceil(
    filteredAndSortedContent.length / contentPerPage
  );

  const openModal = (contentItem) => {
    setSelectedContent(contentItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEmail("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle email submission and bundle access
    toast.success(
      `Bundle access link for "${selectedContent.title}" will be sent to: ${email}`
    );
    try {
      const response = await emailService.sendContentLinkEmail({
        email,
        contentTitle: selectedContent.title,
        downloadUrl: selectedContent.downloadUrl,
        recipientName: email,
      });

      if (response.success) {
        toast.success(
          "Bundle access link sent successfully. Please check your email."
        );
      } else {
        toast.error("Failed to send bundle access link. Please try again.");
      }
    } catch (error) {
      console.error("Error sending content link email:", error);
      alert("Failed to send bundle access link. Please try again.");
    }
    closeModal();
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate color gradient based on content title
  const getColorGradient = (title) => {
    const gradients = [
      "bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600",
      "bg-gradient-to-br from-secondary-400 via-secondary-500 to-secondary-600",
      "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600",
      "bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600",
      "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
      "bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600",
      "bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600",
      "bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600",
    ];

    const hash = title.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return gradients[Math.abs(hash) % gradients.length];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading Amazing Content
            </h3>
            <p className="text-gray-600">
              Preparing the best content for you...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <div className="text-red-600 text-2xl">⚠️</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchContent}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Discover Amazing Content - Premium Social Media Bundles</title>
        <meta
          name="description"
          content="Explore our curated collection of high-quality content bundles and videos. Find inspiration and ready-to-use content for your social media platforms. Get access to premium social media content bundles."
        />
        <meta
          name="keywords"
          content="social media content, content bundles, social media marketing, digital content, video content, social media inspiration, content creation"
        />
        <meta name="author" content="Content Platform" />

        {/* Open Graph Meta Tags */}
        <meta
          property="og:title"
          content="Discover Amazing Content - Premium Social Media Bundles"
        />
        <meta
          property="og:description"
          content="Explore our curated collection of high-quality content bundles and videos. Find inspiration and ready-to-use content for your social media platforms."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:site_name" content="Content Platform" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Discover Amazing Content - Premium Social Media Bundles"
        />
        <meta
          name="twitter:description"
          content="Explore our curated collection of high-quality content bundles and videos. Find inspiration and ready-to-use content for your social media platforms."
        />
        <meta name="twitter:image" content="/og-image.jpg" />

        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.href} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Content Platform",
            description:
              "Discover amazing content bundles and videos for social media platforms",
            url: window.location.origin,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${window.location.origin}/content?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-4">
                Discover Amazing
                <span className="relative inline-block ml-2">
                  <span className="relative z-10 bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                    Content
                  </span>
                  <div className="absolute bottom-1 left-0 h-3 bg-primary-100 bg-opacity-50 z-0"></div>
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Explore our curated collection of high-quality content bundles
                and videos. Find inspiration and ready-to-use content for your
                social media platforms.
              </p>

              {/* Search and Controls */}
              <div className="max-w-4xl mx-auto">
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search content by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  />
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  <div className="flex items-center space-x-4">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "grid"
                            ? "bg-primary-100 text-primary-700"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <FiGrid className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "list"
                            ? "bg-primary-100 text-primary-700"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <FiList className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiFilter className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none pl-10 pr-8 py-2.5 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer font-medium"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="title">Alphabetical</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FiChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {filteredAndSortedContent.length} content items found
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {currentContent.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FiSearch className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No content found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {currentContent.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                  onClick={() => openModal(item)}
                >
                  {/* Thumbnail */}
                  <div
                    className={`relative ${
                      viewMode === "list" ? "w-48 h-32" : "h-48"
                    }`}
                  >
                    <div
                      className={`w-full h-full ${getColorGradient(
                        item.title
                      )} flex items-center justify-center`}
                    >
                      {item.imageUrl && item.imageUrl !== "null" ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiPlay className="h-12 w-12 text-white opacity-80" />
                      )}
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={(e) => handleLike(item._id, e)}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                        likedContent.has(item._id)
                          ? "bg-red-500 text-white shadow-lg hover:bg-red-600"
                          : "bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      <FiHeart
                        className={`h-4 w-4 ${
                          likedContent.has(item._id) ? "fill-current" : ""
                        }`}
                      />
                    </button>

                    {/* Like Count */}
                    {likeCounts[item._id] > 0 && (
                      <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {likeCounts[item._id]}{" "}
                        {likeCounts[item._id] === 1 ? "like" : "likes"}
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="h-4 w-4 mr-1" />
                          {formatDate(item.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <FiUser className="h-4 w-4 mr-1" />
                          {item.creator?.name || "Anonymous"}
                        </div>
                      </div>

                      <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
                        View Details
                        <FiArrowRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-12">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-primary-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedContent.title}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                <div
                  className={`w-full h-64 ${getColorGradient(
                    selectedContent.title
                  )} rounded-xl flex items-center justify-center mb-6`}
                >
                  {selectedContent.imageUrl &&
                  selectedContent.imageUrl !== "null" ? (
                    <img
                      src={selectedContent.imageUrl}
                      alt={selectedContent.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiPlay className="h-16 w-16 text-white opacity-80" />
                  )}
                </div>

                <p className="text-gray-600 mb-6 capitalize">
                  {selectedContent.description}
                </p>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="h-4 w-4 mr-1" />
                      {formatDate(selectedContent.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <FiUser className="h-4 w-4 mr-1" />
                      {selectedContent.creator?.name || "Anonymous"}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleLike(selectedContent._id, e)}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        likedContent.has(selectedContent._id)
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      <FiHeart
                        className={`h-4 w-4 ${
                          likedContent.has(selectedContent._id)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-600">
                      {likeCounts[selectedContent._id] || 0}{" "}
                      {likeCounts[selectedContent._id] === 1 ? "like" : "likes"}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Get bundle access link
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      We'll send you a direct link to access this content bundle
                      via email.
                    </p>

                    <p className="text-xs text-gray-400 mt-2 italic">
                      Note: This content is not hosted on our platform. We do
                      not claim ownership of any content displayed. If you have
                      any issues, please contact us directly.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Send Bundle Link
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Important Note */}
        <div className="text-center py-8 mb-6">
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed text-center font-medium">
            This content is not hosted on our platform. All content shown here
            is already available on the internet, and we are simply redirecting
            users to these existing resources. We do not claim ownership of any
            of the content displayed.
          </p>
        </div>
      </div>
    </>
  );
};

export default ContentPage;
