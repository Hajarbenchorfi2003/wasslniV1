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
// Import Shadcn UI Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust path if needed

const ITEMS_PER_PAGE = 3; // Number of buses per page for pagination

const BusPage = () => {
  // Use a state variable for demoData to ensure re-renders when it changes
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [buses, setBuses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null); // null for add, bus object for edit
  const [currentPage, setCurrentPage] = useState(1);
  // State for filtering by establishment
  const [filterEstablishmentId, setFilterEstablishmentId] = useState('all'); // 'all' for no filter

  // Effect to filter and set buses whenever currentDemoData or filterEstablishmentId changes
  useEffect(() => {
    console.log("currentDemoData or filterEstablishmentId updated, filtering buses...");

    // Enrich buses with establishment names
    let enrichedBuses = currentDemoData.buses.map(bus => {
      const establishment = currentDemoData.establishments.find(est => est.id === bus.establishmentId);
      return {
        ...bus,
        establishmentName: establishment ? establishment.name : 'Non attribué'
      };
    });

    // Apply filter if an establishment is selected
    if (filterEstablishmentId !== 'all') {
      enrichedBuses = enrichedBuses.filter(bus =>
        bus.establishmentId === parseInt(filterEstablishmentId) // Ensure type consistency for comparison
      );
    }

    setBuses(enrichedBuses);

    // Adjust current page if the number of pages changes after an operation
    const newTotalPages = Math.ceil(enrichedBuses.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && enrichedBuses.length > 0) {
      setCurrentPage(1);
    } else if (enrichedBuses.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentDemoData, currentPage, filterEstablishmentId]); // Add filterEstablishmentId to dependency array

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

  const handleDeleteBus = (id) => {
    try {
      console.log(`Attempting to delete bus with ID: ${id}`);
      const updatedBuses = currentDemoData.buses.filter(bus => bus.id !== id);

      const updatedTrips = currentDemoData.trips.map(trip => {
        if (trip.busId === id) {
          return { ...trip, busId: null }; // Unlink bus from trips
        }
        return trip;
      });

      setCurrentDemoData(prevData => ({
        ...prevData,
        buses: updatedBuses,
        trips: updatedTrips,
      }));

      toast.success('Bus supprimé avec succès');
      console.log("Bus deleted successfully, updated demoData:", { buses: updatedBuses, trips: updatedTrips });
    } catch (error) {
      console.error('Error deleting bus:', error);
      toast.error('Erreur lors de la suppression du bus');
    }
  };

  const handleSaveBus = async (busData) => {
    try {
      let message = '';
      let updatedBusesArray = [...currentDemoData.buses];

      if (editingBus) {
        const index = updatedBusesArray.findIndex(b => b.id === editingBus.id);
        if (index !== -1) {
          const busToUpdate = updatedBusesArray[index];
          const updatedBus = {
            ...busToUpdate,
            ...busData,
            id: editingBus.id,
          };
          updatedBusesArray[index] = updatedBus;
          message = 'Bus modifié avec succès';
          console.log("Bus updated:", updatedBus);
        } else {
          console.warn("Editing bus not found in current demoData.buses:", editingBus);
          throw new Error("Bus à modifier non trouvé.");
        }
      } else {
        const newId = Math.max(...currentDemoData.buses.map(b => b.id), 0) + 1;
        const newBus = {
          ...busData,
          id: newId,
        };
        updatedBusesArray.push(newBus);
        message = 'Bus ajouté avec succès';
        console.log("New bus added:", newBus);
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        buses: updatedBusesArray,
      }));

      toast.success(message);
      console.log("Save operation successful. Final buses array after save:", updatedBusesArray);
      setIsModalOpen(false);
      setEditingBus(null);

    } catch (error) {
      console.error('Error saving bus:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
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
      </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Filter by Establishment using Shadcn UI Select */}
          <Select value={filterEstablishmentId} onValueChange={setFilterEstablishmentId}>
            <SelectTrigger className="w-full max-w-md">
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
            setEditingBus(null);
            setIsModalOpen(true);
          }}>
            <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
            Ajouter un Bus
          </Button>
        </div>
      

      <ModalBus
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingBus={editingBus}
        onSave={handleSaveBus}
        establishments={currentDemoData.establishments}
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