import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

function NotFound() {
  return (
    <>
      <SEO 
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved. Return to the homepage to continue browsing."
        keywords="404, page not found, error page, broken link"
        noIndex={true}
      />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-primary-600">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-gray-900">Page Not Found</h2>
      <p className="mt-2 text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="mt-6 btn btn-primary">
        Go to Dashboard
      </Link>
    </div>
    </>
  );
}

export default NotFound;