import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  RiFacebookBoxFill,
  RiInstagramLine,
  RiMoneyDollarCircleLine,
  RiYoutubeLine,
} from "react-icons/ri";

const Hero = ({ isAuthenticated }) => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Left Content */}
          <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
            {/* Heading - Fixed the space issue between words */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-4">
              Cross-Platform{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Content Automation</span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute bottom-1 left-0 h-3 bg-primary-100 bg-opacity-50 z-0"
                />
              </span>
            </h1>

            {/* Description - Added platform-agnostic text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 mb-8 max-w-lg"
            >
              Save time and grow your audience with our powerful automation
              tools. Schedule posts, manage content, and never miss a publishing
              deadline.
            </motion.p>

            {/* CTA Buttons - Improved hover states */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 font-medium text-lg flex items-center justify-center shadow-lg hover:shadow-primary-500/20 hover:scale-[1.02]"
                >
                  Go to Dashboard <FiArrowRight className="ml-2" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 font-medium text-lg flex items-center justify-center shadow-lg hover:shadow-primary-500/20 hover:scale-[1.02]"
                >
                  Get Started Free <FiArrowRight className="ml-2" />
                </Link>
              )}

              <button className="px-8 py-3.5 border border-gray-300 hover:border-primary-300 text-gray-700 hover:text-primary-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-lg flex items-center justify-center shadow-sm hover:scale-[1.02]">
                <FiPlay className="mr-2 text-primary-600" /> Watch Demo
              </button>
            </motion.div>

            {/* Social Proof - Added more diverse avatars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex items-center"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.img
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                    src={`https://randomuser.me/api/portraits/${
                      i % 2 === 0 ? "women" : "men"
                    }/${i + 20}.jpg`}
                    alt={`User ${i}`}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.svg
                      key={star}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                        delay: 0.7 + star * 0.05,
                      }}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Trusted by 5,000+ content creators
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="lg:w-1/2 relative group">
  {/* Main Preview Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
  >
    {/* Chart Container */}
    <div className="relative aspect-video bg-gray-50 p-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-medium text-gray-900">Performance Growth</h3>
          <p className="text-sm text-gray-500">30-day automation results</p>
        </div>
        <div className="flex space-x-1.5">
          <div className="p-1.5 bg-white rounded-lg shadow-xs border border-gray-200">
            <RiYoutubeLine className="w-4 h-4 text-red-600" />
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative flex-1">
        {/* Grid */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-5">
          {[...Array(4)].map((_, i) => (
            <div key={`col-${i}`} className="border-r border-gray-200/80"></div>
          ))}
          {[...Array(5)].map((_, i) => (
            <div key={`row-${i}`} className="border-t border-gray-200/80"></div>
          ))}
        </div>

        {/* Y-axis */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Line Chart */}
        <div className="absolute bottom-0 left-8 right-6 top-2">
          <svg 
            viewBox="0 0 300 150" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Engagement Line */}
            <motion.path
              d="M0,120 C50,100 100,80 150,60 C200,40 250,30 300,20"
              stroke="url(#engagementGradient)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                duration: 1.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.3
              }}
            />
            
            {/* Followers Line */}
            <motion.path
              d="M0,130 C50,110 100,90 150,70 C200,50 250,40 300,30"
              stroke="url(#followersGradient)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                duration: 1.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.6
              }}
            />
            
            {/* Revenue Line */}
            <motion.path
              d="M0,140 C50,115 100,70 150,40 C200,20 250,10 300,5"
              stroke="url(#revenueGradient)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                duration: 1.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.9
              }}
            />

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="engagementGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="followersGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#84CC16" />
              </linearGradient>
            </defs>
          </svg>

          {/* Animated Dots */}
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-white border-2 border-primary-500 shadow-xs"
            initial={{ left: '0%', bottom: '20%', opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1,
              scale: 1,
              left: ['0%', '25%', '50%', '75%', '100%'],
              bottom: ['20%', '13.3%', '10%', '6.6%', '3.3%']
            }}
            transition={{ 
              duration: 2.1,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.3
            }}
          />
        </div>

        {/* X-axis */}
        <div className="absolute bottom-2 left-8 right-6 flex justify-between text-xs text-gray-500">
          {['Week 1', 'Week 2', 'Week 3', 'Month 2'].map((label, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
            >
              {label}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute top-2 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-xs border border-gray-200">
          <div className="flex flex-col space-y-1.5 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 mr-2 rounded-full"></div>
              <span>Engagement</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-gradient-to-r from-secondary-500 to-secondary-400 mr-2 rounded-full"></div>
              <span>Followers</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-gradient-to-r from-green-500 to-green-400 mr-2 rounded-full"></div>
              <span>Revenue</span>
            </div>
          </div>
        </div>

        {/* Monetization Badge */}
        <motion.div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <RiMoneyDollarCircleLine className="w-4 h-4 text-yellow-500 mr-1.5" />
          <span className="text-xs font-medium">Monetization Active</span>
        </motion.div>
      </div>
    </div>

    {/* PRO Badge */}
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-medium shadow-md z-10 border-2 border-white"
    >
      PRO
    </motion.div>
  </motion.div>

  {/* Decorative Element */}
  <motion.div
    animate={{
      y: [0, -5, 0],
      rotate: [0, 2, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="absolute -top-6 -left-6 w-14 h-14 bg-primary-100/50 rounded-xl backdrop-blur-sm z-0"
  />
</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
