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
import {fetchroute,createroute,updateroute,deleteroute}  from '@/services/route';
import {fetchUserEstablishments} from '@/services/etablissements';
import { sync } from 'framer-motion';

const ITEMS_PER_PAGE = 9;


const RoutesPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
   const [loading, setLoading] = useState(false);
   const [establishments, setEstablishments] = useState([]);
      const [establishmentsLoading, setEstablishmentsLoading] = useState(false);

 useEffect(() => {
  let isMounted = true;

  async function loadEstablishments() {
    setEstablishmentsLoading(true);
    try {
      const data = await fetchUserEstablishments();
      console.log("Établissements reçus :", data);

      if (isMounted && data && Array.isArray(data)) {
        setEstablishments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des établissements', error);
      toast.error("Impossible de charger les établissements");
    } finally {
      if (isMounted) {
        setEstablishmentsLoading(false);
      }
    }
  }

  // Charger seulement si non encore chargés
  if (establishments.length === 0) {
    loadEstablishments();
  }

  return () => {
    isMounted = false;
  };
}, []);
 const loadRoute = async () => {
    setLoading(true);
    try {
      const data = await fetchroute(); // Récupère les données depuis l'API
      setRoutes(data || []); // Met à jour l'état local
      setCurrentDemoData(data);
      console.log("Données reçues depuis l'API :", data); // ✅ Affiche directement les données
    } catch (error) {
      console.error('Erreur lors du chargement des parents', error);
      toast.error("Impossible de charger les routes");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  loadRoute();
}, []);

 

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

  const handleDeleteRoute = async(id) => {
    try {
      await deleteroute(id);
      await loadRoute();
      toast.success('Route supprimée avec succès');
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Erreur lors de la suppression de la route');
    }
  };

 const handleSaveRoute = async (routeData) => {
  try {
    let message = '';

    if (editingRoute) {
      await updateroute(editingRoute.id, routeData);
      message = 'Route mise à jour avec succès';
    } else {
      await createroute(routeData);
      message = 'Route ajoutée avec succès';
    }

    await loadRoute(); // recharge les routes
    toast.success(message);
    setIsModalOpen(false);
    setEditingRoute(null);

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la route :', error);

    if (error.response) {
      // Erreur côté serveur avec réponse HTTP
      const { status, data } = error.response;

      if (status === 400 && data.error) {
        // Affiche l'erreur spécifique pour Bad Request
        toast.error(`Erreur : ${data.error}`, {
          position: "bottom-right",
          autoClose: 5000,
        });
      } else {
        // Autres erreurs serveur (ex: 500)
        toast.error(`Erreur serveur (${status}) : Veuillez réessayer plus tard.`, {
          position: "bottom-right",
          autoClose: 5000,
        });
      }
    } else {
      // Erreurs réseau ou autre
      toast.error(`Erreur réseau : ${error.message}`, {
        position: "bottom-right",
        autoClose: 5000,
      });
    }
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
        establishments={establishments}
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