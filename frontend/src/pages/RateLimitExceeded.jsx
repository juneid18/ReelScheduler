import React from 'react'

const RateLimitExceeded = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-primary-600">429</h1>
      <h2 className="mt-4 text-2xl font-bold text-gray-900">Rate Limit Exceeded</h2>
      <p className="mt-2 text-gray-600 w-2/4 text-center">You've made too many requests too quickly. This helps us maintain optimal performance and prevent abuse. Please wait a moment before trying again.</p>
      <a href="/" className="mt-6 btn btn-primary">Go Back Home</a>
    </div>
  )
}

export default RateLimitExceeded