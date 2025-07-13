"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { menuParentConfig } from "@/config/menus";
import { isParent } from '@/utils/auth';

const Layout = ({ children }) => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [trans, setTrans] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr || userStr === "undefined" || userStr === "null") {
      router.push("/auth/login");
      return;
    }

    // Vérifier si l'utilisateur a le rôle parent
    if (!isParent()) {
      console.log('Accès refusé: Utilisateur n\'a pas le rôle parent');
      router.push("/error-page/403");
      return;
    }

    import("@/app/dictionaries/en.json")
      .then((module) => {
        setTrans(module.default);
        setIsAuth(true);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des traductions :", err);
        router.push("/auth/login");
      });
  }, [router]);

  if (!isAuth || !trans) return null;

  return (
    <DashBoardLayoutProvider trans={trans} menusConfig={menuParentConfig}>
      {children}
    </DashBoardLayoutProvider>
  );
};

export default Layout;
