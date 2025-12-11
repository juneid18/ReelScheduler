import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { RiUserLine } from "react-icons/ri";
import toast from "react-hot-toast";
import Account from "./Account";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { Link } from "react-router-dom";
import { FiInfo, FiUnlock } from "react-icons/fi";
  // import FacebookConnectButton from '../components/FacebookConnectButton';
  // import api from '../services/api';

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
  const [isTeamMember, setIsTeamMember] = useState(false);
  // const [facebookConnected, setFacebookConnected] = useState(false);

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
        if(error.response.data.message === "Not a team member"){
          toast.error("You Are Not a Team Member")
        }
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

  useEffect(() => {
    // Check if user is a member of any team
    const checkTeamMembership = async () => {
      try {
        const res = await authService.getMyOwners();
        setIsTeamMember(Array.isArray(res.owners) && res.owners.length > 0);
      } catch {
        setIsTeamMember(false);
      }
    };
    checkTeamMembership();
  }, []);

  // useEffect(() => {
  //   // Fetch Facebook connection status
  //   async function fetchFacebookStatus() {
  //     try {
  //       const res = await api.get('/users/me');
  //       setFacebookConnected(res.data.facebookConnected);
  //     } catch {
  //       setFacebookConnected(false);
  //     }
  //   }
  //   fetchFacebookStatus();
  // }, [currentUser, manageOwner]);

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
        setOwnerUser((prev) => ({ ...prev, ...formData })); // Update local state
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

  // const handleFacebookConnect = () => {
  //   window.location.href = '/api/facebook/auth';
  // };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 rounded-full">
            <RiUserLine
              className="text-2xl text-primary-600"
              aria-hidden="true"
            />
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
          {!manageOwner && (
            <Link to="/subscription">
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                Upgrade Plan <FiUnlock className="inline ml-1" />
              </button>
            </Link>
          )}
        </div>
      </div>

      {isTeamMember && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 mb-1">
                Account Management Mode
              </h3>
              <p className="text-xs text-gray-500">
                {manageOwner
                  ? "Currently viewing owner account"
                  : "Currently viewing personal account"}
              </p>
            </div>

            <div className="flex items-center">
              {/* Modern toggle switch */}
              <button
                type="button"
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  manageOwner ? "bg-blue-600" : "bg-gray-200"
                }`}
                role="switch"
                aria-checked={manageOwner}
                onClick={() => {
                  if (!ownerLoading) {
                    // Only allow click if not already loading
                    setOwnerLoading(true);
                    setManageOwner(!manageOwner);
                    setTimeout(() => setOwnerLoading(false), 800); // 800ms delay
                  }
                }}
                disabled={ownerLoading}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    manageOwner ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {manageOwner ? "Owner Mode" : "Personal Mode"}
                {ownerLoading && (
                  <span className="ml-2 text-xs text-gray-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-pulse mr-1"></span>
                    Switching...
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Help text with icon */}
          <div
            className={`mt-3 flex items-start p-2 rounded-md ${
              manageOwner
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            <FiInfo
              className={`flex-shrink-0 h-4 w-4 mt-0.5 mr-2 ${
                manageOwner ? "text-blue-500" : "text-gray-500"
              }`}
            />
            <span className="text-xs">
              {manageOwner
                ? "You're viewing content for the owner account only"
                : "You're viewing your personal account content"}
            </span>
          </div>
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
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
              readOnly={ownerUser}
              disabled={ownerUser || loading}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              readOnly={ownerUser}
              disabled={ownerUser || loading}
              autoComplete="username"
            />
          </div>

          {manageOwner && ownerUser && (
            <div className="text-xs text-gray-500 p-2 bg-yellow-50 rounded">
              You Cannot edit the owner's profile as a team member. Please
              manage the owner account directly.
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={loading || ownerUser}
            >
              {loading || ownerLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Account Connections section */}
      {/* <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs mb-6">
        <h3 className="text-lg font-semibold mb-2">Account Connections</h3>
        <FacebookConnectButton connected={facebookConnected} onConnect={handleFacebookConnect} />
      </div> */}
    </div>
  );
};

export default Profile;
