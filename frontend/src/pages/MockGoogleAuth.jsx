import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";

function MockGoogleAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // useEffect(() => {
  //   const mockAuth = async () => {
  //     // Get user ID from state parameter
  //     const userId = searchParams.get('state');
      
  //     if (!userId) {
  //       toast.error("Invalid state parameter");
  //       navigate('/dashboard?youtube=error&reason=invalid_state');
  //       return;
  //     }
      
  //     // Simulate successful authentication
  //     toast.info("Simulating Google authentication...");
      
  //     // Wait 2 seconds to simulate the process
  //     await new Promise(resolve => setTimeout(resolve, 2000));
      
  //     // Redirect back to dashboard with success
  //     navigate('/dashboard?youtube=connected');
  //   };
    
  //   mockAuth();
  // }, [searchParams, navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Mock Google Authentication</h1>
        <p className="mb-4">This is a mock authentication page for development purposes.</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-center text-gray-500">Simulating authentication process...</p>
      </div>
    </div>
  );
}

export default MockGoogleAuth;