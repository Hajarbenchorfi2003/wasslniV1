// components/manager/MangmentNotificationsList.jsx
// (Assurez-vous que le chemin de ce fichier correspond à son utilisation, par exemple, dans IncidentsNotificationsPage.jsx)
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// IMPORTANT: Le composant est maintenant exporté sous le nom MangmentNotificationsList
export const MangmentNotificationsList = ({ notifications, onMarkAsRead }) => {
  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'ATTENDANCE': return 'blue';
      case 'INCIDENT': return 'red';
      case 'ALERT': return 'yellow';
      case 'CONCERN': return 'purple'; // For concerns sent by parents
      default: return 'gray';
    }
  };

  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'ATTENDANCE': return 'Présence Élève'; // Plus spécifique pour le manager
      case 'INCIDENT': return 'Incident';
      case 'ALERT': return 'Alerte Système'; // Plus spécifique
      case 'CONCERN': return 'Message Parent'; // Plus clair pour le manager
      default: return 'Général';
    }
  };

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        {/* Titre et description adaptés pour le gestionnaire */}
        <CardTitle className="text-xl font-medium text-default-800">Notifications de l'Établissement</CardTitle>
        <CardDescription>Restez informé des événements importants concernant votre établissement.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-[calc(100%-0px)]">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification.id} className="p-4 border-b last:border-b-0 flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-1">
                    <Badge variant="soft" color={getNotificationTypeColor(notification.type)} className="mr-2 capitalize">
                      {getNotificationTypeText(notification.type)}
                    </Badge>
                    <span className="font-semibold text-default-700">{notification.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleString('fr-FR', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="ml-4 flex-shrink-0 text-primary hover:text-primary-foreground"
                    title="Marquer comme lu"
                  >
                    <Icon icon="heroicons:check-circle" className="h-5 w-5" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-muted-foreground">Aucune notification pour le moment.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MangmentNotificationsList;