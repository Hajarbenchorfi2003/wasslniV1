'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data'; // Import initialDemoData
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalUser } from '@/components/models/ModalUser';
import DriverCard from './DriverCard';

// Import shadcn/ui Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust this path if your components are organized differently

const ITEMS_PER_PAGE = 3;

const DriversPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // New state for filtering by establishment
  const [filterEstablishmentId, setFilterEstablishmentId] = useState('all'); // 'all' for no filter

  // Effect to filter and set Drivers whenever currentDemoData or filterEstablishmentId changes
  useEffect(() => {
    console.log("currentDemoData or filterEstablishmentId updated, filtering drivers...");
    const allDrivers = currentDemoData.users.filter(user => user.role === 'DRIVER');

    // Enrich drivers with associated establishment names
    let enrichedDrivers = allDrivers.map(driver => {
      const associatedEstablishmentIds = currentDemoData.trips
        .filter(trip => trip.driverId === driver.id)
        .map(trip => trip.establishmentId);

      const uniqueEstablishmentIds = [...new Set(associatedEstablishmentIds)];

      const establishmentNames = uniqueEstablishmentIds.map(establishmentId => {
        const establishment = currentDemoData.establishments.find(e => e.id === establishmentId);
        return establishment ? establishment.name : 'N/A';
      });

      return {
        ...driver,
        establishmentNames: establishmentNames.length > 0 ? establishmentNames.join(', ') : 'N/A',
        // Also add the raw IDs for filtering purposes
        associatedEstablishmentIds: uniqueEstablishmentIds
      };
    });

    // Apply filter if an establishment is selected
    if (filterEstablishmentId !== 'all') {
      const selectedId = parseInt(filterEstablishmentId);
      enrichedDrivers = enrichedDrivers.filter(driver =>
        driver.associatedEstablishmentIds.includes(selectedId)
      );
    }

    setDrivers(enrichedDrivers);

    const newTotalPages = Math.ceil(enrichedDrivers.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && enrichedDrivers.length > 0) {
      setCurrentPage(1);
    } else if (enrichedDrivers.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentDemoData, currentPage, filterEstablishmentId]); // Add filterEstablishmentId to dependency array

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

  const handleDeleteDriver = (id) => {
    try {
      console.log(`Attempting to delete user with ID: ${id}`);
      const updatedUsers = currentDemoData.users.filter(user => user.id !== id);

      const updatedTrips = currentDemoData.trips.map(trip => {
        if (trip.driverId === id) {
          return { ...trip, driverId: null };
        }
        return trip;
      });

      const updatedAttendances = currentDemoData.attendances.map(attendance => {
        if (attendance.markedById === id) {
          return { ...attendance, markedById: null };
        }
        return attendance;
      });

      const updatedIncidents = currentDemoData.incidents.map(incident => {
        if (incident.reportedById === id) {
          return { ...incident, reportedById: null };
        }
        return incident;
      });

      setCurrentDemoData(prevData => ({
        ...prevData, // Use prevData to ensure all other data remains
        users: updatedUsers,
        trips: updatedTrips,
        attendances: updatedAttendances,
        incidents: updatedIncidents,
      }));

      toast.success('Driver supprimé avec succès');
      console.log("User deleted successfully, updated demoData:", { users: updatedUsers, trips: updatedTrips });
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Erreur lors de la suppression du Driver');
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      let message = '';
      let updatedUsersArray = [...currentDemoData.users];

      if (editingUser) {
        const index = updatedUsersArray.findIndex(u => u.id === editingUser.id);
        if (index !== -1) {
          const userToUpdate = updatedUsersArray[index];

          const updatedUser = {
            ...userToUpdate,
            ...userData,
            id: editingUser.id,
            role: 'DRIVER',
            password: userData.password && userData.password.trim() !== '' ? userData.password : userToUpdate.password
          };

          updatedUsersArray[index] = updatedUser;
          message = 'Driver modifié avec succès';
          console.log("Driver updated:", updatedUser);

        } else {
          console.warn("Editing user not found in current demoData.users:", editingUser);
          throw new Error("Utilisateur à modifier non trouvé.");
        }
      } else {
        const newId = Math.max(...currentDemoData.users.map(u => u.id), 0) + 1;
        const newUser = {
          ...userData,
          id: newId,
          createdAt: new Date().toISOString(),
          role: 'DRIVER',
          isActive: true,
        };
        updatedUsersArray.push(newUser);
        message = 'Driver ajouté avec succès';
        console.log("New driver added:", newUser);
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        users: updatedUsersArray,
      }));

      toast.success(message);
      console.log("Save operation successful. Final users array after save:", updatedUsersArray);
      setIsModalOpen(false);
      setEditingUser(null);

    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
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
              {currentDemoData.establishments.map((establishment) => (
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
        establishments={currentDemoData.establishments}
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