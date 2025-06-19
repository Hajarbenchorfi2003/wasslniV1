// pages/IncidentsNotificationsPage.jsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getIncidentsByEstablishment,
    getNotificationsForUser,
    markNotificationAsRead,
    updateIncidentStatus,
    deleteIncident,    
    deleteNotification,
    getAllIncidents,
} from '@/data/data';
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { IncidentListItem } from './IncidentListItem';
import IncidentItemDisplay from './IncidentItemDisplay';
import { NotificationListItem } from './NotificationListItem';
import NotificationItemDisplay from './NotificationItemDisplay';

const ITEMS_PER_PAGE = 10;

const ALL_PAGE_TABS = [
    { value: "incidents", label: "Incidents", icon: "heroicons:exclamation-triangle" },
    { value: "notifications-primary", label: "Primary", icon: "heroicons:envelope" },
    { value: "notifications-incident", label: "Incidents", icon: "heroicons:bell-alert" },
    { value: "notifications-presence", label: "Presence", icon: "heroicons:clipboard-document-list" },
];

export default function IncidentsNotificationsPage({ managerEstablishmentId, managerId }) {
    const effectiveManagerId = managerId || 3;
    const effectiveManagerEstablishmentId = managerEstablishmentId || 1;

    // Data state
    const [allIncidents, setAllIncidents] = useState([]);
    const [allNotifications, setAllNotifications] = useState([]);
    const [currentTab, setCurrentTab] = useState('incidents');
    const [isPending, startTransition] = useState(false);

    // Incident state
    const [selectedIncidentId, setSelectedIncidentId] = useState(null);
    const [incidentSearchTerm, setIncidentSearchTerm] = useState('');
    const [incidentStatusFilter, setIncidentStatusFilter] = useState('all');
    const [incidentCurrentPage, setIncidentCurrentPage] = useState(1);

    // Notification state
    const [selectedNotificationId, setSelectedNotificationId] = useState(null);
    const [notificationSearchTerm, setNotificationSearchTerm] = useState('');
    const [notificationStatusFilter, setNotificationStatusFilter] = useState('all');
    const [notificationCurrentPage, setNotificationCurrentPage] = useState(1);

    const refreshAllData = useCallback(() => {
        if (!effectiveManagerId) {
            setAllIncidents([]);
            setAllNotifications([]);
            return;
        }

        // Si managerEstablishmentId est null, on récupère tous les incidents
        const fetchedIncidents = effectiveManagerEstablishmentId 
            ? getIncidentsByEstablishment(effectiveManagerEstablishmentId)
            : getAllIncidents(); // Cette fonction devra être créée dans data.js

        setAllIncidents(fetchedIncidents);

        const fetchedNotifications = getNotificationsForUser(effectiveManagerId);
        setAllNotifications(fetchedNotifications);

        if (selectedIncidentId && !fetchedIncidents.some(inc => inc.id === selectedIncidentId)) {
            setSelectedIncidentId(null);
        }
        if (selectedNotificationId && !fetchedNotifications.some(notif => notif.id === selectedNotificationId)) {
            setSelectedNotificationId(null);
        }
    }, [effectiveManagerEstablishmentId, effectiveManagerId, selectedIncidentId, selectedNotificationId]);

    useEffect(() => {
        refreshAllData();
    }, [refreshAllData]);

    const filteredIncidents = useMemo(() => {
        let temp = [...allIncidents];
        if (currentTab !== 'incidents') return [];

        if (incidentStatusFilter !== 'all') {
            temp = temp.filter(inc => inc.status === incidentStatusFilter);
        }
        if (incidentSearchTerm) {
            const lowerCaseSearch = incidentSearchTerm.toLowerCase();
            temp = temp.filter(inc =>
                inc.description.toLowerCase().includes(lowerCaseSearch) ||
                inc.reportedByName.toLowerCase().includes(lowerCaseSearch) ||
                (inc.dailyTripName && inc.dailyTripName.toLowerCase().includes(lowerCaseSearch))
            );
        }
        return temp;
    }, [allIncidents, currentTab, incidentSearchTerm, incidentStatusFilter]);

    const handleDeleteIncident = (id) => {
        if (deleteIncident(id)) {
        refreshAllData();
            toast.success('Incident supprimé avec succès.');
            if (selectedIncidentId === id) {
                setSelectedIncidentId(null);
            }
        } else {
            toast.error('Erreur lors de la suppression de l\'incident.');
        }
    };

    const handleDeleteNotification = (id) => {
        if (deleteNotification(id)) {
        refreshAllData();
            toast.success('Notification supprimée avec succès.');
            if (selectedNotificationId === id) {
                setSelectedNotificationId(null);
            }
        } else {
            toast.error('Erreur lors de la suppression de la notification.');
        }
    };

    const filteredNotifications = useMemo(() => {
        let temp = [...allNotifications];
        if (currentTab === 'incidents') return [];

        if (currentTab === "notifications-primary") {
            temp = temp.filter(notif => !notif.type || !['INCIDENT_REPORT', 'DAILY_TRIP_ASSIGNMENT', 'INCIDENT_UPDATE', 'INCIDENT_RESOLUTION'].includes(notif.type));
        } else if (currentTab === "notifications-incident") {
            temp = temp.filter(notif => notif.type && notif.type.startsWith('INCIDENT_'));
        } else if (currentTab === "notifications-presence") {
            temp = temp.filter(notif => notif.type === 'DAILY_TRIP_ASSIGNMENT');
        }

        if (notificationStatusFilter !== 'all') {
            temp = temp.filter(notif =>
                notificationStatusFilter === 'read' ? notif.read : !notif.read
            );
        }
        if (notificationSearchTerm) {
            const lowerCaseSearch = notificationSearchTerm.toLowerCase();
            temp = temp.filter(notif =>
                notif.title.toLowerCase().includes(lowerCaseSearch) ||
                notif.message.toLowerCase().includes(lowerCaseSearch)
            );
        }
        return temp;
    }, [allNotifications, currentTab, notificationSearchTerm, notificationStatusFilter]);

    const paginatedIncidents = filteredIncidents.slice(
        (incidentCurrentPage - 1) * ITEMS_PER_PAGE,
        incidentCurrentPage * ITEMS_PER_PAGE
    );
    const totalIncidentPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE);

    const paginatedNotifications = filteredNotifications.slice(
        (notificationCurrentPage - 1) * ITEMS_PER_PAGE,
        notificationCurrentPage * ITEMS_PER_PAGE
    );
    const totalNotificationPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);

    const handleSelectIncident = (id) => {
        setSelectedIncidentId(id);
        setSelectedNotificationId(null);
    };

    const handleSelectNotification = (id) => {
        setSelectedNotificationId(id);
        setSelectedIncidentId(null);
        markNotificationAsRead(id);
        refreshAllData();
    };

    const handleTabChange = (value) => {
        setCurrentTab(value);
        setSelectedIncidentId(null);
            setSelectedNotificationId(null);
        setIncidentSearchTerm('');
        setNotificationSearchTerm('');
    };

    const selectedIncident = useMemo(() => {
        return allIncidents.find(inc => inc.id === selectedIncidentId);
    }, [selectedIncidentId, allIncidents]);

    const selectedNotification = useMemo(() => {
        return allNotifications.find(notif => notif.id === selectedNotificationId);
    }, [selectedNotificationId, allNotifications]);

    if (!effectiveManagerEstablishmentId) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-default-600">
                Chargement des données...
            </div>
        );
    }

    return (
        <div className="app-height overflow-hidden">
            <Card className="h-full">
                <CardContent className="overflow-y-auto no-scrollbar h-full px-0">
                    {!isPending && (
                        <div className="pt-6 rounded-t-md flex space-y-1.5 px-6 border-b border-border border-none flex-row gap-4 flex-wrap mb-1 sticky top-0 bg-card z-50">
                            <div className="flex items-center w-full">
                                <div className="relative flex-1 inline-flex items-center">
                                    <Input
                                        type="text"
                                        placeholder={`Search ${currentTab.includes('notification') ? 'notifications' : 'incidents'}...`}
                                        className="pl-10 pr-4 py-2 border rounded-md flex-1"
                                        value={currentTab.includes('notification') ? notificationSearchTerm : incidentSearchTerm}
                                        onChange={(e) => currentTab.includes('notification') ? setNotificationSearchTerm(e.target.value) : setIncidentSearchTerm(e.target.value)}
                                    />
                                    <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    )}
                    {selectedIncidentId || selectedNotificationId ? (
                        currentTab === 'incidents' ? (
                            <IncidentItemDisplay
                                incident={selectedIncident}
                                onClose={() => setSelectedIncidentId(null)}
                                onAcknowledge={(id) => {
                                    updateIncidentStatus(id, 'ACKNOWLEDGED');
                                    refreshAllData();
                                    toast.success('Incident reconnu.');
                                }}
                                onResolve={(id) => {
                                    updateIncidentStatus(id, 'RESOLVED');
                                    refreshAllData();
                                    toast.success('Incident résolu.');
                                }}
                                onDelete={handleDeleteIncident}
                            />
                        ) : (
                            <NotificationItemDisplay
                                notification={selectedNotification}
                                onClose={() => setSelectedNotificationId(null)}
                                onMarkAsRead={(id) => {
                                    markNotificationAsRead(id);
                                    refreshAllData();
                                    toast.success("Notification marquée comme lue.");
                                }}
                                onDelete={handleDeleteNotification}
                            />
                        )
                    ) : (
                        <>
                            {isPending && <div>Loading...</div>}
                            {!isPending && (
                                <Tabs defaultValue={currentTab}>
                                    <div className="flex items-center py-2">
                                        <TabsList className="bg-transparent gap-2 lg:gap-6 w-full justify-start pl-6 lg:pl-0">
                                    {ALL_PAGE_TABS.map((tab) => (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                                    className="capitalize data-[state=active]:shadow-none pl-0 data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
                                                        before:left-1/2 before:-bottom-[5px] before:h-[2px] w-fit md:min-w-[126px]
                                                        before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full"
                                                    onClick={() => handleTabChange(tab.value)}
                                        >
                                                    <Icon
                                                        icon={tab.icon}
                                                        className="h-4 w-4 currentColor me-1 hidden sm:block"
                                                    />
                                            {tab.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                                </div>
                                    <TabsContent value="incidents" className="m-0 overflow-hidden">
                                        <ScrollArea className="h-[calc(100vh-180px)]">
                                            {paginatedIncidents.length > 0 ? (
                                                            paginatedIncidents.map(incident => (
                                                                <IncidentListItem
                                                                    key={incident.id}
                                                                    incident={incident}
                                                                    onSelect={handleSelectIncident}
                                                                    isSelected={selectedIncidentId === incident.id}
                                                        onAcknowledge={(id) => {
                                                            updateIncidentStatus(id, 'ACKNOWLEDGED');
                                                            refreshAllData();
                                                        }}
                                                        onResolve={(id) => {
                                                            updateIncidentStatus(id, 'RESOLVED');
                                                            refreshAllData();
                                                        }}
                                                        onDelete={handleDeleteIncident}
                                                                />
                                                            ))
                                                        ) : (
                                                            <div className="p-6 text-center text-muted-foreground">Aucun incident trouvé.</div>
                                            )}
                                        </ScrollArea>
                                    </TabsContent>
                                    {ALL_PAGE_TABS.filter(tab => tab.value !== 'incidents').map(tab => (
                                        <TabsContent key={tab.value} value={tab.value} className="m-0 overflow-hidden">
                                            <ScrollArea className="h-[calc(100vh-180px)]">
                                                {paginatedNotifications.length > 0 ? (
                                                            paginatedNotifications.map(notification => (
                                                        <NotificationListItem
                                                                    key={notification.id}
                                                                    notification={notification}
                                                            onMarkAsRead={handleSelectNotification}
                                                                    onSelect={handleSelectNotification}
                                                                    isSelected={selectedNotificationId === notification.id}
                                                            onDismiss={handleDeleteNotification}
                                                                />
                                                            ))
                                                        ) : (
                                                            <div className="p-6 text-center text-muted-foreground">Aucune notification trouvée.</div>
                                                    )}
                                            </ScrollArea>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}