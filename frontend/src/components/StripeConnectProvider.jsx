import React, { useEffect, useState } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import STRIPE_CONFIG from '../config/stripe';

const StripeConnectContext = React.createContext(null);

export const useStripeConnect = () => React.useContext(StripeConnectContext);

const StripeConnectProvider = ({ children }) => {
  const [stripeConnect, setStripeConnect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeStripeConnect = async () => {
      try {
        const fetchClientSecret = async () => {
          // Fetch the AccountSession client secret from your backend
          const response = await fetch('/api/account_session', { method: "POST" });
          if (!response.ok) {
            const { error } = await response.json();
            console.error('An error occurred: ', error);
            setError('Failed to initialize payment system');
            return undefined;
          } else {
            const { client_secret: clientSecret } = await response.json();
            return clientSecret;
          }
        };

        const stripeConnectInstance = await loadConnectAndInitialize({
          publishableKey: STRIPE_CONFIG.publishableKey,
          fetchClientSecret: fetchClientSecret,
        });
        
        setStripeConnect(stripeConnectInstance);
      } catch (err) {
        console.error('Error initializing Stripe Connect:', err);
        setError('Failed to initialize payment system');
      } finally {
        setLoading(false);
      }
    };

    initializeStripeConnect();
  }, []);

  return (
    <StripeConnectContext.Provider value={{ stripeConnect, loading, error }}>
      {children}
    </StripeConnectContext.Provider>
  );
};

export default StripeConnectProvider;