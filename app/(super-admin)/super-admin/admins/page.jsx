'use client';

import { useState, useEffect } from 'react';
 // No need for getSchoolAdmins import here
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalUser } from '@/components/models/ModalUser';
import AdminCard from './AdminCard';
import { Input } from '@/components/ui/input'; // Import Input component
import {fetchAdmins,register,updateUser,deleteUser} from '@/services/user.jsx';

const ITEMS_PER_PAGE = 3;

const AdminsPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState({
  users: [],
  schools: [],
  userSchools: [],
});
  const [admins, setAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query
  const [filteredAndPaginatedAdmins, setFilteredAndPaginatedAdmins] = useState([]);
useEffect(() => {
  console.log("i am in fetching")
  async function loadAdmins() {
    try {
      const data = await fetchAdmins(); // Supposons que cela renvoie simplement un tableau d'admins
      console.log("Données reçues depuis l'API:", data);

      // ✅ Mettez à jour avec les données venant de l'API
      const enrichedAdmins = data.map(admin => ({
        ...admin,
        schoolNames: admin.schools?.join(', ') || 'Aucune école'
      }));

      setAdmins(enrichedAdmins);
      setCurrentDemoData({
        users: data,
        schools: [], // À remplir si nécessaire
        userSchools: [] // À remplir si nécessaire
      });

    } catch (error) {
      console.error('Erreur lors du chargement des admins', error);
      toast.error("Impossible de charger les administrateurs");
    }
  }

  loadAdmins();
}, []);
 console.log( "data",currentDemoData);
  // Effect to filter and set admins whenever currentDemoData or searchQuery changes
  useEffect(() => {
    console.log("currentDemoData or searchQuery updated, filtering admins...");
    let currentAdmins = currentDemoData.users.filter(user => user.role === 'ADMIN');

    // Enrich admin data with school names
    const enrichedAdmins = currentAdmins.map(admin => {
      const associatedSchoolIds = currentDemoData.userSchools
        .filter(us => us.userId === admin.id)
        .map(us => us.schoolId);

      const schoolNames = associatedSchoolIds.map(schoolId => {
        const school = currentDemoData.schools.find(s => s.id === schoolId);
        return school ? school.name : 'N/A';
      });

      return {
        ...admin,
        schoolNames: schoolNames.join(', ')
      };
    });

    // Apply search filter
    const lowerCaseQuery = searchQuery.toLowerCase();
    const searchedAdmins = enrichedAdmins.filter(admin => {
      return (
        admin.fullname.toLowerCase().includes(lowerCaseQuery) ||
        admin.email.toLowerCase().includes(lowerCaseQuery) ||
        admin.phone.toLowerCase().includes(lowerCaseQuery) ||
        admin.cin.toLowerCase().includes(lowerCaseQuery) ||
        (admin.schoolNames && admin.schoolNames.toLowerCase().includes(lowerCaseQuery))
      );
    });

    setAdmins(searchedAdmins); // Set the filtered admins (before pagination)
  }, [currentDemoData, searchQuery]);

  // Effect for pagination whenever admins or currentPage changes
  useEffect(() => {
    const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);
    const paginated = admins.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
    setFilteredAndPaginatedAdmins(paginated);

    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && admins.length > 0) {
      setCurrentPage(1);
    } else if (admins.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [admins, currentPage]);


  const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE); // Calculate total pages based on `admins` (after search)


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditAdmin = (admin) => {

    console.log("edit admin",admin);
    setEditingUser(admin);
    setIsModalOpen(true);
  };

  const handleDeleteAdmin  = async (id) => { 
    try {
      console.log(`Attempting to delete user with ID: ${id}`);
      const response = await deleteUser(id); 
      const updatedUsers = currentDemoData.users.filter(user => user.id !== id);
       toast.success('Admin supprimé avec succès', {
    position: "bottom-right",
  });
      const updatedEstablishments = currentDemoData.establishments.map(est => {
        if (est.responsableId === id) {
          return { ...est, responsableId: null };
        }
        return est;
      });

      const updatedUserSchools = currentDemoData.userSchools.filter(us => us.userId !== id);

      setCurrentDemoData({
        ...currentDemoData,
        users: updatedUsers,
        establishments: updatedEstablishments,
        userSchools: updatedUserSchools,
      });

      toast.success('Admin supprimé avec succès');
      console.log("User deleted successfully, updated demoData:", { users: updatedUsers, establishments: updatedEstablishments, userSchools: updatedUserSchools });
    }  catch (error) {
    console.error('Error deleting admin:', error);
    
    // Gestion fine de l'erreur pour affichage utilisateur
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'Erreur lors de la suppression de l\'Admin';

    toast.error(`Erreur : ${errorMessage}`, {
    position: "bottom-right",
  });
  }
  };

  const handleSaveUser = async (userData) => {
    try {
      console.log( "DATA WANT TO ADD",userData)
       
      let message = '';
      let updatedUsersArray = [...currentDemoData.users];
      let updatedUserSchoolsArray = [...currentDemoData.userSchools];

      if (editingUser) {
        const response=await updateUser(editingUser.id,userData)
        const index = updatedUsersArray.findIndex(u => u.id === editingUser.id);
        if (index !== -1) {
          const userToUpdate = updatedUsersArray[index];

          const updatedUser = {
            ...userToUpdate,
            ...userData,
            id: editingUser.id,
            role: 'ADMIN',
            password: userData.password && userData.password.trim() !== '' ? userData.password : userToUpdate.password
          };

          updatedUsersArray[index] = updatedUser;
          message = 'Admin modifié avec succès';
          console.log("User updated:", updatedUser);

          if (userData.schoolId) {
            const existingLinkIndex = updatedUserSchoolsArray.findIndex(us => us.userId === updatedUser.id && us.schoolId === userData.schoolId);
            if (existingLinkIndex === -1) {
              updatedUserSchoolsArray.push({ userId: updatedUser.id, schoolId: userData.schoolId });
              console.log(`Linked existing admin ${updatedUser.id} to school ${userData.schoolId}`);
            }
          }
        } else {
          console.warn("Editing user not found in current demoData.users:", editingUser);
          throw new Error("Utilisateur à modifier non trouvé.");
        }
      } else {
        // Vérification des champs obligatoires
    const requiredFields = ['email', 'password', 'fullname', 'phone'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Les champs suivants sont manquants : ${missingFields.join(', ')}`);
    }
        const dataToSend = {
          ...userData,
         role: 'ADMIN'
         };

       console.log("Data being sent to register:",(dataToSend) );

       const response = await register(dataToSend);
       console.log(response);
        const newId = Math.max(...currentDemoData.users.map(u => u.id), 0) + 1;
        const newUser = {
          ...dataToSend,
          id: newId,
          createdAt: new Date().toISOString(),
          role: 'ADMIN',
          
        };
        updatedUsersArray.push(newUser);
        message = 'Admin ajouté avec succès';
        console.log("New user added:", newUser);

        if (userData.schoolId) {
          updatedUserSchoolsArray.push({ userId: newId, schoolId: userData.schoolId });
          console.log(`Linked new admin ${newId} to school ${userData.schoolId}`);
        }
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        users: updatedUsersArray,
        userSchools: updatedUserSchoolsArray,
      }));toast.success(message, {
       position: "bottom-right",
    });

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
         Gestion des admins
        </h2>
      </div>

      {/* Search & Add Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
         {/* Search Input */}
        <div className="relative w-full max-w-md">
        <Input
          type="text"
          placeholder="Rechercher un admin..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-md w-full"
        />
        <Icon
          icon="heroicons:magnifying-glass"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        />
      </div>

        {/* Add Admin Button */}
        <Button onClick={() => {
          setEditingUser(null);
          setIsModalOpen(true);
          }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Admin
        </Button>
     </div>
      <ModalUser
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onSave={handleSaveUser}
        role="ADMIN"
        schools={currentDemoData.schools}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndPaginatedAdmins.length > 0 ? (
          filteredAndPaginatedAdmins.map((admin) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onEditAdmin={handleEditAdmin}
              onDeleteAdmin={handleDeleteAdmin}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            {searchQuery ? `Aucun Admin trouvé pour &quot;${searchQuery}&quot;.` : 'Aucun Admin trouvé.'}
          </p>
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

export default AdminsPage;