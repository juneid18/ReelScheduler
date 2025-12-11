import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  
  const faqs = [
    {
      question: 'How does ReelScheduler work?',
      answer: 'ReelScheduler allows you to upload your videos, organize them into bundles, and create schedules for automatic publishing to YouTube. You can set up recurring schedules or one-time uploads based on your content strategy.'
    },
    {
      question: 'Do I need to give ReelScheduler access to my YouTube account?',
      answer: 'Yes, ReelScheduler needs permission to upload videos on your behalf. We use secure OAuth authentication with YouTube to ensure your account remains safe. You can revoke access at any time.'
    },
    {
      question: 'What happens if I exceed my plan\'s upload limit?',
      answer: 'If you reach your monthly upload limit, you can upgrade to a higher plan at any time. Any uploads beyond your limit will be paused until the next billing cycle or until you upgrade.'
    },
    {
      question: 'Can I schedule uploads to multiple YouTube channels?',
      answer: 'Yes, our Pro and Business plans support multiple YouTube channel connections, allowing you to manage content across different channels from a single ReelScheduler account.'
    },
    {
      question: 'Is there a limit to video file size?',
      answer: 'Free accounts can upload videos up to 500MB in size. Pro accounts support videos up to 2GB, and Business accounts can upload videos up to 5GB in size.'
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes, you can cancel your subscription at any time. Your account will remain active until the end of your current billing period.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about ReelScheduler
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="mb-4 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <FiChevronUp className="text-primary-600" />
                ) : (
                  <FiChevronDown className="text-gray-400" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Still have questions? <Link to="contact" className="text-primary-600 hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;