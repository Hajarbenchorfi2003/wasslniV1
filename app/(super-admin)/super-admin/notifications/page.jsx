'use client';
import React, { useState, useEffect, useCallback } from 'react';

// Services
import {
  getAllIncidents,
  getNotfication,
  markNotificationAsRead
} from '@/services/notficationicidient';

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MangmentNotificationsList } from './MangmentNotificationsList';
import { ModalIncidentDetails } from './ModalIncidentDetails';
import { getUser } from '@/utils/auth'; // Import getUser to get user info

const ITEMS_PER_PAGE_INCIDENTS = 10;

const IncidentsNotificationsPage = () => {
  // États
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentTab, setCurrentTab] = useState('incidents');
  const [effectiveManagerEstablishmentId, setEffectiveManagerEstablishmentId] = useState(null);

  // Filtres incidents
  const [incidentSearchTerm, setIncidentSearchTerm] = useState('');
  const [incidentDateRange, setIncidentDateRange] = useState(null);
  const [incidentStatusFilter, setIncidentStatusFilter] = useState('all');
  const [incidentCurrentPage, setIncidentCurrentPage] = useState(1);

  // Modale détails incident
  const [isIncidentDetailsModalOpen, setIsIncidentDetailsModalOpen] = useState(false);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState(null);

  // Set the establishment ID based on the logged-in user
  useEffect(() => {
    const user = getUser();
    if (user && user.establishmentId) {
      setEffectiveManagerEstablishmentId(user.establishmentId);
    }
  }, []);

  // Charger les données via API
  const refreshIncidentsAndNotifications = useCallback(async () => {
    try {
      const [incidentsRes, notificationsRes] = await Promise.all([
        getAllIncidents(),   // Devrait retourner un tableau d'incidents
        getNotfication()
      ]);
  
      setIncidents(incidentsRes || []);
      setFilteredIncidents(incidentsRes || []);
      setNotifications(notificationsRes || []);
      setIncidentCurrentPage(1);
    } catch (error) {
      console.error('Erreur lors du chargement:', error.message);
      toast.error("Impossible de charger les incidents ou notifications");
    }
  }, []);

  useEffect(() => {
    refreshIncidentsAndNotifications();
  }, [refreshIncidentsAndNotifications]);

  // Appliquer les filtres aux incidents
  useEffect(() => {
    let tempFilteredIncidents = [...incidents];
  
    // Filtrer par établissement
    if (effectiveManagerEstablishmentId) {
      tempFilteredIncidents = tempFilteredIncidents.filter(
        inc =>
          inc.dailyTrip?.trip?.establishment?.id === effectiveManagerEstablishmentId
      );
    }
  
    // Filtrer par statut (ex: NEW, ACKNOWLEDGED)
    if (incidentStatusFilter !== 'all') {
      tempFilteredIncidents = tempFilteredIncidents.filter(
        inc => inc.status === incidentStatusFilter
      );
    }
  
    // Filtrer par date
    if (incidentDateRange?.from) {
      const fromDate = new Date(incidentDateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = incidentDateRange.to ? new Date(incidentDateRange.to) : fromDate;
      toDate.setHours(23, 59, 59, 999);
  
      tempFilteredIncidents = tempFilteredIncidents.filter(inc => {
        const incDate = new Date(inc.timestamp);
        return incDate >= fromDate && incDate <= toDate;
      });
    }
  
    // Recherche textuelle
    if (incidentSearchTerm) {
      const lowerCaseSearch = incidentSearchTerm.toLowerCase();
      tempFilteredIncidents = tempFilteredIncidents.filter(inc =>
        inc.description.toLowerCase().includes(lowerCaseSearch) ||
        inc.reportedBy?.fullname?.toLowerCase().includes(lowerCaseSearch) ||
        inc.dailyTrip?.trip?.name?.toLowerCase().includes(lowerCaseSearch)
      );
    }
  
    setFilteredIncidents(tempFilteredIncidents);
    const newTotalPages = Math.ceil(tempFilteredIncidents.length / ITEMS_PER_PAGE_INCIDENTS);
    if (newTotalPages > 0 && incidentCurrentPage > newTotalPages) {
      setIncidentCurrentPage(newTotalPages);
    } else if (tempFilteredIncidents.length === 0 && incidentCurrentPage !== 1) {
      setIncidentCurrentPage(1);
    }
  }, [
    incidents,
    incidentSearchTerm,
    incidentDateRange,
    incidentStatusFilter,
    incidentCurrentPage,
    effectiveManagerEstablishmentId, // Add to dependencies
  ]);

  const paginatedIncidents = filteredIncidents.slice(
    (incidentCurrentPage - 1) * ITEMS_PER_PAGE_INCIDENTS,
    incidentCurrentPage * ITEMS_PER_PAGE_INCIDENTS
  );
  
  const totalIncidentPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE_INCIDENTS);

  const handleIncidentPageChange = (page) => setIncidentCurrentPage(page);

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      toast.success('Notification marquée comme lue.');
    } catch (error) {
      toast.error("Échec de mise à jour de la notification.");
    }
  };

  const handleViewIncidentDetails = (incident) => {
    setSelectedIncidentDetails(incident);
    setIsIncidentDetailsModalOpen(true);
  };

  const getIncidentStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'red';
      case 'ACKNOWLEDGED': return 'yellow';
      case 'RESOLVED': return 'green';
      default: return 'gray';
    }
  };
  
  const getIncidentStatusText = (status) => {
    switch (status) {
      case 'NEW': return 'Nouveau';
      case 'ACKNOWLEDGED': return 'Reconnu';
      case 'RESOLVED': return 'Résolu';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Incidents & Notifications</h1>
      <p>Gestion des incidents et consultation des notifications.</p>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="incidents">Incidents Signalés</TabsTrigger>
          <TabsTrigger value="notifications">Mes Notifications</TabsTrigger>
        </TabsList>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Incidents de l&rsquo;Établissement</CardTitle>
              <CardDescription>{filteredIncidents.length} résultats trouvés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4 flex-wrap">
                <Input
                  placeholder="Rechercher un incident..."
                  value={incidentSearchTerm}
                  onChange={(e) => setIncidentSearchTerm(e.target.value)}
                />
                <Select
                  value={incidentStatusFilter}
                  onValueChange={setIncidentStatusFilter}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="NEW">Nouveau</SelectItem>
                    <SelectItem value="ACKNOWLEDGED">Reconnu</SelectItem>
                    <SelectItem value="RESOLVED">Résolu</SelectItem>
                  </SelectContent>
                </Select>
                <DatePickerWithRange date={incidentDateRange} setDate={setIncidentDateRange} />
              </div>

              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Trajet Quotidien</TableHead>
                      <TableHead>Date Trajet</TableHead>
                      <TableHead>Rapporté par</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date/Heure Signalement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedIncidents.length > 0 ? (
                      paginatedIncidents.map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell>{incident.description}</TableCell>
                          <TableCell>{incident.dailyTrip?.trip?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {new Date(incident.dailyTrip?.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{incident.reportedBy?.fullname || 'Inconnu'}</TableCell>
                          <TableCell>
                            <Badge color={getIncidentStatusColor(incident.status)}>
                              {getIncidentStatusText(incident.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(incident.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" onClick={() => handleViewIncidentDetails(incident)}>
                              <Icon icon="heroicons:eye" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Aucun incident trouvé.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Pagination */}
              {totalIncidentPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  <Button
                    disabled={incidentCurrentPage === 1}
                    onClick={() => handleIncidentPageChange(incidentCurrentPage - 1)}
                  >
                    Précédent
                  </Button>
                  {Array.from({ length: totalIncidentPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={incidentCurrentPage === i + 1 ? "default" : "outline"}
                      onClick={() => handleIncidentPageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    disabled={incidentCurrentPage === totalIncidentPages}
                    onClick={() => handleIncidentPageChange(incidentCurrentPage + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <MangmentNotificationsList
            notifications={notifications}
            onMarkAsRead={handleMarkNotificationAsRead}
          />
        </TabsContent>
      </Tabs>

      {/* Modale détails incident */}
      {isIncidentDetailsModalOpen && (
        <ModalIncidentDetails
          isOpen={isIncidentDetailsModalOpen}
          setIsOpen={setIsIncidentDetailsModalOpen}
          incidentDetails={selectedIncidentDetails}
        />
      )}
    </div>
  );
};

export default IncidentsNotificationsPage;