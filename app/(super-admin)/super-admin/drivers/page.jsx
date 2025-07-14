'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalUser } from '@/components/models/ModalUser';
import DriverCard from './DriverCard';
import {fetchAllEstablishments} from '@/services/etablissements';
import {fetchDrivers,register,updateUser,deleteUser} from '@/services/user';

// Import shadcn/ui Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust this path if your components are organized differently

const ITEMS_PER_PAGE = 9;

const DriversPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // New state for filtering by establishment
  const [filterEstablishmentId, setFilterEstablishmentId] = useState('all'); // 'all' for no filter
 const [establishments, setEstablishments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [establishmentsLoading, setEstablishmentsLoading] = useState(false); 
  
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
}, []); // ✅ seulement au montage du composant
// 👈 pas `loading` global ici
console.log("etablisment",establishments)
 const loadDriver = async () => {
    setLoading(true);
    try {
      const data = await fetchDrivers(); // Récupère les données depuis l'API
     const safeDrivers = Array.isArray(data) ? data : [];// Met à jour l'état local
      setDrivers(safeDrivers);
    setCurrentDemoData(safeDrivers);
    
      console.log("Données reçues depuis l'API :", data); // ✅ Affiche directement les données
    } catch (error) {
      console.error('Erreur lors du chargement des parents', error);
      toast.error("Impossible de charger les parents");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  loadDriver();
}, []);
console.log("drivers",drivers)
  // Effect to filter and set Drivers whenever currentDemoData or filterEstablishmentId changes
 useEffect(() => {
  console.log("currentDemoData or filterEstablishmentId updated, filtering drivers...");

  let filteredDrivers = [...currentDemoData]; // Ici tu dois récupérer les utilisateurs

  if (filterEstablishmentId !== 'all') {
    const selectedId = parseInt(filterEstablishmentId);

    filteredDrivers = filteredDrivers.filter(driver => 
      driver.establishmentsLink && 
      driver.establishmentsLink.some(link => link.establishmentId === selectedId)
    );
  }

  setDrivers(filteredDrivers);

  const newTotalPages = Math.ceil(filteredDrivers.length / ITEMS_PER_PAGE);
  if (currentPage > newTotalPages && newTotalPages > 0) {
    setCurrentPage(newTotalPages);
  } else if (newTotalPages === 0 && filteredDrivers.length > 0) {
    setCurrentPage(1);
  } else if (filteredDrivers.length === 0 && currentPage !== 1) {
    setCurrentPage(1);
  }
}, [currentDemoData, filterEstablishmentId]);
 // Add filterEstablishmentId to dependency array

  const totalPages = Math.ceil(drivers.length / ITEMS_PER_PAGE);
  const paginatedDrivers = drivers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditDriver = (driver) => {
    setEditingUser(driver);
    setIsModalOpen(true);
  };

  const handleDeleteDriver =async (id) => {
    try {
      await deleteUser(id);
      console.log(`Attempting to delete user with ID: ${id}`);
    

      toast.success('Chauffeur supprimé avec succès');
       await loadDriver();
      
    } catch (error) {
      console.error('Error deleting driver:', error);
      
      toast.error(
      `Erreur lors de la sauvegarde: ${error.response?.data?.message || error.message || 'Vérifiez les données.'}`,
      { position: 'bottom-right' }
    );
    }
  };

  const handleSaveUser = async (userData) => {
  try {
    let message = '';

    if (editingUser) {
      await updateUser(editingUser.id,userData);
      message = 'Chauffeur mis à jour avec succès';
    } else {
      const newUser = {
        ...userData,
        role: 'DRIVER',
      };

      await register(newUser);
      message = 'Chauffeur ajouté avec succès';
      console.log("New driver added:", newUser);
    }

    // 🔄 Charger les données uniquement après succès
    await loadDriver();

    // ✅ Message de succès en bas à droite
    toast.success(message, { position: 'bottom-right' });

    setIsModalOpen(false);
    setEditingUser(null);

  } catch (error) {
    console.error('Error saving user:', error);

    // ✅ Message d'erreur clair en bas à droite
    toast.error(
      `Erreur lors de la sauvegarde: ${error.response?.data?.message || error.message || 'Vérifiez les données.'}`,
      { position: 'bottom-right' }
    );
  }
};


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
        Gestion des drivers
        </h2>
      </div>  
      <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Filter by Establishment using shadcn/ui Select */}
          <Select onValueChange={setFilterEstablishmentId} value={filterEstablishmentId}>
            <SelectTrigger  className="w-full max-w-md">
              <SelectValue placeholder="Filtrer par établissement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les Établissements</SelectItem>
              {establishments.map((establishment) => (
                <SelectItem key={establishment.id} value={String(establishment.id)}>
                  {establishment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}>
            <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
            Ajouter un Driver
          </Button>
        </div>
 

      <ModalUser
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onSave={handleSaveUser}
        role="DRIVER"
        establishments={establishments}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedDrivers.length > 0 ? (
          paginatedDrivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onEditDriver={handleEditDriver}
              onDeleteDriver={handleDeleteDriver}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Aucun Driver trouvé.</p>
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

export default DriversPage;