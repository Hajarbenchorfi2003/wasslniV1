'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from '@iconify/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { userAPI } from '@/utils/auth'; // <-- API réel
import toast from 'react-hot-toast';

export default function ParentProfilePage() {
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    cin: ''
  });

  const [passwordInfo, setPasswordInfo] = useState({
    ancienPassword: '',
    nouveauPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadParentData = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getProfile();
        console.log(res);
        const user = res.user; // selon ta réponse { user: { ... } }
        setParent(user);
        setPersonalInfo({
          fullname: user.fullname || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
        });
      } catch (error) {
        toast.error('Impossible de charger les informations du profil.');
      } finally {
        setLoading(false);
      }
    };

    loadParentData();
  }, []);

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePersonalInfo = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile(personalInfo);
      toast.success('Informations personnelles mises à jour avec succès !');
      // rafraîchir les données
      const res = await userAPI.getProfile();
      setParent(res.user);
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la mise à jour des informations.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordInfo.nouveauPassword !== passwordInfo.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    if (passwordInfo.nouveauPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setChangingPassword(true);
    try {
      await userAPI.changePassword({
        ancienPassword: passwordInfo.ancienPassword,
        nouveauPassword: passwordInfo.nouveauPassword
      });
      toast.success('Mot de passe modifié avec succès !');
      setPasswordInfo({ ancienPassword: '', nouveauPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la modification du mot de passe.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="text-center py-10">
        <Icon icon="heroicons:exclamation-triangle" className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600">Erreur</h2>
        <p className="text-muted-foreground">Impossible de charger les informations du profil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={parent.avatar} alt={parent.fullname} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {parent.fullname?.charAt(0) || 'P'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-default-900">Profil Parent</h1>
          <p className="text-default-600">Gérez vos informations personnelles</p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <Icon icon="heroicons:user" className="h-4 w-4" />
            Informations personnelles
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Icon icon="heroicons:lock-closed" className="h-4 w-4" />
            Mot de passe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="heroicons:user-circle" className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Nom complet</Label>
                  <Input
                    id="fullname"
                    value={personalInfo.fullname}
                    onChange={(e) => handlePersonalInfoChange('fullname', e.target.value)}
                    placeholder="Votre nom complet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    placeholder="votre.email@exemple.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    placeholder="+212 6 XX XX XX XX"
                  />
                </div>
                <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={personalInfo.address}
                  onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                  placeholder="Votre adresse complète"
                />
              </div>

              </div>


              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePersonalInfo}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    <Icon icon="heroicons:arrow-path" className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon icon="heroicons:check" className="h-4 w-4" />
                  )}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="heroicons:lock-closed" className="h-5 w-5" />
                Changer le mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ancienPassword">Mot de passe actuel</Label>
                  <Input
                    id="ancienPassword"
                    type="password"
                    value={passwordInfo.ancienPassword}
                    onChange={(e) => handlePasswordChange('ancienPassword', e.target.value)}
                    placeholder="Votre mot de passe actuel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nouveauPassword">Nouveau mot de passe</Label>
                  <Input
                    id="nouveauPassword"
                    type="password"
                    value={passwordInfo.nouveauPassword}
                    onChange={(e) => handlePasswordChange('nouveauPassword', e.target.value)}
                    placeholder="Nouveau mot de passe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordInfo.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Confirmer le nouveau mot de passe"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  variant="destructive"
                  className="gap-2"
                >
                  {changingPassword ? (
                    <Icon icon="heroicons:arrow-path" className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon icon="heroicons:key" className="h-4 w-4" />
                  )}
                  {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
