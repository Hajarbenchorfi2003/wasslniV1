// pages/manager/TripsPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data'; // Votre source de données
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalTrip } from '@/components/models/ModalTrip'; // Modale pour ajouter/modifier un trajet
import TripCard from './TripCard'; // Le composant carte pour chaque trajet

// Composants Shadcn/ui pour les filtres et le layout
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input'; // Champ de recherche
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'; // Composants Card pour la mise en page générale

const ITEMS_PER_PAGE = 6; // Affichera 6 trajets par page (ex: 2 lignes de 3 cartes)

// Ce composant est conçu pour être utilisé par un gestionnaire d'établissement,
// il attend donc `managerEstablishmentId` comme prop.
export const TripsPage = ({ managerEstablishmentId }) => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [trips, setTrips] = useState([]); // Liste des trajets après enrichissement et filtrage initial par établissement
  const [filteredTrips, setFilteredTrips] = useState([]); // Liste des trajets après application des filtres
  const [isModalOpen, setIsModalOpen] = useState(false); // État de visibilité de la modale d'ajout/modification
  const [editingTrip, setEditingTrip] = useState(null); // Trajet en cours d'édition (null si ajout)
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination

  // États des filtres (maintenus pour la clarté, même si certains sont prédéfinis par managerEstablishmentId)
  const [filterRouteId, setFilterRouteId] = useState('all');
  const [filterBusId, setFilterBusId] = useState('all');
  const [filterDriverId, setFilterDriverId] = useState('all');
  // Le filtre d'établissement est implicite pour le gestionnaire, mais gardons l'état pour sa valeur par défaut
  const [filterEstablishmentId, setFilterEstablishmentId] = useState(String(managerEstablishmentId || 'all')); // Initialise avec l'établissement du gestionnaire

  // Utilise l'ID de l'établissement du gestionnaire. Si non fourni, simule avec l'ID 1.
  const effectiveManagerEstablishmentId = managerEstablishmentId || 1;
  const establishmentName = currentDemoData.establishments.find(e => e.id === effectiveManagerEstablishmentId)?.name || 'Votre Établissement';


  // Effet pour enrichir les trajets et les filtrer par établissement
  useEffect(() => {
    if (!effectiveManagerEstablishmentId) {
      setTrips([]);
      return;
    }

    // 1. Filtrer les trajets par l'établissement du gestionnaire dès le début
    const establishmentTrips = currentDemoData.trips.filter(
        trip => trip.establishmentId === effectiveManagerEstablishmentId
    );

    // 2. Enrichir les trajets filtrés
    let enrichedTrips = establishmentTrips.map(trip => {
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

    setTrips(enrichedTrips); // Store the fully enriched and establishment-filtered list
    setCurrentPage(1); // Reset page on base data change
  }, [currentDemoData, effectiveManagerEstablishmentId]); // Depend on currentDemoData and managerEstablishmentId

  // Effect to apply additional filters and handle pagination
  useEffect(() => {
    let tempFilteredTrips = [...trips]; // Start with trips already filtered by establishment

    // Apply route filter
    if (filterRouteId !== 'all') {
      tempFilteredTrips = tempFilteredTrips.filter(trip =>
        trip.routeId === parseInt(filterRouteId)
      );
    }
    // Apply bus filter
    if (filterBusId !== 'all') {
      tempFilteredTrips = tempFilteredTrips.filter(trip =>
        trip.busId === parseInt(filterBusId)
      );
    }
    // Apply driver filter
    if (filterDriverId !== 'all') {
      tempFilteredTrips = tempFilteredTrips.filter(trip =>
        trip.driverId === parseInt(filterDriverId)
      );
    }
    // Note: filterEstablishmentId is implicitly applied by the initial `setTrips` filter

    setFilteredTrips(tempFilteredTrips);

    const newTotalPages = Math.ceil(tempFilteredTrips.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && tempFilteredTrips.length > 0) {
      setCurrentPage(1);
    } else if (tempFilteredTrips.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [trips, currentPage, filterRouteId, filterBusId, filterDriverId]); // Depend on base trips and filter states

  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const paginatedTrips = filteredTrips.slice(
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

  // Helper arrays for Select options (filtered by manager's establishment)
  const allRoutes = currentDemoData.routes.filter(r => r.establishmentId === effectiveManagerEstablishmentId);
  const allBuses = currentDemoData.buses.filter(b => b.establishmentId === effectiveManagerEstablishmentId);
  const allDrivers = currentDemoData.users.filter(user => user.role === 'DRIVER' && currentDemoData.trips.some(t => t.driverId === user.id && t.establishmentId === effectiveManagerEstablishmentId));
  const allEstablishments = [currentDemoData.establishments.find(e => e.id === effectiveManagerEstablishmentId)]; // Only manager's establishment for context

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Trajets (Plans) de {establishmentName}
        </h2>
        <Button onClick={() => {
          setEditingTrip(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Trajet
        </Button>
      </div>

      {/* --- Filters Section --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
      </div>

      <ModalTrip
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingTrip={editingTrip}
        onSave={handleSaveTrip}
        routes={allRoutes} // Pass filtered routes
        buses={allBuses} // Pass filtered buses
        drivers={allDrivers} // Pass filtered drivers
        establishments={allEstablishments} // Pass only manager's establishment for context
        students={currentDemoData.students.filter(student => student.establishmentId === effectiveManagerEstablishmentId && !student.deletedAt)} // Students only from this establishment
        tripStudents={currentDemoData.tripStudents}
        fixedEstablishmentId={effectiveManagerEstablishmentId} // Force new/edited trips to manager's establishment
      />

      {/* Main content area: Grid of Trip Cards */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:route" className="h-6 w-6 text-primary" />
            Liste des Trajets
          </CardTitle>
          <CardDescription>
            Nombre total de trajets filtrés: {filteredTrips.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {paginatedTrips.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onEditTrip={handleEditTrip}
                  onDeleteTrip={handleDeleteTrip}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">Aucun trajet trouvé.</p>
          )}
        </CardContent>
      </Card>

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