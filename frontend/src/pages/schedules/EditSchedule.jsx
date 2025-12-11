import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiSave,
  FiX,
  FiCalendar,
  FiClock,
  FiInfo,
  FiLock,
} from "react-icons/fi";
import { scheduleService } from "../../services/scheduleService";
import { bundleService } from "../../services/bundleService";
import subscriptionService from "../../services/subscriptionService";

function EditSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [schedulingOption, setSchedulingOption] = useState();
  const [formData, setFormData] = useState({
    name: "",
    bundleId: "",
    frequency: "daily",
    timeOfDay: "12:00",
    startDate: new Date().toISOString().split("T")[0],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    daysOfWeek: [],
    dayOfMonth: "1",
    status: "active",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await subscriptionService.getSubscriptionDetails();
        
        if (!response.statusText || response.statusText !== "OK") {
          toast.error(
            "Your subscription is not active. Please renew to edit schedules."
          );
          navigate("/subscription");
          return;
        }
        setSchedulingOption(
          response.data.subscription.plan.features.schedulingOptions
        );

        const [bundlesResponse, scheduleData] = await Promise.all([
          bundleService.getBundles(),
          scheduleService.getSchedule(id),
        ]);

        const activeBundles = bundlesResponse.filter(
          (bundle) => bundle.videos && bundle.videos.length > 0
        );
        setBundles(activeBundles);

        const formattedData = {
          name: scheduleData.name,
          bundleId: scheduleData.bundleId,
          frequency: scheduleData.frequency,
          timeOfDay: scheduleData.timeOfDay,
          startDate: scheduleData.startDate
            ? new Date(scheduleData.startDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          timezone:
            scheduleData.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          daysOfWeek: scheduleData.daysOfWeek?.map(String) || [],
          dayOfMonth: scheduleData.dayOfMonth?.toString() || "1",
          status: scheduleData.status || "active",
        };

        setFormData(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load schedule data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const validateForm = () => {
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
    if (formData.frequency === "weekly" && formData.daysOfWeek.length === 0) {
      toast.error("Please select at least one day of the week");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const scheduleData = {
        name: formData.name,
        bundleId: formData.bundleId,
        startDate: formData.startDate,
        timeOfDay: formData.timeOfDay,
        timezone: formData.timezone,
        frequency: formData.frequency,
        status: formData.status,
        ...(formData.frequency === "weekly" && {
          daysOfWeek: formData.daysOfWeek,
        }),
        ...(formData.frequency === "monthly" && {
          dayOfMonth: formData.dayOfMonth,
        }),
      };

      await scheduleService.updateSchedule(id, scheduleData);
      toast.success("Schedule updated successfully");
      navigate(`/schedules/${id}`);
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error(error.response?.data?.message || "Failed to update schedule");
      setIsSaving(false);
    }
  };

  const daysOfWeek = [
    { value: "0", label: "Sun" },
    { value: "1", label: "Mon" },
    { value: "2", label: "Tue" },
    { value: "3", label: "Wed" },
    { value: "4", label: "Thu" },
    { value: "5", label: "Fri" },
    { value: "6", label: "Sat" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Schedule</h1>
          <p className="text-gray-500 mt-1">
            Update your video schedule settings
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schedule Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                Schedule Name <span className="text-red-500">*</span>
                <div className="group relative">
                  <FiInfo className="text-gray-400" />
                  <div className="absolute left-full ml-2 w-64 p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Give your schedule a descriptive name for easy
                    identification
                  </div>
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Morning Playlist"
                required
              />
            </div>

            {/* Bundle Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bundle <span className="text-red-500">*</span>
              </label>
              <select
                name="bundleId"
                value={formData.bundleId?._id || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiYjMzM7IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.5rem]"
                required
              >
                <option value="">Select a bundle</option>
                {bundles.map((bundle) => (
                  <option key={bundle._id} value={bundle._id}>
                    {bundle.name} ({bundle.videos.length} videos)
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Frequency
                </label>

                {["once", "daily", "weekly", "monthly"].some(
                  (freq) => !schedulingOption.includes(freq)
                ) && (
                  <button
                    type="button"
                    className="text-sm text-primary-600 hover:text-primary-800"
                    onClick={() => {
                      navigate("/subscription");
                    }}
                  >
                    Unlock More Options
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "once", label: "Once" },
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                ].map((option) => {
                  const isLocked = !schedulingOption.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      onClick={() => {
                        if (isLocked) {
                          toast.dismiss();
                          toast(
                            <div className="flex flex-col">
                              <span>
                                Upgrade your plan to access {option.label}{" "}
                                scheduling
                              </span>
                              <div className="mt-2 flex justify-end">
                                <button
                                  onClick={() => {
                                    toast.dismiss();
                                    navigate("/subscription");
                                  }}
                                  className="text-primary-600 hover:text-primary-800 font-medium"
                                >
                                  Upgrade
                                </button>
                              </div>
                            </div>
                          );
                        }
                      }}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all relative ${
                        formData.frequency === option.value
                          ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                          : "border-gray-300 hover:border-gray-400"
                      } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={option.value}
                        checked={formData.frequency === option.value}
                        onChange={isLocked ? undefined : handleChange}
                        className="sr-only"
                        disabled={isLocked}
                      />
                      {option.label}
                      {isLocked && (
                        <span className="absolute top-0 right-0 p-1">
                          <FiLock className="h-4 w-4 text-gray-400" />
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {[
                  { value: "active", label: "Active" },
                  { value: "paused", label: "Paused" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.status === option.value
                        ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={formData.status === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Start Date & Time */}
            <div className="bg-gray-50 p-4 rounded-xl md:col-span-2">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <FiCalendar className="text-primary-500" /> Schedule Timing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="timeOfDay"
                      value={formData.timeOfDay}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiYjMzM7IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center] bg-[length:1.5rem]"
                  >
                    {Intl.supportedValuesOf("timeZone").map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Frequency-specific settings */}
            {formData.frequency === "weekly" && (
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl">
                <h3 className="font-medium text-gray-800 mb-3">
                  Days of Week <span className="text-red-500">*</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        formData.daysOfWeek.includes(day.value)
                          ? "bg-primary-600 text-white shadow-md"
                          : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {formData.daysOfWeek.length === 0 && (
                  <p className="mt-2 text-sm text-red-500">
                    Please select at least one day
                  </p>
                )}
              </div>
            )}

            {formData.frequency === "monthly" && (
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day of Month <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                  {[...Array(31)].map((_, i) => (
                    <label
                      key={i + 1}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.dayOfMonth === String(i + 1)
                          ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="dayOfMonth"
                        value={String(i + 1)}
                        checked={formData.dayOfMonth === String(i + 1)}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {i + 1}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/schedules/${id}`)}
                className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center gap-2"
              >
                <FiX className="text-base" /> Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-400 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center gap-2"
              >
                {isSaving ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-1"></span>
                ) : (
                  <FiSave className="text-base" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSchedule;
