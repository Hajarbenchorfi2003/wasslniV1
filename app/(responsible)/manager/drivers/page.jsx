// pages/DriversPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalUser } from '@/components/models/ModalUser'; // Assumed path for ModalUser
import DriverCard from './DriverCard'; // Ensure this path is correct

// Import shadcn/ui components
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 6; // Changed to 6 for a 3-column grid (2 rows)

// IMPORTANT: This component now *requires* managerEstablishmentId as a prop
export const DriversPage = ({ managerEstablishmentId =1 }) => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [drivers, setDrivers] = useState([]); // All DRIVERs after initial enrichment
  const [filteredDrivers, setFilteredDrivers] = useState([]); // Drivers after applying search filter
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Get the establishment name for the title
  const establishmentName = currentDemoData.establishments.find(e => e.id === managerEstablishmentId)?.name || 'Votre Établissement';

  // Effect to enrich drivers and apply initial establishment filter
  useEffect(() => {
    if (!managerEstablishmentId) {
      // Handle case where managerEstablishmentId is not yet available (e.g., during initial load in layout)
      setDrivers([]);
      setFilteredDrivers([]);
      return;
    }

    const allDrivers = currentDemoData.users.filter(user => user.role === 'DRIVER');

    let enrichedAndFilteredByEstablishment = allDrivers.map(driver => {
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
        associatedEstablishmentIds: uniqueEstablishmentIds
      };
    }).filter(driver =>
      // Filter drivers to only include those associated with the manager's establishment
      driver.associatedEstablishmentIds.includes(managerEstablishmentId)
    );

    setDrivers(enrichedAndFilteredByEstablishment); // This now holds drivers specific to the establishment
    setCurrentPage(1); // Reset page on initial load/filter by establishment
  }, [currentDemoData, managerEstablishmentId]); // Re-run if currentDemoData or managerEstablishmentId changes

  // Effect to apply search term filter and handle pagination
  useEffect(() => {
    let tempFilteredDrivers = [...drivers]; // Start with the drivers already filtered by establishment

    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredDrivers = tempFilteredDrivers.filter(driver =>
        driver.fullname.toLowerCase().includes(lowerCaseSearchTerm) ||
        driver.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        (driver.phone && driver.phone.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (driver.cin && driver.cin.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredDrivers(tempFilteredDrivers);

    const newTotalPages = Math.ceil(tempFilteredDrivers.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && tempFilteredDrivers.length > 0) {
      setCurrentPage(1);
    } else if (tempFilteredDrivers.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [drivers, searchTerm, currentPage]); // Depend on drivers (already establishment-filtered) and searchTerm

  const totalPages = Math.ceil(filteredDrivers.length / ITEMS_PER_PAGE);
  const paginatedDrivers = filteredDrivers.slice(
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
      const updatedUsers = currentDemoData.users.filter(user => user.id !== id);
      const updatedTrips = currentDemoData.trips.map(trip => {
        if (trip.driverId === id) { return { ...trip, driverId: null }; }
        return trip;
      });
      const updatedAttendances = currentDemoData.attendances.map(attendance => {
        if (attendance.markedById === id) { return { ...attendance, markedById: null }; }
        return attendance;
      });
      const updatedIncidents = currentDemoData.incidents.map(incident => {
        if (incident.reportedById === id) { return { ...incident, reportedById: null }; }
        return incident;
      });

      setCurrentDemoData(prevData => ({
        ...prevData,
        users: updatedUsers,
        trips: updatedTrips,
        attendances: updatedAttendances,
        incidents: updatedIncidents,
      }));

      toast.success('Driver supprimé avec succès');
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
        } else {
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
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        users: updatedUsersArray,
      }));

      toast.success(message);
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
          Gestion des Chauffeurs de {establishmentName}
        </h2>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par nom, email, téléphone ou CIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* The Establishment filter is REMOVED as it's now implicitly filtered */}
        {/*
        <Select onValueChange={setFilterEstablishmentId} value={filterEstablishmentId}>
          <SelectTrigger className="w-full max-w-sm">
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
        */}

        {/* Add Driver Button */}
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
        // Ensure the new driver is associated with the manager's establishment
        fixedEstablishmentId={managerEstablishmentId}
      />

      {/* Main content area: Grid of Driver Cards */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:users" className="h-6 w-6 text-primary" />
            Liste des Chauffeurs
          </CardTitle>
          <CardDescription>
            Nombre total de Chauffeurs filtrés: {filteredDrivers.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {paginatedDrivers.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedDrivers.map((driver) => (
                <DriverCard
                  key={driver.id}
                  driver={driver}
                  onEditDriver={handleEditDriver}
                  onDeleteDriver={handleDeleteDriver}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">Aucun Driver trouvé.</p>
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

export default DriversPage;