// pages/driver/NotificationsPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import driverService from '@/services/driverService';
import { NotificationsList } from '../NotificationsList';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useToast } from '@/components/ui/use-toast';

 const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fonction pour rafraîchir les notifications
  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notificationsData = await driverService.getNotfication();
      setNotifications(notificationsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await driverService.markNotificationAsRead(notificationId);
      await refreshNotifications();
      toast({
        title: "Succès",
        description: "Notification marquée comme lue",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour de la notification: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length === 0) {
        toast({
          title: "Information",
          description: "Aucune nouvelle notification à marquer comme lue",
        });
        return;
      }

      // Marquer toutes les notifications non lues comme lues
      await Promise.all(
        unreadNotifications.map(n => 
          driverService.markNotificationAsRead(n.id)
        )
      );
      
      await refreshNotifications();
      toast({
        title: 'Succès',
        description: 'Toutes les notifications ont été marquées comme lues',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour des notifications: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="h-8 w-8 mx-auto animate-spin" />
          <p className="mt-2">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-default-900">Notifications</h1>
        <Button
          onClick={handleMarkAllAsRead}
          variant="outline"
          className="text-primary hover:bg-primary/5"
          disabled={notifications.every(n => n.read)}
        >
          <Icon icon="heroicons:check-circle" className="h-5 w-5 mr-2" /> 
          Marquer tout comme lu
        </Button>
      </div>

      {notifications.length > 0 ? (
        <NotificationsList
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
        />
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Icon icon="heroicons:bell" className="h-12 w-12 mx-auto mb-3" />
          <p>Aucune notification disponible</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;