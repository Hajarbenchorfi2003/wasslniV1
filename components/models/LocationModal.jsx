"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getUser, saveUser, getToken, saveLocation } from "@/utils/auth";

export default function LocationModal({ open, onClose, onLocationSaved }) {
  const [user, setUser] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) return;

    setUser(currentUser);

    if (currentUser.lat && currentUser.lng) {
      setCurrentLocation({ lat: currentUser.lat, lng: currentUser.lng });
    }
  }, []);

  const sendLocation = () => {
    if (!navigator.geolocation) {
      alert("Votre navigateur ne supporte pas la géolocalisation.");
      return;
    }

    const currentUser = getUser();
    const token = getToken();
    if (!currentUser || !token) {
      alert("Utilisateur non connecté");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/users/me/location`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        });

        const data = await res.json();

        if (res.ok) {
          const updatedUser = { ...currentUser, lat: latitude, lng: longitude };
          saveUser({ user: updatedUser, token });

          // ✅ Sauvegarde globale de la position
          saveLocation({ lat: latitude, lng: longitude });

          setUser(updatedUser);
          setCurrentLocation({ lat: latitude, lng: longitude });

          if (onLocationSaved) onLocationSaved(latitude, longitude);

          onClose();
        } else {
          alert(data.message || "Erreur lors de l'envoi de la localisation");
        }
      } catch (err) {
        console.error("Erreur fetch location:", err);
        alert("Erreur lors de l'envoi de la localisation");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partagez votre localisation</DialogTitle>
        </DialogHeader>
        <p className="mb-4 text-sm text-gray-600">
          Vous devez envoyer votre localisation pour continuer.
        </p>
        <div className="flex gap-2">
          <Button onClick={sendLocation} className="w-full">
            Envoyer ma localisation
          </Button>
          <Button variant="outline" onClick={onClose}>
            Plus tard
          </Button>
        </div>
        
        {currentLocation.lat && currentLocation.lng && (
          <div className="p-2 text-sm text-gray-500">
            Localisation enregistrée : {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}