import React, { useState } from "react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import { FiMail, FiSend } from "react-icons/fi";
import Footer from "./Landing/components/Footer";
import Header from "../components/navigation/Header";
import userService from "../services/userService";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await userService.sendContactUsEmail(
        form.email,
        `Contact from ${form.name}`,
        form.message
      );
      if (!res.success) throw new Error("Failed to send message");
      setSuccess("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError("There was an error sending your message. Please try again.");
      console.error("Contact form error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with the ReelScheduler team. Have questions or need support? We're here to help you with your social media content management needs."
        keywords="contact us, support, help, customer service, social media management, content scheduling support"
        ogTitle="Contact ReelScheduler - Get Support"
        ogDescription="Get in touch with our team for questions, support, or to learn more about our social media content management platform."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact ReelScheduler",
          "description": "Get in touch with our team for support and questions",
          "url": window.location.href,
          "mainEntity": {
            "@type": "Organization",
            "name": "ReelScheduler",
            "email": import.meta.env.VITE_DEVELOPER_EMAIL,
            "contactType": "customer service"
          }
        }}
      />
      <Header />
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get In <span className="text-primary-600">Touch</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or want to learn more? Reach out to our team and we'll get back to you within 24 hours.
            </p>
          </motion.div>

          {/* Contact Content */}
          <div className="flex flex-col md:flex-row gap-12">
            {/* Email Contact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="bg-gray-50 rounded-xl p-8 h-full flex flex-col items-center justify-center text-center border border-gray-100">
                <div className="bg-primary-100 p-4 rounded-full mb-6">
                  <FiMail className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Email Us
                </h3>
                <p className="text-gray-600 mb-6">
                  Send us a message directly to our inbox
                </p>
                <a
                  href={`mailto:${import.meta.env.VITE_DEVELOPER_EMAIL}`}
                  className="text-primary-600 hover:text-primary-800 text-lg font-medium transition-colors"
                >
                  {import.meta.env.VITE_DEVELOPER_EMAIL}
                </a>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Send a Message
                </h3>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="John Doe"
                      required
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
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      value={form.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}
                  {success && (
                    <div className="text-green-600 text-sm">{success}</div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send Message"} <FiSend className="ml-2" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Contact;
