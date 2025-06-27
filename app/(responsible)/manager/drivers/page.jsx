// pages/DriversPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalUser } from '@/components/models/ModalUser'; 
import DriverCard from './DriverCard';
import { fetchDrivers, deleteUser, updateUser, register } from '@/services/user';

// Import shadcn/ui components
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 6;

export const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Effect to fetch drivers from API based on connected user's role
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        setIsLoading(true);
        const apiDrivers = await fetchDrivers();
        setDrivers(apiDrivers);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading drivers:', error);
        toast.error('Erreur lors du chargement des chauffeurs');
        setIsLoading(false);
      }
    };

    loadDrivers();
  }, []);

  // Effect to apply search term filter and handle pagination
  useEffect(() => {
    let tempFilteredDrivers = [...drivers];

    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredDrivers = tempFilteredDrivers.filter(driver =>
        driver.fullname?.toLowerCase().includes(lowerCaseSearchTerm) ||
        driver.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
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
  }, [drivers, searchTerm, currentPage]);

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

  const handleDeleteDriver = async (id) => {
    try {
      await deleteUser(id);
      setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== id));
      toast.success('Chauffeur supprimé avec succès');
    }catch (error) {
        console.error('Error deleting driver:', error);
        const errorMsg = error.response?.data?.message || 'Erreur lors de la suppression du chauffeur';
        toast.error(errorMsg);
      }
  };

  const handleSaveUser = async (userData) => {
    try {
      let message = '';
      let updatedUser;

      if (editingUser) {
        // Update existing driver
        updatedUser = await updateUser(editingUser.id, {
          ...userData,
          role: 'DRIVER'
        });
        message = 'Chauffeur modifié avec succès';
      } else {
        // Create new driver
        updatedUser = await register({
          ...userData,
          role: 'DRIVER'
        });
        message = 'Chauffeur ajouté avec succès';
      }

      // Update local state
      if (editingUser) {
        setDrivers(prevDrivers => 
          prevDrivers.map(driver => 
            driver.id === editingUser.id ? updatedUser : driver
          )
        );
      } else {
        setDrivers(prevDrivers => [...prevDrivers, updatedUser]);
      }

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
          Gestion des Chauffeurs
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

        {/* Add Driver Button */}
        <Button onClick={() => {
          setEditingUser(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Chauffeur
        </Button>
      </div>

      <ModalUser
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onSave={handleSaveUser}
        role="DRIVER"
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
          {isLoading ? (
            <p className="col-span-full text-center text-gray-500 py-10">Chargement des chauffeurs...</p>
          ) : paginatedDrivers.length > 0 ? (
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
            <p className="col-span-full text-center text-gray-500 py-10">
              {searchTerm ? 'Aucun chauffeur trouvé avec ce critère de recherche' : 'Aucun chauffeur trouvé'}
            </p>
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