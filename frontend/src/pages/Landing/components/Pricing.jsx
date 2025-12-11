import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiX, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const plans = [
    {
      name: 'Free',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      description: 'Perfect for beginners and casual creators',
      features: [
        { text: '5 video uploads per month', included: true },
        { text: '250MB storage limit', included: true },
        { text: '2 content bundles', included: true },
        { text: '1 active schedule', included: true },
        { text: 'YouTube integration', included: true },
        { text: 'Basic scheduling (daily only)', included: true },
        { text: '7-day video storage', included: true },
      ],
      buttonText: isAuthenticated ? 'Current Plan' : 'Get Started',
      buttonLink: isAuthenticated ? '/dashboard' : '/register',
      highlighted: false,
      buttonStyle: 'border border-primary-600 text-primary-600 hover:bg-primary-50'
    },
    {
      name: 'Creator',
      monthlyPrice: '$9.99',
      yearlyPrice: '$99',
      description: 'For growing creators who post regularly',
      features: [
        { text: '30 video uploads per month', included: true },
        { text: '5GB storage limit', included: true },
        { text: '10 content bundles', included: true },
        { text: '5 active schedules', included: true },
        { text: 'YouTube integration', included: true },
        { text: 'All scheduling options', included: true },
        { text: 'Priority support', included: true },
        { text: '30-day video storage', included: true },
      ],
      buttonText: 'Subscribe Now',
      buttonLink: isAuthenticated ? '/subscription/checkout?plan=creator' : '/register?plan=creator',
      highlighted: true,
      buttonStyle: 'bg-primary-600 text-white hover:bg-primary-700'
    },
    {
      name: 'Professional',
      monthlyPrice: '$19.99',
      yearlyPrice: '$199',
      description: 'For serious content creators and professionals',
      features: [
        { text: 'Unlimited video uploads', included: true },
        { text: '50GB storage limit', included: true },
        { text: 'Unlimited content bundles', included: true },
        { text: 'Unlimited active schedules', included: true },
        { text: 'YouTube integration', included: true },
        { text: 'Custom scheduling with time slots', included: true },
        { text: 'Priority support with 24hr response', included: true },
        { text: '90-day video storage', included: true },
        { text: 'Bulk upload feature', included: true },
      ],
      buttonText: 'Subscribe Now',
      buttonLink: isAuthenticated ? '/subscription/checkout?plan=professional' : '/register?plan=professional',
      highlighted: false,
      buttonStyle: 'border border-primary-600 text-primary-600 hover:bg-primary-50'
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your content creation needs. No hidden fees, cancel anytime.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center mt-8">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button 
              className="relative mx-4 rounded-full w-14 h-7 bg-primary-100 flex items-center transition-colors focus:outline-none"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            >
              <span 
                className={`absolute left-1 top-1 bg-primary-600 w-5 h-5 rounded-full transition-transform transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : ''
                }`} 
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly <span className="text-green-500 font-medium">(Save 17%)</span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 ${
                plan.highlighted ? 'ring-2 ring-primary-500 md:scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="bg-primary-500 text-white text-center py-2 font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {billingCycle === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      {feature.included ? (
                        <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      ) : (
                        <FiX className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to={plan.buttonLink + (billingCycle === 'yearly' ? '&billing=yearly' : '')}
                  className={`w-full py-3 rounded-lg font-medium text-center block transition-colors ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 text-gray-600">
          <p className="mt-2">Need a custom plan for your team? <a href="#contact" className="text-primary-600 hover:underline">Contact us</a></p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;


