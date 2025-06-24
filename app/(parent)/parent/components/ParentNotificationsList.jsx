// components/parent/ParentNotificationsList.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const ParentNotificationsList = ({ notifications, onMarkAsRead }) => {
  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'BUS_ARRIVAL': return 'green';
      case 'STUDENT_ABSENT': return 'red';
      case 'INCIDENT_REPORTED': return 'orange';
      case 'BUS_DELAY': return 'yellow';
      case 'ROUTE_CHANGE': return 'purple';
      case 'ATTENDANCE': return 'blue';
      case 'INCIDENT': return 'red';
      case 'ALERT': return 'yellow';
      case 'CONCERN': return 'purple';
      default: return 'gray';
    }
  };

  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'BUS_ARRIVAL': return 'Bus arrivé';
      case 'STUDENT_ABSENT': return 'Enfant absent';
      case 'INCIDENT_REPORTED': return 'Incident signalé';
      case 'BUS_DELAY': return 'Retard de bus';
      case 'ROUTE_CHANGE': return 'Changement de route';
      case 'ATTENDANCE': return 'Présence';
      case 'INCIDENT': return 'Incident';
      case 'ALERT': return 'Alerte';
      case 'CONCERN': return 'Réponse à message';
      default: return 'Général';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BUS_ARRIVAL': return 'heroicons:truck';
      case 'STUDENT_ABSENT': return 'heroicons:user-minus';
      case 'INCIDENT_REPORTED': return 'heroicons:exclamation-triangle';
      case 'BUS_DELAY': return 'heroicons:clock';
      case 'ROUTE_CHANGE': return 'heroicons:map';
      case 'ATTENDANCE': return 'heroicons:clipboard-document-check';
      case 'INCIDENT': return 'heroicons:exclamation-triangle';
      case 'ALERT': return 'heroicons:bell-alert';
      case 'CONCERN': return 'heroicons:chat-bubble-left-right';
      default: return 'heroicons:bell';
    }
  };

  const getPriorityLevel = (type) => {
    switch (type) {
      case 'STUDENT_ABSENT':
      case 'INCIDENT_REPORTED':
        return 'high';
      case 'BUS_DELAY':
      case 'ROUTE_CHANGE':
        return 'medium';
      default:
        return 'low';
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    // Sort by priority first, then by timestamp
    const priorityA = getPriorityLevel(a.type);
    const priorityB = getPriorityLevel(b.type);
    
    if (priorityA === 'high' && priorityB !== 'high') return -1;
    if (priorityA === 'medium' && priorityB === 'low') return -1;
    if (priorityA === 'low' && priorityB !== 'low') return 1;
    
    // If same priority, sort by timestamp (newest first)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-medium text-default-800 flex items-center gap-2">
              <Icon icon="heroicons:bell" className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Restez informé des activités de vos enfants</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          {sortedNotifications.length > 0 ? (
            <div className="space-y-1">
              {sortedNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`
                    p-4 border-b last:border-b-0 flex items-start justify-between transition-colors
                    ${!notification.read ? 'bg-default-50 border-l-4 border-l-blue-500' : 'bg-default'}
                    ${getPriorityLevel(notification.type) === 'high' ? 'border-l-red-500 bg-red-50' : ''}
                    ${getPriorityLevel(notification.type) === 'medium' ? 'border-l-yellow-500 bg-yellow-50' : ''}
                  `}
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Icon 
                        icon={getNotificationIcon(notification.type)} 
                        className={`h-4 w-4 mr-2 ${
                          getPriorityLevel(notification.type) === 'high' ? 'text-red-500' :
                          getPriorityLevel(notification.type) === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                        }`}
                      />
                      <Badge 
                        variant="soft" 
                        color={getNotificationTypeColor(notification.type)} 
                        className="mr-2 capitalize text-xs"
                      >
                        {getNotificationTypeText(notification.type)}
                      </Badge>
                      {getPriorityLevel(notification.type) === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mb-2">
                      <h4 className="font-semibold text-default-700 text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString('fr-FR', {
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p>
                      
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-primary hover:text-primary-foreground h-6 px-2"
                          title="Marquer comme lu"
                        >
                          <Icon icon="heroicons:check-circle" className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Icon icon="heroicons:bell-slash" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
              <p className="text-muted-foreground text-sm">
                Vous n'avez aucune notification pour le moment.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};