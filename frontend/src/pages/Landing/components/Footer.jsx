import React from 'react';
import { Link } from 'react-router-dom';
import { FiYoutube, FiTwitter, FiInstagram, FiFacebook, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'FAQ', href: '#faq' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'API Documentation', href: '/api-docs' },
        { name: 'YouTube Tips', href: '/youtube-tips' },
        { name: 'Community', href: '/community' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
      ]
    }
  ];
  
  const socialLinks = [
    { icon: <FiYoutube />, href: 'https://youtube.com' },
    { icon: <FiTwitter />, href: 'https://x.com/Juneidshaikh18' },
    { icon: <FiInstagram />, href: 'https://instagram.com' },
    { icon: <FiFacebook />, href: 'https://facebook.com' },
    { icon: <FiLinkedin />, href: 'https://www.linkedin.com/in/juneid-shaikh' },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo and description */}
          <div className="col-span-2">
            <Link to="/" className="text-2xl font-bold text-white mb-4 inline-block">
              ReelScheduler
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              Automate your YouTube content schedule and grow your channel with our powerful scheduling platform.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Footer links */}
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, i) => (
                  <li key={i}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} ReelScheduler. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <a href="/privacy-policy" className="text-gray-500 hover:text-gray-300 text-sm">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-500 hover:text-gray-300 text-sm">
              Terms of Service
            </a>
            <a href="/cookies" className="text-gray-500 hover:text-gray-300 text-sm">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;