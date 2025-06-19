// pages/driver/DriverDashboardPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  demoData,
  getDailyTripsForDriver,
  getStudentsByTrip,
  getStopsByRoute,
  getAttendanceForDailyTripAndStudent,
  getNotificationsForUser,
  markNotificationAsRead,
  getUserById,
  getTripById,
  getBusById,
  getRouteById,
  updateDailyTripStatus,
  addBusPosition,
  getLatestBusPosition,
} from '@/data/data';

import { AssignedTripsList } from './AssignedTripsList';
import { TripDetailsCard } from './TripDetailsCard';
import { MarkAttendanceModal } from './MarkAttendanceModal';
import { ReportIncidentModal } from './ReportIncidentModal';
import { NotificationsList } from './NotificationsList';

import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DatePickerWithRange from "@/components/date-picker-with-range";
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Import Leaflet components for the embedded map
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const ITEMS_PER_PAGE = 5;
const MOCK_DRIVER_ID = 4; // Chauffeur Ali

const DriverDashboardPage = () => {
  const [currentDemoData, setCurrentDemoData] = useState(demoData);
  const [driver, setDriver] = useState(null);
  const [dailyTrips, setDailyTrips] = useState([]);
  const [selectedDailyTrip, setSelectedDailyTrip] = useState(null);
  const [studentsInSelectedTrip, setStudentsInSelectedTrip] = useState([]);
  const [stopsInSelectedRoute, setStopsInSelectedRoute] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [busPosition, setBusPosition] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  // Pagination for daily trips list
  const [currentPage, setCurrentPage] = useState(1);
  const [dailyTripsFilteredAndPaginated, setDailyTripsFilteredAndPaginated] = useState([]);
  const [totalDailyTripPages, setTotalDailyTripPages] = useState(1);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  // Modals state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalStudentId, setAttendanceModalStudentId] = useState(null);
  const [attendanceModalDailyTripId, setAttendanceModalDailyTripId] = useState(null);
  const [attendanceModalCurrentStatus, setAttendanceModalCurrentStatus] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Fetch initial driver data and all assigned daily trips
  useEffect(() => {
    const driverUser = getUserById(MOCK_DRIVER_ID);
    setDriver(driverUser);

    const fetchedDailyTrips = getDailyTripsForDriver(MOCK_DRIVER_ID);
    setDailyTrips(fetchedDailyTrips);

    const fetchedNotifications = getNotificationsForUser(MOCK_DRIVER_ID);
    setNotifications(fetchedNotifications);
  }, [currentDemoData]);

  // Filter and paginate daily trips
  useEffect(() => {
    let filteredTrips = dailyTrips;

    if (selectedDate) {
      const selectedDateString = selectedDate.toISOString().split('T')[0];
      filteredTrips = filteredTrips.filter(dTrip => dTrip.simpleDate === selectedDateString);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredTrips = filteredTrips.filter(dTrip => {
        const trip = dTrip.trip;
        const bus = trip?.bus;
        const route = trip?.route;
        const driver = trip?.driver;

        const studentsAssigned = getStudentsByTrip(trip.id);
        const studentNameMatch = studentsAssigned.some(student =>
          student.fullname.toLowerCase().includes(lowerCaseSearchTerm)
        );

        return (
          trip?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          bus?.plateNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
          bus?.marque.toLowerCase().includes(lowerCaseSearchTerm) ||
          route?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          driver?.fullname.toLowerCase().includes(lowerCaseSearchTerm) ||
          studentNameMatch
        );
      });
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDailyTripsFilteredAndPaginated(filteredTrips.slice(startIndex, endIndex));
    setTotalDailyTripPages(Math.ceil(filteredTrips.length / ITEMS_PER_PAGE));

    if (selectedDailyTrip && !filteredTrips.some(dTrip => dTrip.id === selectedDailyTrip.id)) {
      setSelectedDailyTrip(null);
    }

    const newTotalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (filteredTrips.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [dailyTrips, currentPage, searchTerm, selectedDate, selectedDailyTrip]);

  // When a daily trip is selected, fetch its detailed data
  useEffect(() => {
    if (selectedDailyTrip) {
      setStudentsInSelectedTrip(getStudentsByTrip(selectedDailyTrip.trip.id));
      setStopsInSelectedRoute(getStopsByRoute(selectedDailyTrip.trip.route.id));
      
      // Get current bus position
      const position = getLatestBusPosition(selectedDailyTrip.id);
      setBusPosition(position);
    } else {
      setStudentsInSelectedTrip([]);
      setStopsInSelectedRoute([]);
      setBusPosition(null);
    }
  }, [selectedDailyTrip]);

  // Helper Functions
  const getAttendanceStatusForStudent = useCallback((studentId) => {
    if (!selectedDailyTrip) return null;
    const attendance = getAttendanceForDailyTripAndStudent(selectedDailyTrip.id, studentId);
    const departStatus = attendance.find(att => att.type === 'DEPART')?.status;
    return departStatus || 'ABSENT';
  }, [selectedDailyTrip]);

  const getAttendanceText = (status) => {
    switch (status) {
      case 'PRESENT': return 'Présent';
      case 'ABSENT': return 'Absent';
      case 'LATE': return 'En Retard';
      default: return 'Non marqué';
    }
  };

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'green';
      case 'ABSENT': return 'red';
      case 'LATE': return 'yellow';
      default: return 'gray';
    }
  };

  const getTripStatusColor = (s) => {
    switch (s) {
      case 'PLANNED': return 'blue';
      case 'ONGOING': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELED': return 'red';
      default: return 'gray';
    }
  };

  const getTripStatusText = (s) => {
    switch (s) {
      case 'PLANNED': return 'Planifié';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELED': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  // Handlers
  const handleSelectDailyTrip = (dTrip) => {
    setSelectedDailyTrip(dTrip);
  };

  const handleGoBackToList = () => {
    setSelectedDailyTrip(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenAttendanceModal = (sId) => {
    if (!selectedDailyTrip) {
      toast.error("Veuillez sélectionner un trajet quotidien avant de marquer la présence.");
      return;
    }
    setAttendanceModalDailyTripId(selectedDailyTrip.id);
    setAttendanceModalStudentId(sId);
    setAttendanceModalCurrentStatus(getAttendanceStatusForStudent(sId));
    setIsAttendanceModalOpen(true);
  };

  const handleAttendanceMarked = () => {
    setCurrentDemoData({ ...demoData });
    toast.success('Présence mise à jour!');
  };

  const handleOpenIncidentModal = () => {
    if (!selectedDailyTrip) {
      toast.error("Veuillez sélectionner un trajet pour signaler un incident.");
      return;
    }
    setIsIncidentModalOpen(true);
  };

  const handleIncidentReported = () => {
    setCurrentDemoData({ ...demoData });
    toast.success('Incident signalé avec succès !');
  };

  const handleMarkNotificationAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
    setCurrentDemoData({ ...demoData });
    toast.success('Notification marquée comme lue.');
  };

  const handleStartTrip = () => {
    if (!selectedDailyTrip) return;
    
    try {
      updateDailyTripStatus(selectedDailyTrip.id, 'ONGOING');
      setCurrentDemoData({ ...demoData });
      toast.success('Trajet démarré avec succès !');
    } catch (error) {
      toast.error('Erreur lors du démarrage du trajet.');
    }
  };

  const handleCompleteTrip = () => {
    if (!selectedDailyTrip) return;
    
    try {
      updateDailyTripStatus(selectedDailyTrip.id, 'COMPLETED');
      setCurrentDemoData({ ...demoData });
      toast.success('Trajet terminé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la finalisation du trajet.');
    }
  };

  const handleCancelTrip = () => {
    if (!selectedDailyTrip) return;
    
    try {
      updateDailyTripStatus(selectedDailyTrip.id, 'CANCELED');
      setCurrentDemoData({ ...demoData });
      toast.success('Trajet annulé.');
    } catch (error) {
      toast.error('Erreur lors de l\'annulation du trajet.');
    }
  };

  const handleToggleTracking = () => {
    if (!selectedDailyTrip) {
      toast.error("Veuillez sélectionner un trajet pour activer le suivi.");
      return;
    }

    if (isTrackingActive) {
      setIsTrackingActive(false);
      toast.success('Suivi GPS désactivé.');
    } else {
      setIsTrackingActive(true);
      toast.success('Suivi GPS activé ! Les parents peuvent maintenant voir votre position.');
      
      // Simulate GPS tracking (in real app, this would be actual GPS)
      const mockPosition = {
        lat: 36.8065 + (Math.random() - 0.5) * 0.01,
        lng: 10.1815 + (Math.random() - 0.5) * 0.01
      };
      
      addBusPosition(selectedDailyTrip.id, mockPosition.lat, mockPosition.lng);
      setBusPosition(mockPosition);
    }
  };

  if (!driver) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-default-600">
        Chargement des informations du chauffeur...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Tableau de bord Conducteur</h1>
          <p className="text-default-600">Bienvenue, {driver.fullname}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Icon icon="heroicons:signal" className="h-4 w-4 mr-1" />
            En ligne
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:truck" className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trajets aujourd'hui</p>
                <p className="text-2xl font-bold">{dailyTrips.filter(t => t.simpleDate === new Date().toISOString().split('T')[0]).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:users" className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Élèves transportés</p>
                <p className="text-2xl font-bold">{studentsInSelectedTrip.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:bell" className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nouvelles notifications</p>
                <p className="text-2xl font-bold">{notifications.filter(n => !n.read).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:map-pin" className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suivi GPS</p>
                <p className="text-2xl font-bold">{isTrackingActive ? 'Actif' : 'Inactif'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Input
              type="text"
              placeholder="Rechercher un trajet..."
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
            date={selectedDate}
            setDate={setSelectedDate}
            placeholder="Sélectionner une date"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedDailyTrip ? (
            <Card className="shadow-sm border border-gray-200 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
                      <Button onClick={handleGoBackToList} variant="ghost" size="icon" className="mr-2">
                        <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
                      </Button>
                      Détails du Trajet: {selectedDailyTrip.trip?.name || 'N/A'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Date: {selectedDailyTrip.displayDate}
                      <Badge className={cn("ml-2 capitalize")} color={getTripStatusColor(selectedDailyTrip.status)} variant="soft">
                        {getTripStatusText(selectedDailyTrip.status)}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                     {selectedDailyTrip.status === 'PLANNED' && (
                      <Button onClick={handleStartTrip} variant="default" size="sm">
                          <Icon icon="heroicons:play" className="h-4 w-4 mr-2" /> Démarrer
                        </Button>
                      )}
                      {selectedDailyTrip.status === 'ONGOING' && (
                      <Button onClick={handleCompleteTrip} variant="default" size="sm">
                          <Icon icon="heroicons:check" className="h-4 w-4 mr-2" /> Terminer
                        </Button>
                      )}
                      {(selectedDailyTrip.status === 'PLANNED' || selectedDailyTrip.status === 'ONGOING') && (
                      <Button onClick={handleCancelTrip} variant="destructive" size="sm">
                          <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" /> Annuler
                        </Button>
                      )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow overflow-y-auto">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="students">Élèves</TabsTrigger>
                    <TabsTrigger value="route">Itinéraire</TabsTrigger>
                    <TabsTrigger value="tracking">Suivi GPS</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                 {/* Bus & Route Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                        <h4 className="font-semibold text-sm mb-2">Informations Bus</h4>
                        <p className="text-sm"><strong>Plaque:</strong> {selectedDailyTrip.trip?.bus?.plateNumber || 'N/A'}</p>
                        <p className="text-sm"><strong>Marque:</strong> {selectedDailyTrip.trip?.bus?.marque || 'N/A'}</p>
                        <p className="text-sm"><strong>Capacité:</strong> {selectedDailyTrip.trip?.bus?.capacity || 'N/A'} places</p>
                  </div>
                  <div>
                        <h4 className="font-semibold text-sm mb-2">Informations Route</h4>
                        <p className="text-sm"><strong>Route:</strong> {selectedDailyTrip.trip?.route?.name || 'N/A'}</p>
                        <p className="text-sm"><strong>Arrêts:</strong> {stopsInSelectedRoute.length}</p>
                        <p className="text-sm"><strong>Élèves:</strong> {studentsInSelectedTrip.length}</p>
                  </div>
                </div>

                    {/* Quick Actions */}
                    {selectedDailyTrip.status === 'PLANNED' && (
                      <div className="grid grid-cols-2 gap-4">
                       <Button 
                       onClick={handleToggleTracking} 
                       variant={isTrackingActive ? "destructive" : "default"}
                       className=" flex   gap-2"
                     >
                       <Icon icon="heroicons:map-pin" className="h-6 w-6" />
                       {isTrackingActive ? 'Désactiver GPS' : 'Activer GPS'}
                     </Button>
                     <Button 
                       onClick={handleOpenIncidentModal} 
                       variant="outline"
                       className="  flex   gap-2"
                     >
                       <Icon icon="heroicons:exclamation-triangle" className="h-6 w-6" />
                       Signaler Incident
                     </Button>
                    </div>
                    )}
                    
                     
                  </TabsContent>

                  <TabsContent value="students" className="space-y-4">
                    <h3 className="font-semibold text-lg mb-2 text-default-700">Liste des Élèves & Présence</h3>
                {studentsInSelectedTrip.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                              <TableHead>Élève</TableHead>
                          <TableHead>Classe</TableHead>
                          <TableHead>Quartier</TableHead>
                              <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsInSelectedTrip.map(student => {
                          const studentAttendanceStatus = getAttendanceStatusForStudent(student.id);
                          return (
                            <TableRow key={student.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback>{student.fullname.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium">{student.fullname}</span>
                                    </div>
                                  </TableCell>
                              <TableCell>{student.class}</TableCell>
                              <TableCell>{student.quartie}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="soft"
                                  color={getAttendanceColor(studentAttendanceStatus)}
                                  className="capitalize"
                                >
                                  {getAttendanceText(studentAttendanceStatus)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                      onClick={() => handleOpenAttendanceModal(student.id)}
                                  className="text-primary-foreground bg-primary hover:bg-primary/90"
                                >
                                  <Icon icon="heroicons:check-circle" className="h-4 w-4 mr-2" /> Marquer
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun élève assigné à ce trajet.</p>
                )}
                  </TabsContent>

                  <TabsContent value="route" className="space-y-4">
                    <h3 className="font-semibold text-lg mb-2 text-default-700">Carte de l'Itinéraire</h3>
                    {stopsInSelectedRoute.length > 0 ? (
                      <div className="w-full h-[400px] rounded-md overflow-hidden border">
                        <MapContainer
                          center={[stopsInSelectedRoute[0].lat, stopsInSelectedRoute[0].lng]}
                          zoom={13}
                          scrollWheelZoom={false}
                          className="h-full w-full"
                        >
                          <TileLayer
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          {stopsInSelectedRoute.map((stop, index) => (
                            <Marker key={stop.id} position={[stop.lat, stop.lng]}>
                              <Popup>
                                <div>
                                  <strong>Arrêt {index + 1}: {stop.name}</strong>
                                  <br />
                                  {stop.address}
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                          {stopsInSelectedRoute.length > 1 && (
                            <Polyline positions={stopsInSelectedRoute.map(stop => [stop.lat, stop.lng])} color="blue" />
                          )}
                          {busPosition && (
                            <Marker position={[busPosition.lat, busPosition.lng]} icon={new L.Icon({
                              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                              iconSize: [25, 41],
                              iconAnchor: [12, 41],
                              popupAnchor: [1, -34],
                              shadowSize: [41, 41]
                            })}>
                              <Popup>Position actuelle du bus</Popup>
                            </Marker>
                          )}
                        </MapContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun arrêt pour afficher l'itinéraire.</p>
                    )}

                    <h3 className="font-semibold text-lg mb-2 text-default-700">Liste des Arrêts</h3>
                    {stopsInSelectedRoute.length > 0 ? (
                      <div className="space-y-2">
                        {stopsInSelectedRoute.map((stop, index) => (
                          <div key={stop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{stop.name}</p>
                                <p className="text-sm text-muted-foreground">{stop.address}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Icon icon="heroicons:bell" className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun arrêt défini pour cette route.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="tracking" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-default-700">Suivi GPS en Temps Réel</h3>
                      <Button 
                        onClick={handleToggleTracking} 
                        variant={isTrackingActive ? "destructive" : "default"}
                        size="sm"
                      >
                        <Icon icon={isTrackingActive ? "heroicons:stop" : "heroicons:play"} className="h-4 w-4 mr-2" />
                        {isTrackingActive ? 'Arrêter' : 'Démarrer'} le suivi
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon icon="heroicons:information-circle" className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Statut du suivi</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        {isTrackingActive 
                          ? "Le suivi GPS est actif. Les parents peuvent voir votre position en temps réel."
                          : "Le suivi GPS est inactif. Activez-le pour permettre aux parents de suivre le bus."
                        }
                      </p>
                    </div>

                    {busPosition && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Latitude</p>
                          <p className="text-lg font-mono">{busPosition.lat.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Longitude</p>
                          <p className="text-lg font-mono">{busPosition.lng.toFixed(6)}</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <AssignedTripsList
              dailyTrips={dailyTripsFilteredAndPaginated}
              onSelectDailyTrip={handleSelectDailyTrip}
              selectedDailyTripId={selectedDailyTrip?.id}
              currentPage={currentPage}
              totalPages={totalDailyTripPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* GPS Tracking Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-default-800 flex items-center gap-2">
                <Icon icon="heroicons:map-pin" className="h-5 w-5 text-green-500" />
                Suivi GPS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge variant={isTrackingActive ? "default" : "secondary"}>
                  {isTrackingActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              
              {selectedDailyTrip && (
                <Button 
                  onClick={handleToggleTracking} 
                  variant={isTrackingActive ? "destructive" : "default"}
                  className="w-full"
                  disabled={!selectedDailyTrip}
                >
                  <Icon icon={isTrackingActive ? "heroicons:stop" : "heroicons:play"} className="h-5 w-5 mr-2" />
                  {isTrackingActive ? 'Arrêter' : 'Démarrer'} le suivi
                </Button>
              )}
              
              {!selectedDailyTrip && (
                <p className="text-xs text-muted-foreground text-center">
                  Sélectionnez un trajet pour activer le suivi GPS
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <NotificationsList
            notifications={notifications}
            onMarkAsRead={handleMarkNotificationAsRead}
          />
        </div>
      </div>

      {/* Modals */}
      {isAttendanceModalOpen && (
        <MarkAttendanceModal
          isOpen={isAttendanceModalOpen}
          setIsOpen={setIsAttendanceModalOpen}
          dailyTripId={attendanceModalDailyTripId}
          studentId={attendanceModalStudentId}
          currentStatus={attendanceModalCurrentStatus}
          onAttendanceMarked={handleAttendanceMarked}
          driverId={MOCK_DRIVER_ID}
          initialDemoData={currentDemoData}
        />
      )}

      {isIncidentModalOpen && (
        <ReportIncidentModal
          isOpen={isIncidentModalOpen}
          setIsOpen={setIsIncidentModalOpen}
          dailyTripId={selectedDailyTrip?.id}
          driverId={MOCK_DRIVER_ID}
          onIncidentReported={handleIncidentReported}
        />
      )}
    </div>
  );
};

export default DriverDashboardPage;