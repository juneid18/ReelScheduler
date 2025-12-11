import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import STRIPE_CONFIG from '../config/stripe';

// Initialize Stripe outside of the component to avoid recreating it on re-renders
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

const StripeProvider = ({ children }) => {
  return (
    <Elements stripe={stripePromise} options={{ appearance: STRIPE_CONFIG.appearance }}>
      {children}
    </Elements>
  );
};

export default StripeProvider;