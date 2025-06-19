// pages/parent/ParentNotificationsPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  demoData,
  getNotificationsForUser,
  markNotificationAsRead,
} from '@/data/data';
import { ParentNotificationsList } from '../components/ParentNotificationsList'; // Réutiliser le composant de liste

import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const MOCK_PARENT_ID = 5; // Utilisez l'ID du parent connecté

export const ParentNotificationsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(demoData);
  const [notifications, setNotifications] = useState([]);

  // Fonction pour rafraîchir les notifications
  const refreshNotifications = useCallback(() => {
    const fetchedNotifications = getNotificationsForUser(MOCK_PARENT_ID);
    setNotifications(fetchedNotifications);
  }, [currentDemoData]); // Dépend de currentDemoData pour déclencher le rafraîchissement

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleMarkNotificationAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
    setCurrentDemoData({ ...currentDemoData }); // Déclenche le re-rendu et le rafraîchissement
    toast.success('Notification marquée comme lue.');
  };

  const handleMarkAllAsRead = () => {
    if (notifications.some(n => !n.read)) {
      notifications.forEach(n => {
        if (!n.read) {
          markNotificationAsRead(n.id);
        }
      });
      setCurrentDemoData({ ...currentDemoData }); // Déclenche le re-rendu
      toast.success('Toutes les notifications ont été marquées comme lues.');
    } else {
      toast('Aucune nouvelle notification à marquer comme lue.', { icon: 'ℹ️' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-default-900">Notifications</h1>
        <Button
          onClick={handleMarkAllAsRead}
          variant="outline"
          className="text-primary hover:bg-primary/5"
        >
          <Icon icon="heroicons:check-circle" className="h-5 w-5 mr-2" /> Marquer tout comme lu
        </Button>
      </div>

      <ParentNotificationsList
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
      />
    </div>
  );
};

export default ParentNotificationsPage;