import React, { useState } from "react";
import { FiMail, FiMessageSquare, FiSend } from "react-icons/fi";
import Header from "../components/navigation/Header";
import Footer from "./Landing/components/Footer";
import userService from "../services/userService";
import toast from "react-hot-toast";

const FeedbackSupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically send the form data to your backend API
      await userService.sendFeedbackEmail(
        formData.email,
        "User Feedback",
        formData.message
      );
      toast.success("Thank you for your feedback!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("There was an error submitting your feedback.");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiMessageSquare className="text-primary-600" /> Feedback & Support
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            We value your feedback and are here to help you with any issues or
            questions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="you@example.com"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Write your feedback or issue here..."
              ></textarea>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
              >
                <FiSend /> Send Feedback
              </button>
            </div>
          </form>

          {/* Contact Info */}
          <div className="mt-8 border-t pt-4 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <FiMail className="text-primary-600" /> {import.meta.env.VITE_DEVELOPER_EMAIL}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FeedbackSupportPage;
