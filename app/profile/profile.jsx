// app/[lang]/(responsible)/manager/user-profile/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { userAPI } from '@/utils/auth'; 
import PersonalDetails from "./settings/personal-details";
import ChangePassword from "./settings/change-password";

const PageProfilUtilisateur = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const onglets = [
    {
      label: "Informations personnelles",
      value: "personal"
    },
    {
      label: "Changer le mot de passe",
      value: "password"
    },
  ];

  useEffect(() => {
    const chargerDonneesUtilisateur = async () => {
      setLoading(true);
      try {
        const userData = await userAPI.getProfile();
        console.log('Données utilisateur reçues:', userData); // <-- Ajoutez cette ligne
        setUser(userData);
      } catch (error) {
        toast.error(error.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    chargerDonneesUtilisateur();
  }, []);
  const supprimerCompte = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        // You would need to implement this endpoint in your API
        // await userAPI.deleteAccount();
        toast.success('Compte supprimé avec succès !');
        // Redirect after deletion
        // router.push(&apos;/logout&apos;);
      } catch (error) {
        toast.error(error.message || 'Erreur lors de la suppression du compte');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-10 text-destructive">Utilisateur non trouvé.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Icon icon="heroicons:user-circle" className="w-8 h-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profil Utilisateur {user.fullname}</h1>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background p-0 h-12 border-b rounded-none">
          {onglets.map((onglet, index) => (
            <TabsTrigger
              key={`onglet-${index}`}
              value={onglet.value}
              className="relative data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              {onglet.label}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-0 data-[state=active]:opacity-100 transition-opacity"></span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <PersonalDetails user={user} onUpdate={setUser} />
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <ChangePassword />
        </TabsContent>
      </Tabs>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-destructive flex items-center gap-2">
            <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5" />
            Zone dangereuse
          </CardTitle>
          <CardDescription>Actions irréversibles concernant votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La suppression de votre compte supprimera définitivement toutes vos données de nos systèmes.
          </p>
          <Button
            variant="destructive"
            color="destructive"
            onClick={supprimerCompte}
            className="gap-2"
          >
            <Icon icon="heroicons:trash" className="w-5 h-5" />
            Supprimer le compte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageProfilUtilisateur;