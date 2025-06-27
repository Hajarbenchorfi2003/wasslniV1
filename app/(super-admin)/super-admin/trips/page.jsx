'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalTrip } from '@/components/models/ModalTrip';
import TripCard from './TripCard';
import {fetchAllEstablishments} from '@/services/etablissements';
import {fetchAllBuses} from '@/services/bus.jsx';
import {fetchroute}  from '@/services/route';
import {fetchDrivers} from '@/services/user';
import {fetchAlltrip,createtrip,createtripStudents,updatetrip,removeStudentFromTrip,deleteTrip} from '@/services/trips';

// Import shadcn/ui Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 9;


const TripsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState([]);
  const [trips, setTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [establishments, setEstablishments] = useState([]);
  const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
   const [establishmentsLoading, setEstablishmentsLoading] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [loadingbus, setLoadingbus] = useState(false);
  const [loadingroute, setLoadingroute] = useState(false);
  const [loadingdriver, setLoadindriver] = useState(false);
 
    
   useEffect(() => {
    let isMounted = true;
  
    async function loadEstablishments() {
      setEstablishmentsLoading(true);
      try {
        const data = await fetchAllEstablishments();
        console.log("Établissements reçus :", data);
  
        if (isMounted && data && Array.isArray(data)) {
          setEstablishments(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des établissements', error);
        toast.error("Impossible de charger les établissements");
      } finally {
        if (isMounted) {
          setEstablishmentsLoading(false);
        }
      }
    }
  
    // Charger seulement si non encore chargés
    if (establishments.length === 0) {
      loadEstablishments();
    }
  
    return () => {
      isMounted = false;
    };
  }, []);
  const loadBuses = async (filters) => {
    try {
      setLoadingbus(true);
      
      const data = await fetchAllBuses(filters);
      console.log("Données reçues depuis l'API:", data);
     
      setBuses(data);
    } catch (err) {
      console.error("Erreur lors du chargement des bus :", err);
      
      toast.error("Erreur lors du chargement des buses");
    } finally {
      setLoading(false);
    }
  };
  
  // Charge les bus au montage du composant
  useEffect(() => {
    loadBuses();
  }, []);
   const loadRoute = async () => {
      setLoadingroute(true);
      try {
        const data = await fetchroute(); // Récupère les données depuis l'API
        setRoutes(data || []); // Met à jour l'état local
        
        console.log("Données reçues depuis l'API :", data); // ✅ Affiche directement les données
      } catch (error) {
        console.error('Erreur lors du chargement des parents', error);
        toast.error("Impossible de charger les routes");
      } finally {
        setLoadingroute(false);
      }
    };
  useEffect(() => {
    loadRoute();
  }, []);
 const loadDriver = async () => {
    setLoadindriver(true);
    try {
      const data = await fetchDrivers(); // Récupère les données depuis l'API
      setDrivers(data || []); // Met à jour l'état local
      
      console.log("Données reçues depuis l'API :", data); // ✅ Affiche directement les données
    } catch (error) {
      console.error('Erreur lors du chargement des parents', error);
      toast.error("Impossible de charger les parents");
    } finally {
      setLoadindriver(false);
    }
  };
useEffect(() => {
  loadDriver();
}, []);

 
const [error, setError] = useState(null);

// New states for filters
const [filterRouteId, setFilterRouteId] = useState('all');
const [filterBusId, setFilterBusId] = useState('all');
const [filterDriverId, setFilterDriverId] = useState('all');
const [filterEstablishmentId, setFilterEstablishmentId] = useState('all');



 const fetchTripsWithFilters = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};

      if (filterRouteId !== 'all') filters.routeId = parseInt(filterRouteId);
      if (filterBusId !== 'all') filters.busId = parseInt(filterBusId);
      if (filterDriverId !== 'all') filters.driverId = parseInt(filterDriverId);
      if (filterEstablishmentId !== 'all') filters.establishmentId = parseInt(filterEstablishmentId);

      // Appel vers le backend
      const data = await fetchAlltrip(filters);
      console.log("data api",data)
      
      setTrips(data.data); // On stocke les trajets reçus du backend
      setCurrentPage(1); // Réinitialise à la première page après filtrage
    } catch (err) {
      setError(err.message);
      toast.error(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {  fetchTripsWithFilters();
}, [
  filterRouteId,
  filterBusId,
  filterDriverId,
  filterEstablishmentId,
]);
console.log("trips",trips)

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

  const handleDeleteTrip =async (id) => {
    try {
      await deleteTrip(id);
      await fetchTripsWithFilters();

      toast.success('Trajet supprimé avec succès');
    } catch (error) {
       let errorMessage = 'Erreur inconnue';

    // Récupère le message d'erreur depuis le backend si disponible
    if (error.response) {
      // Erreur HTTP (ex: 400, 500)
      errorMessage = error.response.data?.error || error.response.data?.message || 'Erreur serveur';
    } else if (error.request) {
      // Aucune réponse reçue (problème réseau)
      errorMessage = 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    } else {
      // Erreur côté client
      errorMessage = error.message || 'Erreur lors de la suppression';
    }

    console.error('Erreur lors de la suppression du trajet :', errorMessage);

    // Affiche l'erreur en bas à droite
    toast.error(`Erreur : ${errorMessage}`, {
      position: "bottom-right"});
    }
  };
const [initialStudentIds, setInitialStudentIds] = useState([]);

useEffect(() => {
  if (editingTrip && editingTrip.tripStudents) {
    const ids = editingTrip.tripStudents.map(ts => ts.studentId);
    setInitialStudentIds(ids);
  }
}, [editingTrip]);
  const handleSaveTrip = async (tripData) => {
    try {
      let message = '';

      if (editingTrip) {
           await updatetrip(editingTrip.id, tripData);
          const currentStudentIds = tripData.studentIds;
             // 🟢Ajouter les nouveaux élèves
         const studentsToAdd = currentStudentIds.filter(id => !initialStudentIds.includes(id));
         const data={studentIds:studentsToAdd};
            if (studentsToAdd.length > 0) {
            await createtripStudents(editingTrip.id, data);
           }

    // Supprimer les élèves retirés
          const studentsToRemove = initialStudentIds.filter(id => !currentStudentIds.includes(id));
         for (const studentId of studentsToRemove) {
           await removeStudentFromTrip(editingTrip.id, studentId);
           }
           message = 'Trajet modfié avec succès';
      } else {
         const dataAdd={ ...tripData, busId: parseInt(tripData.busId),
          driverId: parseInt(tripData.driverId),
          routeId: parseInt(tripData.routeId),
          establishmentId: parseInt(tripData.establishmentId),};
         const tripAdd=await createtrip(dataAdd);
         
          if (Array.isArray(tripData.studentIds) && tripData.studentIds.length > 0) {
            const data={studentIds:tripData.studentIds};
             await createtripStudents(tripAdd.id,data);
           console.log("Élèves assignés avec succès");
            } else {
           console.warn("Aucun élève sélectionné ou format incorrect");
           }

        message = 'Trajet ajouté avec succès';

       
      }

      await fetchTripsWithFilters();

      toast.success(message);
      setIsModalOpen(false);
      setEditingTrip(null);

    } catch (error) {
     let errorMessage = 'Erreur inconnue';

    if (error.response) {
      // Erreur côté serveur (ex: 400, 500)
      errorMessage = error.response.data?.error || error.response.data?.message || 'Erreur serveur';
    } else if (error.request) {
      // Aucune réponse reçue
      errorMessage = 'Impossible de joindre le serveur';
    } else {
      // Erreur locale
      errorMessage = error.message;
    }

    // Affichage de l'erreur en bas à droite
    toast.error(`Erreur : ${errorMessage}`, {
      position: "bottom-right"
    });

    console.error('Error saving trip:', error);
  }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  // Helper arrays for Select options
  const allRoutes =routes;
  const allBuses = buses;
  const allDrivers = drivers;
  const allEstablishments = establishments;

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
        routes={routes}
        buses={buses}
        drivers={drivers}
        establishments={establishments}
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