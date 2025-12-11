import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RiDashboardLine,
  RiVideoLine,
  RiCalendarCheckLine,
  RiSettings4Line,
  RiUser3Line,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiAiGenerate,
} from "react-icons/ri";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { IoIosAnalytics } from "react-icons/io";
import { IoAlbumsOutline, IoCloudUploadOutline } from "react-icons/io5";
import { FiUsers, FiUserCheck } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

function Sidebar() {
  const { userPlan, currentUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    localStorage.setItem('sidebarCollapsed', !collapsed);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) setCollapsed(savedState === 'true');
  }, []);

  // Navigation groups
  const navGroups = [
    {
      title: "AI",
      items: [
        { path: "/AI-generate", icon: <RiAiGenerate />, label: "AI Script Generate" }
      ]
    },
    {
      title: "Dashboard",
      items: [
        { path: "/dashboard", icon: <RiDashboardLine />, label: "Dashboard" }
      ]
    },
    {
      title: "Content",
      items: [
        { path: "/videos", icon: <IoAlbumsOutline />, label: "My Videos" },
        { path: "/videos/upload", icon: <IoCloudUploadOutline />, label: "Upload" },
        { path: "/bundles", icon: <RiVideoLine />, label: "Bundles" },
        { path: "/content", icon: <MdOutlineVideoLibrary />, label: "Content" }
      ]
    },
    {
      title: "Automation",
      items: [
        { path: "/schedules", icon: <RiCalendarCheckLine />, label: "Schedules" },
        { path: "/analytics", icon: <IoIosAnalytics />, label: "Analytics" }
      ]
    },
    {
      title: "Account",
      items: [
        { path: "/profile", icon: <RiUser3Line />, label: "Profile" },
        { path: "/youtube-settings", icon: <RiSettings4Line />, label: "Settings" }
      ]
    }
  ];

  return (
    <div className={`bg-white shadow-md transition-all duration-300 flex flex-col h-full ${collapsed ? "w-16" : "w-64"}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <Link to="/" className="text-xl font-bold text-primary-600 whitespace-nowrap">
            ReelScheduler
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <RiMenuUnfoldLine size={20} /> : <RiMenuFoldLine size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hidden">
        {/* AI Generate CTA */}
        {/* <div className="px-2 mb-6">
          <Link
            to="/AI-generate"
            className={`
              flex items-center justify-center gap-2 
              ${!collapsed ? "py-2 px-4 rounded-lg" : "p-3 rounded-full"}
              font-medium transition-all duration-300
              bg-gradient-to-r from-purple-600 to-blue-500
              hover:from-purple-700 hover:to-blue-600
              text-white shadow-md hover:shadow-lg
              relative overflow-hidden
            `}
          >
            <RiAiGenerate size={18} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">AI Video Generate</span>}
          </Link>
        </div> */}

        {/* Navigation Groups */}
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2.5 rounded-md transition-colors mx-2 ${
                      isActive(item.path)
                        ? "bg-primary-50 text-primary-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!collapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Team Section */}
        {userPlan?.features?.teamMembers > 1 && (
          <div className="mb-6">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                Team
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <Link
                  to="/team-management"
                  className={`flex items-center px-4 py-2.5 rounded-md transition-colors mx-2 ${
                    isActive("/team-management")
                      ? "bg-primary-50 text-primary-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiUsers className="text-lg" />
                  {!collapsed && <span className="ml-3 whitespace-nowrap">Team Management</span>}
                </Link>
              </li>
              <li>
                <Link
                  to="/team-member-workflow"
                  className={`flex items-center px-4 py-2.5 rounded-md transition-colors mx-2 ${
                    isActive("/team-member-workflow")
                      ? "bg-primary-50 text-primary-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiUserCheck className="text-lg" />
                  {!collapsed && <span className="ml-3 whitespace-nowrap">Member Workflow</span>}
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* User Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-700 truncate">
                {currentUser?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.email || "user@example.com"}
              </p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <Link to="/feedback-support" className="hover:text-primary-600 hover:underline">
              Feedback & Support
            </Link>
            <Link to="/contact" className="hover:text-primary-600 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;