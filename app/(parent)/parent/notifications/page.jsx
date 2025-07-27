'use client';

import React, { useState, useEffect, useCallback } from 'react';
import parentService from '@/services/parentService';
import { ParentNotificationsList } from '../components/ParentNotificationsList';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParentIncidentList } from '../components/ParentIncidentList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ParentNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState({
    notifications: true,
    incidents: true
  });
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);

  // Charger les données depuis l'API
  const fetchData = useCallback(async () => {
    try {
      // Récupérer la liste des enfants
      const childrenList = await parentService.getChildren();
      setChildren(childrenList);

      if (childrenList.length > 0 && !selectedChildId) {
        setSelectedChildId(childrenList[0].student.id);
      }

      // Récupérer les notifications
      setLoading(prev => ({ ...prev, notifications: true }));
      const notifs = await parentService.getNotifications();
      setNotifications(Array.isArray(notifs) ? notifs : []);

      // Récupérer les incidents pour chaque enfant
      setLoading(prev => ({ ...prev, incidents: true }));
      const incidentsMap = {};
      
      for (const relation of childrenList) {
        const student = relation.student;
        const incs = await parentService.getChildIncidents(student.id);
        incidentsMap[student.id] = Array.isArray(incs) ? incs : [];
      }
      
      setIncidents(incidentsMap);
    } catch (error) {
      toast.error("Erreur lors du chargement des données.");
      console.error(error);
    } finally {
      setLoading(prev => ({ 
        notifications: false,
        incidents: false
      }));
    }
  }, [selectedChildId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Marquer une notification comme lue
  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await parentService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      toast.success('Notification marquée comme lue.');
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la notification.");
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async (type = 'notifications') => {
    const items = type === 'notifications' ? notifications : (incidents[selectedChildId] || []);
    const unread = items.filter(n => !n.read);

    if (unread.length === 0) {
      toast(`Aucune ${type} nouvelle à marquer comme lue.`, {icon: <Icon icon="heroicons:exclamation-circle" className="h-5 w-5 text-red-500" /> });
      return;
    }

    try {
      await Promise.all(unread.map(n => parentService.markNotificationAsRead(n.id)));
      
      if (type === 'notifications') {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } else {
        setIncidents(prev => ({
          ...prev,
          [selectedChildId]: prev[selectedChildId].map(n => ({ ...n, read: true }))
        }));
      }
      
      toast.success(`Toutes les ${type} ont été marquées comme lues.`);
    } catch (error) {
      toast.error(`Erreur lors de la mise à jour des ${type}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-default-900">Notifications et Incidents</h1>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="notifications">
            <Icon icon="heroicons:bell" className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4 mr-2" />
            Incidents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <Button
                  onClick={() => handleMarkAllAsRead('notifications')}
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  disabled={loading.notifications}
                >
                  <Icon icon="heroicons:check-circle" className="h-4 w-4 mr-2" /> 
                  Tout marquer comme lu
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ParentNotificationsList
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                loading={loading.notifications}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Incidents</CardTitle>
                {children.length > 0 && (
                  <div className="flex items-center gap-2">
                    {children.length > 1 && (
                      <select
                        value={selectedChildId || ''}
                        onChange={(e) => setSelectedChildId(Number(e.target.value))}
                        className="text-sm border rounded-md px-2 py-1"
                      >
                        {children.map(child => (
                          <option key={child.student.id} value={child.student.id}>
                            {child.student.fullname}
                          </option>
                        ))}
                      </select>
                    )}
                    <Button
                      onClick={() => handleMarkAllAsRead('incidents')}
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      disabled={loading.incidents || !selectedChildId}
                    >
                      <Icon icon="heroicons:check-circle" className="h-4 w-4 mr-2" /> 
                      Tout marquer comme lu
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ParentIncidentList 
                incidents={selectedChildId ? incidents[selectedChildId] || [] : []} 
                onMarkAsRead={handleMarkNotificationAsRead}
                loading={loading.incidents}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentNotificationsPage;