// app/[lang]/(admin)/admin/daily-trips/page.jsx
'use client';

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

// Import the full demoData
import { demoData as initialDemoData } from '@/data/data';

// Import the separated components
import { DailyTripsTable } from './DailyTripsTable';
import { TripDetailsPanel } from './TripDetailsPanel';
import { ModalDailyTrip } from '@/components/models/ModalDailyTrip';
import ModalSuppression from '@/components/models/ModalSuppression';

const ITEMS_PER_PAGE = 5;

const DailyTripsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [enrichedDailyTrips, setEnrichedDailyTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // For Add/Edit Modal
  const [editingDailyTrip, setEditingDailyTrip] = useState(null);
  const [selectedTripDetails, setSelectedTripDetails] = useState(null); // This state will control the layout

  // States for Deletion Confirmation Modal
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [dailyTripToDeleteId, setDailyTripToDeleteId] = useState(null);

  // Filter and search states
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Data Enrichment and Filtering Logic ---
  useEffect(() => {
    let tripsToProcess = currentDemoData.dailyTrips;

    // Enrich data
    const enriched = tripsToProcess.map(dTrip => {
      const trip = currentDemoData.trips.find(t => t.id === dTrip.tripId);
      if (!trip) {
        console.warn(`Trip with ID ${dTrip.tripId} not found for dailyTrip ${dTrip.id}`);
        return null;
      }
      const bus = currentDemoData.buses.find(b => b.id === trip.busId);
      const driver = currentDemoData.users.find(u => u.id === trip.driverId && u.role === 'DRIVER');
      const route = currentDemoData.routes.find(r => r.id === trip.routeId);
      const stops = route ? currentDemoData.stops.filter(s => s.routeId === route.id) : [];
      const attendance = currentDemoData.attendances.filter(a => a.dailyTripId === dTrip.id).map(att => ({
        ...att,
        student: currentDemoData.students.find(s => s.id === att.studentId),
        markedBy: currentDemoData.users.find(u => u.id === att.markedById)
      }));
      const positions = currentDemoData.positions.filter(p => p.dailyTripId === dTrip.id);
      const incidents = currentDemoData.incidents.filter(i => i.dailyTripId === dTrip.id).map(inc => ({
        ...inc,
        reportedBy: currentDemoData.users.find(u => u.id === inc.reportedById)
      }));

      return {
        ...dTrip,
        trip: {
          ...trip,
          bus: bus || {},
          driver: driver || {},
          route: { ...route, stops: stops } || {}
        },
        attendance,
        positions,
        incidents,
      };
    }).filter(Boolean);

    let filteredTrips = enriched;

    // Apply status filter
    if (filterStatus !== 'all') {
      filteredTrips = filteredTrips.filter(dTrip => dTrip.status === filterStatus);
    }

    // Apply search query filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filteredTrips = filteredTrips.filter(dTrip => {
        const tripName = dTrip.trip?.name?.toLowerCase() || '';
        const busPlate = dTrip.trip?.bus?.plateNumber?.toLowerCase() || '';
        const driverName = dTrip.trip?.driver?.fullname?.toLowerCase() || '';
        const routeName = dTrip.trip?.route?.name?.toLowerCase() || '';
        const date = dTrip.date?.toLowerCase() || '';

        return tripName.includes(lowerCaseQuery) ||
               busPlate.includes(lowerCaseQuery) ||
               driverName.includes(lowerCaseQuery) ||
               routeName.includes(lowerCaseQuery) ||
               date.includes(lowerCaseQuery);
      });
    }

    setEnrichedDailyTrips(filteredTrips);

    const newTotalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (filteredTrips.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (currentPage === 0 && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentDemoData, filterStatus, searchQuery, currentPage]);

  const totalPages = Math.ceil(enrichedDailyTrips.length / ITEMS_PER_PAGE);
  const paginatedDailyTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return enrichedDailyTrips.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [enrichedDailyTrips, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditDailyTrip = (trip) => {
    setEditingDailyTrip(trip);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id) => {
    setDailyTripToDeleteId(id);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (dailyTripToDeleteId === null) return;

    setCurrentDemoData(prevData => ({
      ...prevData,
      dailyTrips: prevData.dailyTrips.filter(dTrip => dTrip.id !== dailyTripToDeleteId),
      attendances: prevData.attendances.filter(att => att.dailyTripId !== dailyTripToDeleteId),
      positions: prevData.positions.filter(pos => pos.dailyTripId !== dailyTripToDeleteId),
      incidents: prevData.incidents.filter(inc => inc.dailyTripId !== dailyTripToDeleteId),
    }));
    toast.success('Trajet quotidien supprimé avec succès.');
    setSelectedTripDetails(null); // Clear details if deleted
    setIsDeleteConfirmModalOpen(false);
    setDailyTripToDeleteId(null);
  };

  const cancelDelete = () => {
    setIsDeleteConfirmModalOpen(false);
    setDailyTripToDeleteId(null);
  };

  const handleSaveDailyTrip = (formData) => {
    let message = '';
    let updatedDailyTrips = [...currentDemoData.dailyTrips];

    const tripExists = currentDemoData.trips.some(t => t.id === formData.tripId);
    if (!tripExists) {
      toast.error(`L'ID du trajet '${formData.tripId}' n'existe pas. Veuillez utiliser un ID de trajet valide.`);
      return;
    }

    if (editingDailyTrip) {
      const index = updatedDailyTrips.findIndex(dTrip => dTrip.id === editingDailyTrip.id);
      if (index !== -1) {
        updatedDailyTrips[index] = {
          ...updatedDailyTrips[index],
          tripId: formData.tripId,
          date: formData.date,
          status: formData.status,
        };
        message = 'Trajet quotidien modifié avec succès.';
      } else {
        toast.error('Erreur: Trajet quotidien à modifier non trouvé.');
        return;
      }
    } else {
      const newId = Math.max(...currentDemoData.dailyTrips.map(d => d.id), 0) + 1;
      updatedDailyTrips.push({
        id: newId,
        tripId: formData.tripId,
        date: formData.date,
        status: formData.status,
      });
      message = 'Nouveau trajet quotidien ajouté avec succès.';
    }

    setCurrentDemoData(prevData => ({
      ...prevData,
      dailyTrips: updatedDailyTrips,
    }));
    toast.success(message);
    setIsModalOpen(false);
    setEditingDailyTrip(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDailyTrip(null);
  };

  const handleOpenAddModal = () => {
    setEditingDailyTrip(null);
    setIsModalOpen(true);
  };

  // --- Helper Functions for Display (Passed to children) ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED': return 'default';
      case 'ONGOING': return 'warning';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PLANNED': return 'Planifié';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      default: return status;
    }
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'destructive';
      default: return 'default';
    }
  };

  const getAttendanceStatusText = (status) => {
    switch (status) {
      case 'PRESENT': return 'Présent';
      case 'ABSENT': return 'Absent';
      default: return status;
    }
  };

  const getAttendanceTypeText = (type) => {
    switch (type) {
      case 'DEPART': return 'Départ';
      case 'RETOUR': return 'Retour';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
        <h1 className="text-3xl font-bold text-default-900">Gestion des Trajets Quotidiens</h1>
        <Button onClick={handleOpenAddModal} className="shrink-0">
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un trajet
        </Button>
      </div>

      {/* Filters and Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Statuts</SelectItem>
            {currentDemoData.enums.TripStatus.map(status => (
              <SelectItem key={status} value={status}>
                {getStatusText(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Rechercher par nom du trajet, matricule bus, chauffeur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="col-span-1 md:col-span-2"
        />
      </div>

      {/* Main Content Area: Table and (conditionally) Details Panels */}
      <div className={`grid gap-6 ${selectedTripDetails ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {/* Daily Trips Table */}
        <div className={selectedTripDetails ? 'lg:col-span-1' : 'lg:col-span-full'}>
            <DailyTripsTable
              dailyTrips={paginatedDailyTrips}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEditDailyTrip={handleEditDailyTrip}
              onDeleteDailyTrip={handleDeleteRequest}
              selectedTripDetails={selectedTripDetails}
              onSelectTrip={setSelectedTripDetails}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getAttendanceStatusColor={getAttendanceStatusColor}
              getAttendanceStatusText={getAttendanceStatusText}
              getAttendanceTypeText={getAttendanceTypeText}
            />
        </div>

        {/* Trip Details Panel - Conditionally rendered */}
        {selectedTripDetails && (
          <div className="lg:col-span-1">
              <TripDetailsPanel
                selectedTripDetails={selectedTripDetails}
                getAttendanceStatusColor={getAttendanceStatusColor}
                getAttendanceStatusText={getAttendanceStatusText}
                getAttendanceTypeText={getAttendanceTypeText}
              />
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Daily Trip */}
      <ModalDailyTrip
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingDailyTrip={editingDailyTrip}
        onSave={handleSaveDailyTrip}
        trips={currentDemoData.trips.map(trip => {
          const bus = currentDemoData.buses.find(b => b.id === trip.busId);
          const driver = currentDemoData.users.find(u => u.id === trip.driverId && u.role === 'DRIVER');
          return {
            ...trip,
            name: `${trip.name} (Bus: ${bus?.plateNumber || 'N/A'}, Chauffeur: ${driver?.fullname || 'N/A'})`
          };
        })}
        tripStatuses={currentDemoData.enums.TripStatus}
      />

      {/* Deletion Confirmation Modal */}
      <ModalSuppression
        isOpen={isDeleteConfirmModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression du trajet"
        description="Êtes-vous sûr de vouloir supprimer ce trajet quotidien ? Cette action supprimera également les présences et incidents associés et est irréversible."
        confirmText="Supprimer le trajet"
        cancelText="Annuler"
      />
    </div>
  );
};

export default DailyTripsPage;