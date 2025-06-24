// app/super-admin/layout.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { menuSuperAdminConfig } from "@/config/menus";
import { getUser, getToken, isAuthenticated } from '@/utils/auth';
console.log("Raw user:", localStorage.getItem("user"));
console.log("Parsed user:", getUser());
console.log("Token:", getToken());
// Exemple
if (isAuthenticated()) {
  const user = getUser();
  console.log('Utilisateur connecté :', user.fullname);
  console.log('Role :', user.role);
}


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

    // Charger les traductions dynamiquement
    import("@/app/dictionaries/en.json").then((module) => {
      setTrans(module.default);
      setIsAuth(true); // Auth validé après traduction
    });
  }, [router]);

  if (!isAuth || !trans) return null; // Optionnel : afficher un spinner

  return (
    <DashBoardLayoutProvider trans={trans} menusConfig={menuSuperAdminConfig}>
      {children}
    </DashBoardLayoutProvider>
  );
};

export default Layout;
