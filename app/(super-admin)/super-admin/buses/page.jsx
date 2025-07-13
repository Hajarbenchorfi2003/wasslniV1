// components/BusPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data'; // Adjust path if needed
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils'; // For conditional classnames
import toast from 'react-hot-toast'; // For notifications
import { ModalBus } from '@/components/models/ModalBus'; // We'll create this next
import BusCard from './BusCard'; // You'll create this or use a generic card
import {fetchAllBuses,createBus,updateBus,deleteBus} from '@/services/bus.jsx';
import { fetchAllEstablishments} from '@/services/etablissements';
import { Input } from '@/components/ui/input';
// Import Shadcn UI Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust path if needed

const ITEMS_PER_PAGE = 6; // Number of buses per page for pagination

const BusPage = () => {
  // Use a state variable for demoData to ensure re-renders when it changes
  const [currentDemoData, setCurrentDemoData] = useState({
  buses: [],
  trips: [],
  establishments: []
});
  const [buses, setBuses] = useState([]);
  const [allBuses, setAllBuses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null); // null for add, bus object for edit
  const [currentPage, setCurrentPage] = useState(1);
  const [establishments, setEstablishments] = useState([]);
  const [filterEstablishmentId, setFilterEstablishmentId] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minCapacity, setMinCapacity] = useState('');
const [maxCapacity, setMaxCapacity] = useState('');


  // State for filtering by establishment
   // 'all' for no filter
const loadBuses = async (filters) => {
  try {
    setLoading(true);
    setError(null);
    const data = await fetchAllBuses(filters);
    console.log("Données reçues depuis l'API:", data);
    setAllBuses(data);
    setBuses(data);
  } catch (err) {
    console.error("Erreur lors du chargement des bus :", err);
    setError("Impossible de charger les bus. Vérifiez votre connexion.");
    toast.error("Erreur lors du chargement des buses");
  } finally {
    setLoading(false);
  }
};

