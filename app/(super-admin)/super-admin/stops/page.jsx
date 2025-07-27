// pages/manager/StopsPage.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalStop } from '@/components/models/ModalStop';
import StopCard from './StopCard';
import stopService from '@/services/stopService';
import { fetchUserEstablishments } from '@/services/etablissements';

// Shadcn/ui components
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 6;

 const StopsPage = () => {
  const [stops, setStops] = useState([]);
  const [filteredStops, setFilteredStops] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEstablishment, setUserEstablishment] = useState(null);
  const [routes, setRoutes] = useState([]);

  // Récupère l'établissement de l'utilisateur
  useEffect(() => {
    const fetchEstablishment = async () => {
      try {
        const establishments = await fetchUserEstablishments();
        if (establishments.length > 0) {
          setUserEstablishment(establishments[0]);
        }
      } catch (err) {
        console.error('Failed to fetch establishments', err);
        setError('Erreur lors du chargement des établissements');
      }
    };

    fetchEstablishment();
  }, []);

  // Récupère les arrêts et routes
  useEffect(() => {
    if (!userEstablishment) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupère les arrêts accessibles à l'utilisateur
        const stopsData = await stopService.getUserStops();
        
        // Filtre par établissement de l'utilisateur
        const filteredStops = stopsData.filter(stop => 
          stop.route?.establishmentId === userEstablishment.id
        );
        
        setStops(filteredStops);
        setError(null);
      } catch (err) {
        console.error('Error fetching stops:', err);
        setError(err.message || 'Erreur lors du chargement des arrêts');
        toast.error(err.message || 'Erreur lors du chargement des arrêts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userEstablishment]);

  // Filtrage et pagination
  useEffect(() => {
    let tempFilteredStops = [...stops];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredStops = tempFilteredStops.filter(stop =>
        stop.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (stop.route?.name && stop.route.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (stop.lat && String(stop.lat).toLowerCase().includes(lowerCaseSearchTerm)) ||
        (stop.lng && String(stop.lng).toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredStops(tempFilteredStops);
    
    // Ajuste la pagination
    const newTotalPages = Math.ceil(tempFilteredStops.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (tempFilteredStops.length === 0) {
      setCurrentPage(1);
    }
  }, [stops, searchTerm , currentPage]);

  const totalPages = Math.ceil(filteredStops.length / ITEMS_PER_PAGE);
  const paginatedStops = filteredStops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteStop = async (id) => {
    try {
      await stopService.deleteStop(id);
      setStops(prev => prev.filter(stop => stop.id !== id));
      toast.success('Arrêt supprimé avec succès');
    } catch (err) {
      console.error('Error deleting stop:', err);
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleSaveStop = async (stopData) => {
    try {
      let savedStop;
      
      if (editingStop) {
        savedStop = await stopService.updateStop(editingStop.id, stopData);
        setStops(prev => prev.map(s => s.id === editingStop.id ? savedStop : s));
        toast.success('Arrêt modifié avec succès');
      } else {
        savedStop = await stopService.createStop(stopData);
        setStops(prev => [...prev, savedStop]);
        toast.success('Arrêt créé avec succès');
      }

      setIsModalOpen(false);
      setEditingStop(null);
    } catch (err) {
      console.error('Error saving stop:', err);
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    }
  };

  if (!userEstablishment) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icon icon="mdi:loading" className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Arrêts de {userEstablishment.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Arrêt
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
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

      <ModalStop
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStop(null);
        }}
        editingStop={editingStop}
        onSave={handleSaveStop}
        routes={routes}
      />

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:map-pin" className="h-6 w-6 text-primary" />
            Liste des Arrêts
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Chargement...' : `Nombre total d'arrêts: ${filteredStops.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Icon icon="mdi:loading" className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-10">{error}</p>
          ) : paginatedStops.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedStops.map((stop) => (
                <StopCard
                  key={stop.id}
                  stop={{
                    ...stop,
                    routeName: stop.route?.name || 'N/A'
                  }}
                  onEditStop={() => {
                    setEditingStop(stop);
                    setIsModalOpen(true);
                  }}
                  onDeleteStop={handleDeleteStop}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun arrêt disponible'}
            </p>
          )}
        </CardContent>
      </Card>

      {!isLoading && totalPages > 1 && (
        <div className="flex gap-2 items-center mt-4 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={`page-${page}`}
              onClick={() => setCurrentPage(page)}
              variant={page === currentPage ? "default" : "outline"}
              className={cn("w-8 h-8")}
            >
              {page}
            </Button>
          ))}

          <Button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
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