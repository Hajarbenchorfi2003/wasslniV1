// pages/manager/BusesPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { demoData as initialDemoData, getBusesByEstablishment } from '@/data/data'; // Ensure getBusesByEstablishment is imported
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalBus } from './ModalBus'; // La nouvelle modale ModalBus
import BusCard from './BusCard'; // Le nouveau composant BusCard

// Shadcn/ui components for filters and layout
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 6; // Affichera 6 bus par page

// Ce composant est conçu pour être utilisé par un gestionnaire d'établissement,
// il attend donc `managerEstablishmentId` comme prop.
export const BusesPage = ({ managerEstablishmentId }) => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [buses, setBuses] = useState([]); // Liste des bus après enrichissement et filtrage par établissement
  const [filteredBuses, setFilteredBuses] = useState([]); // Liste des bus après application du terme de recherche
  const [isModalOpen, setIsModalOpen] = useState(false); // État de visibilité de la modale d'ajout/modification
  const [editingBus, setEditingBus] = useState(null); // Bus en cours d'édition (null si ajout)
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche

  // Utilise l'ID de l'établissement du gestionnaire. Si non fourni, simule avec l'ID 1.
  const effectiveManagerEstablishmentId = managerEstablishmentId || 1;
  const establishmentName = currentDemoData.establishments.find(e => e.id === effectiveManagerEstablishmentId)?.name || 'Votre Établissement';


  // Effet pour enrichir les bus et les filtrer par établissement
  useEffect(() => {
    if (!effectiveManagerEstablishmentId) {
      setBuses([]);
      return;
    }

    const fetchedBuses = getBusesByEstablishment(effectiveManagerEstablishmentId);

    let enrichedBuses = fetchedBuses.map(bus => {
      const establishment = currentDemoData.establishments.find(e => e.id === bus.establishmentId);
      return {
        ...bus,
        establishmentName: establishment ? establishment.name : 'N/A',
      };
    });

    setBuses(enrichedBuses); // Store the fully enriched and establishment-filtered list
    setCurrentPage(1); // Reset pagination on data change
  }, [currentDemoData, effectiveManagerEstablishmentId]);

  // Effet pour appliquer le filtre de recherche et gérer la pagination.
  useEffect(() => {
    let tempFilteredBuses = [...buses]; // Commence avec la liste déjà filtrée par établissement

    // Applique le filtre de recherche (par numéro de plaque, marque, établissement)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredBuses = tempFilteredBuses.filter(bus =>
        bus.plateNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        bus.marque.toLowerCase().includes(lowerCaseSearchTerm) ||
        (bus.establishmentName && bus.establishmentName.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredBuses(tempFilteredBuses); // Met à jour la liste filtrée finale

    const newTotalPages = Math.ceil(tempFilteredBuses.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && tempFilteredBuses.length > 0) {
      setCurrentPage(1);
    } else if (tempFilteredBuses.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [buses, searchTerm, currentPage]); // Dépendencies

  const totalPages = Math.ceil(filteredBuses.length / ITEMS_PER_PAGE);
  const paginatedBuses = filteredBuses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditBus = (bus) => {
    setEditingBus(bus); // Définit le bus à éditer
    setIsModalOpen(true); // Ouvre la modale
  };

  const handleDeleteBus = (id) => {
    try {
      const busToDelete = currentDemoData.buses.find(b => b.id === id);
      if (!busToDelete) {
        toast.error("Bus non trouvé pour suppression.");
        return;
      }

      // Important: Deleting a bus impacts trips.
      // In a real system, you'd likely:
      // 1. Disassociate trips from this bus (set busId to null or delete them).
      // 2. Potentially update related driver assignments.
      // For demo purposes, we'll just remove the bus.
      const updatedBuses = currentDemoData.buses.filter(bus => bus.id !== id);
      const updatedTrips = currentDemoData.trips.map(trip => trip.busId === id ? { ...trip, busId: null } : trip);

      setCurrentDemoData(prevData => ({
        ...prevData,
        buses: updatedBuses,
        trips: updatedTrips,
      }));

      toast.success(`Bus "${busToDelete.plateNumber}" supprimé avec succès.`);
    } catch (error) {
      console.error('Error deleting bus:', error);
      toast.error('Erreur lors de la suppression du bus.');
    }
  };

  const handleSaveBus = async (busData) => {
    try {
      let message = '';
      let updatedBusesArray = [...currentDemoData.buses];

      if (editingBus) { // Mode édition
        const index = updatedBusesArray.findIndex(b => b.id === editingBus.id);
        if (index !== -1) {
          const busToUpdate = updatedBusesArray[index];
          const updatedBus = {
            ...busToUpdate,
            ...busData,
            id: editingBus.id, // Ensure ID is preserved
          };
          updatedBusesArray[index] = updatedBus;
          message = 'Bus modifié avec succès';

        } else {
          throw new Error("Bus à modifier non trouvé.");
        }
      } else { // Mode ajout
        const newId = Math.max(...currentDemoData.buses.map(b => b.id), 0) + 1; // Generate new unique ID
        const newBus = {
          ...busData,
          id: newId,
        };
        updatedBusesArray.push(newBus);
        message = 'Bus ajouté avec succès';
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        buses: updatedBusesArray,
      }));

      toast.success(message);
      setIsModalOpen(false); // Close modal
      setEditingBus(null); // Reset editing state

    } catch (error) {
      console.error('Error saving bus:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBus(null);
  };

  // Only pass the manager's establishment to the modal if it's fixed
  const establishmentsForModal = [currentDemoData.establishments.find(e => e.id === effectiveManagerEstablishmentId)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">Gestion des Bus  </h2>
        {/* Add Bus Button */}
        <Button onClick={() => {
          setEditingBus(null); // Ensure no previous editing state
          setIsModalOpen(true); // Open the modal
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Bus
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Input */}
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

      {/* Modale d'ajout/modification de bus */}
      <ModalBus
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingBus={editingBus} // Pass the bus to edit
        onSave={handleSaveBus} // Save handler
        establishments={establishmentsForModal} // Pass available establishments for the select
        fixedEstablishmentId={effectiveManagerEstablishmentId} // Force new/edited buses to manager's establishment
      />
       <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <p className="col-span-full  text-gray-500">Nombre total de bus filtrés: {filteredBuses.length}</p>
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
 
      {/* Pagination Controls */}
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

export default BusesPage;