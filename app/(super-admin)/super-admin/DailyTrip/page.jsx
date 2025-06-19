// components/DailyTripsPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalDailyTrip } from '@/components/models/ModalDailyTrip';
import DailyTripCard from './DailyTripCard'; // Create this

 
// Import shadcn/ui Select and Input components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Make sure you have this installed: npx shadcn-ui@latest add input

const ITEMS_PER_PAGE = 3;

const DailyTripsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [dailyTrips, setDailyTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDailyTrip, setEditingDailyTrip] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // States for existing filters
  const [filterTripId, setFilterTripId] = useState('all');
  const [filterDriverId, setFilterDriverId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // New states for search functionality
  const [searchTerm, setSearchTerm] = useState(''); // For trip name, driver name, bus plate
  const [searchDate, setSearchDate] = useState(''); // For specific date search (YYYY-MM-DD)

  useEffect(() => {
    console.log("Filters or search terms updated, re-filtering daily trips...");
    let processedDailyTrips = currentDemoData.dailyTrips;

    // Enrich daily trips with trip name, route name, driver, bus, and status
    // Also add driverId and tripId for filtering, and busPlate for search
    let enrichedDailyTrips = processedDailyTrips.map(dailyTrip => {
      const trip = currentDemoData.trips.find(t => t.id === dailyTrip.tripId);
      const route = trip ? currentDemoData.routes.find(r => r.id === trip.routeId) : null;
      const bus = trip ? currentDemoData.buses.find(b => b.id === trip.busId) : null;
      const driver = trip ? currentDemoData.users.find(u => u.id === trip.driverId) : null;

      return {
        ...dailyTrip,
        tripName: trip ? trip.name : 'N/A',
        routeId: trip ? trip.routeId : null,
        routeName: route ? route.name : 'N/A',
        busPlate: bus ? bus.plateNumber : 'N/A',
        driverId: trip ? trip.driverId : null,
        driverName: driver ? driver.fullname : 'N/A',
        statusText: dailyTrip.status,
      };
    });

    // --- Apply Filters ---
    if (filterTripId !== 'all') {
      enrichedDailyTrips = enrichedDailyTrips.filter(dailyTrip =>
        dailyTrip.tripId === parseInt(filterTripId)
      );
    }
    if (filterDriverId !== 'all') {
      enrichedDailyTrips = enrichedDailyTrips.filter(dailyTrip =>
        dailyTrip.driverId === parseInt(filterDriverId)
      );
    }
    if (filterStatus !== 'all') {
      enrichedDailyTrips = enrichedDailyTrips.filter(dailyTrip =>
        dailyTrip.status === filterStatus
      );
    }

    // --- Apply Search Term (Nom de trajet, Nom de chauffeur, Numéro de plaque du bus) ---
    if (searchTerm.trim() !== '') {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      enrichedDailyTrips = enrichedDailyTrips.filter(dailyTrip =>
        dailyTrip.tripName.toLowerCase().includes(lowerCaseSearchTerm) ||
        dailyTrip.driverName.toLowerCase().includes(lowerCaseSearchTerm) ||
        dailyTrip.busPlate.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // --- Apply Search Date ---
    if (searchDate) {
      // Format searchDate to YYYY-MM-DD for comparison
      const formattedSearchDate = new Date(searchDate).toISOString().split('T')[0];
      enrichedDailyTrips = enrichedDailyTrips.filter(dailyTrip => {
        // Format dailyTrip.date to YYYY-MM-DD for comparison
        const dailyTripDate = new Date(dailyTrip.date).toISOString().split('T')[0];
        return dailyTripDate === formattedSearchDate;
      });
    }

    setDailyTrips(enrichedDailyTrips);

    // Adjust current page if the number of pages changes after filtering/searching
    const newTotalPages = Math.ceil(enrichedDailyTrips.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (enrichedDailyTrips.length === 0 && currentPage !== 1) {
      setCurrentPage(1); // Go to page 1 if no items, to avoid empty page
    } else if (newTotalPages === 0 && enrichedDailyTrips.length > 0) {
      setCurrentPage(1); // If suddenly there are items, but totalPages was 0
    }
  }, [currentDemoData, currentPage, filterTripId, filterDriverId, filterStatus, searchTerm, searchDate]); // Add all filter and search states to dependencies

  const totalPages = Math.ceil(dailyTrips.length / ITEMS_PER_PAGE);
  const paginatedDailyTrips = dailyTrips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditDailyTrip = (dailyTrip) => {
    setEditingDailyTrip(dailyTrip);
    setIsModalOpen(true);
  };

  const handleDeleteDailyTrip = (id) => {
    try {
      console.log(`Attempting to delete daily trip with ID: ${id}`);
      const updatedDailyTrips = currentDemoData.dailyTrips.filter(dt => dt.id !== id);

      // Also remove associated attendances and positions
      const updatedAttendances = currentDemoData.attendances.filter(att => att.dailyTripId !== id);
      const updatedPositions = currentDemoData.positions.filter(pos => pos.dailyTripId !== id);

      setCurrentDemoData(prevData => ({
        ...prevData,
        dailyTrips: updatedDailyTrips,
        attendances: updatedAttendances,
        positions: updatedPositions,
      }));

      toast.success('Trajet quotidien supprimé avec succès');
    } catch (error) {
      console.error('Error deleting daily trip:', error);
      toast.error('Erreur lors de la suppression du trajet quotidien');
    }
  };

  const handleSaveDailyTrip = async (dailyTripData) => {
    try {
      let message = '';
      let updatedDailyTripsArray = [...currentDemoData.dailyTrips];

      if (editingDailyTrip) {
        const index = updatedDailyTripsArray.findIndex(dt => dt.id === editingDailyTrip.id);
        if (index !== -1) {
          const dailyTripToUpdate = updatedDailyTripsArray[index];
          const updatedDailyTrip = {
            ...dailyTripToUpdate,
            ...dailyTripData,
            id: editingDailyTrip.id,
            tripId: parseInt(dailyTripData.tripId),
            date: dailyTripData.date ? new Date(dailyTripData.date).toISOString() : null,
          };
          updatedDailyTripsArray[index] = updatedDailyTrip;
          message = 'Trajet quotidien modifié avec succès';
        } else {
          throw new Error("Trajet quotidien à modifier non trouvé.");
        }
      } else {
        const newId = Math.max(...currentDemoData.dailyTrips.map(dt => dt.id), 0) + 1;
        const newDailyTrip = {
          ...dailyTripData,
          id: newId,
          tripId: parseInt(dailyTripData.tripId),
          date: dailyTripData.date ? new Date(dailyTripData.date).toISOString() : null,
          status: dailyTripData.status || currentDemoData.enums.TripStatus.SCHEDULED, // Default status for new trips
        };
        updatedDailyTripsArray.push(newDailyTrip);
        message = 'Trajet quotidien ajouté avec succès';
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        dailyTrips: updatedDailyTripsArray,
      }));

      toast.success(message);
      setIsModalOpen(false);
      setEditingDailyTrip(null);

    } catch (error) {
      console.error('Error saving daily trip:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDailyTrip(null);
  };

  // Extract unique trips and drivers for filter options
  const uniqueTrips = [...new Map(currentDemoData.trips.map(trip => [trip.id, trip])).values()];
  const uniqueDrivers = [...new Map(currentDemoData.users
    .filter(user => user.role === 'DRIVER')
    .map(driver => [driver.id, driver])).values()];

  const tripStatuses = Object.values(currentDemoData.enums.TripStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Gestion des Trajets Quotidiens
        </div>
        <Button onClick={() => {
          setEditingDailyTrip(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Trajet Quotidien
        </Button>
      </div>

      {/* --- Filters and Search Section --- */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {/* Search by Text */}
  
   <div className="relative w-full  ">
        <Input
          type="text"
          placeholder=" Trajet, chauffeur, bus..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-md w-full"
        />
        <Icon
          icon="heroicons:magnifying-glass"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        />
    </div>

  {/* Search by Date */}
  <Input
    type="date"
    value={searchDate}
    onChange={(e) => setSearchDate(e.target.value)}
    className="w-full"
  />

  {/* Filter by Trip Name */}
  <Select onValueChange={setFilterTripId} value={filterTripId}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Filtrer par Trajet" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous les Trajets</SelectItem>
      {uniqueTrips.map((trip) => (
        <SelectItem key={trip.id} value={String(trip.id)}>
          {trip.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Filter by Driver */}
  <Select onValueChange={setFilterDriverId} value={filterDriverId}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Filtrer par Chauffeur" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous les Chauffeurs</SelectItem>
      {uniqueDrivers.map((driver) => (
        <SelectItem key={driver.id} value={String(driver.id)}>
          {driver.fullname}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Filter by Status */}
  <Select onValueChange={setFilterStatus} value={filterStatus}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Filtrer par Statut" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous les Statuts</SelectItem>
      {tripStatuses.map((status) => (
        <SelectItem key={status} value={status}>
          {status}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


      <ModalDailyTrip
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingDailyTrip={editingDailyTrip}
        onSave={handleSaveDailyTrip}
        trips={currentDemoData.trips}
        tripStatuses={currentDemoData.enums.TripStatus}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedDailyTrips.length > 0 ? (
          paginatedDailyTrips.map((dailyTrip) => (
            <DailyTripCard
              key={dailyTrip.id}
              dailyTrip={dailyTrip}
              onEditDailyTrip={handleEditDailyTrip}
              onDeleteDailyTrip={handleDeleteDailyTrip}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Aucun trajet quotidien trouvé.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 items-center mt-4 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={`page-${page}`}
              onClick={() => handlePageChange(page)}
              variant={page === currentPage ? "default" : "outline"}
              className={cn("w-8 h-8")}
            >
              {page}
            </Button>
          ))}

          <Button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DailyTripsPage;