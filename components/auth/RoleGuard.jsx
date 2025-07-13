"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, hasRole, hasAnyRole } from "@/utils/auth";

const RoleGuard = ({ 
  children, 
  requiredRole = null, 
  requiredRoles = [], 
  fallbackPath = "/error-page/403",
  showLoading = true 
}) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }

    // Vérifier les rôles requis
    let authorized = false;
    
    if (requiredRole) {
      authorized = hasRole(requiredRole);
    } else if (requiredRoles.length > 0) {
      authorized = hasAnyRole(requiredRoles);
    } else {
      // Si aucun rôle requis, autoriser l'accès
      authorized = true;
    }

    if (!authorized) {
      console.log(`Accès refusé: Utilisateur n'a pas les permissions requises`);
      router.push(fallbackPath);
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [router, requiredRole, requiredRoles, fallbackPath]);

  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard; 