import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiPackage,
  FiClock,
  FiRepeat,
  FiGlobe,
  FiList,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiSettings,
  FiAlertTriangle,
  FiInbox,
  FiInfo,
} from "react-icons/fi";
import { scheduleService } from "../../services/scheduleService";
import { RiArrowLeftLine } from "react-icons/ri";

function ScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const getSchedule = await scheduleService.getSchedule(id);
        setSchedule(getSchedule);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        toast.error("Failed to load schedule details");
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [id]);

  const handleDelete = async () => {
    try {
      await scheduleService.deleteSchedule(id); // Delete schedule

      toast.success("Schedule deleted successfully");
      navigate("/schedules");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
    setShowDeleteModal(false);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDayName = (dayValue) => {
    if (dayValue === null) return "";
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[parseInt(dayValue)];
  };

  const getFrequencyDetails = (schedule) => {
    switch (schedule.frequency) {
      case "daily":
        return "Every day";
      case "weekly":
        if (
          schedule.daysOfWeek &&
          schedule.daysOfWeek.length > 0 &&
          schedule.daysOfWeek[0] !== null
        ) {
          return `Every ${schedule.daysOfWeek
            .map((day) => getDayName(day))
            .filter(Boolean)
            .join(", ")}`;
        }
        return "Weekly";
      case "monthly":
        return `Day ${schedule.dayOfMonth} of each month`;
      case "once":
        return "One time only";
      default:
        return schedule.frequency;
    }
  };

  const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-0.5 mr-3">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="mt-0.5 text-gray-800">{value}</div>
      </div>
    </div>
  );

  const InfoItem = ({ label, value }) => (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Schedule not found</h2>
        <p className="mt-2 text-gray-500">
          The schedule you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/schedules"
          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          Back to Schedules
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/schedules')}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          >
            <RiArrowLeftLine className="text-2xl" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {schedule.name}
          </h1>
          <div className="flex items-center mt-2">
            <div
              className={`h-3 w-3 rounded-full mr-2 ${
                schedule.status === "active"
                  ? "bg-green-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            ></div>
            <span className="text-sm text-gray-600 capitalize">
              {schedule.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/schedules/${id}/edit`)}
            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiEdit2 className="mr-2" />
            Edit Schedule
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
          >
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Details Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiSettings className="mr-2 text-primary-500" />
                Schedule Details
              </h2>

              <div className="space-y-4">
                <DetailItem
                  icon={<FiPackage className="text-gray-400" />}
                  label="Bundle"
                  value={
                    schedule.bundleId &&
                    typeof schedule.bundleId === "object" ? (
                      <Link
                        to={`/bundles/${schedule.bundleId._id}`}
                        className="text-primary-600 hover:text-primary-500 hover:underline"
                      >
                        {schedule.bundleId.name}
                      </Link>
                    ) : (
                      <Link
                        to={`/bundles/${schedule.bundleId}`}
                        className="text-primary-600 hover:text-primary-500 hover:underline"
                      >
                        View Bundle
                      </Link>
                    )
                  }
                />

                <DetailItem
                  icon={<FiRepeat className="text-gray-400" />}
                  label="Frequency"
                  value={getFrequencyDetails(schedule)}
                />

                <DetailItem
                  icon={<FiClock className="text-gray-400" />}
                  label="Time"
                  value={schedule.timeOfDay}
                />

                <DetailItem
                  icon={
                    <div
                      className={`h-4 w-4 rounded-full ${
                        schedule.status === "active"
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    ></div>
                  }
                  label="Status"
                  value={<span className="capitalize">{schedule.status}</span>}
                />

                {schedule.timezone && (
                  <DetailItem
                    icon={<FiGlobe className="text-gray-400" />}
                    label="Timezone"
                    value={schedule.timezone}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Run History Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiList className="mr-2 text-primary-500" />
                Run History
              </h2>

              {schedule.runHistory?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {schedule.runHistory.map((run, index) => (
                    <div key={index} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">
                            {formatDate(run.date)}
                          </p>
                          {run.error && (
                            <p className="text-sm text-red-500 mt-1 truncate max-w-[280px]">
                              <FiAlertCircle className="inline mr-1" />
                              {run.error}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            run.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {run.status === "success" ? (
                            <FiCheck className="mr-1" />
                          ) : (
                            <FiX className="mr-1" />
                          )}
                          {run.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FiInbox className="mx-auto h-10 w-10 mb-2" />
                  <p>No run history available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Next Run Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiCalendar className="mr-2 text-primary-500" />
                Next Run
              </h2>
              <div className="text-center py-2">
                <div className="inline-flex flex-col items-center p-4 bg-primary-50 rounded-lg">
                  <FiClock className="text-3xl text-primary-600 mb-2" />
                  <p className="text-lg font-medium text-gray-800">
                    {formatDate(schedule.nextRunAt, "MMM d, yyyy")}
                  </p>
                  <p className="text-gray-600">
                    {formatDate(schedule.nextRunAt, "h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Info Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiInfo className="mr-2 text-primary-500" />
                Schedule Info
              </h2>
              <div className="space-y-3">
                <InfoItem
                  label="Created"
                  value={formatDate(schedule.createdAt)}
                />
                <InfoItem
                  label="Last Updated"
                  value={formatDate(schedule.updatedAt)}
                />
                <InfoItem
                  label="Last Run"
                  value={
                    schedule.lastRunAt
                      ? formatDate(schedule.lastRunAt)
                      : "Never"
                  }
                />
                <InfoItem
                  label="Start Date"
                  value={formatDate(schedule.startDate)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="text-red-500 mr-2 text-xl" />
              <h3 className="text-lg font-semibold">Delete Schedule</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium">"{schedule.name}"</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FiTrash2 className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleDetail;
