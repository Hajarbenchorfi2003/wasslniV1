// pages/manager/RoutesPage.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { demoData as initialDemoData, getRoutesByEstablishment, getStopsByRoute, getTripsByEstablishment } from '@/data/data'; // Ensure all getters are imported
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalRoute } from './ModalRoute'; // Le nouveau composant ModalRoute
import RouteCard from './RouteCard'; // Le nouveau composant RouteCard

// Shadcn/ui components for filters and layout
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 6; // Affichera 6 routes par page

// Ce composant est conçu pour être utilisé par un gestionnaire d'établissement,
// il attend donc `managerEstablishmentId` comme prop.
export const RoutesPage = ({ managerEstablishmentId }) => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [routes, setRoutes] = useState([]); // Liste des routes après enrichissement et filtrage par établissement
  const [filteredRoutes, setFilteredRoutes] = useState([]); // Liste des routes après application du terme de recherche
  const [isModalOpen, setIsModalOpen] = useState(false); // État de visibilité de la modale d'ajout/modification
  const [editingRoute, setEditingRoute] = useState(null); // Route en cours d'édition (null si ajout)
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle pour la pagination
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche

  // Utilise l'ID de l'établissement du gestionnaire. Si non fourni, simule avec l'ID 1.
  const effectiveManagerEstablishmentId = managerEstablishmentId || 1;
  const establishmentName = currentDemoData.establishments.find(e => e.id === effectiveManagerEstablishmentId)?.name || 'Votre Établissement';


  // Effet pour enrichir les routes et les filtrer par établissement
  useEffect(() => {
    if (!effectiveManagerEstablishmentId) {
      setRoutes([]);
      return;
    }

    const fetchedRoutes = getRoutesByEstablishment(effectiveManagerEstablishmentId);

    let enrichedRoutes = fetchedRoutes.map(route => {
      const stops = currentDemoData.stops.filter(s => s.routeId === route.id);
      const trips = currentDemoData.trips.filter(t => t.routeId === route.id);
      return {
        ...route,
        stopCount: stops.length,
        tripCount: trips.length,
      };
    });

    setRoutes(enrichedRoutes); // Store the fully enriched and establishment-filtered list
    setCurrentPage(1); // Reset pagination on data change
  }, [currentDemoData, effectiveManagerEstablishmentId]);

  // Effet pour appliquer le filtre de recherche et gérer la pagination.
  useEffect(() => {
    let tempFilteredRoutes = [...routes]; // Commence avec la liste déjà filtrée par établissement

    // Applique le filtre de recherche (par nom de route)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredRoutes = tempFilteredRoutes.filter(route =>
        route.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    setFilteredRoutes(tempFilteredRoutes); // Met à jour la liste filtrée finale

    const newTotalPages = Math.ceil(tempFilteredRoutes.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && tempFilteredRoutes.length > 0) {
      setCurrentPage(1);
    } else if (tempFilteredRoutes.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [routes, searchTerm, currentPage]); // Dépendencies

  const totalPages = Math.ceil(filteredRoutes.length / ITEMS_PER_PAGE);
  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route); // Définit la route à éditer
    setIsModalOpen(true); // Ouvre la modale
  };

  const handleDeleteRoute = (id) => {
    try {
      const routeToDelete = currentDemoData.routes.find(r => r.id === id);
      if (!routeToDelete) {
        toast.error("Route non trouvée pour suppression.");
        return;
      }

      // Important: Deleting a route impacts trips and stops.
      // In a real system, you'd likely:
      // 1. Disassociate trips from this route (set routeId to null or delete them).
      // 2. Disassociate stops from this route (set routeId to null or delete them).
      // For demo purposes, we'll just remove the route for now.
      const updatedRoutes = currentDemoData.routes.filter(route => route.id !== id);
      const updatedTrips = currentDemoData.trips.map(trip => trip.routeId === id ? { ...trip, routeId: null } : trip);
      const updatedStops = currentDemoData.stops.map(stop => stop.routeId === id ? { ...stop, routeId: null } : stop);

      setCurrentDemoData(prevData => ({
        ...prevData,
        routes: updatedRoutes,
        trips: updatedTrips,
        stops: updatedStops,
      }));

      toast.success(`Route "${routeToDelete.name}" supprimée avec succès.`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la route:', error);
      toast.error('Erreur lors de la suppression de la route.');
    }
  };

  const handleSaveRoute = async (routeData) => {
    try {
      let message = '';
      let updatedRoutesArray = [...currentDemoData.routes];

      if (editingRoute) { // Mode édition
        const index = updatedRoutesArray.findIndex(r => r.id === editingRoute.id);
        if (index !== -1) {
          const routeToUpdate = updatedRoutesArray[index];
          const updatedRoute = {
            ...routeToUpdate,
            ...routeData,
            id: editingRoute.id, // Ensure ID is preserved
          };
          updatedRoutesArray[index] = updatedRoute;
          message = 'Route modifiée avec succès';

        } else {
          throw new Error("Route à modifier non trouvée.");
        }
      } else { // Mode ajout
        const newId = Math.max(...currentDemoData.routes.map(r => r.id), 0) + 1; // Generate new unique ID
        const newRoute = {
          ...routeData,
          id: newId,
        };
        updatedRoutesArray.push(newRoute);
        message = 'Route ajoutée avec succès';
      }

      setCurrentDemoData(prevData => ({
        ...prevData,
        routes: updatedRoutesArray,
      }));

      toast.success(message);
      setIsModalOpen(false); // Close modal
      setEditingRoute(null); // Reset editing state

    } catch (error) {
      console.error('Error saving route:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null);
  };

  // Only pass the manager's establishment to the modal if it's fixed
  const establishmentsForModal = [currentDemoData.establishments.find(e => e.id === effectiveManagerEstablishmentId)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Routes de {establishmentName}
        </h2>
        {/* Add Route Button */}
        <Button onClick={() => {
          setEditingRoute(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter une Route
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par nom de route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Modale d'ajout/modification de route */}
      <ModalRoute
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingRoute={editingRoute}
        onSave={handleSaveRoute}
        establishments={establishmentsForModal} // Pass only manager's establishment
        fixedEstablishmentId={effectiveManagerEstablishmentId} // Ensure new routes are linked to manager's establishment
      />


      {/* Zone principale de contenu : Grille de cartes de routes */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:map" className="h-6 w-6 text-primary" />
            Liste des Routes
          </CardTitle>
          <CardDescription>
            Nombre total de routes filtrées: {filteredRoutes.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {paginatedRoutes.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onEditRoute={handleEditRoute}
                  onDeleteRoute={handleDeleteRoute}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">Aucune Route trouvée.</p>
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

export default RoutesPage;