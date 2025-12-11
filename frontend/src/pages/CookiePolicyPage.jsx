import React from "react";
import { Helmet } from "react-helmet";
import CookieIcon from "@mui/icons-material/Cookie";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import FeaturedVideoIcon from "@mui/icons-material/FeaturedVideo";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import Footer from "./Landing/components/Footer";
import Header from "../components/navigation/Header";

const CookiePolicyPage = () => {
  const contactEmail =
    import.meta.env.VITE_DEVELOPER_EMAIL;
  const companyName = import.meta.env.VITE_APP_NAME || "ReelScheduler";

  const cookieTypes = [
    {
      icon: <CookieIcon className="text-blue-500" />,
      name: "Essential Cookies",
      purpose: "Necessary for website functionality",
      examples: ["Session management", "Authentication", "Security"],
      duration: "Session / Persistent",
    },
    {
      icon: <SettingsIcon className="text-green-500" />,
      name: "Functionality Cookies",
      purpose: "Remember your preferences",
      examples: ["Language selection", "Font size", "Region settings"],
      duration: "Up to 1 year",
    },
    {
      icon: <BarChartIcon className="text-purple-500" />,
      name: "Analytics Cookies",
      purpose: "Understand website usage",
      examples: ["Google Analytics", "Heatmaps", "Visitor tracking"],
      duration: "Up to 2 years",
    },
    {
      icon: <FeaturedVideoIcon className="text-orange-500" />,
      name: "Marketing Cookies",
      purpose: "Deliver relevant ads",
      examples: ["Facebook Pixel", "Google Ads", "Retargeting"],
      duration: "Up to 1 year",
    },
  ];

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>Cookie Policy | {companyName}</title>
        <meta
          name="description"
          content={`Learn about how ${companyName} uses cookies and similar technologies`}
        />
      </Helmet>

      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
          <CookieIcon className="text-blue-600 text-3xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Cookie Policy
        </h1>
      </header>

      <div className="prose prose-blue max-w-none">
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            1. What Are Cookies?
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files placed on your device when you visit
              websites. They help:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
              <li>Make websites function properly</li>
              <li>Remember your preferences</li>
              <li>Provide anonymized analytics data</li>
              <li>Deliver relevant content and ads</li>
            </ul>
            <p className="mt-4 text-gray-700 text-sm italic">
              We also use similar technologies like web beacons and pixels for
              these purposes.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            2. Our Cookie Usage
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Examples</th>
                  <th className="py-3 px-4">Duration</th>
                </tr>
              </thead>
              <tbody>
                {cookieTypes.map((cookie, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="mr-2">{cookie.icon}</div>
                        {cookie.name}
                      </div>
                    </td>
                    <td className="py-4 px-4">{cookie.purpose}</td>
                    <td className="py-4 px-4">
                      <ul className="list-disc list-inside">
                        {cookie.examples.map((example, i) => (
                          <li key={i}>{example}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 px-4">{cookie.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            3. Managing Cookies
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-medium text-blue-800 mb-3">
                Browser Settings
              </h3>
              <p className="text-gray-700 mb-4">Most browsers allow you to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Block all cookies</li>
                <li>Clear existing cookies</li>
                <li>Set preferences for specific sites</li>
              </ul>
              <p className="mt-4 text-gray-700 text-sm">
                Note: Blocking essential cookies may affect website
                functionality.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-medium text-green-800 mb-3">
                Our Cookie Consent Tool
              </h3>
              <p className="text-gray-700 mb-4">
                When you first visit our site, you can:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Customize your preferences</li>
              </ul>
              <p className="mt-4 text-gray-700 text-sm">
                You can change your preferences anytime via our cookie settings
                panel.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            4. Third-Party Cookies
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 mb-4 leading-relaxed">
              We work with trusted partners who may set cookies when you use our
              site:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Analytics Providers
                </h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Google Analytics</li>
                  <li>Hotjar</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Advertising Partners
                </h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Google Ads</li>
                  <li>Facebook Pixel</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-gray-700 text-sm">
              These third parties have their own privacy policies. We recommend
              reviewing them.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            5. Policy Updates
          </h2>
          <div className="bg-yellow-50 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              We may update this policy periodically. Significant changes will
              be:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
              <li>Posted on this page with a new effective date</li>
              <li>Communicated via email (for registered users)</li>
              <li>Highlighted in our cookie consent tool</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            6. Contact Us
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              For questions about our cookie usage:
            </p>
            <div className="flex items-center">
              <AlternateEmailIcon className="text-gray-700 mt-1 mr-3 flex-shrink-0" />
              <div>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {contactEmail}
                </a>
              </div>
            </div>
            <p className="mt-4 text-gray-700 text-sm">
              For cookie-specific requests, please include "Cookie Request" in
              your subject line.
            </p>
          </div>
        </section>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default CookiePolicyPage;
