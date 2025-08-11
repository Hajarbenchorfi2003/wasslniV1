// pages/IncidentsNotificationsPage.jsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    markNotificationAsRead,
    getNotfication,
    getAllIncidents,
    getIncidentsByEstablishment,
    getNotificationsForUser,
    updateIncidentStatus,
    deleteIncident,
    deleteNotification,
} from '@/services/notficationicidient';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ITEMS_PER_PAGE = 10;

const ALL_PAGE_TABS = [
  { value: "incidents", label: "Incidents", icon: "heroicons:exclamation-triangle" },
  { value: "notifications-primary", label: "Primary", icon: "heroicons:envelope" },
  { value: "notifications-incident", label: "Incidents", icon: "heroicons:bell-alert" },
  { value: "notifications-presence", label: "Presence", icon: "heroicons:clipboard-document-list" },
];

export default function IncidentsNotificationsPage({ managerEstablishmentId, managerId }) {
  const queryClient = useQueryClient();
  const effectiveManagerId = managerId || null;
  const effectiveManagerEstablishmentId = managerEstablishmentId || null;

  // State management
  const [currentTab, setCurrentTab] = useState('incidents');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [incidentSearchTerm, setIncidentSearchTerm] = useState('');
  const [notificationSearchTerm, setNotificationSearchTerm] = useState('');
  const [incidentStatusFilter, setIncidentStatusFilter] = useState('all');
  const [notificationStatusFilter, setNotificationStatusFilter] = useState('all');
  const [incidentCurrentPage, setIncidentCurrentPage] = useState(1);
  const [notificationCurrentPage, setNotificationCurrentPage] = useState(1);

  // API Queries
  const { 
    data: incidentsData, 
    isLoading: isLoadingIncidents,
    error: incidentsError,
    refetch: refetchIncidents
  } = useQuery({
    queryKey: ['incidents', effectiveManagerEstablishmentId],
    queryFn: () => effectiveManagerEstablishmentId 
      ? getIncidentsByEstablishment(effectiveManagerEstablishmentId)
      : getAllIncidents(),
    enabled: !!effectiveManagerId
  });

  const { 
    data: notificationsData, 
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications', effectiveManagerId],
    queryFn: () => getNotificationsForUser(effectiveManagerId),
    enabled: !!effectiveManagerId
  });

  // API Mutations
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', effectiveManagerId]);
      toast.success("Notification marquée comme lue");
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const updateIncidentStatusMutation = useMutation({
    mutationFn: updateIncidentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['incidents', effectiveManagerEstablishmentId]);
      toast.success("Statut de l'incident mis à jour");
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const deleteIncidentMutation = useMutation({
    mutationFn: deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries(['incidents', effectiveManagerEstablishmentId]);
      toast.success("Incident supprimé avec succès");
      setSelectedIncidentId(null);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', effectiveManagerId]);
      toast.success("Notification supprimée avec succès");
      setSelectedNotificationId(null);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Derived data
  const allIncidents = incidentsData?.data || [];
  const allNotifications = notificationsData?.data || [];

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

  // Pagination
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

  const selectedIncident = useMemo(() => {
    return allIncidents.find(inc => inc.id === selectedIncidentId);
  }, [selectedIncidentId, allIncidents]);

  const selectedNotification = useMemo(() => {
    return allNotifications.find(notif => notif.id === selectedNotificationId);
  }, [selectedNotificationId, allNotifications]);

  // Handlers
  const handleSelectIncident = (id) => {
    setSelectedIncidentId(id);
    setSelectedNotificationId(null);
  };

  const handleSelectNotification = (id) => {
    setSelectedNotificationId(id);
    setSelectedIncidentId(null);
    markAsReadMutation.mutate(id);
  };

  const handleTabChange = (value) => {
    setCurrentTab(value);
    setSelectedIncidentId(null);
    setSelectedNotificationId(null);
    setIncidentSearchTerm('');
    setNotificationSearchTerm('');
    setIncidentCurrentPage(1);
    setNotificationCurrentPage(1);
  };

  const handleDeleteIncident = (id) => {
    deleteIncidentMutation.mutate(id);
  };

  const handleDeleteNotification = (id) => {
    deleteNotificationMutation.mutate(id);
  };

  const handleAcknowledgeIncident = (id) => {
    updateIncidentStatusMutation.mutate({ id, status: 'ACKNOWLEDGED' });
  };

  const handleResolveIncident = (id) => {
    updateIncidentStatusMutation.mutate({ id, status: 'RESOLVED' });
  };

  if (!effectiveManagerId) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-default-600">
        Chargement des données...
      </div>
    );
  }

  if (incidentsError || notificationsError) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-destructive">
        Erreur lors du chargement des données
      </div>
    );
  }

  const isLoading = isLoadingIncidents || isLoadingNotifications;

  return (
    <div className="app-height overflow-hidden">
      <Card className="h-full">
        <CardContent className="overflow-y-auto no-scrollbar h-full px-0">
          <div className="pt-6 rounded-t-md flex space-y-1.5 px-6 border-b border-border border-none flex-row gap-4 flex-wrap mb-1 sticky top-0 bg-card z-50">
            <div className="flex items-center w-full">
              <div className="relative flex-1 inline-flex items-center">
                <Input
                  type="text"
                  placeholder={`Rechercher ${currentTab.includes('notification') ? 'notifications' : 'incidents'}...`}
                  className="pl-10 pr-4 py-2 border rounded-md flex-1"
                  value={currentTab.includes('notification') ? notificationSearchTerm : incidentSearchTerm}
                  onChange={(e) => currentTab.includes('notification') 
                    ? setNotificationSearchTerm(e.target.value) 
                    : setIncidentSearchTerm(e.target.value)}
                />
                <Icon 
                  icon="heroicons:magnifying-glass" 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                />
              </div>
            </div>
          </div>

          {selectedIncidentId || selectedNotificationId ? (
            currentTab === 'incidents' ? (
              <IncidentItemDisplay
                incident={selectedIncident}
                onClose={() => setSelectedIncidentId(null)}
                onAcknowledge={handleAcknowledgeIncident}
                onResolve={handleResolveIncident}
                onDelete={handleDeleteIncident}
                isLoading={updateIncidentStatusMutation.isLoading || deleteIncidentMutation.isLoading}
              />
            ) : (
              <NotificationItemDisplay
                notification={selectedNotification}
                onClose={() => setSelectedNotificationId(null)}
                onMarkAsRead={markAsReadMutation.mutate}
                onDelete={handleDeleteNotification}
                isLoading={markAsReadMutation.isLoading || deleteNotificationMutation.isLoading}
              />
            )
          ) : (
            <>
              {isLoading && (
                <div className="flex justify-center items-center h-64">
                  <Icon icon="heroicons:arrow-path" className="h-12 w-12 animate-spin" />
                </div>
              )}

              {!isLoading && (
                <Tabs defaultValue={currentTab}>
                  <div className="flex items-center py-2">
                    <TabsList className="bg-transparent gap-2 lg:gap-6 w-full justify-start pl-6 lg:pl-0">
                      {ALL_PAGE_TABS.map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="capitalize data-[state=active]:shadow-none pl-0 data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute before:left-1/2 before:-bottom-[5px] before:h-[2px] w-fit md:min-w-[126px] before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full"
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
                    <div className="px-4 py-2">
                      <Select
                        value={incidentStatusFilter}
                        onValueChange={setIncidentStatusFilter}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="REPORTED">Signalé</SelectItem>
                          <SelectItem value="ACKNOWLEDGED">Reconnu</SelectItem>
                          <SelectItem value="RESOLVED">Résolu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <ScrollArea className="h-[calc(100vh-220px)]">
                      {paginatedIncidents.length > 0 ? (
                        paginatedIncidents.map(incident => (
                          <IncidentListItem
                            key={incident.id}
                            incident={incident}
                            onSelect={handleSelectIncident}
                            isSelected={selectedIncidentId === incident.id}
                            onAcknowledge={handleAcknowledgeIncident}
                            onResolve={handleResolveIncident}
                            onDelete={handleDeleteIncident}
                          />
                        ))
                      ) : (
                        <div className="p-6 text-center text-muted-foreground">
                          Aucun incident trouvé.
                        </div>
                      )}
                    </ScrollArea>
                    {totalIncidentPages > 1 && (
                      <div className="flex justify-center items-center gap-2 p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIncidentCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={incidentCurrentPage === 1}
                        >
                          Précédent
                        </Button>
                        <span className="text-sm">
                          Page {incidentCurrentPage} sur {totalIncidentPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIncidentCurrentPage(p => Math.min(p + 1, totalIncidentPages))}
                          disabled={incidentCurrentPage === totalIncidentPages}
                        >
                          Suivant
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {ALL_PAGE_TABS.filter(tab => tab.value !== 'incidents').map(tab => (
                    <TabsContent key={tab.value} value={tab.value} className="m-0 overflow-hidden">
                      <div className="px-4 py-2">
                        <Select
                          value={notificationStatusFilter}
                          onValueChange={setNotificationStatusFilter}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrer par statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="read">Lues</SelectItem>
                            <SelectItem value="unread">Non lues</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <ScrollArea className="h-[calc(100vh-220px)]">
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
                          <div className="p-6 text-center text-muted-foreground">
                            Aucune notification trouvée.
                          </div>
                        )}
                      </ScrollArea>
                      {totalNotificationPages > 1 && (
                        <div className="flex justify-center items-center gap-2 p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNotificationCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={notificationCurrentPage === 1}
                          >
                            Précédent
                          </Button>
                          <span className="text-sm">
                            Page {notificationCurrentPage} sur {totalNotificationPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNotificationCurrentPage(p => Math.min(p + 1, totalNotificationPages))}
                            disabled={notificationCurrentPage === totalNotificationPages}
                          >
                            Suivant
                          </Button>
                        </div>
                      )}
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