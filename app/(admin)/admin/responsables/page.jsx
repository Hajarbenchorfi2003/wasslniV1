'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalUser1 } from '@/components/models/modalResp';
import ResponsableCard from './ResponsableCard';
import { Input } from '@/components/ui/input';
  import {fetchResponsibles,register,updateUser,deleteUser} from '@/services/user';

const ITEMS_PER_PAGE = 3;

const ResponsablesPage = () => {
  const [currentDemoData, setCurrentDemoData] =useState({
  users: []
});
const [loading, setLoading] = useState(false);
  const [responsables, setResponsables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
 




useEffect(() => {
  let isMounted = true; // 🔥 Pour éviter les fuites de mémoire si le composant se démonte

  async function loadResponsibles() {
    if (loading || responsables.length > 0) {
      // 🚫 Évite de recharger si déjà en cours ou déjà chargé
      return;
    }

    setLoading(true);
    try {
      const data = await fetchResponsibles(); // Assurez-vous que cette fonction renvoie bien un tableau
      console.log("Données reçues depuis l'API:", data);

     
        // Met à jour la liste des responsables
        setResponsables(data);

        // Met à jour currentDemoData.users
        setCurrentDemoData((prev) => ({ ...prev, users: data }));

        console.log("Données mises à jour dans currentDemoData:", currentDemoData);
      
    } catch (error) {
      console.error('Erreur lors du chargement des responsables', error);
      toast.error("Impossible de charger les responsables");
    } finally {
      if (isMounted) {
        setLoading(false); // 🔄 Fin du chargement
      }
    }
  }

  loadResponsibles();

  // Nettoyage pour éviter les mises à jour sur un composant non monté
  return () => {
    isMounted = false;
  };
}, [loading]); // ⚠️ Tu peux retirer `responsables` si tu veux forcer le rechargement manuellement

  // Effect to filter and set responsables whenever currentDemoData or searchQuery changes
  useEffect(() => {
    
     
    console.log("currentDemoData or searchQuery updated, filtering responsables...");
    console.log("currentData",currentDemoData)
    const allResponsibles = currentDemoData.users;

    // Enrich responsable data with associated establishment names
    const enrichedResponsibles = allResponsibles.map(responsable => {
      // Find establishments where this responsable is the responsableId
      const establishmentNames = responsable.establishments?.map(e => e.name).join(', ') || 'Aucun établissement';
      console.log(establishmentNames)
   

      return {
        ...responsable,
        // Join multiple establishment names if a responsable is linked to several
        establishmentNames: establishmentNames
      };
    });

    // Apply search filter
    const filteredResponsibles = enrichedResponsibles.filter(responsable => {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      return (
        responsable.fullname.toLowerCase().includes(lowerCaseSearchQuery) ||
        responsable.email.toLowerCase().includes(lowerCaseSearchQuery) ||
        (responsable.phone && responsable.phone.toLowerCase().includes(lowerCaseSearchQuery)) ||
        (responsable.cin && responsable.cin.toLowerCase().includes(lowerCaseSearchQuery)) ||
        // NEW: Include establishmentNames in the search
        (responsable.establishmentNames && responsable.establishmentNames.toLowerCase().includes(lowerCaseSearchQuery))
      );
    });

    setResponsables(filteredResponsibles);

    // Adjust current page if the number of pages changes after an operation or filter
    const newTotalPages = Math.ceil(filteredResponsibles.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && filteredResponsibles.length > 0) {
      setCurrentPage(1);
    } else if (filteredResponsibles.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentDemoData, currentPage, searchQuery]);

  const totalPages = Math.ceil(responsables.length / ITEMS_PER_PAGE);
  const paginatedResponsables = responsables.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditResponsable = (responsable) => {
    setEditingUser(responsable);
    setIsModalOpen(true);
  };

  const handleDeleteResponsable = (id) => {
    try {
      console.log(`Attempting to delete user with ID: ${id}`);
      const updatedUsers = currentDemoData.users.filter(user => user.id !== id);

      const updatedEstablishments = currentDemoData.establishments.map(est => {
        if (est.responsableId === id) {
          return { ...est, responsableId: null };
        }
        return est;
      });

      setCurrentDemoData({
        ...currentDemoData,
        users: updatedUsers,
        establishments: updatedEstablishments,
      });

      toast.success('Responsable supprimé avec succès');
      console.log("User deleted successfully, updated demoData:", { users: updatedUsers, establishments: updatedEstablishments });
    } catch (error) {
      console.error('Error deleting responsible:', error);
      toast.error('Erreur lors de la suppression du responsable');
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      let message = '';
      let updatedUsersArray = [...currentDemoData.users];

      if (editingUser) {
        const response=await updateUser(editingUser.id,userData)
        const index = updatedUsersArray.findIndex(u => u.id === editingUser.id);
        if (index !== -1) {
          const userToUpdate = updatedUsersArray[index];

          const updatedUser = {
            ...userToUpdate,
            ...userData,
            id: editingUser.id,
            role: 'RESPONSIBLE',
            password: userData.password && userData.password.trim() !== '' ? userData.password : userToUpdate.password
          };

          updatedUsersArray[index] = updatedUser;
          message = 'Responsable modifié avec succès';
          console.log("User updated:", updatedUser);
        } else {
          console.warn("Editing user not found in current demoData.users:", editingUser);
          throw new Error("Utilisateur à modifier non trouvé.");
        }
      } else {
        const dataToSend = {
          ...userData,
         role: 'RESPONSIBLE'
         };

       console.log("Data being sent to register:",(dataToSend) );

       const response = await register(dataToSend);
       console.log(response);
        const newId = Math.max(...currentDemoData.users.map(u => u.id), 0) + 1; // Generate a numeric ID
        const newUser = {
          ...dataToSend,
          id: newId,
          createdAt: new Date().toISOString(),
        
        };
        updatedUsersArray.push(newUser);
        message = 'Responsable ajouté avec succès';
        console.log("New user added:", newUser);
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        users: updatedUsersArray,
      }));

      toast.success(message);
      console.log("Save operation successful. Final users array after save:", updatedUsersArray);
      setIsModalOpen(false);
      setEditingUser(null);

    }  catch (error) {
  let errorMessage = 'Erreur inconnue. Vérifiez les données ou réessayez plus tard.';

  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }

  console.error('Error saving user:', error);
  toast.error(`Erreur : ${errorMessage}`, {
    position: "bottom-right",
  });
}
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button Section */}
      <div className="flex items-center flex-wrap justify-between gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Responsables
        </h2>
      </div>

      {/* Search & Add Button Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Rechercher un responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon
            icon="heroicons:magnifying-glass"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
        </div>

        {/* Add responsable Button */}
        <Button onClick={() => {
          setEditingUser(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un responsable
        </Button>
      </div>

      <ModalUser1
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onSave={handleSaveUser}
        role="RESPONSIBLE" // Ensure role is correct
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedResponsables.length > 0 ? (
          paginatedResponsables.map((responsable) => (
            <ResponsableCard
              key={responsable.id}
              responsable={responsable}
              onEditResponsable={handleEditResponsable}
              onDeleteResponsable={handleDeleteResponsable}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Aucun responsable trouvé.</p>
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

export default ResponsablesPage;