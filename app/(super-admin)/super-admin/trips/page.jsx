'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalTrip } from '@/components/models/ModalTrip';
import TripCard from './TripCard';

// Import shadcn/ui Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 3;

const TripsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [trips, setTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // New states for filters
  const [filterRouteId, setFilterRouteId] = useState('all');
  const [filterBusId, setFilterBusId] = useState('all');
  const [filterDriverId, setFilterDriverId] = useState('all');
  const [filterEstablishmentId, setFilterEstablishmentId] = useState('all');

  useEffect(() => {
    console.log("currentDemoData or filters updated, filtering trips...");
    let processedTrips = currentDemoData.trips;

    // Enrich trips with route name, bus plate, driver name, establishment name, and student count
    let enrichedTrips = processedTrips.map(trip => {
      const route = currentDemoData.routes.find(r => r.id === trip.routeId);
      const bus = currentDemoData.buses.find(b => b.id === trip.busId);
      const driver = currentDemoData.users.find(u => u.id === trip.driverId && u.role === 'DRIVER');
      const establishment = currentDemoData.establishments.find(est => est.id === trip.establishmentId);
      const studentCount = currentDemoData.tripStudents.filter(ts => ts.tripId === trip.id).length;

      return {
        ...trip,
        routeName: route ? route.name : 'N/A',
        busPlate: bus ? bus.plateNumber : 'N/A',
        driverName: driver ? driver.fullname : 'N/A',
        establishmentName: establishment ? establishment.name : 'N/A',
        studentCount: studentCount,
      };
    });

    // --- Apply Filters ---
    if (filterRouteId !== 'all') {
      enrichedTrips = enrichedTrips.filter(trip =>
        trip.routeId === parseInt(filterRouteId)
      );
    }
    if (filterBusId !== 'all') {
      enrichedTrips = enrichedTrips.filter(trip =>
        trip.busId === parseInt(filterBusId)
      );
    }
    if (filterDriverId !== 'all') {
      enrichedTrips = enrichedTrips.filter(trip =>
        trip.driverId === parseInt(filterDriverId)
      );
    }
    if (filterEstablishmentId !== 'all') {
      enrichedTrips = enrichedTrips.filter(trip =>
        trip.establishmentId === parseInt(filterEstablishmentId)
      );
    }

    setTrips(enrichedTrips);

    // Adjust current page if the number of pages changes after filtering
    const newTotalPages = Math.ceil(enrichedTrips.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (enrichedTrips.length === 0 && currentPage !== 1) {
      setCurrentPage(1); // Go to page 1 if no items, to avoid empty page
    } else if (newTotalPages === 0 && enrichedTrips.length > 0) {
      setCurrentPage(1); // If suddenly there are items, but totalPages was 0
    }
  }, [currentDemoData, currentPage, filterRouteId, filterBusId, filterDriverId, filterEstablishmentId]); // Add all filter states to dependencies

  const totalPages = Math.ceil(trips.length / ITEMS_PER_PAGE);
  const paginatedTrips = trips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleDeleteTrip = (id) => {
    try {
      console.log(`Attempting to delete trip with ID: ${id}`);
      const updatedTrips = currentDemoData.trips.filter(trip => trip.id !== id);

      const dailyTripsToDelete = currentDemoData.dailyTrips.filter(dt => dt.tripId === id).map(dt => dt.id);
      const updatedDailyTrips = currentDemoData.dailyTrips.filter(dt => dt.tripId !== id);
      const updatedTripStudents = currentDemoData.tripStudents.filter(ts => ts.tripId !== id);
      const updatedAttendances = currentDemoData.attendances.filter(att => !dailyTripsToDelete.includes(att.dailyTripId));
      const updatedPositions = currentDemoData.positions.filter(pos => !dailyTripsToDelete.includes(pos.dailyTripId));

      setCurrentDemoData(prevData => ({
        ...prevData,
        trips: updatedTrips,
        dailyTrips: updatedDailyTrips,
        tripStudents: updatedTripStudents,
        attendances: updatedAttendances,
        positions: updatedPositions,
      }));

      toast.success('Trajet supprimé avec succès');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Erreur lors de la suppression du trajet');
    }
  };

  const handleSaveTrip = async (tripData) => {
    try {
      let message = '';
      let updatedTripsArray = [...currentDemoData.trips];
      let updatedTripStudentsArray = [...currentDemoData.tripStudents];

      if (editingTrip) {
        const index = updatedTripsArray.findIndex(t => t.id === editingTrip.id);
        if (index !== -1) {
          const tripToUpdate = updatedTripsArray[index];
          const updatedTrip = {
            ...tripToUpdate,
            ...tripData,
            id: editingTrip.id,
            busId: parseInt(tripData.busId),
            driverId: parseInt(tripData.driverId),
            routeId: parseInt(tripData.routeId),
            establishmentId: parseInt(tripData.establishmentId),
          };
          updatedTripsArray[index] = updatedTrip;
          message = 'Trajet modifié avec succès';

          updatedTripStudentsArray = updatedTripStudentsArray.filter(ts => ts.tripId !== updatedTrip.id);
          if (tripData.studentIds && tripData.studentIds.length > 0) {
            tripData.studentIds.forEach(studentId => {
              updatedTripStudentsArray.push({ tripId: updatedTrip.id, studentId: parseInt(studentId) });
            });
          }
        } else {
          throw new Error("Trajet à modifier non trouvé.");
        }
      } else {
        const newId = Math.max(...currentDemoData.trips.map(t => t.id), 0) + 1;
        const newTrip = {
          ...tripData,
          id: newId,
          busId: parseInt(tripData.busId),
          driverId: parseInt(tripData.driverId),
          routeId: parseInt(tripData.routeId),
          establishmentId: parseInt(tripData.establishmentId),
        };
        updatedTripsArray.push(newTrip);
        message = 'Trajet ajouté avec succès';

        if (tripData.studentIds && tripData.studentIds.length > 0) {
          tripData.studentIds.forEach(studentId => {
            updatedTripStudentsArray.push({ tripId: newId, studentId: parseInt(studentId) });
          });
        }
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        trips: updatedTripsArray,
        tripStudents: updatedTripStudentsArray,
      }));

      toast.success(message);
      setIsModalOpen(false);
      setEditingTrip(null);

    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  // Helper arrays for Select options
  const allRoutes = currentDemoData.routes;
  const allBuses = currentDemoData.buses;
  const allDrivers = currentDemoData.users.filter(user => user.role === 'DRIVER');
  const allEstablishments = currentDemoData.establishments;

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Gestion des Trajets
        </div>
        <Button onClick={() => {
          setEditingTrip(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Trajet
        </Button>
      </div>


{/* --- Filters Section --- */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {/* Filter by Route */}
  <Select onValueChange={setFilterRouteId} value={filterRouteId}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Filtrer par Route" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Toutes les Routes</SelectItem>
      {allRoutes.map(route => (
        <SelectItem key={route.id} value={String(route.id)}>
          {route.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Filter by Bus */}
  <Select onValueChange={setFilterBusId} value={filterBusId}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Filtrer par Bus" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous les Bus</SelectItem>
      {allBuses.map(bus => (
        <SelectItem key={bus.id} value={String(bus.id)}>
          {bus.plateNumber}
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
      {allDrivers.map(driver => (
        <SelectItem key={driver.id} value={String(driver.id)}>
          {driver.fullname}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Filter by Establishment */}
  <Select onValueChange={setFilterEstablishmentId} value={filterEstablishmentId}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Filtrer par Établissement" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous les Établissements</SelectItem>
      {allEstablishments.map(est => (
        <SelectItem key={est.id} value={String(est.id)}>
          {est.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


      <ModalTrip
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingTrip={editingTrip}
        onSave={handleSaveTrip}
        routes={currentDemoData.routes}
        buses={currentDemoData.buses}
        drivers={currentDemoData.users.filter(user => user.role === 'DRIVER')}
        establishments={currentDemoData.establishments}
        students={currentDemoData.students.filter(student => !student.deletedAt)}
        tripStudents={currentDemoData.tripStudents}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedTrips.length > 0 ? (
          paginatedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEditTrip={handleEditTrip}
              onDeleteTrip={handleDeleteTrip}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Aucun trajet trouvé.</p>
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

export default TripsPage;