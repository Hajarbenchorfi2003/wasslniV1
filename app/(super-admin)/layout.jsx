"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { menuSuperAdminConfig } from "@/config/menus";
import { getUser, getToken, isAuthenticated, isSuperAdmin } from '@/utils/auth';

const Layout = ({ children }) => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [trans, setTrans] = useState(null);

  useEffect(() => {
    // ✅ Ceci s'exécute uniquement côté client
    console.log("Raw user:", localStorage.getItem("user"));
    console.log("Parsed user:", getUser());
    console.log("Token:", getToken());

    if (isAuthenticated()) {
      const user = getUser();
      console.log('Utilisateur connecté :', user.fullname);
      console.log('Role :', user.role);
    }

    const userStr = localStorage.getItem("user");
    if (!userStr || userStr === "undefined" || userStr === "null") {
      router.push("/auth/login");
      return;
    }

    if (!isSuperAdmin()) {
      console.log("Accès refusé: Utilisateur n'a pas le rôle super-admin");
      router.push("/error-page/403");
      return;
    }

    import("@/app/dictionaries/en.json").then((module) => {
      setTrans(module.default);
      setIsAuth(true);
    });
  }, [router]);

  if (!isAuth || !trans) return null; // Ou <Spinner />

  return (
    <DashBoardLayoutProvider trans={trans} menusConfig={menuSuperAdminConfig}>
      {children}
    </DashBoardLayoutProvider>
  );
};

export default Layout;
