'use client';

import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { userAPI } from '@/utils/auth';

const PersonalDetails = ({ user, onUpdate }) => {
  const [formData, setFormData] = React.useState({
    fullname: '',
    email: '',
    phone: '',
    isActive: true,
    notificationEnabled: true,
  });

  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Initialize form data when user data is received
  useEffect(() => {
    if (user?.user) {
      const u = user.user;
      setFormData({
        fullname: u.fullname || '',
        email: u.email || '',
        phone: u.phone || '',
        isActive: u.isActive !== undefined ? u.isActive : true,
        notificationEnabled: u.notificationEnabled !== undefined ? u.notificationEnabled : true,
      });
    }
  }, [user]);
  console.log("Données utilisateur resvoire:",user);
  console.log(formData);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSwitchChange = (field) => (checked) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: checked 
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await userAPI.updateProfile(formData);
      onUpdate(updatedUser);
      setIsEditing(false);
      toast.success('Informations mises à jour avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="rounded-t-none pt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Détails personnels</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          disabled={loading}
        >
          <Icon icon={isEditing ? "heroicons:x-mark" : "heroicons:pencil-square"} className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 md:gap-x-12 gap-y-5">
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="fullname">Nom et prénom</Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              disabled={!isEditing || loading}
              placeholder="Entrez votre nom complet"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing || loading}
              placeholder="Entrez votre email"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing || loading}
              placeholder="Entrez votre numéro de téléphone"
            />
          </div> 
        </div>

        <div className="flex items-center justify-between mt-4">
          <Label htmlFor="isActive" className="flex flex-col space-y-1">
            <span>Statut du compte</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Indique si le compte est actif.
            </span>
          </Label>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={handleSwitchChange('isActive')}
            disabled={!isEditing || loading}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <Label htmlFor="notificationEnabled" className="flex flex-col space-y-1">
            <span>Activer les notifications par e-mail</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Recevez des mises à jour et des annonces importantes par e-mail.
            </span>
          </Label>
          <Switch
            id="notificationEnabled"
            checked={formData.notificationEnabled}
            onCheckedChange={handleSwitchChange('notificationEnabled')}
            disabled={!isEditing || loading}
          />
        </div>

        {isEditing && (
          <Button onClick={handleSave} className="mt-6" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalDetails;