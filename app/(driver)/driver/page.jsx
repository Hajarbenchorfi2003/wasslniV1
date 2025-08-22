'use client';
import React, { useState, useEffect, useCallback } from 'react';
import driverService from '@/services/driverService';
import stopService from '@/services/stopService';
import { AssignedTripsList } from './AssignedTripsList';
import { MarkAttendanceModal } from './MarkAttendanceModal';
import { ReportIncidentModal } from './ReportIncidentModal';
import { NotificationsList } from './NotificationsList';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DatePickerWithRange from '@/components/date-picker-with-range';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import 'leaflet/dist/leaflet.css';

// Import Leaflet components dynamically to avoid SSR issues
import dynamic from 'next/dynamic';
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

const ITEMS_PER_PAGE = 5;

const DriverDashboardPage = () => {
  const [driver, setDriver] = useState(null);
  const [dailyTrips, setDailyTrips] = useState([]);
  const [selectedDailyTrip, setSelectedDailyTrip] = useState(null);
  const [studentsInSelectedTrip, setStudentsInSelectedTrip] = useState([]);
  const [stopsInSelectedRoute, setStopsInSelectedRoute] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [busPosition, setBusPosition] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [parentsCoordinates, setParentsCoordinates] = useState([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [dailyTripsFilteredAndPaginated, setDailyTripsFilteredAndPaginated] = useState([]);
  const [totalDailyTripPages, setTotalDailyTripPages] = useState(1);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  // Modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalStudentId, setAttendanceModalStudentId] = useState(null);
  const [attendanceModalDailyTripId, setAttendanceModalDailyTripId] = useState(null);
  const [attendanceModalCurrentStatus, setAttendanceModalCurrentStatus] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Load driver & trips on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const trips = await driverService.getDailyTrips();
        setDailyTrips(trips);

        if (trips.length > 0 && trips[0].trip?.driver) {
          setDriver(trips[0].trip.driver);
        }
        const fetchedNotifications = await driverService.getNotfication();
        setNotifications(fetchedNotifications);
      } catch (error) {
        toast.error("Impossible de charger les données");
      }
    };

    fetchInitialData();
  }, []);

  // Filter and paginate dailyTrips
  useEffect(() => {
    let filtered = [...dailyTrips];

    if (selectedDate) {
      const selectedDateString = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(
        (dTrip) => new Date(dTrip.date).toISOString().split('T')[0] === selectedDateString
      );
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((dTrip) => {
        const trip = dTrip.trip;
        return (
          trip.name?.toLowerCase().includes(lower) ||
          trip.bus?.plateNumber?.toLowerCase().includes(lower) ||
          trip.route?.name?.toLowerCase().includes(lower)
        );
      });
    }

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setTotalDailyTripPages(totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    setDailyTripsFilteredAndPaginated(filtered.slice(start, start + ITEMS_PER_PAGE));
  }, [dailyTrips, currentPage, searchTerm, selectedDate]);

  // Load trip details when selected
  useEffect(() => {
    const loadTripDetails = async () => {
      if (!selectedDailyTrip) {
        setStudentsInSelectedTrip([]);
        setStopsInSelectedRoute([]);
        setBusPosition(null);
        setParentsCoordinates([]);
        return;
      }

      try {
        setIsLoadingParents(true);
        
        // Charger les détails du trajet
        const tripDetails = await driverService.getTripDetails(selectedDailyTrip.id);
        
        // Charger les coordonnées des parents
        const tripId = tripDetails.trip?.id || selectedDailyTrip.tripId;
        if (tripId) {
          try {
            const parentsCoords = await stopService.getParentsCoordinatesForTrip(tripId);
            setParentsCoordinates(parentsCoords.data || []);
          } catch (error) {
            console.error('Error loading parents coordinates:', error);
            setParentsCoordinates([]);
          }
        }
        
        // Extraire les étudiants et les arrêts
        const students = tripDetails.trip?.tripStudents?.map(ts => ts.student) || [];
        const stops = tripDetails.trip?.route?.stops || [];
        
        setStudentsInSelectedTrip(students);
        setStopsInSelectedRoute(stops);
        setBusPosition(tripDetails.currentPosition || null);
        
      } catch (error) {
        console.error('Error loading trip details:', error);
        toast.error("Erreur lors du chargement des détails du trajet");
      } finally {
        setIsLoadingParents(false);
      }
    };

    loadTripDetails();
  }, [selectedDailyTrip]);

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

  const handleStartTrip = async () => {
    if (!selectedDailyTrip) return;
    try {
      await driverService.startTrip(selectedDailyTrip.id);
      setSelectedDailyTrip({ ...selectedDailyTrip, status: 'ONGOING' });
      toast.success("Trajet démarré !");
    } catch (error) {
      toast.error("Échec du démarrage du trajet");
    }
  };

  const handleCompleteTrip = async () => {
    if (!selectedDailyTrip) return;
    try {
      await driverService.completeTrip(selectedDailyTrip.id);
      setSelectedDailyTrip({ ...selectedDailyTrip, status: 'COMPLETED' });
      toast.success("Trajet terminé !");
    } catch (error) {
      toast.error("Échec de la finalisation du trajet");
    }
  };

  const handleCancelTrip = async () => {
    if (!selectedDailyTrip) return;
    try {
      await driverService.cancelTrip(selectedDailyTrip.id);
      setSelectedDailyTrip({ ...selectedDailyTrip, status: 'CANCELLED' });
      toast.success("Trajet annulé !");
    } catch (error) {
      toast.error("Échec de l'annulation du trajet");
    }
  };

  const handleToggleTracking = () => {
    if (!selectedDailyTrip) {
      toast.error("Veuillez sélectionner un trajet.");
      return;
    }
    setIsTrackingActive(!isTrackingActive);
    toast.success(`Suivi GPS ${isTrackingActive ? 'désactivé' : 'activé'}`);
  };

  const getAttendanceStatusForStudent = useCallback(
    (studentId) => {
      if (!selectedDailyTrip) return 'EN_COURS';
      
      const attendance = selectedDailyTrip.attendances?.find(
        att => att.studentId === studentId && att.type === 'DEPART'
      );
      
      return attendance?.status || 'EN_COURS';
    },
    [selectedDailyTrip]
  );

  const handleOpenIncidentModal = () => {
    if (!selectedDailyTrip) {
      toast.error("Veuillez sélectionner un trajet.");
      return;
    }
    setIsIncidentModalOpen(true);
  };

  const handleOpenAttendanceModal = (studentId) => {
    if (!selectedDailyTrip) {
      toast.error("Veuillez sélectionner un trajet.");
      return;
    }
    setAttendanceModalStudentId(studentId);
    setAttendanceModalDailyTripId(selectedDailyTrip.id);
    setAttendanceModalCurrentStatus(getAttendanceStatusForStudent(studentId));
    setIsAttendanceModalOpen(true);
  };

  const getTripStatusColor = (status) => {
    switch (status) {
      case 'PLANNED': return 'blue';
      case 'ONGOING': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getTripStatusText = (status) => {
    switch (status) {
      case 'PLANNED': return 'Planifié';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'green';
      case 'ABSENT': return 'red';
      case 'LATE': return 'yellow';
      case 'EN_COURS': return 'blue';
      default: return 'gray';
    }
  };
  
  const getAttendanceText = (status) => {
    switch (status) {
      case 'PRESENT': return 'Présent';
      case 'ABSENT': return 'Absent';
      case 'LATE': return 'En retard';
      case 'EN_COURS': return 'En cours';
      default: return 'Inconnu';
    }
  };

  // Fonction pour calculer le centre de la carte
  const getMapCenter = () => {
    if (stopsInSelectedRoute.length > 0) {
      return [stopsInSelectedRoute[0].lat, stopsInSelectedRoute[0].lng];
    }
    if (parentsCoordinates.length > 0) {
      return [parentsCoordinates[0].lat, parentsCoordinates[0].lng];
    }
    if (busPosition) {
      return [busPosition.lat, busPosition.lng];
    }
    return [0, 0]; // Fallback
  };

  if (!dailyTrips) {
    return (
      <div className="flex justify-center items-center h-screen">
        Chargement des informations...
      </div>
    );
  }
  // Create a custom Marker component that handles the icon creation safely
const CustomMarker = ({ position, iconConfig, children }) => {
  const [icon, setIcon] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.L) {
      const newIcon = new window.L.Icon(iconConfig);
      setIcon(newIcon);
    }
  }, [iconConfig]);

  if (!icon) return null;

  return (
    <Marker position={position} icon={icon}>
      {children && <Popup>{children}</Popup>}
    </Marker>
  );
};


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Conducteur</h1>
          <p>Bienvenue!</p>
        </div>
        <Badge variant="outline" color="success">
          En ligne
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <Icon icon="heroicons:truck" className="text-blue-500" />
            <div>
              <p>Trajets aujourd&apos;hui</p>
              <p className="text-2xl font-bold">{dailyTrips.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter/Search Section */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DatePickerWithRange date={selectedDate} setDate={setSelectedDate} />
      </div>

      {/* Main Content Grid */}
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
                   <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                   <TabsTrigger value="students">Élèves</TabsTrigger>
                    <TabsTrigger value="route">Itinéraire</TabsTrigger>
                    <TabsTrigger value="tracking">Suivi GPS</TabsTrigger>
                </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* Bus & Route Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-default-50 rounded-lg">
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
                        <p className="text-sm"><strong>Parents localisés:</strong> {parentsCoordinates.length}</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {(selectedDailyTrip.status === 'PLANNED' || selectedDailyTrip.status === 'ONGOING') && (
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          onClick={handleToggleTracking} 
                          variant={isTrackingActive ? "destructive" : "default"}
                          className="flex gap-2"
                        >
                          <Icon icon="heroicons:map-pin" className="h-6 w-6" />
                          {isTrackingActive ? 'Désactiver GPS' : 'Activer GPS'}
                        </Button>
                        <Button 
                          onClick={handleOpenIncidentModal} 
                          variant="outline"
                          className="flex gap-2"
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
                              const isStatusUndefined = !studentAttendanceStatus || studentAttendanceStatus === 'EN_COURS';
                              
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
                                      {isStatusUndefined ? 'En cours' : getAttendanceText(studentAttendanceStatus)}
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
                    <h3 className="font-semibold text-lg mb-2 text-default-700">Carte de l&apos;Itinéraire</h3>
                    
                    {isLoadingParents && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon icon="heroicons:arrow-path" className="h-5 w-5 animate-spin text-blue-600" />
                          <span className="text-blue-700">Chargement des positions des parents...</span>
                        </div>
                      </div>
                    )}

                    {(stopsInSelectedRoute.length > 0 || parentsCoordinates.length > 0 || busPosition) ? (
                      <div className="w-full h-[500px] rounded-md overflow-hidden border">
                        {typeof window !== 'undefined' && (
                          <MapContainer
                            center={getMapCenter()}
                            zoom={13}
                            scrollWheelZoom={true}
                            className="h-full w-full"
                          >
                            <TileLayer
                              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {/* Marqueurs pour les arrêts */}
                            {stopsInSelectedRoute.map((stop, index) => (
                                    <CustomMarker
              key={`stop-${stop.id}`}
              position={[stop.lat, stop.lng]}
              iconConfig={{
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              }}
            >
                                <Popup>
                                  <div className="text-center">
                                    <strong>Arrêt {index + 1}: {stop.name}</strong>
                                    <br />
                                    <small>{stop.address}</small>
                                    <br />
                                    <span className="text-blue-600">● Arrêt de bus</span>
                                  </div>
                                </Popup>
                              </CustomMarker>
                            ))}

                            {/* Marqueurs pour les parents */}
                            {parentsCoordinates.map((parent, index) => (
                              parent.lat && parent.lng && (
                                  <CustomMarker
                key={`parent-${parent.parentId || index}`}
                position={[parent.lat, parent.lng]}
                iconConfig={{
                  iconUrl: 'https://img.icons8.com/color/48/person-male.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                }}
              >
                                  <Popup>
                                    <div className="text-center">
                                      <strong>📍 Parent: {parent.parentName || 'Parent'}</strong>
                                      <br />
                                      {parent.parentPhone && (
                                        <><small>Tél: {parent.parentPhone}</small><br /></>
                                      )}
                                      {parent.studentName && (
                                        <><small>Élève: {parent.studentName}</small><br /></>
                                      )}
                                      <span className="text-green-600">● Domicile parent</span>
                                    </div>
                                  </Popup>
                                </CustomMarker>
                              )
                            ))}

                            {/* Ligne pour l'itinéraire */}
                            {stopsInSelectedRoute.length > 1 && (
                              <Polyline 
                                positions={stopsInSelectedRoute.map(stop => [stop.lat, stop.lng])} 
                                color="blue" 
                                weight={4}
                                opacity={0.7}
                              />
                            )}

                            {/* Position actuelle du bus */}
                            {busPosition && busPosition.lat && busPosition.lng && (
                              <Marker 
                                position={[busPosition.lat, busPosition.lng]} 
                               iconConfig={{
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }}
                              >
                                <Popup>
                                  <div className="text-center">
                                    <strong>🚌 Position actuelle du bus</strong>
                                    <br />
                                    <small>Lat: {busPosition.lat.toFixed(6)}</small>
                                    <br />
                                    <small>Lng: {busPosition.lng.toFixed(6)}</small>
                                  </div>
                                </Popup>
                              </Marker>
                            )}
                          </MapContainer>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune donnée à afficher sur la carte.</p>
                    )}

                    {/* Légende de la carte */}
                    <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Position du bus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Arrêts de bus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Domiciles des parents</span>
                      </div>
                    </div>

                    {/* Statistiques des parents */}
                    {parentsCoordinates.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Domiciles des parents</h4>
                        <p className="text-sm text-green-700">
                          {parentsCoordinates.length} parent(s) ont partagé leur position
                        </p>
                      </div>
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
                          ? 'Le suivi GPS est actif. Les parents peuvent voir votre position en temps réel.'
                          : 'Le suivi GPS est inactif. Activez-le pour permettre aux parents de suivre le bus.'
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
          <Card>
            <CardHeader>
              <CardTitle>Suivi GPS</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleToggleTracking}>
                {isTrackingActive ? 'Arrêter' : 'Démarrer'} le suivi
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <NotificationsList notifications={notifications} />
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
        />
      )}

      {isIncidentModalOpen && (
        <ReportIncidentModal
          isOpen={isIncidentModalOpen}
          setIsOpen={setIsIncidentModalOpen}
          dailyTripId={selectedDailyTrip?.id}
        />
      )}
    </div>
  );
};

export default DriverDashboardPage;