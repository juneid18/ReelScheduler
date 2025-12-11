import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SEO from '../../components/SEO';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <SEO 
        title="Professional Social Media Content Scheduler"
        description="Streamline your social media presence with our advanced content scheduling platform. Schedule posts, manage multiple platforms, and grow your audience with AI-powered insights and analytics."
        keywords="social media scheduler, content scheduling, social media management, post scheduler, social media automation, content calendar, social media marketing, digital marketing tools"
        ogTitle="ReelScheduler - Professional Social Media Content Scheduler"
        ogDescription="Streamline your social media presence with our advanced content scheduling platform. Schedule posts, manage multiple platforms, and grow your audience."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ReelScheduler",
          "description": "Professional social media content scheduling and management platform",
          "url": window.location.origin,
          "applicationCategory": "SocialNetworkingApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "150"
          }
        }}
      />
      <div className="min-h-screen bg-white">
        <Header isAuthenticated={isAuthenticated} />
        <Hero isAuthenticated={isAuthenticated} />
        <Features />
        <HowItWorks />
        <Pricing isAuthenticated={isAuthenticated} />
        <Testimonials />
        <FAQ />
        <CTA isAuthenticated={isAuthenticated} />
        <Footer />
      </div>
    </>
  );
};

export default Landing;
