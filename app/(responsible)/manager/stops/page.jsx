// pages/manager/StopsPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { demoData as initialDemoData, getStopsByEstablishment, getRouteById, getRoutesByEstablishment } from '@/data/data'; // Ensure getRoutesByEstablishment is imported
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
// IMPORTATION CORRIGÉE : Utiliser ModalStop au lieu de ModalUser
import { ModalStop } from '@/components/models/ModalStop'; // Le nouveau composant ModalStop
import StopCard from './StopCard'; // Le composant StopCard

// Shadcn/ui components for filters and layout
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 6; // Affichera 6 arrêts par page

export const StopsPage = ({ managerEstablishmentId }) => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [stops, setStops] = useState([]); // Liste des arrêts après enrichissement et filtrage par établissement
  const [filteredStops, setFilteredStops] = useState([]); // Liste des arrêts après application du terme de recherche
  const [isModalOpen, setIsModalOpen] = useState(false); // État de visibilité de la modale d'ajout/modification
  const [editingStop, setEditingStop] = useState(null); // Arrêt en cours d'édition (null si ajout)
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche

  // Utilise l'ID de l'établissement du gestionnaire. Si non fourni, simule avec l'ID 1.
  const effectiveManagerEstablishmentId = managerEstablishmentId || 1;
  const establishmentName = currentDemoData.establishments.find(e => e.id === effectiveManagerEstablishmentId)?.name || 'Votre Établissement';


  // Effet pour enrichir les arrêts et les filtrer par établissement
  useEffect(() => {
    if (!effectiveManagerEstablishmentId) {
      setStops([]);
      return;
    }

    const fetchedStops = getStopsByEstablishment(effectiveManagerEstablishmentId);

    let enrichedStops = fetchedStops.map(stop => {
      const route = currentDemoData.routes.find(r => r.id === stop.routeId);
      return {
        ...stop,
        routeName: route ? route.name : 'N/A',
      };
    });

    setStops(enrichedStops); // Store the fully enriched and establishment-filtered list
    setCurrentPage(1); // Reset pagination on data change
  }, [currentDemoData, effectiveManagerEstablishmentId]);

  // Effet pour appliquer le filtre de recherche et gérer la pagination.
  useEffect(() => {
    let tempFilteredStops = [...stops]; // Commence avec la liste déjà filtrée par établissement

    // Applique le filtre de recherche (par nom d'arrêt, nom de route, lat/lng)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredStops = tempFilteredStops.filter(stop =>
        stop.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        stop.routeName.toLowerCase().includes(lowerCaseSearchTerm) ||
        (stop.lat && String(stop.lat).toLowerCase().includes(lowerCaseSearchTerm)) ||
        (stop.lng && String(stop.lng).toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredStops(tempFilteredStops); // Met à jour la liste filtrée finale

    const newTotalPages = Math.ceil(tempFilteredStops.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && tempFilteredStops.length > 0) {
      setCurrentPage(1);
    } else if (tempFilteredStops.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [stops, searchTerm, currentPage]); // Dépendencies

  const totalPages = Math.ceil(filteredStops.length / ITEMS_PER_PAGE);
  const paginatedStops = filteredStops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditStop = (stop) => {
    setEditingStop(stop); // Définit l'arrêt à éditer
    setIsModalOpen(true); // Ouvre la modale
  };

  const handleDeleteStop = (id) => {
    try {
      const stopToDelete = currentDemoData.stops.find(s => s.id === id);
      if (!stopToDelete) {
        toast.error("Arrêt non trouvé pour suppression.");
        return;
      }

      const updatedStops = currentDemoData.stops.filter(stop => stop.id !== id);
      
      setCurrentDemoData(prevData => ({
        ...prevData,
        stops: updatedStops,
      }));

      toast.success(`Arrêt "${stopToDelete.name}" supprimé avec succès.`);
    } catch (error) {
      console.error('Error deleting stop:', error);
      toast.error('Erreur lors de la suppression de l\'arrêt.');
    }
  };

  const handleSaveStop = async (stopData) => {
    try {
      let message = '';
      let updatedStopsArray = [...currentDemoData.stops];

      if (editingStop) { // Mode édition
        const index = updatedStopsArray.findIndex(s => s.id === editingStop.id);
        if (index !== -1) {
          const stopToUpdate = updatedStopsArray[index];
          const updatedStop = {
            ...stopToUpdate,
            ...stopData,
            id: editingStop.id, // S'assure que l'ID est conservé
          };
          updatedStopsArray[index] = updatedStop;
          message = 'Arrêt modifié avec succès';

        } else {
          throw new Error("Arrêt à modifier non trouvé.");
        }
      } else { // Mode ajout
        const newId = Math.max(...currentDemoData.stops.map(s => s.id), 0) + 1; // Génère un nouvel ID unique
        const newStop = {
          ...stopData,
          id: newId,
        };
        updatedStopsArray.push(newStop);
        message = 'Arrêt ajouté avec succès';
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        stops: updatedStopsArray,
      }));

      toast.success(message);
      setIsModalOpen(false); // Ferme la modale
      setEditingStop(null); // Réinitialise l'arrêt en édition

    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'arrêt:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStop(null);
  };

  // Récupère les routes associées à l'établissement du gestionnaire pour le Select de la modale
  const routesInManagerEstablishment = currentDemoData.routes.filter(r => r.establishmentId === effectiveManagerEstablishmentId);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Arrêts de {establishmentName}
        </h2>
        {/* Add Stop Button */}
        <Button onClick={() => {
          setEditingStop(null); // S'assure qu'aucun état d'édition précédent n'est actif
          setIsModalOpen(true); // Ouvre la modale
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Arrêt
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par nom, route, lat/lng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Modale d'ajout/modification d'arrêt */}
      <ModalStop
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingStop={editingStop} // Passe l'arrêt à éditer
        onSave={handleSaveStop} // Gestionnaire de sauvegarde
        routes={routesInManagerEstablishment} // Passe les routes disponibles pour le select
      />


      {/* Zone principale de contenu : Grille de cartes d'arrêts */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:map-pin" className="h-6 w-6 text-primary" />
            Liste des Arrêts
          </CardTitle>
          <CardDescription>
            Nombre total d'arrêts filtrés: {filteredStops.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {paginatedStops.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedStops.map((stop) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  onEditStop={handleEditStop}
                  onDeleteStop={handleDeleteStop}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">Aucun Arrêt trouvé.</p>
          )}
        </CardContent>
      </Card>

      {/* Contrôles de pagination */}
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

export default StopsPage;