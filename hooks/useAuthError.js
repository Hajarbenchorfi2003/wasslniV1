import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useErrorHandler } from '@/utils/errorHandler';
import { useAuthError } from '@/hooks/useAuthError';

export const useAuthError = (error, isLoading = false) => {
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && error) {
      // Handle 403 (Forbidden) errors
      if (error?.status === 403 || error?.message?.includes('403')) {
        router.push('/error-page/403');
        return;
      }

      // Handle 401 (Unauthorized) errors
      if (error?.status === 401 || error?.message?.includes('401')) {
        // You might want to redirect to login instead
        router.push('/');
        return;
      }

      // Handle 404 (Not Found) errors
      if (error?.status === 404 || error?.message?.includes('404')) {
        router.push('/error-page/404');
        return;
      }

      // Handle 500 (Internal Server Error) and other errors
      if (error?.status >= 500 || error?.message?.includes('500')) {
        router.push('/error-page/500');
        return;
      }
    }
  }, [error, isLoading, router]);

  return { error, isLoading };
}; 