import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiTrash2, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { bundleService } from "../../../services/bundleService";
import VideoUpload from "../../videos/VideoUpload";
import { RiCloseCircleLine } from "react-icons/ri";

const AddVideoModel = ({ isOpen, onClose, refetch, bundleID }) => {
  const [uploadResponse, setUploadResponse] = useState(null);
  const [data, setData] = useState(null);

  const handleSubmit = async () => {
    if (!data?.[0]?.data?.video?._id) {
      toast.error("Video ID not found!");
      return;
    }
    const videoId = data[0].data.video._id;
    await toast.promise(bundleService.addVideoToBundle(bundleID, videoId), {
      loading: "Adding video to bundle...",
      success: "Video has been added!",
      error: "Failed to add video to bundle.",
    });
  };

  useEffect(() => {
  const processUpload = async () => {
    if (uploadResponse && data) {
      await handleSubmit();
      onClose();
      refetch();
      toast.success("Upload finished successfully!");
    }
  };

  processUpload();
}, [uploadResponse, data]);


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 w-2/4 shadow-2xl relative space-y-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <RiCloseCircleLine
              onClick={onClose}
              className="absolute right-4 text-2xl cursor-pointer"
            />
            <VideoUpload onUploadComplete={setUploadResponse} data={setData} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddVideoModel;
