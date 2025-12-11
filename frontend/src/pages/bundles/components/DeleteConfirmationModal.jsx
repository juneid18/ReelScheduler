import React from "react";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";

const DeleteConfirmationModal = ({ isOpen, onClose, onDelete, bundleName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-100 text-red-600">
            <FiAlertTriangle className="text-xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Delete Bundle
          </h3>
        </div>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium">"{bundleName}"</span>? This action
          cannot be undone and all associated schedules will be removed.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FiTrash2 className="mr-2" /> Delete Bundle
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
