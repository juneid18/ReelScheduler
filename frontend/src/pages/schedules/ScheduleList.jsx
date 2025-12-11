import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiCalendarCheckLine,
  RiSearchLine,
  RiFilterLine,
  RiStackLine,
  RiRepeat2Line,
  RiCalendarEventLine,
  RiCalendarTodoLine,
  RiPauseLine,
  RiEyeLine,
  RiAddLine,
  RiTimeZoneLine,
} from "react-icons/ri";
import { scheduleService } from "../../services/scheduleService";
import toast from "react-hot-toast";
import { FiInfo } from "react-icons/fi";

function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nextRunAt");
  const [sortOrder, setSortOrder] = useState("asc");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockSchedules = await scheduleService.getSchedules();

        setSchedules(mockSchedules);
        setLoading(false);
      } catch (error) {
        if (
          error.response?.data?.permission === false ||
          error.response?.data?.message ===
            "You do not have permission to view owner's videos"
        ) {
          setError(
            error.response?.data?.message ||
              "You do not have permission to view this owner's videos. Contact to your owner to get access."
          );
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
          toast.dismiss();
          setLoading(false);
          return;
        }
        console.error("Error fetching schedules:", error);
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Filter schedules based on search term
  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.bundleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort schedules
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "bundleName") {
      return sortOrder === "asc"
        ? a.bundleName.localeCompare(b.bundleName)
        : b.bundleName.localeCompare(a.bundleName);
    } else {
      // Default sort by nextRunAt
      return sortOrder === "asc"
        ? new Date(a.nextRunAt) - new Date(b.nextRunAt)
        : new Date(b.nextRunAt) - new Date(a.nextRunAt);
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to ascending for dates, descending for others
      setSortBy(field);
      setSortOrder(field === "nextRunAt" ? "asc" : "desc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Title section with icon */}
        <div className="flex items-center gap-3">
          <RiCalendarCheckLine
            className="text-2xl text-primary-600"
            aria-hidden="true"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Schedules
          </h1>
          <span className="hidden sm:inline-block ml-2 px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
            {schedules?.length || 0} schedules
          </span>
        </div>

        {/* Create button */}
        <Link
          to="/schedules/create"
          className="btn btn-primary flex items-center gap-2 px-4 py-2.5 text-sm sm:text-base font-medium rounded-lg transition-all hover:shadow-md hover:bg-primary-600 focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
          aria-label="Create new upload schedule"
        >
          <RiCalendarCheckLine className="text-lg" />
          <span className="hidden xs:inline">New Schedule</span>
          <span className="xs:hidden">New</span>
        </Link>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <RiSearchLine className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search schedules..."
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
              <option value="nextRunAt">Sort by Next Run</option>
              <option value="name">Sort by Name</option>
              <option value="bundleName">Sort by Bundle</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <RiFilterLine className="text-gray-400" />
            </div>
          </div>

          <button
            className="btn btn-outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSchedules.length > 0 ? (
            sortedSchedules.map((schedule, idx) => (
              <div
                key={schedule.id || idx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-3">
                    <h2
                      className="text-lg font-semibold text-gray-800 truncate"
                      title={schedule.name}
                    >
                      {schedule.name || ""}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        schedule.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {schedule.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-start">
                      <RiTimeZoneLine className="flex-shrink-0 mt-0.5 mr-2 text-gray-400" />
                      <p className="text-sm text-gray-600 ">
                        Timezone: {schedule.timezone || ""}
                      </p>
                    </div>

                    <div className="flex items-start">
                      <RiRepeat2Line className="flex-shrink-0 mt-0.5 mr-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Frequency:{" "}
                        <span className="capitalize font-medium">
                          {schedule.frequency || ""}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-start">
                      <RiCalendarEventLine className="flex-shrink-0 mt-0.5 mr-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Next run:{" "}
                        <span className="font-medium text-gray-700">
                          {new Date(schedule.nextRunAt).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <Link
                    to={`/schedules/${schedule._id}`}
                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 hover:underline"
                  >
                    <RiEyeLine className="mr-1.5" />
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <RiCalendarTodoLine className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No schedules found
              </h3>
              <p className="text-gray-400 mb-4 max-w-md">
                Create your first schedule to automate your content uploads
              </p>
              <Link
                to="/schedules/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RiAddLine className="mr-2" />
                Create Schedule
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ScheduleList;
