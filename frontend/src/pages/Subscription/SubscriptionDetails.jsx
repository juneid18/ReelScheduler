import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { useAuth } from '../../contexts/AuthContext';
import toast from "react-hot-toast";
import { FiCreditCard, FiCalendar, FiArrowRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const SubscriptionDetails = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/subscription/details' } });
      return;
    }
    
    const fetchSubscriptionDetails = async () => {
      try {
        setLoading(true);
        const response = await subscriptionService.getSubscriptionDetails();
        
        if (response.data.success) {
          setSubscription(response.data.subscription);
        } else {
          toast.error('Failed to load subscription details');
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionDetails();
  }, [isAuthenticated, navigate]);
  
  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.')) {
      try {
        const response = await subscriptionService.cancelSubscription();
        
        if (response.data.success) {
          toast.success('Subscription canceled successfully');
          // Refresh subscription details
          const updatedResponse = await subscriptionService.getSubscriptionDetails();
          setSubscription(updatedResponse.data.subscription);
        } else {
          toast.error(response.data.message || 'Failed to cancel subscription');
        }
      } catch (error) {
        console.error('Error canceling subscription:', error);
        toast.error('Failed to cancel subscription');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Subscription Details</h1>
          <Link 
            to="/subscription" 
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            View All Plans <FiArrowRight className="ml-1" />
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className={`p-6 ${subscription.isFree ? 'bg-gray-100' : 'bg-primary-50'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{subscription.plan.name} Plan</h2>
                <p className="text-gray-600 mt-1">
                  {subscription.isFree 
                    ? 'Basic free plan' 
                    : subscription.cancelAtPeriodEnd 
                      ? 'Your subscription will end soon' 
                      : 'Your subscription is active'
                  }
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                subscription.isFree 
                  ? 'bg-gray-100 text-gray-800' 
                  : subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subscription.isFree 
                  ? 'Free Plan' 
                  : subscription.status === 'active' 
                    ? subscription.cancelAtPeriodEnd ? 'Canceling' : 'Active' 
                    : 'Inactive'
                }
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-100">
            {!subscription.isFree && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">BILLING DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <FiCalendar className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Period</p>
                      <p className="text-sm text-gray-600">
                        Ends on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiCreditCard className="mt-1 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment Method</p>
                      <p className="text-sm text-gray-600">
                        •••• •••• •••• {subscription.lastFour || '****'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <h3 className="text-sm font-medium text-gray-500 mb-2">PLAN FEATURES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              {Object.entries(subscription.plan.features).map(([key, value]) => {
                let displayText;
                
                switch(key) {
                  case 'videoUploadsLimit':
                    displayText = value === -1 ? 'Unlimited video uploads' : `${value} video uploads per month`;
                    break;
                  case 'videoStorageDays':
                    displayText = `${value}-day video storage`;
                    break;
                  case 'storageLimit':
                    displayText = value >= 1000 
                      ? `${value/1000}GB storage limit` 
                      : `${value}MB storage limit`;
                    break;
                  case 'bundleLimit':
                    displayText = value === -1 ? 'Unlimited content bundles' : `${value} content bundles`;
                    break;
                  case 'scheduleLimit':
                    displayText = value === -1 ? 'Unlimited active schedules' : `${value} active schedule${value !== 1 ? 's' : ''}`;
                    break;
                  case 'schedulingOptions':
                    displayText = Array.isArray(value) 
                      ? `${value.length === 3 ? 'All' : value.join(', ')} scheduling options` 
                      : 'Basic scheduling';
                    break;
                  case 'prioritySupport':
                    displayText = value ? 'Priority support' : 'Standard support';
                    break;
                  case 'bulkUpload':
                    displayText = 'Bulk upload feature';
                    break;
                  default:
                    displayText = `${key}: ${value}`;
                }
                
                return (
                  <div key={key} className="flex items-center">
                    <FiCheckCircle className="text-green-500 mr-2" />
                    <span className="text-gray-700">{displayText}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            {subscription.isFree ? (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <p className="text-gray-600 mb-4 sm:mb-0">
                  Upgrade to get more features and increase your limits
                </p>
                <Link 
                  to="/subscription" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                  Upgrade Plan
                </Link>
              </div>
            ) : subscription.cancelAtPeriodEnd ? (
              <div className="flex items-start p-4 bg-yellow-50 rounded-md border border-yellow-100">
                <FiAlertCircle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Your subscription is set to cancel</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. 
                    After this date, your account will be downgraded to the Free plan.
                  </p>
                  <button 
                    onClick={async () => {
                      try {
                        const response = await subscriptionService.reactivateSubscription();
                        if (response.data.success) {
                          toast.success('Subscription reactivated successfully');
                          // Refresh subscription details
                          const updatedResponse = await subscriptionService.getSubscriptionDetails();
                          setSubscription(updatedResponse.data.subscription);
                        }
                      } catch (error) {
                        toast.error('Failed to reactivate subscription');
                      }
                    }}
                    className="mt-3 text-primary-600 font-medium hover:text-primary-700"
                  >
                    Reactivate Subscription
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <button 
                    onClick={handleCancelSubscription}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Cancel Subscription
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    You'll still have access until the end of your current billing period
                  </p>
                </div>
                <Link 
                  to="/subscription" 
                  className="mt-4 sm:mt-0 border border-primary-600 text-primary-600 px-4 py-2 rounded-md font-medium hover:bg-primary-50 transition-colors"
                >
                  Change Plan
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Billing History</h2>
          {subscription.isFree ? (
            <p className="text-gray-600">No billing history available for free plan.</p>
          ) : subscription.invoices && subscription.invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscription.invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.created * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(invoice.amount_paid / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a 
                          href={invoice.invoice_pdf} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No invoices available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;

