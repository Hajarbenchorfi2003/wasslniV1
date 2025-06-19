// components/driver/NotificationsList.jsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";

export const NotificationsList = ({
  notifications,
  onMarkAsRead,
}) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'INCIDENT': return 'heroicons:exclamation-triangle';
      case 'ATTENDANCE': return 'heroicons:user-group';
      case 'TRIP': return 'heroicons:truck';
      case 'SYSTEM': return 'heroicons:cog';
      case 'CONCERN': return 'heroicons:chat-bubble-left-right';
      default: return 'heroicons:bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'INCIDENT': return 'text-red-600';
      case 'ATTENDANCE': return 'text-blue-600';
      case 'TRIP': return 'text-green-600';
      case 'SYSTEM': return 'text-gray-600';
      case 'CONCERN': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'INCIDENT': return 'Incident';
      case 'ATTENDANCE': return 'Présence';
      case 'TRIP': return 'Trajet';
      case 'SYSTEM': return 'Système';
      case 'CONCERN': return 'Préoccupation';
      default: return 'Notification';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-default-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:bell" className="h-5 w-5 text-blue-500" />
            Notifications
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 border-b last:border-b-0 flex items-start justify-between transition-colors cursor-pointer hover:bg-gray-50",
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'
                  )}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", 
                      !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                    )}>
                      <Icon 
                        icon={getNotificationIcon(notification.type)} 
                        className={cn("h-4 w-4", getNotificationColor(notification.type))} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !notification.read ? 'text-blue-900' : 'text-gray-900'
                        )}>
                          {notification.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {getNotificationTitle(notification.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Icon icon="heroicons:bell-slash" className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">Aucune notification</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};