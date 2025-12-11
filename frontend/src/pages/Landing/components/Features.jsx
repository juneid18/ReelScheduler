import React from 'react';
import { FiYoutube, FiCalendar, FiClock, FiBarChart2, FiGlobe, FiShield } from 'react-icons/fi';

const Features = () => {
  const features = [
    {
      icon: <FiYoutube className="text-3xl text-primary-600" />,
      title: 'YouTube Integration',
      description: 'Connect your YouTube account and upload videos directly from our platform with just a few clicks.'
    },
    {
      icon: <FiCalendar className="text-3xl text-primary-600" />,
      title: 'Flexible Scheduling',
      description: 'Schedule uploads daily, weekly, or monthly at your preferred times to maintain a consistent posting schedule.'
    },
    {
      icon: <FiClock className="text-3xl text-primary-600" />,
      title: 'Time-Saving Automation',
      description: 'Set it and forget it. Let ReelScheduler handle your content calendar while you focus on creating.'
    },
    {
      icon: <FiBarChart2 className="text-3xl text-primary-600" />,
      title: 'Performance Analytics',
      description: 'Track your video performance and get insights to optimize your content strategy and grow your audience.'
    },
    {
      icon: <FiGlobe className="text-3xl text-primary-600" />,
      title: 'Global Timezone Support',
      description: 'Schedule content based on your audiences timezone to maximize engagement and reach.'
    },
    {
      icon: <FiShield className="text-3xl text-primary-600" />,
      title: 'Secure Content Management',
      description: 'Your videos and account information are protected with enterprise-grade security measures.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Content Creators</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to streamline your YouTube content workflow and grow your channel
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-primary-50 rounded-lg flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;