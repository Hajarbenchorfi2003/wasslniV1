// components/parent/ParentProfilePage.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import toast from 'react-hot-toast';

import { demoData, getUserById } from '@/data/data';

const MOCK_PARENT_ID = 5;

export const ParentProfilePage = () => {
  const [parentData, setParentData] = useState(null);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cin, setCin] = useState('');

  useEffect(() => {
    const loadedParent = getUserById(MOCK_PARENT_ID);
    if (loadedParent) {
      setParentData(loadedParent);
      setFullname(loadedParent.fullname || '');
      setEmail(loadedParent.email || '');
      setPhone(loadedParent.phone || '');
      setCin(loadedParent.cin || '');
    } else {
      toast.error("Impossible de charger les informations du parent.");
    }
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!parentData) return;

    const updatedData = {
      ...parentData,
      fullname,
      email,
      phone,
      cin,
    };

    const userIndex = demoData.users.findIndex(u => u.id === MOCK_PARENT_ID);
    if (userIndex !== -1) {
      demoData.users[userIndex] = updatedData;
      setParentData(updatedData);
      toast.success("Profil mis à jour avec succès !");
      console.log("Updated Parent Data:", updatedData);
    } else {
      toast.error("Erreur lors de la mise à jour du profil.");
    }
  };

  if (!parentData) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-default-600">
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-default-900">Mon Profil</h1>
      <p className="text-default-600">Mettez à jour vos informations personnelles et préférences de contact.</p>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:user-circle" className="h-6 w-6 text-primary" />
            Informations Personnelles
          </CardTitle>
          <CardDescription className="text-sm text-default-600">
            Ces informations sont utilisées pour les communications importantes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullname">Nom Complet</Label>
              <Input
                id="fullname"
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cin">CIN</Label>
              <Input
                id="cin"
                type="text"
                value={cin}
                onChange={(e) => setCin(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Icon icon="heroicons:save" className="h-5 w-5 mr-2" /> Enregistrer les modifications
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentProfilePage;