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
import{fetchdailytrip,createDailyTrip,updateDailyTrip,deleteDailyTrip} from '@/services/dailyTrip';
import {fetchUserEstablishments} from '@/services/etablissements';
import {fetchDrivers} from '@/services/user';
import {fetchAlltrip} from '@/services/trips';

 
// Import shadcn/ui Select and Input components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Make sure you have this installed: npx shadcn-ui@latest add input
import { date } from 'zod';



const DailyTripsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [dailyTrips, setDailyTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDailyTrip, setEditingDailyTrip] = useState(null);

const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const ITEMS_PER_PAGE = 10;
  // States for existing filters
  const [filterTripId, setFilterTripId] = useState('all');
  const [filterDriverId, setFilterDriverId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEstablishmentsId, setFilterEstablishmentsId] = useState('all');

  // New states for search functionality
 
  const [searchDate, setSearchDate] = useState(''); // For specific date search (YYYY-MM-DD)
  const[establishments,setEstablishments]=useState([]);
 const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [establishmentsLoading, setEstablishmentsLoading] = useState(false); 
  const [loading, setLoading] = useState(false);
   
    const [loadingtrip, setLoadingtrip] = useState(false);
    const [loadingdriver, setLoadingdriver] = useState(false);
   
    const loadtrip = async () => {
    try {
     setLoadingtrip(true);
      
      const data = await fetchAlltrip();
     
      setTrips(data.data);
    } catch (err) {
      console.error("Erreur lors du chargement des bus :", err);
      
      toast.error("Erreur lors du chargement des buses");
    } finally {
      setLoadingtrip(false);
    }
  };
  
  // Charge les bus au montage du composant
  useEffect(() => {
    loadtrip();
  }, []); 
    
    const loadDriver = async () => {
      try {
        setLoadingdriver(true);
        
        const data = await fetchDrivers();
       
        setDrivers(data);
      } catch (err) {
        console.error("Erreur lors du chargement des bus :", err);
        
        toast.error("Erreur lors du chargement des buses");
      } finally {
        setLoadingdriver(false);
      }
    };
    
    // Charge les bus au montage du composant
    useEffect(() => {
      loadDriver();
    }, []);
       useEffect(() => {
      let isMounted = true;
    
      async function loadEstablishments() {
        setEstablishmentsLoading(true);
        try {
          const data = await fetchUserEstablishments();
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


const fetchDailyTripsWithFilters = async () => {
        setLoading(true);
       setError(null);

  try {
    const filters = {};

    if (filterTripId !== 'all') filters.tripId = parseInt(filterTripId);
    if (filterEstablishmentsId !== 'all') filters.establishmentId = parseInt(filterEstablishmentsId);
    if (filterDriverId !== 'all') filters.driverId = parseInt(filterDriverId);
    if (filterStatus !== 'all') filters.status = filterStatus;
    if (searchDate) filters.date = searchDate;
    

    // Appel vers le backend
    const data = await fetchdailytrip(filters);
    
    console.log("Données reçues depuis l'API :", data);

    // ✅ Extraction des données avec gestion robuste
    const tripsData = Array.isArray(data.data) ? data.data : [];
    const pagination = data.pagination || {};
    console.log(pagination)

    setDailyTrips(tripsData);
    setTotalPages(pagination.totalPages|| 1);
    setCurrentPage(pagination.page || 1);

  } catch (err) {
    let errorMessage = "Erreur lors du chargement des trajets quotidiens";

    if (err.response?.data?.error || err.response?.data?.message) {
      errorMessage = err.response.data.error || err.response.data.message;
    } else if (err.request) {
      errorMessage = "Aucune réponse du serveur";
    } else if (err.message) {
      errorMessage = err.message;
    }

    setError(errorMessage);
    toast.error(`Erreur : ${errorMessage}`, {
      position: "bottom-right"
    });

    setDailyTrips([]);

  } finally {
    setLoading(false);
  }
  };
    useEffect(() => {
     fetchDailyTripsWithFilters();
    }, [
      filterTripId,
      filterEstablishmentsId,
      filterDriverId,
      filterStatus,
      searchDate,
      currentPage,
    ]);

 
 
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

  const handleDeleteDailyTrip =async (id) => {
    try {
      await deleteDailyTrip(id)
     
      await fetchDailyTripsWithFilters();
      toast.success('Trajet quotidien supprimé avec succès');
    } catch (error) {
    let errorMessage = 'Erreur inconnue';

    // ✅ Récupère l'erreur depuis le serveur si possible
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.request) {
      errorMessage = 'Aucune réponse du serveur';
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erreur lors de la sauvegarde :', errorMessage);
    
    // Affichage de l'erreur utilisateur
    toast.error(`Erreur : ${errorMessage}`, {
      position: "bottom-right", // Notification en bas à droite
      duration: 5000,
    });
  }
  };

  const handleSaveDailyTrip = async (dailyTripData) => {
  try {
    let message = '';

    if (editingDailyTrip) {
      const status = {status:dailyTripData.status};
      console.log(status)
      await updateDailyTrip(editingDailyTrip.id, status);
      message = 'Trajet quotidien modifié avec succès';
    } else {
      console.log("data",dailyTripData)
      await createDailyTrip(dailyTripData);
      message = 'Trajet quotidien ajouté avec succès';
    }

    await fetchDailyTripsWithFilters();

    toast.success(message);
    setIsModalOpen(false);
    setEditingDailyTrip(null);

  } catch (error) {
    let errorMessage = 'Erreur inconnue';

    // ✅ Récupère l'erreur depuis le serveur si possible
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.request) {
      errorMessage = 'Aucune réponse du serveur';
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erreur lors de la sauvegarde :', errorMessage);
    
    // Affichage de l'erreur utilisateur
    toast.error(`Erreur : ${errorMessage}`, {
      position: "bottom-right", // Notification en bas à droite
      duration: 5000,
    });
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
      {trips.map((trip) => (
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
      {drivers.map((driver) => (
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
        trips={trips}
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

      {totalPages >1 && (
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