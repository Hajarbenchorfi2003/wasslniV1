"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getUser, saveUser, getToken } from "@/utils/auth";

export default function ParentLocationModal() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  const checkLocation = () => {
    const currentUser = getUser();
    return currentUser ? !currentUser.lat || !currentUser.lng : false;
  };

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) return;

    setUser(currentUser);

    if (!currentUser.lat || !currentUser.lng) {
      setOpen(true);
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
          method: "POST",
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
          setUser(updatedUser);
          setOpen(false);
        } else {
          alert(data.message || "Erreur lors de l'envoi de la localisation");
        }
      } catch (err) {
        console.error("Erreur fetch location:", err);
        alert("Erreur lors de l'envoi de la localisation");
      }
    });
  };

  const handleLater = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button variant="outline" onClick={handleLater}>
            Plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
