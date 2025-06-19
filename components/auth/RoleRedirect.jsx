'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/utils/auth';

export default function RoleRedirect() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    const role = user?.role?.toLowerCase(); // sécurisation ici

    switch (role) {
      case "admin":
        router.replace("/admin/dashboard");
        break;
      case "super-admin":
        router.replace("/super-admin/dashboard");
        break;
      case "parent":
        router.replace("/parent/dashboard");
        break;
      case "responsable":
        router.replace("/responsable/dashboard");
        break;
      case "driver":
        router.replace("/driver/dashboard");
        break;
      default:
        router.replace("/aut");
        break;
    }
  }, [router]);

  return null;
}
