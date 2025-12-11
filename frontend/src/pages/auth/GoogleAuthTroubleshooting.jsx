import React from 'react';
import { Link } from 'react-router-dom';

function GoogleAuthTroubleshooting() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Google Sign-In Troubleshooting
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Having trouble signing in with Google? Here are some solutions.
          </p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Common Issues and Solutions</h2>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Infinite Loading
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Check if pop-ups are blocked in your browser</li>
                    <li>Clear your browser cookies and cache</li>
                    <li>Try using a different browser</li>
                    <li>Ensure you have a stable internet connection</li>
                  </ul>
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  "App Not Verified" Error
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <p>If you see a warning that the app isn't verified:</p>
                  <ol className="list-decimal pl-5 space-y-2 mt-2">
                    <li>Click "Advanced" at the bottom left</li>
                    <li>Click "Go to [App Name] (unsafe)"</li>
                    <li>Continue with the sign-in process</li>
                  </ol>
                  <p className="mt-2 text-sm text-gray-500">
                    This happens because the app is in development mode and hasn't been verified by Google yet.
                  </p>
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  "Redirect URI Mismatch" Error
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <p>This is a configuration issue that needs to be fixed by the developer:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Please contact support and provide the exact error message</li>
                    <li>Try again later after the issue has been resolved</li>
                  </ul>
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  "Access Denied" Error
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <p>This happens if you denied permission to access your Google account:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Try signing in again and make sure to click "Allow" when prompted</li>
                    <li>The app needs these permissions to function properly</li>
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Return to Login
          </Link>
          <a
            href="mailto:support@example.com"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default GoogleAuthTroubleshooting;