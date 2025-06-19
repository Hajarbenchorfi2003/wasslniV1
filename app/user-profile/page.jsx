// app/[lang]/(responsible)/manager/user-profile/page.jsx (or similar path)
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@iconify/react';
import { Switch } from '@/components/ui/switch'; // Assuming you have a Switch component
import toast from 'react-hot-toast';
import { getUserById, updateUserData } from '@/data/data'; // Adjust path to your data source

// This component expects a userId prop, perhaps from URL params or context
const UserProfilePage = ({ userId = 1 }) => { // Default to ID 1 for demo purposes
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notificationEnabled: false,
  });

  // Password fields (managed separately for security)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    // In a real app, you'd fetch the user data from an API
    setLoading(true);
    const fetchedUser = getUserById(userId); // Using your mock data function
    if (fetchedUser) {
      setUser(fetchedUser);
      setFormData({
        firstName: fetchedUser.firstName || '',
        lastName: fetchedUser.lastName || '',
        email: fetchedUser.email || '',
        phone: fetchedUser.phone || '',
        address: fetchedUser.address || '',
        notificationEnabled: fetchedUser.notificationEnabled || false,
      });
    } else {
      toast.error('User not found!');
      setUser(null);
    }
    setLoading(false);
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    // In a real app, send formData to your backend API
    // Example: await fetch(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(formData) });
    const success = updateUserData(userId, formData); // Using your mock update function

    if (success) {
      setUser(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile.');
    }
  };

  const handleUpdatePassword = () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) { // Basic validation
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    // In a real app, send passwordData to a security endpoint
    // Example: await fetch(`/api/users/${userId}/change-password`, { method: 'POST', body: JSON.stringify(passwordData) });
    // For demo, just simulate success
    console.log("Updating password for user", userId, passwordData);
    toast.success('Password updated successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear fields
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // In a real app, send a DELETE request to your backend
      // Example: await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      toast.success('Account deleted successfully!');
      // Redirect user to logout or homepage
      // router.push('/logout');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading user data...</div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-red-500">User not found.</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-bold text-default-900 flex items-center gap-2">
        <Icon icon="heroicons:user-circle" className="w-8 h-8 text-primary" />
        User Profile
      </h2>

      {/* Basic Information Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Basic Information</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            aria-label={isEditing ? "Cancel editing" : "Edit profile"}
          >
            <Icon icon={isEditing ? "heroicons:x-mark" : "heroicons:pencil-square"} className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div>
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
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          {isEditing && (
            <Button onClick={handleSaveProfile} className="mt-4">
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Password Security Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Password Security</CardTitle>
          <CardDescription>Update your password for enhanced security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <Button onClick={handleUpdatePassword} className="mt-4">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Notification Settings</CardTitle>
          <CardDescription>Manage how you receive alerts and updates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="notificationEnabled" className="flex flex-col space-y-1">
              <span>Enable Email Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive important updates and announcements via email.
              </span>
            </Label>
            <Switch
              id="notificationEnabled"
              checked={formData.notificationEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notificationEnabled: checked }))}
            />
          </div>
          <Button onClick={handleSaveProfile} className="mt-4">
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Card (Optional, use with caution) */}
      <Card className="shadow-md border-destructive">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions related to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Deleting your account will permanently remove your data and cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;