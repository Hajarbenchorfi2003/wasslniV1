"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { menuParentConfig } from "@/config/menus";
import { isParent, getUser } from '@/utils/auth';
import LocationModal from "@/components/models/LocationModal"; 

const Layout = ({ children }) => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [trans, setTrans] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

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
    const user = getUser(); // récupère user du localStorage
  if (!user.lat || !user.lng) {
    setShowLocationModal(true); // ouvre le modal si pas de localisation
  }

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
    <DashBoardLayoutProvider trans={trans} menusConfig={menuParentConfig}>
      {children}
       {showLocationModal && <LocationModal onClose={() => setShowLocationModal(false)} />}
    </DashBoardLayoutProvider>
  );
};

export default Layout;
