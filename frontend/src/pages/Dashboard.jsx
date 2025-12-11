import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { videoService } from "../services/videoService";
import { bundleService } from "../services/bundleService";
import { scheduleService } from "../services/scheduleService";
import { authService } from "../services/authService";
import SEO from "../components/SEO";
import {
  RiVideoAddLine,
  RiPlayListAddLine,
  RiCalendarCheckLine,
  RiYoutubeLine,
  RiPlayFill,
  RiInstagramLine,
  RiLinkUnlinkM,
  RiRefreshLine,
  RiArrowRightLine,
  RiFolderVideoLine,
  RiVideoLine,
  RiArrowRightSLine,
  RiDashboardLine,
  RiFacebookCircleLine,
} from "react-icons/ri";
import toast from "react-hot-toast";
import YouTubeCredentialsForm from "../components/YouTubeCredentialsForm";
import { useAuth } from "../contexts/AuthContext";
import { useYouTube } from "../contexts/YouTubeContext";
import YouTubeConnectButton from "../components/YouTubeConnectButton";
import InstaCredentialForm from "./InstaCredentialForm";
import { useInstagram } from "../contexts/InstagramContext";

function Dashboard() {
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState({
    videos: 0,
    bundles: 0,
    schedules: 0,
    activeSchedules: 0,
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [recentBundles, setRecentBundles] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [checkingFacebook, setCheckingFacebook] = useState(false);
  const [facebookAccountInfo, setFacebookAccountInfo] = useState(null);

  const { currentUser, isAuthenticated, logout, checkTokenExpiration } =
    useAuth();
  const navigate = useNavigate();
  const {
    youtubeConnected,
    youtubeChannelInfo,
    checkingYouTube,
    checkYouTubeConnection,
    connectYouTube,
    disconnectYouTube,
    handleYouTubeConnected,
  } = useYouTube();

  const {
    checkInstagramConnection,
    checkingInstagram,
    setCheckingInstagram,
    instagramConnected,
    setInstagramConnected,
  } = useInstagram();

  // Add this function to check auth token
  const checkAuthToken = () => {
    const token = localStorage.getItem("authToken");
    const oldToken = localStorage.getItem("token"); // Check for old token format

    if (!token && !oldToken) {
      toast.error("No authentication token found. Please log in again.");
      return false;
    }

    if (!token && oldToken) {
      // Migrate old token format
      localStorage.setItem("authToken", oldToken);
      toast.success("Authentication token updated");
      return true;
    }

    return !!token;
  };
  const handleRefreshYouTube = () => {
    checkYouTubeConnection();
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  const handleRelogin = () => {
    logout();
    navigate("/login", { state: { from: "/dashboard", tokenExpired: true } });
  };

  const RefreshInstagramConnection = () => {
    if (!checkAuthToken()) {
      handleRelogin();
      return;
    }
    checkInstagramConnection();
  };

  const handleConnectInstagram = async (credentials) => {
    if (!credentials.username || !credentials.password) {
      toast.error("Please enter both username and password");
      return;
    }

    try {
      setCheckingInstagram(true);
      const response = await authService.connectInstagram({
        username: credentials.username,
        password: credentials.password,
      });

      if (response.data && response.data.success) {
        toast.success("Instagram account connected successfully!");
        setInstagramConnected(true);
        setInstagramAccountInfo(response.data.accountInfo);
        setShowInstagramModal(false);
      } else {
        toast.error(
          response.data?.message || "Failed to connect Instagram account"
        );
      }
    } catch (error) {
      console.error("Error connecting Instagram:", error);
      toast.error(
        error.response?.data?.message || "Failed to connect Instagram account"
      );
    } finally {
      setCheckingInstagram(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    try {
      setCheckingInstagram(true);
      const response = await authService.disconnectInstagram();

      if (response.data && response.data.success) {
        toast.success("Instagram account disconnected successfully");
        setInstagramConnected(false);
      } else {
        toast.error("Failed to disconnect Instagram account");
      }
    } catch (error) {
      console.error("Error disconnecting Instagram:", error);
      toast.error("Failed to disconnect Instagram account");
    } finally {
      setCheckingInstagram(false);
    }
  };

  // Facebook connect handler
  const handleConnectFacebook = async () => {
    setCheckingFacebook(true);
    try {
      // Call backend to get Facebook OAuth URL
      const response = await authService.connectFacebook();
      if (response.data?.url) {
        // Open popup for Facebook OAuth
        const fbWindow = window.open(
          response.data.url,
          "facebook_auth",
          "width=600,height=700"
        );
        // Listen for message from popup (optional: implement postMessage in popup)
        const interval = setInterval(async () => {
          if (fbWindow.closed) {
            clearInterval(interval);
            // After popup closes, check connection status
            await checkFacebookConnection();
            setCheckingFacebook(false);
          }
        }, 1000);
      } else {
        toast.error("Failed to get Facebook connect URL");
        setCheckingFacebook(false);
      }
    } catch (err) {
      toast.error("Failed to connect Facebook");
      setCheckingFacebook(false);
    }
  };

  // Facebook disconnect handler
  const handleDisconnectFacebook = async () => {
    setCheckingFacebook(true);
    try {
      const response = await authService.disconnectFacebook();
      if (response.data && response.data.success) {
        toast.success("Facebook account disconnected successfully");
        setFacebookConnected(false);
        setFacebookAccountInfo(null);
      } else {
        toast.error("Failed to disconnect Facebook account");
      }
    } catch (err) {
      toast.error("Failed to disconnect Facebook account");
    } finally {
      setCheckingFacebook(false);
    }
  };

  // Check Facebook connection status
  const checkFacebookConnection = useCallback(async () => {
    setCheckingFacebook(true);
    try {
      const response = await authService.checkFacebookConnection();
      if (response.data?.connected) {
        setFacebookConnected(true);
        setFacebookAccountInfo(response.data.accountInfo || null);
      } else {
        setFacebookConnected(false);
        setFacebookAccountInfo(null);
      }
    } catch (err) {
      setFacebookConnected(false);
      setFacebookAccountInfo(null);
    } finally {
      setCheckingFacebook(false);
    }
  }, []);

  useEffect(() => {
    // Check token on component mount
    if (checkTokenExpiration && typeof checkTokenExpiration === "function") {
      checkTokenExpiration();
    }

    // Check if YouTube was just connected
    const youtubeJustConnected = localStorage.getItem("youtubeJustConnected");
    if (youtubeJustConnected === "true") {
      // Clear the flag
      localStorage.removeItem("youtubeJustConnected");

      // Force refresh YouTube connection status
      checkYouTubeConnection();

      // Show success message
      toast.success("YouTube account connected successfully!");
    }

    // Check YouTube connection status from URL params
    const youtubeStatus = searchParams.get("youtube");
    if (youtubeStatus === "connected") {
      toast.success("YouTube account connected successfully!");
      // Force refresh YouTube connection status
      checkYouTubeConnection();
    } else if (youtubeStatus === "error") {
      toast.error("Failed to connect YouTube account. Please try again.");
    }

    // Check Instagram connection status
    checkInstagramConnection();

    // Check Facebook connection status
    checkFacebookConnection();

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      if (!checkAuthToken()) {
        handleRelogin();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch YouTube connection status first to ensure it's loaded
        await checkYouTubeConnection();

        // Fetch all data in parallel for better performance
        const [videosResponse, bundlesResponse, schedulesResponse] =
          await Promise.allSettled([
            videoService.getVideos(),
            bundleService.getBundles(),
            scheduleService.getSchedules(),
          ]);

        // Process videos
        const videos =
          videosResponse.status === "fulfilled" ? videosResponse.value : [];
        setRecentVideos(videos.slice(0, 3));

        // Process bundles
        const bundles =
          bundlesResponse.status === "fulfilled" ? bundlesResponse.value : [];
        setRecentBundles(bundles.slice(0, 5));

        // Process schedules
        const schedules =
          schedulesResponse.status === "fulfilled"
            ? schedulesResponse.value
            : [];

        const activeSchedules = schedules.filter(
          (schedule) => schedule.status === "active"
        );

        // Sort schedules by next run date
        const sortedSchedules = [...schedules].sort(
          (a, b) => new Date(a.nextRunAt) - new Date(b.nextRunAt)
        );

        setUpcomingSchedules(sortedSchedules.slice(0, 5));

        // Update stats
        setStats({
          videos: videos.length,
          bundles: bundles.length,
          schedules: schedules.length,
          activeSchedules: activeSchedules.length,
        });

        // Check YouTube connection status using the context
        checkYouTubeConnection();
      } catch (err) {
        console.error("Error in dashboard data fetch:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [searchParams, checkYouTubeConnection, checkTokenExpiration]);

  const handleDisconnectYoutube = async () => {
    disconnectYouTube();
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

  return (
    <>
      <SEO 
        title="Dashboard"
        description="Manage your social media content, videos, bundles, and schedules. Connect your YouTube, Instagram, and Facebook accounts for seamless content management."
        keywords="dashboard, social media management, content scheduling, video management, bundle management, social media analytics"
        noIndex={true}
      />
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <RiDashboardLine
            className="text-3xl text-primary-600"
            aria-hidden="true"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            Dashboard
          </h1>
        </div>

        {/* YouTube Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">YouTube Connection Status</h2>
            <button
              onClick={handleRefreshYouTube}
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
              disabled={checkingYouTube}
            >
              {checkingYouTube ? (
                <RiRefreshLine
                  className="animate-spin -ml-1 mr-2 text-primary-600"
                  size={18}
                />
              ) : (
                <RiRefreshLine size={18} />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                youtubeConnected
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <RiYoutubeLine className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-medium">YouTube Account</span>
                <div
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    youtubeConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {youtubeConnected ? "Connected" : "Not Connected"}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {youtubeConnected
                  ? "Your YouTube account is connected and ready to use"
                  : "Connect your YouTube account to schedule uploads"}
              </p>
            </div>
          </div>

          {youtubeConnected && youtubeChannelInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Connected Channel</h3>
              <div className="flex items-start space-x-3">
                {youtubeChannelInfo.thumbnail && (
                  <img
                    src={youtubeChannelInfo.thumbnail}
                    alt="Channel thumbnail"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{youtubeChannelInfo.title}</div>
                  <div className="text-sm text-gray-500">
                    Channel ID:{" "}
                    <i className="font-mono select-none">
                      {youtubeChannelInfo.id}
                    </i>
                  </div>
                  {youtubeChannelInfo.statistics && (
                    <div className="mt-1 text-sm flex space-x-4">
                      <span className="text-gray-700">
                        <strong>
                          {youtubeChannelInfo.statistics.subscriberCount || 0}
                        </strong>{" "}
                        subscribers
                      </span>
                      <span className="text-gray-700">
                        <strong>
                          {youtubeChannelInfo.statistics.videoCount || 0}
                        </strong>{" "}
                        videos
                      </span>
                    </div>
                  )}
                  {youtubeChannelInfo.connectedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                                          Connected on{" "}
                                          {new Date(
                        youtubeChannelInfo.connectedAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            {youtubeConnected ? (
              <button
                onClick={handleDisconnectYoutube}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-150"
              >
                <span className="flex items-center">
                  <RiLinkUnlinkM className="mr-2" />
                  {checkingYouTube ? "Disconnecting..." : "Disconnect YouTube"}
                </span>
              </button>
            ) : (
              <>
                <YouTubeConnectButton />
              </>
            )}
          </div>
        </div>

        {/* Instagram Connection Status */}
        {/* <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Instagram Connection Status
            </h2>
            <button
              onClick={RefreshInstagramConnection}
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
              disabled={checkingInstagram}
            >
              {checkingInstagram ? (
                <RiRefreshLine
                  className="animate-spin -ml-1 mr-2 text-primary-600"
                  size={18}
                />
              ) : (
                <RiRefreshLine size={18} />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                instagramConnected
                  ? "bg-pink-100 text-pink-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <RiInstagramLine className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-medium">Instagram Account</span>
                <div
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    instagramConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {instagramConnected ? "Connected" : "Not Connected"}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {instagramConnected
                  ? "Your Instagram account is connected and ready to use"
                  : "Connect your Instagram account to schedule posts"}
              </p>
            </div>
          </div>

          {/* {InstagramConnected && instagramAccountInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Connected Account</h3>
              <div className="flex items-start space-x-3">
                {instagramAccountInfo.profilePicture && (
                  <img
                    src={instagramAccountInfo.profilePicture}
                    alt="Instagram profile picture"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{instagramAccountInfo.username}</p>
                  {instagramAccountInfo.fullName && (
                    <p className="text-sm text-gray-600">
                      {instagramAccountInfo.fullName}
                    </p>
                  )}
                  {instagramAccountInfo.followerCount && (
                    <p className="text-xs text-gray-500 mt-1">
                      {instagramAccountInfo.followerCount.toLocaleString()}{" "}
                      followers
                    </p>
                  )}
                </div>
              </div>
            </div>
          )} */}

        {/* <div className="mt-4 flex justify-end">
            {instagramConnected ? (
              <button
                onClick={handleDisconnectInstagram}
                disabled={checkingInstagram}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-150"
              >
                <span className="flex items-center">
                  <RiLinkUnlinkM className="mr-2" />
                  {checkingInstagram
                    ? "Disconnecting..."
                    : "Disconnect Instagram"}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowInstagramModal(true)}
                disabled={checkingInstagram}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <RiInstagramLine className="mr-2" />
                {checkingInstagram ? "Connecting..." : "Connect Instagram"}
              </button>
            )}
          </div>
        </div> */}

        {/* Facebook Connection Status */}
        {/* <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Facebook Connection Status</h2>
            <button
              onClick={checkFacebookConnection}
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
              disabled={checkingFacebook}
            >
              {checkingFacebook ? (
                <RiRefreshLine className="animate-spin -ml-1 mr-2 text-primary-600" size={18} />
              ) : (
                <RiRefreshLine size={18} />
              )}
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                facebookConnected
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <RiFacebookCircleLine className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-medium">Facebook Account</span>
                <div
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    facebookConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {facebookConnected ? "Connected" : "Not Connected"}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {facebookConnected
                  ? "Your Facebook account is connected and ready to use"
                  : "Connect your Facebook account to schedule posts"}
              </p>
            </div>
          </div>
          {facebookConnected && facebookAccountInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Connected Account</h3>
              <div className="flex items-start space-x-3">
                {facebookAccountInfo.picture && (
                  <img
                    src={facebookAccountInfo.picture}
                    alt="Facebook profile"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{facebookAccountInfo.name}</div>
                  <div className="text-sm text-gray-500">{facebookAccountInfo.email}</div>
                </div>
              </div>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            {facebookConnected ? (
              <button
                onClick={handleDisconnectFacebook}
                disabled={checkingFacebook}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-150"
              >
                <span className="flex items-center">
                  <RiLinkUnlinkM className="mr-2" />
                  {checkingFacebook ? "Disconnecting..." : "Disconnect Facebook"}
                </span>
              </button>
            ) : (
              <button
                onClick={handleConnectFacebook}
                disabled={checkingFacebook}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <RiFacebookCircleLine className="mr-2" />
                {checkingFacebook ? "Connecting..." : "Connect Facebook"}
              </button>
            )}
          </div>
        </div> */}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ">
          <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg">
            <h2 className="text-lg font-semibold">Videos</h2>
            <p className="text-3xl font-bold mt-2">{stats.videos || 0}</p>
            <Link
              to="/videos"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              View all videos
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg">
            <h2 className="text-lg font-semibold">Bundles</h2>
            <p className="text-3xl font-bold mt-2">{stats.bundles || 0}</p>
            <Link
              to="/bundles"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              View all bundles
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg">
            <h2 className="text-lg font-semibold">Schedules</h2>
            <p className="text-3xl font-bold mt-2">{stats.schedules || 0}</p>
            <Link
              to="/schedules"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              View all schedules
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg">
            <h2 className="text-lg font-semibold">Active Schedules</h2>
            <p className="text-3xl font-bold mt-2">
              {stats.activeSchedules || 0}
            </p>
            <Link
              to="/schedules"
              className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
            >
              View active schedules
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 transition-all duration-200 hover:shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/videos/upload"
              className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-100 text-blue-600 hover:from-blue-100 hover:to-blue-200 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm transition-all duration-200"
            >
              <RiVideoAddLine className="text-xl" />
              <span className="font-medium">Upload Video</span>
            </Link>

            <Link
              to="/bundles/create"
              className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-100 text-purple-600 hover:from-purple-100 hover:to-purple-200 hover:border-purple-200 hover:text-purple-700 hover:shadow-sm transition-all duration-200"
            >
              <RiPlayListAddLine className="text-xl" />
              <span className="font-medium">Create Bundle</span>
            </Link>

            <Link
              to="/schedules/create"
              className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-100 text-green-600 hover:from-green-100 hover:to-green-200 hover:border-green-200 hover:text-green-700 hover:shadow-sm transition-all duration-200"
            >
              <RiCalendarCheckLine className="text-xl" />
              <span className="font-medium">Create Schedule</span>
            </Link>
          </div>
        </div>

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Videos */}
          <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Videos</h2>
              <Link
                to="/videos"
                className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-150 ease-in-out flex items-center"
                aria-label="View all videos"
              >
                View All
                <RiArrowRightLine className="ml-1" />
              </Link>
            </div>

            {recentVideos.length > 0 ? (
              <ul className="space-y-4">
                {recentVideos.map((video) => (
                  <li
                    key={video._id}
                    className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out overflow-hidden"
                  >
                    <Link
                      to={`/videos/${video.videoUrls[0]?._id}`}
                      className="flex flex-col sm:flex-row"
                      aria-label={`View video: ${video.title}`}
                    >
                      {/* Thumbnail container */}
                      <div className="w-full sm:w-48 h-36 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                        {video.videoUrls[0]?.url ? (
                          <>
                            <video
                              src={video.videoUrls[0].url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              aria-hidden="true"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="bg-black bg-opacity-50 rounded-full p-2">
                                <RiPlayFill className="text-white text-xl" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <RiVideoAddLine className="text-gray-400 text-4xl" />
                          </div>
                        )}
                      </div>

                      {/* Video info */}
                      <div className="p-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
                          {video.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-3">
                          <span>
                            {new Date(video.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                          {video.duration && (
                            <span className="flex items-center">
                              <RiTimeLine className="mr-1" />
                              {video.duration}
                            </span>
                          )}
                        </div>
                        {video.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <RiVideoAddLine className="text-gray-400 text-4xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No videos yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get started by uploading your first video to share with your
                  audience
                </p>
                <Link
                  to="/videos/upload"
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
                >
                  <RiVideoAddLine className="mr-2 -ml-1" />
                  Upload Video
                </Link>
              </div>
            )}
          </div>

          {/* Recent Bundles */}
          <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg">
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-lg font-semibold">Recent Bundles</h2>
              <Link
                to="/bundles"
                className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-150 ease-in-out flex items-center"
                aria-label="View all bundle"
              >
                View All
                <RiArrowRightLine className="ml-1" />
              </Link>
            </div>

            {recentBundles.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {recentBundles.map((bundle) => (
                  <li
                    key={bundle._id}
                    className="group hover:bg-gray-50 transition-colors duration-150"
                  >
                    <Link
                      to={`/bundles/${bundle._id}`}
                      className="flex items-center justify-between px-4 py-3.5"
                      aria-label={`View ${bundle.name} bundle with ${
                        bundle.videos?.length || 0
                      } videos`}
                    >
                      <div className="flex items-center min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50 text-primary-600 mr-3 flex-shrink-0">
                          <RiFolderVideoLine className="text-lg" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {bundle.name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <RiVideoLine className="mr-1.5 text-gray-400" />
                            {bundle.videos?.length || 0}{" "}
                            {bundle.videos?.length === 1 ? "video" : "videos"}
                          </p>
                        </div>
                      </div>
                      <RiArrowRightSLine className="text-gray-400 group-hover:text-primary-500 ml-2 flex-shrink-0 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                No bundles yet. Create your first bundle!
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Schedules</h2>
            <Link
              to="/schedules"
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              View All
            </Link>
          </div>

          {upcomingSchedules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bundle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingSchedules.map((schedule) => (
                    <tr key={schedule._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/schedules/${schedule._id}`}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {schedule.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/bundles/${schedule.bundleId}`}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          View Bundle
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {schedule.nextRunAt
                          ? new Date(schedule.nextRunAt).toLocaleString()
                          : "Not scheduled"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            schedule.status === "active"
                              ? "bg-green-100 text-green-800"
                              : schedule.status === "paused"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {schedule.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">
              No schedules yet. Create your first schedule!
            </p>
          )}
        </div>

        {debugMode && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Debug Information</h3>
            <div className="text-xs font-mono whitespace-pre-wrap">
              <p>YouTube Connected: {youtubeConnected ? "Yes" : "No"}</p>
              <p>Checking Status: {checkingYouTube ? "Yes" : "No"}</p>
              <p>
                Channel Info:{" "}
                {youtubeChannelInfo ? "Available" : "Not Available"}
              </p>
              {youtubeChannelInfo && (
                <div className="mt-2">
                  <p>Channel Data:</p>
                  <pre>{JSON.stringify(youtubeChannelInfo, null, 2)}</pre>
                </div>
              )}
            </div>
            <button
              onClick={checkYouTubeConnection}
              className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
            >
              Force Refresh
            </button>
          </div>
        )}
        <div className="mt-4 text-right">
          <button
            onClick={toggleDebugMode}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {debugMode ? "Hide Debug Info" : "Show Debug Info"}
          </button>
        </div>
      </div>
      <InstaCredentialForm
        isOpen={showInstagramModal}
        onClose={() => setShowInstagramModal(false)}
        onSubmit={handleConnectInstagram}
        isLoading={checkingInstagram}
      />
    </>
  );
}

export default Dashboard;
