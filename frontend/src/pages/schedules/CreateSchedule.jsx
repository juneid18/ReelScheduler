import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import { scheduleService } from "../../services/scheduleService";
import { bundleService } from "../../services/bundleService";
import { useAuth } from "../../contexts/AuthContext";
import SubscriptionLimitModal from "../../components/SubscriptionLimitModal";
import FacebookConnectButton from "../../components/FacebookConnectButton";
import api from "../../services/api";

function CreateSchedule({ canCreateSchedule = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userPlan } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    bundleId: "",
    frequency: "daily",
    timeOfDay: "12:00", // Changed from 'time' to 'timeOfDay' to match backend
    startDate: new Date().toISOString().split("T")[0], // Add startDate field
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Add timezone field
    daysOfWeek: ["1"], // Monday by default for weekly
    dayOfMonth: "1", // 1st day by default for monthly
    status: "active",
    uploadToFacebook: false,
  });
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState("");
  const [limitModalData, setLimitModalData] = useState({
    limit: 0,
    current: 0,
  });
  const [facebookConnectedState, setFacebookConnectedState] = useState(false);

  useEffect(() => {
    // Check if bundleId is provided in URL query params
    const queryParams = new URLSearchParams(location.search);
    const bundleIdFromUrl = queryParams.get("bundleId");

    if (bundleIdFromUrl) {
      setFormData((prev) => ({ ...prev, bundleId: bundleIdFromUrl }));
    }

    const fetchBundles = async () => {
      try {
        setLoadingBundles(true);
        // Fetch real bundles from API
        const response = await bundleService.getBundles();

        if (response) {
          // Only show active bundles
          const activeBundles = response.filter(
            (bundle) => bundle.videos && bundle.videos.length > 0
          );

          setBundles(activeBundles);

          // Set default bundle if available and not already set from URL
          if (activeBundles.length > 0 && !bundleIdFromUrl) {
            setFormData((prev) => ({
              ...prev,
              bundleId: activeBundles[0]._id,
            }));
          }
        } else {
          setBundles([]);
        }

        setLoadingBundles(false);
      } catch (error) {
        console.error("Error fetching bundles:", error);
        toast.error("Failed to load bundles");
        setLoadingBundles(false);
      }
    };

    fetchBundles();
  }, [location.search]);

  useEffect(() => {
    // Fetch Facebook connection status from backend
    async function fetchFacebookStatus() {
      try {
        const res = await api.get("/users/me");
        setFacebookConnectedState(res.data.facebookConnected);
      } catch {
        setFacebookConnectedState(false);
      }
    }
    fetchFacebookStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const currentDays = [...prev.daysOfWeek];
      if (currentDays.includes(day)) {
        return { ...prev, daysOfWeek: currentDays.filter((d) => d !== day) };
      } else {
        return { ...prev, daysOfWeek: [...currentDays, day] };
      }
    });
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.name) {
      toast.error("Schedule name is required");
      return false;
    }

    if (!formData.bundleId) {
      toast.error("Please select a bundle");
      return false;
    }

    if (!formData.startDate) {
      toast.error("Start date is required");
      return false;
    }

    if (!formData.timeOfDay) {
      toast.error("Time of day is required");
      return false;
    }

    if (formData.frequency === "weekly" && formData.daysOfWeek.length === 0) {
      toast.error("Please select at least one day of the week");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare the schedule data
      const scheduleData = {
        name: formData.name,
        bundleId: formData.bundleId,
        startDate: formData.startDate,
        timeOfDay: formData.timeOfDay,
        timezone: formData.timezone,
        frequency: formData.frequency,
        status: formData.status,
        uploadToFacebook: formData.uploadToFacebook,
      };

      // Add frequency-specific fields
      if (formData.frequency === "weekly") {
        scheduleData.daysOfWeek = formData.daysOfWeek;
      } else if (formData.frequency === "monthly") {
        scheduleData.dayOfMonth = formData.dayOfMonth;
      }

      const response = await scheduleService.createSchedule(scheduleData);

      if (!response) {
        throw new Error("Failed to create schedule");
      }

      setLoading(false);

      // Show success message and redirect
      toast.success("Schedule created successfully");
      navigate("/schedules");
    } catch (error) {
      if (error.response?.data?.upgradeRequired) {
        const feature = error.response?.data?.feature;

        if (feature === "scheduleLimit") {
          toast.error("You need to upgrade your plan to create more schedules");
          setLimitModalType("scheduleLimit");
          setLimitModalData({
            limit: userPlan?.features?.scheduleLimit || 1,
            current: (userPlan?.features?.scheduleLimit || 1) + 1,
          });
        } else if (feature === "bundleLimit") {
          toast.error("You need to upgrade your plan to create more bundles");
          setLimitModalType("bundleLimit");
          setLimitModalData({
            limit: userPlan?.features?.bundleLimit || 2,
            current: (userPlan?.features?.bundleLimit || 2) + 1,
          });
        } else {
          toast.error("You need to upgrade your plan for this feature");
          setLimitModalType("general");
          setLimitModalData({
            limit: 0,
            current: 0,
          });
        }

        setShowLimitModal(true);
        return;
      }
      console.error("Error creating schedule:", error);
      toast.error(error.response?.data?.message || "Failed to create schedule");
      setLoading(false);
    }
  };

  // Days of week for selection
  const daysOfWeek = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  // Handler to start Facebook OAuth (placeholder)
  const handleFacebookConnect = () => {
    window.location.href = "/api/facebook/auth"; // This should trigger backend OAuth
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FiArrowLeft
            size={24}
            className="text-gray-500 cursor-pointer hover:text-gray-700 transition"
            onClick={() => navigate("/schedules")}
          />
          <div>
            <h1 className="text-2xl font-bold">Create New Schedule</h1>
            <p className="text-sm text-gray-500 mt-1">
              Set up a new schedule for your videos easily.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Schedule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                placeholder="e.g., Weekly Product Reviews"
              />
            </div>

            <div>
              <label
                htmlFor="bundleId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Bundle <span className="text-red-500">*</span>
              </label>
              {loadingBundles ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
              ) : (
                <select
                  id="bundleId"
                  name="bundleId"
                  value={formData.bundleId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a bundle</option>
                  {bundles.map((bundle) => (
                    <option key={bundle._id} value={bundle._id}>
                      {bundle.name}
                    </option>
                  ))}
                </select>
              )}
              {bundles.length === 0 && !loadingBundles && (
                <p className="absolute mt-1 text-sm text-red-500">
                  No active bundles available. Please create a bundle first.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label
                htmlFor="timeOfDay"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="timeOfDay"
                name="timeOfDay"
                value={formData.timeOfDay}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="frequency"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Frequency <span className="text-red-500">*</span>
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {(userPlan?.features?.schedulingOptions || ["daily"]).map(
                  (option) => (
                    <option key={option} value={option}>
                      {option === "once"
                        ? "One-time"
                        : option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  )
                )}
              </select>
            </div>

            {formData.frequency === "weekly" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days of Week <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-3 py-2 rounded-md text-sm ${
                        formData.daysOfWeek.includes(day.value)
                          ? "bg-primary-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {formData.daysOfWeek.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    Please select at least one day
                  </p>
                )}
              </div>
            )}

            {formData.frequency === "monthly" && (
              <div>
                <label
                  htmlFor="dayOfMonth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Day of Month <span className="text-red-500">*</span>
                </label>
                <select
                  id="dayOfMonth"
                  name="dayOfMonth"
                  value={formData.dayOfMonth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => navigate("/schedules")}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center"
            >
              <FiX className="mr-2" /> Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !canCreateSchedule}
              title={
                !canCreateSchedule
                  ? "You do not have permission to create schedules."
                  : ""
              }
            >
              {loading ? (
                <FiSave className="animate-spin mr-2" />
              ) : (
                <FiSave className="mr-2" />
              )}{" "}
              Save Schedule
            </button>
          </div>
        </form>
      </div>
      {/* Subscription Limit Modal */}
      <SubscriptionLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        type={limitModalType}
        limit={limitModalData.limit}
        current={limitModalData.current}
        planName={userPlan?.name || "Free"}
      />
      {!canCreateSchedule && (
        <div className="text-red-500 mt-2 text-sm">
          You do not have permission to create schedules.
        </div>
      )}
    </div>
  );
}

export default CreateSchedule;
