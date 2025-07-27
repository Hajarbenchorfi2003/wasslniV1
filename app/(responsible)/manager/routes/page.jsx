'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalRoute } from './ModalRoute';
import { RouteCard } from './RouteCard';
import routeService from '@/services/routeService';
import {fetchUserEstablishments} from '@/services/etablissements';

const ITEMS_PER_PAGE = 6;

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [establishments, setEstablishments] = useState([]);

  // Fetch routes and establishments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch accessible establishments first
        const establishmentsData = await fetchUserEstablishments();
        setEstablishments(establishmentsData);
        
        // Then fetch routes
        const routesData = await routeService.getUserRoutes();
        setRoutes(routesData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.response?.data?.message || error.message || 'Erreur lors du chargement des données');
        setRoutes([]);
        setEstablishments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply search filter
  useEffect(() => {
    const filtered = routes.filter(route => 
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.establishment?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRoutes(filtered);
    setCurrentPage(1);
  }, [routes, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRoutes.length / ITEMS_PER_PAGE);
  const paginatedRoutes = filteredRoutes.slice(
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

  const handleDeleteRoute = async (id) => {
    try {
      await routeService.deleteRoute(id);
      setRoutes(prev => prev.filter(route => route.id !== id));
      toast.success('Route supprimée avec succès');
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error(error.response?.data?.message || error.message || 'Erreur lors de la suppression');
    }
  };

  const handleSaveRoute = async (routeData) => {
    try {
      let savedRoute;
      
      if (editingRoute) {
        savedRoute = await routeService.updateRoute(editingRoute.id, routeData);
        setRoutes(prev => prev.map(r => r.id === savedRoute.id ? savedRoute : r));
        toast.success('Route mise à jour avec succès');
      } else {
        savedRoute = await routeService.createRoute(routeData);
        setRoutes(prev => [...prev, savedRoute]);
        toast.success('Route créée avec succès');
      }
      
      setIsModalOpen(false);
      setEditingRoute(null);
    } catch (error) {
      console.error('Error saving route:', error);
      toast.error(error.response?.data?.message || error.message || 'Erreur lors de la sauvegarde');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Routes
        </h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter une Route
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par nom de route ou établissement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <ModalRoute
       isOpen={isModalOpen}
       onClose={() => {
         setIsModalOpen(false);
         setEditingRoute(null);
       }}
       editingRoute={editingRoute}
       establishments={establishments}
       onSave={handleSaveRoute}
      />

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:map" className="h-6 w-6 text-primary" />
            Liste des Routes
          </CardTitle>
          <CardDescription>
            {filteredRoutes.length} route(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {paginatedRoutes.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={{
                    ...route,
                    establishmentName: route.establishment?.name || 'Non attribué',
                    stopCount: route.stops?.length || 0
                  }}
                  onEditRoute={handleEditRoute}
                  onDeleteRoute={handleDeleteRoute}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Icon icon="heroicons:exclamation-circle" className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Aucune route ne correspond à votre recherche' : 'Aucune route disponible'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {!searchTerm && 'Commencez par créer une nouvelle route.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex gap-2 items-center mt-4 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <Icon icon="heroicons:chevron-left" className="w-5 h-5" />
            Précédent
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Suivant
            <Icon icon="heroicons:chevron-right" className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;