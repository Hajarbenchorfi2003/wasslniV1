// pages/manager/BusesPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalBus } from './ModalBus';
import BusCard from './BusCard';
import {confirmToast} from '@/components/ui/confirmToast';
import {
  fetchMyBuses,
  createBus,
  updateBus,
  deleteBus,
  fetchAvailableDrivers,
  detachBusFromEstablishment
} from '@/services/bus';
import { Input } from '@/components/ui/input';

const ITEMS_PER_PAGE = 6;

export const BusesPage = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  // Fetch buses from API
  const fetchBuses = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchMyBuses();
      setBuses(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Erreur lors du chargement des bus');
      setIsLoading(false);
    }
  }, []);

  // Fetch available drivers
  const fetchDrivers = useCallback(async () => {
    try {
      const drivers = await fetchAvailableDrivers();
      setAvailableDrivers(drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Erreur lors du chargement des conducteurs');
    }
  }, []);

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
  }, [fetchBuses, fetchDrivers]);

  // Apply search filter
  useEffect(() => {
    let tempFilteredBuses = [...buses];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredBuses = tempFilteredBuses.filter(bus =>
        bus.plateNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        bus.marque.toLowerCase().includes(lowerCaseSearchTerm) ||
        (bus.establishment?.name && bus.establishment.name.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredBuses(tempFilteredBuses);

    const newTotalPages = Math.ceil(tempFilteredBuses.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && tempFilteredBuses.length > 0) {
      setCurrentPage(1);
    } else if (tempFilteredBuses.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [buses, searchTerm, currentPage]);

  const totalPages = Math.ceil(filteredBuses.length / ITEMS_PER_PAGE);
  const paginatedBuses = filteredBuses.slice(
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
      await deleteBus(id);
      toast.success('Bus supprimé avec succès');
      fetchBuses(); // Refresh the list
    } catch (error) {
      console.error('Error deleting bus:', error);
      toast.error('Erreur lors de la suppression du bus');
    }
  };

  const handleSaveBus = async (busData) => {
    try {
      if (editingBus) {
        await updateBus(editingBus.id, busData);
        toast.success('Bus modifié avec succès');
      } else {
        await createBus(busData);
        toast.success('Bus ajouté avec succès');
      }
      setIsModalOpen(false);
      setEditingBus(null);
      fetchBuses(); // Refresh the list
    } catch (error) {
      console.error('Error saving bus:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBus(null);
  };
  const handleDetachBus = (bus) => {
    confirmToast({
      message: `Êtes-vous sûr de vouloir désassocier le bus "${bus.plateNumber}" de l'établissement ?`,
      onConfirm: async () => {
        try {
          await  detachBusFromEstablishment(bus.id);
          toast.success('Bus désassocié avec succès');
          fetchBuses(); // Rafraîchir les données
        } catch (error) {
          console.error("Erreur lors de la désassociation :", error);
          toast.error("Impossible de désassocier ce bus.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">Gestion des Bus</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Bus
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par numéro de plaque, marque ou établissement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <ModalBus
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingBus={editingBus}
        onSave={handleSaveBus}
        availableDrivers={availableDrivers}
        onDetachBus={handleDetachBus} 
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Icon icon="heroicons:arrow-path" className="animate-spin h-12 w-12 text-gray-500" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <p className="col-span-full text-gray-500">Nombre total de bus filtrés: {filteredBuses.length}</p>
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
              <p className="col-span-full text-center text-gray-500">
                {searchTerm ? "Aucun bus ne correspond à votre recherche" : "Aucun bus trouvé"}
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
        </>
      )}
    </div>
  );
};

export default BusesPage;