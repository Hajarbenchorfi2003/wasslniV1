// pages/manager/IncidentsNotificationsPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    demoData,
    getIncidentsByEstablishment,
    getNotificationsForUser,
    markNotificationAsRead,
    getUserById,
} from '@/data/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MangmentNotificationsList } from './MangmentNotificationsList';

// Import the new ModalIncidentDetails component
import { ModalIncidentDetails } from './ModalIncidentDetails'; // Assurez-vous du chemin correct

const ITEMS_PER_PAGE_INCIDENTS = 10;
const ITEMS_PER_PAGE_NOTIFICATIONS = 10;

export const IncidentsNotificationsPage = ({ managerEstablishmentId, managerId }) => {
    const effectiveManagerId = managerId || 3;
    const effectiveManagerEstablishmentId = managerEstablishmentId || 1;

    const [currentDemoData, setCurrentDemoData] = useState(demoData);
    const [incidents, setIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [currentTab, setCurrentTab] = useState('incidents');

    // NOUVEL ÉTAT pour la modale de détails d'incident
    const [isIncidentDetailsModalOpen, setIsIncidentDetailsModalOpen] = useState(false);
    const [selectedIncidentDetails, setSelectedIncidentDetails] = useState(null); // L'incident à afficher dans la modale

    // Incident filters
    const [incidentSearchTerm, setIncidentSearchTerm] = useState('');
    const [incidentDateRange, setIncidentDateRange] = useState(null);
    const [incidentStatusFilter, setIncidentStatusFilter] = useState('all');
    const [incidentCurrentPage, setIncidentCurrentPage] = useState(1);

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

    const refreshIncidentsAndNotifications = useCallback(() => {
        if (!effectiveManagerEstablishmentId || !effectiveManagerId) {
            setIncidents([]);
            setNotifications([]);
            return;
        }

        const fetchedIncidents = getIncidentsByEstablishment(effectiveManagerEstablishmentId);
        setIncidents(fetchedIncidents);

        const fetchedNotifications = getNotificationsForUser(effectiveManagerId);
        setNotifications(fetchedNotifications);

        setIncidentCurrentPage(1);
    }, [effectiveManagerEstablishmentId, effectiveManagerId, currentDemoData]);

    useEffect(() => {
        refreshIncidentsAndNotifications();
    }, [refreshIncidentsAndNotifications]);

    // Effect for Incident filtering and pagination
    useEffect(() => {
        let tempFilteredIncidents = [...incidents];

        if (incidentStatusFilter !== 'all') {
            tempFilteredIncidents = tempFilteredIncidents.filter(inc => inc.status === incidentStatusFilter);
        }

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

        if (incidentSearchTerm) {
            const lowerCaseSearch = incidentSearchTerm.toLowerCase();
            tempFilteredIncidents = tempFilteredIncidents.filter(inc =>
                inc.description.toLowerCase().includes(lowerCaseSearch) ||
                inc.reportedByName.toLowerCase().includes(lowerCaseSearch) ||
                (inc.dailyTripName && inc.dailyTripName.toLowerCase().includes(lowerCaseSearch))
            );
        }
        setFilteredIncidents(tempFilteredIncidents);
        const newTotalPages = Math.ceil(tempFilteredIncidents.length / ITEMS_PER_PAGE_INCIDENTS);
        if (incidentCurrentPage > newTotalPages && newTotalPages > 0) {
            setIncidentCurrentPage(newTotalPages);
        } else if (newTotalPages === 0 && tempFilteredIncidents.length > 0) {
            setIncidentCurrentPage(1);
        } else if (tempFilteredIncidents.length === 0 && incidentCurrentPage !== 1) {
            setIncidentCurrentPage(1);
        }
    }, [incidents, incidentSearchTerm, incidentDateRange, incidentStatusFilter, incidentCurrentPage]);

    const paginatedIncidents = filteredIncidents.slice(
        (incidentCurrentPage - 1) * ITEMS_PER_PAGE_INCIDENTS,
        incidentCurrentPage * ITEMS_PER_PAGE_INCIDENTS
    );
    const totalIncidentPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE_INCIDENTS);

    const handleIncidentPageChange = (page) => setIncidentCurrentPage(page);

    const handleMarkNotificationAsRead = (notificationId) => {
        markNotificationAsRead(notificationId);
        setCurrentDemoData({ ...demoData });
        toast.success('Notification marquée comme lue.');
    };

    // NOUVEAU: Gère l'ouverture de la modale de détails d'incident
    const handleViewIncidentDetails = (incident) => {
        setSelectedIncidentDetails(incident); // Définit l'incident à passer à la modale
        setIsIncidentDetailsModalOpen(true); // Ouvre la modale
    };

    if (!effectiveManagerEstablishmentId) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-default-600">
                Chargement de l'établissement...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-default-900">Incidents & Notifications</h1>
            <p className="text-default-600">Gérez les incidents et consultez les notifications pour l'établissement ID: **{effectiveManagerEstablishmentId}**.</p>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid iniline-block grid-cols-2">
                    <TabsTrigger value="incidents">Incidents Signalés</TabsTrigger>
                    <TabsTrigger value="notifications">Mes Notifications</TabsTrigger>
                </TabsList>

                {/* Incidents Tab Content */}
                <TabsContent value="incidents" className="mt-4 w-full">
                    <Card className="shadow-sm border border-gray-200">
                        <CardHeader className="py-4 px-6 border-b border-gray-200">
                            <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
                                <Icon icon="heroicons:exclamation-triangle" className="h-6 w-6 text-red-500" />
                                Incidents de l'Établissement
                            </CardTitle>
                            <CardDescription>
                                Nombre total d'incidents filtrés: {filteredIncidents.length}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Filters for Incidents */}
                            <div className="sm:grid  sm:grid-cols-3 sm:gap-5 space-y-4 sm:space-y-0 items-center justify-between gap-2 p-4">
                                <div className="relative w-full max-w-sm">
                                    <Input
                                        type="text"
                                        placeholder="Rechercher un incident..."
                                        value={incidentSearchTerm}
                                        onChange={(e) => setIncidentSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border rounded-md w-full"
                                    />
                                    <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                                <Select onValueChange={setIncidentStatusFilter} value={incidentStatusFilter} className="w-full max-w-[150px]">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="NEW">Nouveau</SelectItem>
                                        <SelectItem value="ACKNOWLEDGED">Reconnu</SelectItem>
                                        <SelectItem value="RESOLVED">Résolu</SelectItem>
                                    </SelectContent>
                                </Select>
                                <DatePickerWithRange
                                    date={incidentDateRange}
                                    setDate={setIncidentDateRange}
                                    placeholder="Filtrer par date"
                                />
                            </div>
                            {/* Scrollable Table for Incidents */}
                            <ScrollArea className="h-[400px]">
                                <div className="overflow-x-auto">
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
                                                paginatedIncidents.map(incident => (
                                                    <TableRow key={incident.id}>
                                                        <TableCell className="font-medium max-w-[200px] truncate">{incident.description}</TableCell>
                                                        <TableCell>{incident.dailyTripName}</TableCell>
                                                        <TableCell>{incident.dailyTripDate}</TableCell>
                                                        <TableCell>{incident.reportedByName}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="soft" color={getIncidentStatusColor(incident.status)} className="capitalize">
                                                                {getIncidentStatusText(incident.status)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{incident.timestampFormatted}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button size="icon" variant="ghost" onClick={() => handleViewIncidentDetails(incident)}>
                                                                <Icon icon="heroicons:eye" className="h-5 w-5" />
                                                            </Button>
                                                            {/* Add Acknowledge/Resolve buttons if manager has permission */}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                        Aucun incident trouvé pour cet établissement.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </ScrollArea>
                            {/* Pagination for Incidents */}
                            {totalIncidentPages > 1 && (
                                <div className="flex gap-2 items-center justify-center p-4 border-t">
                                    <Button variant="outline" size="icon" onClick={() => handleIncidentPageChange(Math.max(incidentCurrentPage - 1, 1))} disabled={incidentCurrentPage === 1} className="h-8 w-8">
                                        <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
                                    </Button>
                                    {Array.from({ length: totalIncidentPages }, (_, i) => i + 1).map((page) => (
                                        <Button key={`inc-page-${page}`} onClick={() => handleIncidentPageChange(page)} variant={page === incidentCurrentPage ? "default" : "outline"} className={cn("w-8 h-8", page === incidentCurrentPage ? "bg-primary text-primary-foreground" : "text-default-700")}>
                                            {page}
                                        </Button>
                                    ))}
                                    <Button onClick={() => handleIncidentPageChange(Math.min(incidentCurrentPage + 1, totalIncidentPages))} disabled={incidentCurrentPage === totalIncidentPages} variant="outline" size="icon" className="h-8 w-8">
                                        <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab Content */}
                <TabsContent value="notifications" className="mt-4">
                    <MangmentNotificationsList // Reusing parent's notification list component
                        notifications={notifications}
                        onMarkAsRead={handleMarkNotificationAsRead}
                    />
                    {/* You might add search/filter for notifications here too */}
                </TabsContent>
            </Tabs>

            {/* NOUVEAU: Modale de détails d'incident */}
            {isIncidentDetailsModalOpen && (
                <ModalIncidentDetails
                    isOpen={isIncidentDetailsModalOpen}
                    setIsOpen={setIsIncidentDetailsModalOpen}
                    incidentDetails={selectedIncidentDetails} // Passe les détails de l'incident sélectionné
                />
            )}
        </div>
    );
};

export default IncidentsNotificationsPage;