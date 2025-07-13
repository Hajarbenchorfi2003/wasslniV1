import { useRouter } from 'next/navigation';

export const useErrorHandler = () => {
  const router = useRouter();

  const handleError = (error) => {
    console.error('Error occurred:', error);

    // Check for different types of errors
    if (error?.status === 403 || error?.message?.includes('403')) {
      router.push('/error-page/403');
    } else if (error?.status === 404 || error?.message?.includes('404')) {
      router.push('/error-page/404');
    } else {
      // Default to 500 error page for all other errors
      router.push('/error-page/500');
    }
  };

  return { handleError };
};

// Function to throw errors that will be caught by the error boundary
export const throwError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  throw error;
}; 