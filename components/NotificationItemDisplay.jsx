"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea for content

const NotificationItemDisplay = ({ notification, onClose, onMarkAsRead, onDismiss }) => {
    if (!notification) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <Icon icon="heroicons:inbox" className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-xl">Select a notification to read</p>
                <p className="text-sm">Notifications will appear here.</p>
            </div>
        );
    }

    const getNotificationIcon = (notificationType) => {
        switch (notificationType) {
            case 'INCIDENT_REPORT': return 'heroicons:exclamation-triangle';
            case 'DAILY_TRIP_ASSIGNMENT': return 'heroicons:truck';
            case 'SYSTEM_ALERT': return 'heroicons:bell-alert';
            case 'INCIDENT_UPDATE': return 'heroicons:arrow-path';
            case 'INCIDENT_RESOLUTION': return 'heroicons:check-circle';
            default: return 'heroicons:bell';
        }
    };

    const senderInfo = notification.type === 'INCIDENT_REPORT' && notification.reportedByName
                       ? { name: notification.reportedByName, email: 'incident@example.com' }
                       : { name: 'System Notification', email: 'noreply@example.com' };

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center p-4 border-b">
                {/* Back button visible when a notification is selected */}
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
                    <span className="sr-only">Back to list</span>
                </Button>
                <h1 className="text-xl font-bold flex-1 truncate px-2">{notification.title}</h1>
                <div className="flex items-center gap-2">
                    {!notification.read && (
                        <Button variant="ghost" size="icon" onClick={() => onMarkAsRead(notification.id)}>
                            <Icon icon="heroicons:check" className="h-5 w-5 text-primary" />
                            <span className="sr-only">Marquer comme lu</span>
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onDismiss(notification.id)}>
                        <Icon icon="heroicons:trash" className="h-5 w-5 text-destructive" />
                        <span className="sr-only">Supprimer</span>
                    </Button>
                    {/* Other actions if desired, e.g., print, archive, etc. */}
                </div>
            </div>

            {/* Notification Content Area */}
            <ScrollArea className="flex-1 overflow-y-auto p-6">
                {/* Sender/Recipient Info (aligned with message.jpg) */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {senderInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-base text-default-800">{senderInfo.name}</div>
                        <div className="text-sm text-muted-foreground">{senderInfo.email}</div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {notification.timestamp ? format(new Date(notification.timestamp), 'PPPp', { locale: fr }) : 'Date inconnue'}
                    </div>
                </div>

                {/* Main Content */}
                <div className="prose prose-sm max-w-none text-default-700 leading-relaxed space-y-4">
                    <p>{notification.message}</p>
                    {notification.details && (
                        <div>
                            <strong>Détails Supplémentaires:</strong>
                            <br />
                            <p>{notification.details}</p>
                        </div>
                    )}
                    {notification.relatedIncidentId && (
                        <p><strong>Incident ID:</strong> {notification.relatedIncidentId}</p>
                    )}
                    {notification.status && (
                        <p><strong>Statut:</strong> {notification.status.replace(/_/g, ' ')}</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default NotificationItemDisplay; 