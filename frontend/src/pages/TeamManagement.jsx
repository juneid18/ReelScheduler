import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { RiUserLine } from "react-icons/ri";
import toast from "react-hot-toast";
import Account from "./Account";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { Link } from "react-router-dom";

const Profile = () => {
  const { currentUser, updateUser } = useAuth(); // Added updateUser from context
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [ownerUser, setOwnerUser] = useState(null);
  const [manageOwner, setManageOwner] = useState(
    () => !!localStorage.getItem("ownerId") // Initialize from localStorage
  );
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState(currentUser?.id);

  useEffect(() => {
    // Initialize form with current user data
    if (!manageOwner && currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
      });
      setActiveUserId(currentUser.id);
      localStorage.removeItem("ownerId");
    }
  }, [currentUser, manageOwner]);

  useEffect(() => {
    if (manageOwner) {
      fetchOwnerProfile();
    }

    async function fetchOwnerProfile() {
      try {
        setOwnerLoading(true);
        const res = await userService.getOwnerProfile();
        
        if (res?.user) {
          setOwnerUser(res.user);
          setFormData({
            name: res.user.name,
            email: res.user.email,
          });
          const ownerId = res.user.id || res.user._id;
          setActiveUserId(ownerId);
          localStorage.setItem("ownerId", ownerId);
        } else {
          handleOwnerError("Owner profile not found");
        }
      } catch (error) {
        handleOwnerError(error.message || "Failed to load owner profile");
      } finally {
        setOwnerLoading(false);
      }
    }

    function handleOwnerError(message) {
      setOwnerUser(null);
      toast.error(message);
      localStorage.removeItem("ownerId");
      setManageOwner(false); // Revert to self profile
    }
  }, [manageOwner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setLoading(true);
      let response;

      if (manageOwner && ownerUser) {
        response = await userService.updateOwnerProfile(formData);
        setOwnerUser(prev => ({ ...prev, ...formData })); // Update local state
        toast.success("Owner profile updated");
      } else {
        response = await authService.updateProfile(formData);
        updateUser(response.user); // Update auth context
        toast.success("Your profile updated");
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Determine if the current user is a team member
  const isTeamMember = currentUser?.role === "member" || currentUser?.role === "team_member";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 rounded-full">
            <RiUserLine className="text-2xl text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {manageOwner ? "Owner's Profile" : "Your Profile"}
            </h1>
            <p className="text-gray-500 mt-1">
              {manageOwner
                ? "Manage your owner's account settings"
                : "Manage your account settings"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/subscription">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
              Upgrade Plan
            </button>
          </Link>
        </div>
      </div>

      {/* Owner toggle: Only show the switch if user is a team member */}
      {isTeamMember && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={manageOwner}
              onChange={() => setManageOwner((v) => !v)}
              className="mr-2"
              disabled={ownerLoading}
            />
            <span className="text-sm text-gray-700">
              {manageOwner ? "Switch to your account" : "Manage Owner Account"}
            </span>
          </label>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            When managing owner, only owner's content will be shown
          </span>
        </div>
      )}

      <Account activeUserId={activeUserId} />

      {/* Profile form */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Profile Information
          </h2>
        </div>
        <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={ownerLoading || loading}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              readOnly
              autoComplete="username"
            />
          </div>

          {manageOwner && ownerUser && (
            <div className="text-xs text-gray-500 p-2 bg-yellow-50 rounded">
              You are managing the owner's profile as a team member
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={loading || ownerLoading}
            >
              {loading || ownerLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;