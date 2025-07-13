"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    
    // Check if it's a 403 error (access denied)
    if (error?.message?.includes('403') || error?.status === 403) {
      router.push('/error-page/403');
    } else {
      // For all other errors, redirect to 500 error page
      router.push('/error-page/500');
    }
  }, [error, router]);

  return null; // This component won't render anything as we're redirecting
}
