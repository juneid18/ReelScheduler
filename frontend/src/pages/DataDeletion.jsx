import React from 'react';

const DataDeletionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Deletion Request</h1>
          <p className="text-gray-600">Compliance with Facebook Platform Policies</p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">How to Request Data Deletion</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Send an email to <span className="font-mono bg-gray-100 px-2 py-1 rounded">support@yourdomain.com</span></li>
              <li>Include your Facebook User ID or associated email</li>
              <li>We will process your request within 30 days</li>
            </ol>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">What We Delete</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Facebook Page access tokens</li>
              <li>User profile information (name, email)</li>
              <li>Any content uploaded through our service</li>
            </ul>
          </div>

          <div className="text-center text-sm text-gray-500 mt-8">
            <p>Need help? Contact us at support@yourdomain.com</p>
            <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionPage;