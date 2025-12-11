import React from "react";
import { FiUpload, FiPackage, FiCalendar, FiCheckCircle } from "react-icons/fi";

const HowItWorks = () => {
  const steps = [
    {
      icon: <FiUpload className="text-3xl" />,
      title: "Upload Your Videos",
      description:
        "Upload your pre-recorded videos to ReelScheduler's secure platform. You can also set up recurring schedules for automatic publishing.",
      color: "bg-blue-500",
    },
    {
      icon: <FiPackage className="text-3xl" />,
      title: "Create Content Bundles",
      description:
        "Organize your videos into bundles for easier management and scheduling. You can also set up recurring schedules for automatic publishing.",
      color: "bg-purple-500",
    },
    {
      icon: <FiCalendar className="text-3xl" />,
      title: "Set Your Schedule",
      description:
        "Choose when and how often you want your videos to be published. You can also set up recurring schedules for automatic publishing.",
      color: "bg-green-500",
    },
    {
      icon: <FiCheckCircle className="text-3xl" />,
      title: "Relax & Create More",
      description:
        "We'll handle the publishing while you focus on creating great content. You can also set up recurring schedules for automatic publishing.",
      color: "bg-yellow-500",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How ReelScheduler Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            A simple 4-step process to automate your YouTube content schedule
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Desktop view with connecting lines */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 -translate-y-1/2 rounded-full opacity-20"></div>

              <div className="grid grid-cols-4 gap-8 relative z-10">
                {steps.map((step, index) => (
                  <div key={index} className="text-center group">
                    <div
                      className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                    >
                      <div className="text-white">{step.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed px-2">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile view as cards */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <div
                      className={`w-14 h-14 ${step.color} rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-inner`}
                    >
                      <div className="text-white">{step.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        <span className="text-gray-500 font-medium">
                          Step {index + 1}:
                        </span>{" "}
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mt-2">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to streamline your content workflow?
            </h3>
            <p className="text-lg text-gray-600">
              ReelScheduler handles the technical aspects of content publishing
              so you can focus on what you do best: creating amazing videos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
