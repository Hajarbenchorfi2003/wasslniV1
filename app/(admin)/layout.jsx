"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { menuAdminConfig } from "@/config/menus";
import { isAdmin } from '@/utils/auth';

const Layout = ({ children }) => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [trans, setTrans] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr || userStr === "undefined" || userStr === "null") {
      router.push("/");
      return;
    }

    // Vérifier si l'utilisateur a le rôle admin
    if (!isAdmin()) {
      console.log('Accès refusé: Utilisateur n\'a pas le rôle admin');
      router.push("/error-page/403");
      return;
    }

    // Chargement dynamique des traductions
    import("@/app/dictionaries/en.json")
      .then((module) => {
        setTrans(module.default);
        setIsAuth(true);
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des traductions :', err);
        router.push('/auth/login');
      });
  }, [router]);

  if (!isAuth || !trans) return null;

  return (
    <DashBoardLayoutProvider trans={trans} menusConfig={menuAdminConfig}>
      {children}
    </DashBoardLayoutProvider>
  );
};

export default Layout;
