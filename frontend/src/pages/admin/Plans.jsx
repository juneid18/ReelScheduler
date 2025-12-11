import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch all plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await adminService.getPlans();
        if (res.status === 200) {
          setPlans(res.data?.plans || []);
        } else {
          setError("Failed to fetch plans");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Handle edit button click
  const handleEditClick = (plan) => {
    setEditingPlan({
      ...plan,
      features: {
        videoUploadsLimit: plan.features?.videoUploadsLimit || 0,
        videoStorageDays: plan.features?.videoStorageDays || 0,
        storageLimit: plan.features?.storageLimit || 0,
        bundleLimit: plan.features?.bundleLimit || 0,
        scheduleLimit: plan.features?.scheduleLimit || 0,
        schedulingOptions: plan.features?.schedulingOptions || [],
        prioritySupport: plan.features?.prioritySupport || false,
        bulkUpload: plan.features?.bulkUpload || false,
        teamMembers: plan.features?.teamMembers || 1,
      },
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("features.")) {
      const featureName = name.split(".")[1];
      setEditingPlan((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          [featureName]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setEditingPlan((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle scheduling options changes
  const handleSchedulingOptionsChange = (e) => {
    const { value, checked } = e.target;
    setEditingPlan((prev) => {
      const currentOptions = prev.features.schedulingOptions || [];
      const newOptions = checked
        ? [...currentOptions, value]
        : currentOptions.filter((opt) => opt !== value);

      return {
        ...prev,
        features: {
          ...prev.features,
          schedulingOptions: newOptions,
        },
      };
    });
  };

  // Save the edited plan
  const handleSavePlan = async () => {
    try {
      const res = await adminService.updatePlan(editingPlan._id, editingPlan);
      
      if (res.status === 200) {
        // The updated plan is in res.data.plan, not res.plan
        setPlans(plans.map((p) => (p._id === editingPlan._id ? res.data.plan : p)));
        setShowEditModal(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update plan");
    }
  };

  if (loading) return <div className="text-center py-8">Loading plans...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Manage Subscription Plans</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Monthly
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Yearly
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plans.map((plan, idx) => (
              <tr key={plan?._id || idx}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{plan?.name || "Unknown"}</div>
                  <div className="text-sm text-gray-500">
                    {plan?.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {typeof plan?.monthlyPrice === "number" && !isNaN(plan.monthlyPrice)
                    ? `$${plan.monthlyPrice.toFixed(2)}`
                    : plan?.monthlyPrice !== undefined && plan?.monthlyPrice !== null && plan?.monthlyPrice !== ""
                    ? `$${plan.monthlyPrice}`
                    : <span className="text-gray-400">N/A</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {typeof plan?.yearlyPrice === "number" && !isNaN(plan.yearlyPrice)
                    ? `$${plan.yearlyPrice.toFixed(2)}`
                    : plan?.yearlyPrice !== undefined && plan?.yearlyPrice !== null && plan?.yearlyPrice !== ""
                    ? `$${plan.yearlyPrice}`
                    : <span className="text-gray-400">N/A</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan?.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {plan?.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(plan)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Plan Modal */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Edit Plan: {editingPlan?.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Basic Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingPlan?.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={editingPlan?.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monthly Price ($)
                    </label>
                    <input
                      type="number"
                      name="monthlyPrice"
                      value={editingPlan?.monthlyPrice}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Yearly Price ($)
                    </label>
                    <input
                      type="number"
                      name="yearlyPrice"
                      value={editingPlan?.yearlyPrice}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={editingPlan?.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Active Plan
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={editingPlan?.isPopular}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Mark as Popular
                    </label>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="font-medium">Features</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Video Uploads Limit
                    </label>
                    <input
                      type="number"
                      name="features.videoUploadsLimit"
                      value={editingPlan?.features?.videoUploadsLimit}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Video Storage Days
                    </label>
                    <input
                      type="number"
                      name="features.videoStorageDays"
                      value={editingPlan?.features?.videoStorageDays}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Storage Limit (MB)
                    </label>
                    <input
                      type="number"
                      name="features.storageLimit"
                      value={editingPlan?.features?.storageLimit}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bundle Limit
                    </label>
                    <input
                      type="number"
                      name="features.bundleLimit"
                      value={editingPlan?.features?.bundleLimit}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {editingPlan?.features?.bundleLimit === -1
                        ? "Unlimited bundles"
                        : `Max ${editingPlan?.features?.bundleLimit} bundles`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Schedule Limit
                    </label>
                    <input
                      type="number"
                      name="features.scheduleLimit"
                      value={editingPlan?.features?.scheduleLimit}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {editingPlan?.features?.scheduleLimit === -1
                        ? "Unlimited scheduling"
                        : `Max ${editingPlan?.features?.scheduleLimit} scheduled items`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Scheduling Options
                    </label>
                    <div className="mt-2 space-y-2">
                      {["basic", "advanced", "premium"].map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`scheduling-${option}`}
                            value={option}
                            checked={editingPlan?.features?.schedulingOptions.includes(
                              option
                            )}
                            onChange={handleSchedulingOptionsChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`scheduling-${option}`}
                            className="ml-2 block text-sm text-gray-700 capitalize"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.prioritySupport"
                      checked={editingPlan?.features?.prioritySupport}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Priority Support
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.bulkUpload"
                      checked={editingPlan?.features?.bulkUpload}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Bulk Upload
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Team Members
                    </label>
                    <input
                      type="number"
                      name="features.teamMembers"
                      value={editingPlan?.features?.teamMembers}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
