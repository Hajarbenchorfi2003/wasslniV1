// components/user-profile/PersonalDetails.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@iconify/react'; // Add Icon import for pencil/x-mark
import toast from 'react-hot-toast';
import { getUserById, updateUserData } from '@/data/data'; // Adjust path as needed

const PersonalDetails = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    cin: '', // Added CIN
    isActive: false, // Added isActive
    notificationEnabled: false, // Assuming this is still part of personal settings
  });

  useEffect(() => {
    setLoading(true);
    const fetchedUser = getUserById(userId);
    if (fetchedUser) {
      setUser(fetchedUser);
      setFormData({
        fullname: fetchedUser.fullname || '',
        email: fetchedUser.email || '',
        phone: fetchedUser.phone || '',
        cin: fetchedUser.cin || '', // Initialize CIN
        isActive: fetchedUser.isActive || false, // Initialize isActive
        notificationEnabled: fetchedUser.notificationEnabled || false,
      });
    } else {
      toast.error('Failed to load user data for personal details.');
      setUser(null);
    }
    setLoading(false);
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (field) => (checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleSave = () => {
    setLoading(true);
    const success = updateUserData(userId, formData); // Pass formData directly
    if (success) {
      setUser(prev => ({ ...prev, ...formData })); // Update local user state
      setIsEditing(false);
      toast.success('Personal details updated successfully!');
    } else {
      toast.error('Failed to update personal details.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="shadow-md p-6 text-center">
        <p>Chargement des informations personnelles...</p>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="shadow-md p-6 text-center text-red-500">
        <p>Données utilisateur non disponibles.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-t-none pt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Détails personnels</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          aria-label={isEditing ? "Cancel editing" : "Edit profile"}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Label htmlFor="phone">
          Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Label htmlFor="cin">CIN</Label>
          <Input
            id="cin"
            name="cin"
            value={formData.cin}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        </div>
        {/* isActive Switch (only if editable by user, or for admin view) */}
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
            disabled={!isEditing} // Typically, only admins can change this
          />
        </div>

        {/* Notification Enabled Switch */}
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
            disabled={!isEditing}
          />
        </div>

        {isEditing && (
          <Button onClick={handleSave} className="mt-6">
            Enregistrer les modifications
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalDetails;