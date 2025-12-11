import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { authService } from "../../services/authService";
import {
  FiX,
  FiMail,
  FiUser,
  FiCheck,
  FiTrash2,
  FiShield,
  FiSettings,
  FiPlus,
  FiEdit,
  FiEye,
  FiUpload,
  FiBarChart2,
  FiLayers,
  FiClock,
  FiFilm,
  FiUsers,
  FiAlertTriangle,
} from "react-icons/fi";

// Permission icons mapping
const PERMISSION_ICONS = {
  admin: <FiShield className="text-purple-500" />,
  upload: <FiUpload className="text-blue-500" />,
  edit: <FiEdit className="text-green-500" />,
  delete: <FiTrash2 className="text-red-500" />,
  view: <FiEye className="text-blue-500" />,
  analytics: <FiBarChart2 className="text-yellow-500" />,
  manageBundles: <FiLayers className="text-indigo-500" />,
  manageSchedules: <FiClock className="text-orange-500" />,
  manageVideos: <FiFilm className="text-pink-500" />,
  manageTeam: <FiUsers className="text-cyan-500" />,
};

// Permission labels
const PERMISSION_LABELS = {
  admin: "Admin Access",
  upload: "Upload Content",
  edit: "Edit Content",
  delete: "Delete Content",
  view: "View Content",
  analytics: "View Analytics",
  manageBundles: "Manage Bundles",
  manageSchedules: "Manage Schedules",
  manageVideos: "Manage Videos",
  manageTeam: "Manage Team",
};

