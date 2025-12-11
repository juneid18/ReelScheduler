import React, { useRef, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

const Bubble = ({ targetX, targetY, delay }) => {
  return (
    <motion.div
      className="w-3 h-3 bg-white rounded-full absolute"
      initial={{ x: -50, y: targetY }}
      animate={{
        x: [-50, targetX * 0.3, targetX * 0.6, targetX],
        y: [
          targetY - 20, // go up
          targetY + 20, // go down
          targetY - 10, // up again
          targetY, // settle
        ],
        opacity: [0, 1, 1, 0], // fade in and fade out
      }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        duration: 8, // slow, smooth
        delay,
      }}
    />
  );
};

const CTA = ({ isAuthenticated }) => {
  const buttonRef = useRef(null);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const sectionRect = buttonRef.current
        .closest("section")
        .getBoundingClientRect();
      setTargetPos({
        x: rect.left - sectionRect.left + rect.width / 2 - 6, // center of button
        y: rect.top - sectionRect.top + rect.height / 2 - 6, // center vertically
      });
    }
  }, []);

  return (
    <section className="relative py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
      {!isAuthenticated && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          {/* 5 smooth bubbles with different delays for infinite water-like feel */}
          {[0, 1, 2, 3, 4].map((delay, idx) => (
            <Bubble
              key={idx}
              targetX={targetPos.x}
              targetY={targetPos.y}
              delay={delay * 1.5} // smooth separation
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Automate Your YouTube Content Schedule?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who are saving time and growing
            their channels with ReelScheduler.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-3.5 bg-white text-primary-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg flex items-center justify-center"
              >
                Go to Dashboard <FiArrowRight className="ml-2" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  ref={buttonRef}
                  className="relative px-8 py-3.5 bg-white text-primary-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg flex items-center justify-center overflow-hidden"
                >
                  Get Started Free <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 border border-white text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg flex items-center justify-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
