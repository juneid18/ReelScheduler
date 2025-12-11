// Stripe configuration
const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#6772e5',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      borderRadius: '4px',
    },
  }
};

export default STRIPE_CONFIG;