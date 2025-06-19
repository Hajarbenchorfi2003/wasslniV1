// components/RoutesPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalRoute } from '@/components/models/ModalRoute'; // Create this
import RouteCard from './RouteCard'; // Create this

const ITEMS_PER_PAGE = 3;

const RoutesPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(initialDemoData);
  const [routes, setRoutes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    console.log("currentDemoData updated, filtering routes...");
    const allRoutes = currentDemoData.routes;

    // Enrich routes with establishment name
    const enrichedRoutes = allRoutes.map(route => {
      const establishment = currentDemoData.establishments.find(est => est.id === route.establishmentId);
      const stopsCount = currentDemoData.stops.filter(stop => stop.routeId === route.id).length;
      return {
        ...route,
        establishmentName: establishment ? establishment.name : 'Non attribué',
        stopsCount: stopsCount,
      };
    });

    setRoutes(enrichedRoutes);

    const newTotalPages = Math.ceil(enrichedRoutes.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && enrichedRoutes.length > 0) {
      setCurrentPage(1);
    } else if (enrichedRoutes.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentDemoData, currentPage]);

  const totalPages = Math.ceil(routes.length / ITEMS_PER_PAGE);
  const paginatedRoutes = routes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setIsModalOpen(true);
  };

  const handleDeleteRoute = (id) => {
    try {
      console.log(`Attempting to delete route with ID: ${id}`);
      const updatedRoutes = currentDemoData.routes.filter(route => route.id !== id);

      // Also remove associated stops and trips using this route
      const updatedStops = currentDemoData.stops.filter(stop => stop.routeId !== id);
      const updatedTrips = currentDemoData.trips.filter(trip => trip.routeId !== id);

      setCurrentDemoData(prevData => ({
        ...prevData,
        routes: updatedRoutes,
        stops: updatedStops,
        trips: updatedTrips,
      }));

      toast.success('Route supprimée avec succès');
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Erreur lors de la suppression de la route');
    }
  };

  const handleSaveRoute = async (routeData) => {
    try {
      let message = '';
      let updatedRoutesArray = [...currentDemoData.routes];

      if (editingRoute) {
        const index = updatedRoutesArray.findIndex(r => r.id === editingRoute.id);
        if (index !== -1) {
          const routeToUpdate = updatedRoutesArray[index];
          const updatedRoute = {
            ...routeToUpdate,
            ...routeData,
            id: editingRoute.id,
          };
          updatedRoutesArray[index] = updatedRoute;
          message = 'Route modifiée avec succès';
        } else {
          throw new Error("Route à modifier non trouvée.");
        }
      } else {
        const newId = Math.max(...currentDemoData.routes.map(r => r.id), 0) + 1;
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
      setIsModalOpen(false);
      setEditingRoute(null);

    } catch (error) {
      console.error('Error saving route:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Gestion des Routes
        </div>
        <Button onClick={() => {
          setEditingRoute(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter une Route
        </Button>
      </div>

      <ModalRoute
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingRoute={editingRoute}
        onSave={handleSaveRoute}
        establishments={currentDemoData.establishments}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedRoutes.length > 0 ? (
          paginatedRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onEditRoute={handleEditRoute}
              onDeleteRoute={handleDeleteRoute}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Aucune route trouvée.</p>
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

export default RoutesPage;