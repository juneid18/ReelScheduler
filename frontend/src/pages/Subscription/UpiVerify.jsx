import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { subscriptionService } from '../../services/subscriptionService';
import { FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const UpiVerify = () => {
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Please complete the payment in your UPI app');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  
  // Get payment intent ID from URL
  const query = new URLSearchParams(location.search);
  const paymentIntentId = query.get('payment_intent');
  
  // Check payment status
  const checkPaymentStatus = async () => {
    try {
      const response = await subscriptionService.checkUpiPaymentStatus(paymentIntentId);
      
      if (response.data.status === 'succeeded') {
        setStatus('success');
        setMessage('Payment successful! Your subscription is now active.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else if (response.data.status === 'failed') {
        setStatus('failed');
        setMessage(response.data.message || 'Payment failed. Please try again.');
      } else {
        // Still pending, continue checking
        setTimeout(checkPaymentStatus, 3000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('failed');
      setMessage('Error checking payment status. Please contact support.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (paymentIntentId && stripe) {
      checkPaymentStatus();
    } else {
      setStatus('failed');
      setMessage('Invalid payment information. Please try again.');
      setLoading(false);
    }
  }, [paymentIntentId, stripe]);
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        {status === 'pending' && (
          <div className="animate-pulse">
            <FiRefreshCw className="mx-auto h-16 w-16 text-primary-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <FiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
          </div>
        )}
        
        {status === 'failed' && (
          <div>
            <FiAlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
          </div>
        )}
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {status === 'failed' && (
          <button
            onClick={() => navigate('/subscription/plans')}
            className="bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        )}
        
        {status === 'success' && (
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default UpiVerify;