"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { menuParentConfig } from "@/config/menus";
import { isParent, getUser } from "@/utils/auth";
import LocationModal from "@/components/models/LocationModal";

const Layout = ({ children }) => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [trans, setTrans] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    const user = getUser();

    // Si pas d'utilisateur → login
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Si rôle n'est pas parent → accès refusé
    if (!isParent()) {
      console.log("Accès refusé: Utilisateur n'a pas le rôle parent");
      router.push("/error-page/403");
      return;
    }

    // Si utilisateur a lat/lng → setLocation
    if (user.lat && user.lng) {
      setLocation({ lat: user.lat, lng: user.lng });
      setShowLocationModal(false); // pas besoin de modal
    } else {
      setShowLocationModal(true); // ouvrir modal si pas de localisation
    }

    // Charger les traductions
    import("@/app/dictionaries/en.json")
      .then((module) => {
        setTrans(module.default);
        setIsAuth(true);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des traductions :", err);
        router.push("/");
      });
  }, [router]);

  if (!isAuth || !trans) return null;

  return (
    <>
      <DashBoardLayoutProvider trans={trans} menusConfig={menuParentConfig}>
        {children}
      </DashBoardLayoutProvider>

      {/* Modal seulement si pas de localisation */}
      <LocationModal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSaved={(lat, lng) => {
          setLocation({ lat, lng });
          setShowLocationModal(false); 
        }}
      />
    </>
  );
};

export default Layout;