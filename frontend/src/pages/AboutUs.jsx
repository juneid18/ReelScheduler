import React from "react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import {
  FiCalendar,
  FiTrendingUp,
  FiLayers,
  FiShield,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import DeveloperImg from "../assets/undraw_programming_65t2.svg";
import Footer from "./Landing/components/Footer";
import Header from "../components/navigation/Header";

const AboutUs = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      icon: <FiCalendar className="text-3xl text-primary-600" />,
      title: "Seamless Scheduling",
      description: "Plan and automate your content across multiple platforms",
    },
    {
      icon: <FiTrendingUp className="text-3xl text-primary-600" />,
      title: "Performance Analytics",
      description: "Track engagement and optimize your posting strategy",
    },
    {
      icon: <FiLayers className="text-3xl text-primary-600" />,
      title: "Content Organization",
      description: "Manage your entire video library in one place",
    },
    {
      icon: <FiShield className="text-3xl text-primary-600" />,
      title: "Secure Platform",
      description: "Enterprise-grade security for your content and accounts",
    },
  ];

  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about ReelScheduler's mission to democratize content scheduling and empower creators with professional-grade video management tools."
        keywords="about us, ReelScheduler, content creators, video management, social media tools, content scheduling platform"
        ogTitle="About ReelScheduler - Empowering Content Creators"
        ogDescription="Learn about our mission to democratize content scheduling and empower creators with professional-grade video management tools."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ReelScheduler",
          "description": "Professional social media content scheduling and management platform",
          "url": window.location.origin,
          "foundingDate": "2025",
          "mission": "To democratize content scheduling by providing professional-grade tools that are accessible to creators at every level",
          "sameAs": [
            "https://twitter.com/reelscheduler",
            "https://linkedin.com/company/reelscheduler"
          ]
        }}
      />
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-primary-600">ReelScheduler</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering creators with intelligent video content management tools
          </p>
        </motion.div>

        {/* Our Story */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16 flex flex-col lg:flex-row items-center gap-12"
        >
          <div className="lg:w-1/2">
            <div>
              <img
                src={DeveloperImg}
                alt="Working on ReelScheduler"
                className="rounded-xl w-full h-auto"
              />
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Founded in 2025, ReelScheduler began as a solution to the
              frustrations I experienced as a content creator. Managing multiple
              platforms, remembering posting times, and tracking performance was
              consuming more time than actual content creation.
            </p>
            <p className="text-gray-600 leading-relaxed">
              I built ReelScheduler to automate the tedious parts of content
              management so creators can focus on what matters most - telling
              their stories and connecting with their audience.
            </p>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 md:p-12 text-white"
        >
          <div className="max-w-4xl mx-auto text-center">
            <FiUsers className="mx-auto text-4xl mb-6" />
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg md:text-xl leading-relaxed">
              To democratize content scheduling by providing professional-grade
              tools that are accessible to creators at every level, helping them
              grow their audience and maximize their impact.
            </p>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose ReelScheduler
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl overflow-hidden">
            <div className="md:flex items-center justify-between p-8 md:p-12">
              <div className="md:flex-1 mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to Transform Your Content Workflow?
                </h2>
                <p className="text-primary-100">
                  Join thousands of creators who trust ReelScheduler to manage
                  their video content
                </p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:bg-opacity-10 transition-colors shadow-sm"
                >
                  Get Started Free <FiArrowRight className="ml-2" />
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </>
  );
};

export default AboutUs;