const TeamManagement = () => {
  const { currentUser } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberUserData, setMemberUserData] = useState(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [tempPermissions, setTempPermissions] = useState([]);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const res = await authService.getTeamMembers();
        
        setTeamMembers(res.teamMembers || []);
      } catch (err) {
        toast.error("Failed to load team members");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamMembers();
  }, []);

  // Invite a new team member
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      setLoading(true);
      const res = await authService.inviteTeamMember(inviteEmail);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setTeamMembers((prev) => [...prev, res.teamMember]);
      setInviteEmail("");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  // Accept invitation
  const handleAcceptInvite = async (teamMemberId) => {
    try {
      setLoading(true);
      const res = await authService.acceptTeamMember(teamMemberId);
      toast.success("Invitation accepted!");
      setTeamMembers((prev) =>
        prev.map((tm) => (tm._id === teamMemberId ? res.data.teamMember : tm))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  // Load member data for management
  const handleManageMember = async (member) => {
    await fetchLatestPermissions(member._id);
    setSelectedMember(member);
    setEditingPermissions(false);
    setManageLoading(true);

    try {
      const userId = member.user?._id || member.owner;
      if (userId) {
        const res = await authService.getUserDataById(userId);
        setMemberUserData(res.user);
      } else {
        setMemberUserData(null);
      }
    } catch (err) {
      toast.error("Failed to load user data");
      console.error(err);
    } finally {
      setManageLoading(false);
    }
  };

  // Fetch latest permissions before editing
  const startEditingPermissions = async () => {
    setManageLoading(true);
    try {
      const res = await authService.getTeamMemberPermissions(selectedMember._id);
      // The backend returns { success, permissions }
      const latestPermissions = Array.isArray(res.permissions)
        ? res.permissions
        : [];
      setTempPermissions(latestPermissions);
      setEditingPermissions(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch latest permissions");
      setTempPermissions([]);
      setEditingPermissions(false);
    } finally {
      setManageLoading(false);
    }
  };

  // Fetch Latest Permissions
  const fetchLatestPermissions = async (id) => {
    try {
      setManageLoading(true);
      const res = await authService.getTeamMemberPermissions(id);
      const latestPermissions = Array.isArray(res.teamMember?.permissions)
        ? res.teamMember.permissions
        : [];
      setTempPermissions(latestPermissions);
      setSelectedMember((prev) =>
        prev ? { ...prev, permissions: latestPermissions } : prev
      );
      setEditingPermissions(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch latest permissions");
      setTempPermissions([]);
      setEditingPermissions(false);
    } finally {
      setManageLoading(false);
    }
  };

  // Toggle individual permission
  const togglePermission = (permission) => {
    setTempPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  // Save permission changes
  const savePermissions = async () => {
    try {
      setManageLoading(true);
      // Update permissions in DB
      await authService.changeTeamMemberPermission(
        selectedMember._id,
        tempPermissions
      );

      setTeamMembers((prev) =>
        prev.map((tm) =>
          tm._id === selectedMember._id
            ? { ...tm, permissions: tempPermissions }
            : tm
        )
      );

      setSelectedMember((prev) =>
        prev ? { ...prev, permissions: tempPermissions } : prev
      );

      toast.success("Permissions updated successfully");
      setEditingPermissions(false);
      setSelectedMember(null);
    } catch (err) {
      toast.error("Failed to update permissions");
      console.error(err);
    } finally {
      setManageLoading(false);
    }
  };

  // Remove team member
  const removeTeamMember = async () => {
    // Show a toast confirmation instead of window.confirm
    const confirmed = await new Promise((resolve) => {
      let isLoading = false;
      const toastId = "remove-member-confirm";

      const handleAction = async (shouldRemove) => {
        isLoading = true;
        toast.loading("Processing...", {
          id: toastId,
          position: "top-center",
          className:
            "!bg-white !text-gray-800 !shadow-lg !border !border-gray-200",
        });

        // Small delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 300));

        toast.dismiss(toastId);
        resolve(shouldRemove);
      };

      toast.custom(
        () => (
          <div className="bg-white rounded-xl shadow-lg border border-red-100 px-6 py-5 flex flex-col items-center max-w-xl w-full animate-fade-in">
            {/* Header with icon */}
            <div className="flex items-center mb-3">
              <div className="p-2 bg-red-100 rounded-full mr-3">
                <FiTrash2 className="text-red-600 text-xl" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                Remove Team Member
              </h3>
            </div>

            {/* Member info */}
            <div className="w-full text-center mb-4">
              <div className="font-medium text-gray-900 text-lg mb-1">
                {memberUserData?.name || selectedMember.email}
              </div>
              <div className="text-sm text-gray-600">
                This member will lose all access immediately
              </div>
            </div>

            {/* Warning message */}
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 w-full">
              <div className="flex items-start">
                <FiAlertTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700">
                  This action{" "}
                  <span className="font-semibold">cannot be undone</span>. All
                  associated data will remain with your team.
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <button
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  isLoading
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 shadow-md"
                } text-white flex items-center justify-center`}
                onClick={() => handleAction(true)}
              >
                {isLoading ? (
                  <>
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
                    Removing...
                  </>
                ) : (
                  "Confirm Removal"
                )}
              </button>
              <button
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 border rounded-lg font-medium transition-all ${
                  isLoading
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-md"
                }`}
                onClick={() => handleAction(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity, // Don't auto-dismiss
          position: "top-center",
          id: toastId,
        }
      );
    });
    if (!confirmed) {
      return;
    }

    try {
      setManageLoading(true);
      await authService.removeTeamMember(selectedMember._id);
      setTeamMembers((prev) =>
        prev.filter((tm) => tm._id !== selectedMember._id)
      );
      setSelectedMember(null);
      toast.success("Member removed successfully");
    } catch (err) {
      toast.error("Failed to remove member");
      console.error(err);
    } finally {
      setManageLoading(false);
    }
  };

  // Check if current user is owner
  const isOwner = (member) => {
    // Now owner is an object with _id
    if (member.owner?._id === currentUser.id) {
      return true;
    } else {
      return false;
    }
  };

  // Get member display name
  const getDisplayName = (member) => {
    const isYou =
      member.user?._id === currentUser.id ||
      member.owner?._id === currentUser.id;

    if (member.user?.name) return `${member.user.name}${isYou ? " (You)" : ""}`;
    if (member.owner?.name)
      return `${member.owner.name}${isYou ? " (You)" : ""}`;
    return member.email;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <FiUsers
              className="text-2xl text-primary-600"
              aria-hidden="true"
              role="img"
              aria-label="Team icon"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              Team Management
            </h1>
          </div>
          <p className="text-gray-600 ml-9 sm:ml-9">
            Invite and manage your team members
          </p>
        </div>

        {/* Optional: Add a subtle separator */}
        <div className="mt-4 border-b border-gray-200 w-full"></div>
      </header>

      {/* Invite Form */}
      <form
        onSubmit={handleInvite}
        className="flex flex-col sm:flex-row gap-3 mb-8"
        autoComplete="off"
      >
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="text-gray-400" />
          </span>
          <input
            type="email"
            placeholder="Enter email to invite"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            autoFocus
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 min-w-[120px]"
          disabled={loading || !inviteEmail}
        >
          <FiPlus className="mr-2" />
          {loading ? "Sending..." : "Invite"}
        </button>
      </form>

      {/* Members Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Access Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
                  </div>
                </td>
              </tr>
            ) : teamMembers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No team members found
                </td>
              </tr>
            ) : (
              teamMembers.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-lg">
                        {getDisplayName(member).charAt(0).toUpperCase()}
                      </span>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getDisplayName(member)}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[180px]">
                          {member.user?.email ||
                            member.owner?.email ||
                            member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isOwner(member)
                          ? "bg-purple-100 text-purple-800"
                          : member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : member.status === "invited"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isOwner(member)
                        ? "Owner"
                        : member.status.charAt(0).toUpperCase() +
                          member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(Array.isArray(member.permissions) ? member.permissions : []).includes("admin") ? (
                      <span className="inline-flex items-center gap-1">
                        {PERMISSION_ICONS.admin}
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <FiSettings className="text-gray-400" />
                        Custom
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {member.status === "invited" &&
                    member.email === currentUser.email ? (
                      <button
                        onClick={() => handleAcceptInvite(member._id)}
                        className="flex items-center text-green-600 hover:text-green-900 transition"
                        disabled={loading}
                      >
                        <FiCheck className="mr-1" /> Accept
                      </button>
                    ) : isOwner(member) ? (
                      <button
                        onClick={() => handleManageMember(member)}
                        className="flex items-center text-blue-600 hover:text-blue-900 transition"
                      >
                        <FiSettings className="mr-1" /> Manage
                      </button>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Member Management Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl relative mx-4 max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setSelectedMember(null)}
              aria-label="Close modal"
            >
              <FiX className="h-6 w-6 text-gray-500" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Manage Member
              </h2>
              <p className="text-gray-500 text-sm">
                {!isOwner(selectedMember)
                  ? "Owner has full permissions"
                  : "Update permissions or remove member"}
              </p>
            </div>

            {manageLoading ? (
              <div className="flex justify-center items-center py-8">
                <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
              </div>
            ) : memberUserData ? (
              <div className="space-y-6">
                {/* Member Info */}
                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center font-semibold text-lg">
                    {memberUserData.name?.charAt(0).toUpperCase() ||
                      memberUserData.email.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {memberUserData.name || "No name"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {memberUserData.email}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                        isOwner(selectedMember)
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {isOwner(selectedMember) ? "Owner" : "Team Member"}
                    </span>
                  </div>
                </div>

                {/* Permissions Management */}
                {isOwner(selectedMember) && (
                  <section className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Permissions
                      </h3>
                      {editingPermissions ? (
                        <div className="space-x-2">
                          <button
                            onClick={() => setEditingPermissions(false)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={savePermissions}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={manageLoading}
                            type="button"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={startEditingPermissions}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          type="button"
                        >
                          <FiEdit className="mr-1" /> Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(PERMISSION_ICONS).map(([perm, icon]) => (
                        <div key={perm} className="flex items-center">
                          {editingPermissions ? (
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Array.isArray(tempPermissions) && tempPermissions.includes(perm)}
                                onChange={() => togglePermission(perm)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                disabled={manageLoading}
                              />
                              <span className="flex items-center">
                                {icon}
                                <span className="ml-2 text-sm text-gray-700">
                                  {PERMISSION_LABELS[perm]}
                                </span>
                              </span>
                            </label>
                          ) : (
                            <div className="flex items-center">
                              <span className="text-gray-400">
                                {(Array.isArray(selectedMember.permissions) ? selectedMember.permissions : []).includes(perm) ? (
                                  icon
                                ) : (
                                  <FiX className="text-gray-300" />
                                )}
                              </span>
                              <span className="ml-2 text-sm text-gray-700">
                                {PERMISSION_LABELS[perm]}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Remove Member */}
                {isOwner(selectedMember) && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={removeTeamMember}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      disabled={manageLoading}
                      type="button"
                    >
                      <FiTrash2 className="mr-2" />
                      {manageLoading ? "Removing..." : "Remove from Team"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p>No user data available for this member</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
