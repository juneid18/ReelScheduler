import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { RiShieldCheckLine, RiExternalLinkLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import Header from '../components/navigation/Header';
import Footer from './Landing/components/Footer';

const Terms = () => {
  const [websiteName, setWebsiteName] = useState('Our Service');
  const [lastUpdated] = useState(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    // Extract website name from URL
    const origin = window.location.origin;
    const name = origin.replace(/(^\w+:|^)\/\/(www\.)?/, '').split('.')[0];
    setWebsiteName(name.charAt(0).toUpperCase() + name.slice(1) || 'Our Service');
  }, []);

  const sections = [
    {
      title: "Acceptance of Terms",
      content: `By accessing or using ${websiteName}, you agree to be bound by these Terms of Service. If you disagree with any part, you may not access the service.`
    },
    {
      title: "Basic Terms",
      content: [
        "You must be at least 13 years old to use this service",
        "You are responsible for any activity that occurs under your account",
        "You may not use the service for any illegal activities",
        "You must not violate any laws in your jurisdiction"
      ]
    },
    {
      title: "User Content",
      content: `You retain ownership of any content you submit to ${websiteName}, but grant us a worldwide license to use, display, and distribute your content solely for operating our services.`
    },
    {
      title: "Privacy",
      content: `Your privacy is important to us. Please review our Privacy Policy which explains how we collect and use your information.`
    },
    {
      title: "Modifications",
      content: `We reserve the right to modify these terms at any time. We'll notify you of significant changes through our website or email.`
    },
    {
      title: "Limitation of Liability",
      content: `${websiteName} shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.`
    }
  ];

  return (
    <>
      <SEO 
        title="Terms of Service"
        description={`Terms and conditions for using ${websiteName}. Read our terms of service to understand your rights and responsibilities when using our platform.`}
        keywords="terms of service, terms and conditions, user agreement, legal, privacy policy, social media platform terms"
        ogTitle={`Terms of Service - ${websiteName}`}
        ogDescription={`Terms and conditions for using ${websiteName}. Read our terms of service to understand your rights and responsibilities.`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Terms of Service",
          "description": `Terms and conditions for using ${websiteName}`,
          "url": window.location.href,
          "dateModified": lastUpdated
        }}
      />
      <Header />
      <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8"
    >

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <RiShieldCheckLine className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-500">
            Last Updated: {lastUpdated}
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="prose prose-indigo max-w-none">
              <div className="mb-2 text-sm font-medium text-indigo-600">
                {websiteName}
              </div>
              <p className="text-gray-500 mb-8">
                Welcome to our Terms of Service. Please read these terms carefully before using our website.
              </p>

              {sections.map((section, index) => (
                <motion.section 
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="mb-8 group"
                >
                  <h2 className="text-xl font-semibold mb-3 flex items-center">
                    <span className="mr-2 text-indigo-600">{index + 1}.</span>
                    {section.title}
                  </h2>
                  {Array.isArray(section.content) ? (
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      {section.content.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">
                      {section.content}
                      {section.title === "Privacy" && (
                        <a 
                          href="/privacy-policy" 
                          className="ml-1.5 inline-flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Privacy Policy <RiExternalLinkLine className="ml-1 h-4 w-4" />
                        </a>
                      )}
                    </p>
                  )}
                </motion.section>
              ))}

              <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * sections.length }}
                className="mt-12 pt-6 border-t border-gray-200"
              >
                <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                <p className="text-gray-600">
                  If you have questions about these Terms, please contact us at:
                  <br />
                  <a 
                    href={`mailto:support@${window.location.hostname}`} 
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 hover:underline mt-1"
                  >
                    support@{window.location.hostname} <RiExternalLinkLine className="ml-1 h-4 w-4" />
                  </a>
                </p>
              </motion.section>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <p>
            © {new Date().getFullYear()} {websiteName}. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.div>
    <Footer />
    </>
  );
};

export default Terms;