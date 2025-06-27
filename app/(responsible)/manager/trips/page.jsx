'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ModalTrip } from './ModalTrip';
import TripCard from './TripCard';
import tripService from '@/services/tripService';

// Components for filters and layout
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const ITEMS_PER_PAGE = 6;

export const TripsPage = () => {
  const [tripsData, setTripsData] = useState({
    trips: [],
    pagination: { total: 0 }
  });
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [students, setStudents] = useState([]);
  const [establishments, setEstablishments] = useState([]);
   

  // Filter states
  const [filters, setFilters] = useState({
    routeId: '',
    busId: '',
    driverId: '',
    establishmentId: '',
    search: ''
  });

  // Fetch trips with pagination and filters
  const fetchTrips = async (page = 1) => {
    try {
      setIsLoading(true);
      
      // Prepare filters object
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
      };
      
      // Add filters only if they're not 'all'
      if (filters.establishmentId && filters.establishmentId !== 'all') {
        params.establishmentId = filters.establishmentId;
      }
      if (filters.routeId && filters.routeId !== 'all') {
        params.routeId = filters.routeId;
      }
      if (filters.busId && filters.busId !== 'all') {
        params.busId = filters.busId;
      }
      if (filters.driverId && filters.driverId !== 'all') {
        params.driverId = filters.driverId;
      }
      if (filters.search) {
        params.search = filters.search;
      }
  
      const response = await tripService.getAllTrips(params);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      // Handle response
      const tripsArray = response.data?.data || response.data || [];
      const paginationData = response.data?.pagination || response.pagination || { total: 0 };
  
      setTripsData({
        trips: tripsArray,
        pagination: paginationData
      });
  
      const enrichedTrips = tripsArray.map(trip => ({
        ...trip,
        routeName: trip.route?.name || 'N/A',
        busPlate: trip.bus?.plateNumber || 'N/A',
        driverName: trip.driver?.fullname || 'N/A',
        establishmentName: trip.establishment?.name || 'N/A',
        studentCount: trip.tripStudents?.length || 0
      }));
      
      setFilteredTrips(enrichedTrips);
      
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error(`Failed to load trips: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch related data (routes, buses, drivers, establishments)
  const fetchRelatedData = async () => {
    try {
      if (tripsData.trips.length > 0) {
        // Get unique routes
        const uniqueRoutes = Array.from(new Map(
          tripsData.trips
            .filter(t => t.route)
            .map(t => [t.route.id, t.route])
        ).values());
        
        // Get unique buses
        const uniqueBuses = Array.from(new Map(
          tripsData.trips
            .filter(t => t.bus)
            .map(t => [t.bus.id, t.bus])
        ).values());
        
        // Get unique drivers
        const uniqueDrivers = Array.from(new Map(
          tripsData.trips
            .filter(t => t.driver)
            .map(t => [t.driver.id, t.driver])
        ).values());
        
        // Get unique establishments
        const uniqueEstablishments = Array.from(new Map(
          tripsData.trips
            .filter(t => t.establishment)
            .map(t => [t.establishment.id, t.establishment])
        ).values());
        
        setRoutes(uniqueRoutes);
        setBuses(uniqueBuses);
        setDrivers(uniqueDrivers);
        setEstablishments(uniqueEstablishments);
      }
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTrips();
  }, []);

  // Fetch related data when trips are loaded
  useEffect(() => {
    if (tripsData.trips.length > 0) {
      fetchRelatedData();
    }
  }, [tripsData.trips]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
    
  };

  // Apply filters and fetch new data
  useEffect(() => {
    fetchTrips(currentPage);
  }, [filters, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleDeleteTrip = async (id) => {
    try {
      await tripService.deleteTrip(id);
      toast.success('Trajet supprimé avec succès');
      fetchTrips(currentPage); // Refresh the list
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Erreur lors de la suppression du trajet');
    }
  };

  const handleSaveTrip = async (tripData) => {
    try {
      if (editingTrip) {
        await tripService.updateTrip(editingTrip.id, tripData);
        toast.success('Trajet modifié avec succès');
      } else {
        await tripService.createTrip(tripData);
        toast.success('Trajet ajouté avec succès');
      }
      
      setIsModalOpen(false);
      setEditingTrip(null);
      fetchTrips(currentPage); // Refresh the list
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Vérifiez les données.'}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-medium text-default-800">
          Gestion des Trajets (Plans)
        </h2>
        <Button onClick={() => {
          setEditingTrip(null);
          setIsModalOpen(true);
        }}>
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Ajouter un Trajet
        </Button>
      </div>

      {/* Search and Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Search input */}
        <Input
          placeholder="Rechercher un trajet..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        {/* Filter by Establishment */}
        <Select 
          onValueChange={(value) => handleFilterChange('establishmentId', value)}
          value={filters.establishmentId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrer par Établissement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Établissements</SelectItem>
            {establishments.map(est => (
              <SelectItem key={est.id} value={String(est.id)}>
                {est.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter by Route */}
        <Select 
          onValueChange={(value) => handleFilterChange('routeId', value)}
          value={filters.routeId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrer par Route" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les Routes</SelectItem>
            {routes.map(route => (
              <SelectItem key={route.id} value={String(route.id)}>
                {route.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter by Bus */}
        <Select 
          onValueChange={(value) => handleFilterChange('busId', value)}
          value={filters.busId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrer par Bus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Bus</SelectItem>
            {buses.map(bus => (
              <SelectItem key={bus.id} value={String(bus.id)}>
                {bus.plateNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter by Driver */}
        <Select 
          onValueChange={(value) => handleFilterChange('driverId', value)}
          value={filters.driverId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrer par Chauffeur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Chauffeurs</SelectItem>
            {drivers.map(driver => (
              <SelectItem key={driver.id} value={String(driver.id)}>
                {driver.fullname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ModalTrip
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingTrip={editingTrip}
        onSave={handleSaveTrip}
        routes={routes}
        buses={buses}
        drivers={drivers}
        establishments={establishments}
        students={editingTrip?.tripStudents || []}
      />

      {/* Main content area */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:route" className="h-6 w-6 text-primary" />
            Liste des Trajets
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Chargement...' : `Total: ${tripsData.pagination?.total || 0} trajets`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Icon icon="heroicons:arrow-path" className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onEditTrip={handleEditTrip}
                  onDeleteTrip={handleDeleteTrip}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">
              Aucun trajet trouvé.
            </p>
          )}
        </CardContent>
      </Card>

      {!isLoading && tripsData.pagination?.totalPages > 1 && (
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

          {Array.from({ length: tripsData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
            onClick={() => handlePageChange(Math.min(currentPage + 1, tripsData.pagination.totalPages))}
            disabled={currentPage === tripsData.pagination.totalPages}
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

export default TripsPage;