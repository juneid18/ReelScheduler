import React from "react";
import SEO from "../components/SEO";
import { RiShieldCheckFill, RiMailLine, RiGlobalLine } from "react-icons/ri";
import Footer from "./Landing/components/Footer";
import Header from "../components/navigation/Header";

const PolicyPage = () => {
  const contactEmail = import.meta.env.VITE_DEVELOPER_EMAIL;
  const companyName = "ReelScheduler";

  return (
    <>
      <SEO 
        title="Privacy Policy"
        description={`Learn how ${companyName} collects, uses, and protects your personal information. We are committed to protecting your privacy and handling your data transparently.`}
        keywords="privacy policy, data protection, personal information, GDPR, data privacy, user privacy, social media platform privacy"
        ogTitle={`Privacy Policy - ${companyName}`}
        ogDescription={`Learn how ${companyName} collects, uses, and protects your personal information.`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Privacy Policy",
          "description": `Privacy policy for ${companyName}`,
          "url": window.location.href,
          "publisher": {
            "@type": "Organization",
            "name": companyName
          }
        }}
      />
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
          <RiShieldCheckFill className="text-blue-600 text-3xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
      </header>

      <div className="prose prose-blue max-w-none">
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to {companyName}. We are committed to protecting your
            privacy and handling your data transparently. This policy explains
            how we collect, use, disclose, and safeguard your information when
            you use our services.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            2. Information We Collect
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We collect information you provide directly and automatically
            through your use of our services:
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <h3 className="font-medium text-gray-800 mb-2">
              Information You Provide:
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Name and contact details (email, phone number)</li>
              <li>Account credentials (usernames, passwords)</li>
              <li>
                Payment information (processed securely via Stripe/PayPal)
              </li>
              <li>Social media account details for scheduling</li>
              <li>Content you upload (videos, captions, metadata)</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-800 mb-2">
              Automatically Collected Information:
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Device information (IP address, browser type)</li>
              <li>Usage data (pages visited, features used)</li>
              <li>Cookies and tracking technologies</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            3. How We Use Your Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-medium text-blue-800 mb-2">
                Service Operation
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide and maintain our services</li>
                <li>Process transactions and payments</li>
                <li>Authenticate user accounts</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-medium text-blue-800 mb-2">
                Improvements & Communication
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Improve and personalize your experience</li>
                <li>Send service-related communications</li>
                <li>Respond to inquiries and support requests</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            4. Data Sharing & Disclosure
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We only share your information in these specific circumstances:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Service Providers:</strong> Payment processors, hosting
                services, and analytics providers
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with mergers
                or acquisitions
              </li>
              <li>
                <strong>With Your Consent:</strong> For specific purposes you
                authorize
              </li>
            </ul>
            <p className="mt-4 text-gray-700">
              We <strong>do not</strong> sell your personal information to third
              parties.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            5. Data Security
          </h2>
          <div className="bg-green-50 rounded-lg p-6">
            <p className="text-gray-700 mb-4 leading-relaxed">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Encryption of sensitive data</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication protocols</li>
              <li>Secure payment processing</li>
            </ul>
            <p className="mt-4 text-gray-700 text-sm">
              While we implement robust security measures, no system is 100%
              secure. Please use strong passwords and notify us immediately of
              any unauthorized account access.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            6. Your Rights & Choices
          </h2>
          <div className="bg-purple-50 rounded-lg p-6">
            <p className="text-gray-700 mb-4 leading-relaxed">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access, correct, or delete your personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Restrict or object to data processing</li>
              <li>Request data portability</li>
              <li>Withdraw consent (where applicable)</li>
            </ul>
            <p className="mt-4 text-gray-700">
              To exercise these rights, please contact us using the information
              below.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            7. Changes to This Policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this policy periodically. We'll notify you of
            significant changes through our website or email. The "Effective
            Date" at the top indicates when this policy was last revised.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            8. Contact Us
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start mb-4">
              <RiMailLine className="text-gray-700 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-800">Email</h3>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {contactEmail}
                </a>
              </div>
            </div>
            <div className="flex items-start">
              <RiGlobalLine className="text-gray-700 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-800">Website</h3>
                <a
                  href={window.location.origin + "/contact"}
                  className="text-blue-600 hover:underline"
                >
                  {window.location.origin + "/contact"}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default PolicyPage;
