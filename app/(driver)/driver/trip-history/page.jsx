// pages/driver/TripHistoryPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import driverService from '@/services/driverservice';
import { Input } from '@/components/ui/input';
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ITEMS_PER_PAGE = 10;

 const TripHistoryPage = () => {
  const [allDriverTrips, setAllDriverTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();

  // Fetch all trips for the driver
  const fetchDriverTrips = useCallback(async () => {
    try {
      setLoading(true);
      const trips = await driverService.getallDailyTrips();
      setAllDriverTrips(trips);
      setFilteredTrips(trips);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les trajets: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch detailed trip information
  const fetchTripDetails = useCallback(async (tripId) => {
    try {
      setLoadingDetails(true);
      const details = await driverService.getTripDetails(tripId);
      setTripDetails(details);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du trajet: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDriverTrips();
  }, [fetchDriverTrips]);

  // Handle trip selection
  const handleSelectTrip = useCallback(async (trip) => {
    setSelectedTrip(trip);
    await fetchTripDetails(trip.id);
  }, [fetchTripDetails]);

  // Return to trip list
  const handleBackToList = useCallback(() => {
    setSelectedTrip(null);
    setTripDetails(null);
  }, []);

  // Filter trips based on search term and date range
  useEffect(() => {
    let tempFilteredTrips = [...allDriverTrips];

    if (selectedDateRange?.from) {
      const fromDate = new Date(selectedDateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = selectedDateRange.to ? new Date(selectedDateRange.to) : fromDate;
      toDate.setHours(23, 59, 59, 999);

      tempFilteredTrips = tempFilteredTrips.filter(dTrip => {
        const tripDate = new Date(dTrip.date);
        return tripDate >= fromDate && tripDate <= toDate;
      });
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredTrips = tempFilteredTrips.filter(dTrip => {
        const trip = dTrip.trip;
        const bus = trip?.bus;
        const route = trip?.route;

        const studentNameMatch = trip?.tripStudents?.some(ts => 
          ts.student?.fullname?.toLowerCase().includes(lowerCaseSearchTerm)
        );

        return (
          trip?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
          bus?.plateNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
          bus?.marque?.toLowerCase().includes(lowerCaseSearchTerm) ||
          route?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
          studentNameMatch
        );
      });
    }

    setFilteredTrips(tempFilteredTrips);
    const newTotalPages = Math.ceil(tempFilteredTrips.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (tempFilteredTrips.length === 0) {
      setCurrentPage(1);
    }
  }, [allDriverTrips, searchTerm, selectedDateRange, currentPage]);

  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      COMPLETED: { text: 'Terminé', color: 'bg-green-100 text-green-800' },
      ONGOING: { text: 'En cours', color: 'bg-blue-100 text-blue-800' },
      CANCELLED: { text: 'Annulé', color: 'bg-red-100 text-red-800' },
      PENDING: { text: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge className={cn("capitalize", statusInfo.color)}>
        {statusInfo.text}
      </Badge>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="h-8 w-8 mx-auto animate-spin" />
          <p className="mt-2">Chargement des trajets...</p>
        </div>
      </div>
    );
  }

  // Affichage des détails du trajet
  if (selectedTrip) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackToList} variant="ghost" size="icon">
            <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-default-900">Détails du trajet</h1>
            <p className="text-default-600">
              {selectedTrip.trip?.name || 'Trajet sans nom'} • {new Date(selectedTrip.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="py-4 px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold text-default-800">
                  {selectedTrip.trip?.name || 'Détails du trajet'}
                </CardTitle>
                <CardDescription>
                  {new Date(selectedTrip.date).toLocaleDateString()} • {selectedTrip.timeSlot}
                </CardDescription>
              </div>
              {getStatusBadge(selectedTrip.status)}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loadingDetails ? (
              <div className="flex justify-center items-center h-40">
                <Icon icon="heroicons:arrow-path" className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Informations du bus</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Plaque:</span> {tripDetails?.trip?.bus?.plateNumber || 'N/A'}</p>
                      <p><span className="text-gray-600">Marque:</span> {tripDetails?.trip?.bus?.marque || 'N/A'}</p>
                      <p><span className="text-gray-600">Capacité:</span> {tripDetails?.trip?.bus?.capacity || 'N/A'} places</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Informations du trajet</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Chauffeur:</span> {tripDetails?.trip?.driver?.fullname || 'N/A'}</p>
                      <p><span className="text-gray-600">Itinéraire:</span> {tripDetails?.trip?.route?.name || 'N/A'}</p>
                      <p><span className="text-gray-600">Établissement:</span> {tripDetails?.trip?.establishment?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Liste des arrêts */}
                <div>
                  <h3 className="font-medium mb-3">Itinéraire et arrêts</h3>
                  {tripDetails?.trip?.route?.stops?.length > 0 ? (
                    <div className="border rounded-md divide-y divide-gray-200">
                      {tripDetails.trip.route.stops.map((stop, index) => (
                        <div key={stop.id} className="p-3 flex items-center">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{stop.name}</p>
                            <p className="text-sm text-gray-600">{stop.address}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {stop.lat}, {stop.lng}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucun arrêt défini pour cet itinéraire</p>
                  )}
                </div>

                <Separator />

                {/* Liste des élèves */}
                <div>
                  <h3 className="font-medium mb-3">Élèves assignés</h3>
                  {tripDetails?.trip?.tripStudents?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Classe</TableHead>
                          <TableHead>Quartier</TableHead>
                          <TableHead>Présence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tripDetails.trip.tripStudents.map(({ student }) => {
                          const attendance = tripDetails.attendances?.find(a => 
                            a.studentId === student.id && a.type === 'DEPART'
                          );
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.fullname}</TableCell>
                              <TableCell>{student.class}</TableCell>
                              <TableCell>{student.quartie}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={attendance?.status === 'PRESENT' ? 'default' : 'secondary'}
                                  className={cn(
                                    "capitalize",
                                    attendance?.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                                    attendance?.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  )}
                                >
                                  {attendance ? attendance.status : 'Non marqué'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500">Aucun élève assigné à ce trajet</p>
                  )}
                </div>

                {/* Incidents */}
                {tripDetails?.incidents?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-3">Incidents signalés</h3>
                      <div className="space-y-3">
                        {tripDetails.incidents.map(incident => (
                          <div key={incident.id} className="border-l-4 border-red-500 pl-4 py-2">
                            <p className="text-sm text-gray-500">
                              {new Date(incident.timestamp).toLocaleString()}
                            </p>
                            <p>{incident.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affichage de la liste des trajets (vue par défaut)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-default-900">Historique des Trajets</h1>
      </div>
      <p className="text-default-600">Consultez et recherchez vos trajets passés.</p>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Rechercher par trajet, bus, élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
          <Icon
            icon="heroicons:magnifying-glass"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
        </div>
        <DatePickerWithRange
          date={selectedDateRange}
          setDate={setSelectedDateRange}
          placeholder="Filtrer par date"
        />
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="py-4 px-6 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
            <Icon icon="heroicons:list-bullet" className="h-6 w-6 text-indigo-500" />
            Liste des trajets
          </CardTitle>
          <CardDescription>
            {filteredTrips.length === allDriverTrips.length 
              ? `Nombre total: ${allDriverTrips.length}`
              : `Filtrés: ${filteredTrips.length}/${allDriverTrips.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTrips.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Nom du trajet</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTrips.map((trip) => (
                    <TableRow key={trip.id} className="hover:bg-gray-50">
                      <TableCell>{new Date(trip.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{trip.trip?.name || 'Trajet sans nom'}</TableCell>
                      <TableCell>{trip.trip?.bus?.plateNumber || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(trip.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSelectTrip(trip)}
                        >
                          <Icon icon="heroicons:eye" className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t">
                  <Button 
                    variant="outline" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {allDriverTrips.length === 0 
                ? 'Aucun trajet trouvé'
                : 'Aucun trajet ne correspond à vos critères'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TripHistoryPage;