// Charge les bus au montage du composant
useEffect(() => {
  loadBuses();
}, []);
useEffect(() => {
    let isMounted = true;

    async function loadEstablishments() {
      try {
        setLoading(true);
        const data = await fetchAllEstablishments();
       console.log("data",data)
        if (isMounted) {
          setEstablishments(data);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des établissements");
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEstablishments();

    return () => {
      isMounted = false;
    };
  }, []);
  // Effect to filter and set buses whenever currentDemoData or filterEstablishmentId changes
 useEffect(() => {
    if (!Array.isArray(allBuses)) return;

    let filtered = [...allBuses];

    // Filtre par établissement
    if (filterEstablishmentId !== 'all') {
      const id = parseInt(filterEstablishmentId);
      filtered = filtered.filter(bus => bus.establishmentId === id);
    }

    // Recherche textuelle
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        bus =>
          bus.plateNumber?.toLowerCase().includes(query) ||
          bus.marque?.toLowerCase().includes(query)
      );
    }

    // Ajout du nom de l’établissement
    const enrichedBuses = filtered.map(bus => ({
      ...bus,
      establishmentName: bus.establishment?.name || 'Non attribué'
    }));

    setBuses(enrichedBuses);
    setCurrentPage(1); // Réinitialiser à la première page

  }, [allBuses, filterEstablishmentId, search]);// Add filterEstablishmentId to dependency array
useEffect(() => {
  const filters = {};

  if (filterEstablishmentId !== 'all') {
    filters.establishmentId = filterEstablishmentId;
  }

  if (search.trim()) {
    filters.search = search.trim();
  }

  if (minCapacity !== '') {
    filters.minCapacity = parseInt(minCapacity, 10);
  }

  if (maxCapacity !== '') {
    filters.maxCapacity = parseInt(maxCapacity, 10);
  }

  // Appel à l'API avec les filtres
  loadBuses(filters);

}, [filterEstablishmentId, search, minCapacity, maxCapacity]);
  const totalPages = Math.ceil(buses.length / ITEMS_PER_PAGE);
  const paginatedBuses = buses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setIsModalOpen(true);
  };

  const handleDeleteBus = async (id) => {
  try {
    console.log(`Attempting to delete bus with ID: ${id}`);
    await deleteBus(id);
    await loadBuses();
    toast.success('Bus supprimé avec succès');
  } catch (error) {
    console.error("Erreur lors de la suppression du bus :", error);

    let errorMessage = 'Erreur inconnue';

    if (error.response) {
      // Le serveur a répondu avec un statut d'erreur (4xx, 5xx)
      errorMessage = error.response.data?.message || error.response.data?.error || 'Erreur lors de la suppression';
    } else if (error.request) {
      // Aucune réponse reçue du serveur
      errorMessage = 'Aucune réponse du serveur';
    } else {
      // Erreur pendant la requête
      errorMessage = error.message;
    }

    toast.error(`Échec de la suppression : ${errorMessage}`);
  }
};

  const handleSaveBus = async (busData) => {
    try {
      let message = '';
      let updatedBusesArray = [...currentDemoData.buses];

      if (editingBus) {

        
        const update=await updateBus(editingBus.id,busData)
         message = 'Bus update avec succès';
      } else {
        console.log(busData);
        const add=await createBus(busData);
        // const newId = Math.max(...currentDemoData.buses.map(b => b.id), 0) + 1;
        // const newBus = {
        //   ...busData,
        //   id: newId,
        // };
        // updatedBusesArray.push(newBus);
        message = 'Bus ajouté avec succès';
        console.log("New bus added:", add);
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        buses: updatedBusesArray,
      }));

      toast.success(message);
      await loadBuses();
      console.log("Save operation successful. Final buses array after save:", updatedBusesArray);
      setIsModalOpen(false);
      setEditingBus(null);

    } catch (error) {
      console.error('Error saving bus:', error);
      if (error.response?.data?.code === 'PLATE_NUMBER_EXISTS') {
      toast.error(`Erreur : ${error.response.data.error}`);
    } else {
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
      
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBus(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Gestion des Bus
        </div>
          <Button onClick={() => {
            setEditingBus(null);
            setIsModalOpen(true);
          }}>
            <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
            Ajouter un Bus
          </Button>
      </div>
 
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
  {/* Bloc filtres capacité + recherche */}
  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-wrap">
    <div className="relative">
      <Input 
        type="number"
        placeholder="Capacité min"
        value={minCapacity}
        onChange={(e) => setMinCapacity(e.target.value)}
        className="w-full sm:w-40 px-4 py-2 border rounded-lg focus:ring focus:ring-primary-200"
      />
    </div>

    <div className="relative">
      <Input
        type="number"
        placeholder="Capacité max"
        value={maxCapacity}
        onChange={(e) => setMaxCapacity(e.target.value)}
        className="w-full sm:w-40 px-4 py-2 border rounded-lg focus:ring focus:ring-primary-200"
      />
    </div>

    <div className="relative">
      <Input 
        type="text"
        placeholder="matricule, marque"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-40 px-4 py-2 border rounded-lg focus:ring focus:ring-primary-200"
      />
    </div>
  </div>

  {/* Select établissement */}
  <div className="w-full md:w-auto">
    <Select value={filterEstablishmentId} onValueChange={setFilterEstablishmentId}>
      <SelectTrigger className="w-full md:w-[250px]">
        <SelectValue placeholder="Filtrer par établissement" />
      </SelectTrigger>
      <SelectContent className>
        <SelectItem value="all">Toutes les Établissements</SelectItem>
        {establishments.map((establishment) => (
          <SelectItem key={establishment.id} value={String(establishment.id)}>
            {establishment.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>

      

      <ModalBus
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingBus={editingBus}
        onSave={handleSaveBus}
        establishments={establishments}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedBuses.length > 0 ? (
          paginatedBuses.map((bus) => (
            <BusCard
              key={bus.id}
              bus={bus}
              onEditBus={handleEditBus}
              onDeleteBus={handleDeleteBus}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Aucun bus trouvé.</p>
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

export default BusPage;