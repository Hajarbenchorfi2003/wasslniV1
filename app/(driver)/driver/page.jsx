// pages/driver/DriverDashboardPage.jsx
'use client';
import { io } from 'socket.io-client';
import React, { useState, useEffect, useCallback } from 'react';
import driverService  from '@/services/driverservice';
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
import {getToken, isAuthenticated } from '@/utils/auth';
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}
// Import Leaflet components dynamically to avoid SSR issues
import dynamic from 'next/dynamic';
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center">Chargement de la carte...</div>
  }
);
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Import Leaflet and its CSS
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}




const ITEMS_PER_PAGE = 5;

const DriverDashboardPage =() =>{
  const [driver, setDriver] = useState(null);
  const [dailyTrips, setDailyTrips] = useState([]);
  const [dailyTrip, setDailyTrip] = useState(null);
  const [selectedDailyTrip, setSelectedDailyTrip] = useState(null);
  const [studentsInSelectedTrip, setStudentsInSelectedTrip] = useState([]);
  const [stopsInSelectedRoute, setStopsInSelectedRoute] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [busPosition, setBusPosition] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [parentsCoordinates, setParentsCoordinates] = useState([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [positionInterval, setPositionInterval] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [dailyTripsFilteredAndPaginated, setDailyTripsFilteredAndPaginated] =
    useState([]);
  const [totalDailyTripPages, setTotalDailyTripPages] = useState(1);
 
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  // Modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalStudentId, setAttendanceModalStudentId] = useState(null);
  const [attendanceModalDailyTripId, setAttendanceModalDailyTripId] = useState(null);
  const [attendanceModalCurrentStatus, setAttendanceModalCurrentStatus] =
    useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [icons, setIcons] = useState({ busIcon: null, parentIcon: null });

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then(L => {
        // Fix default marker issue
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        const busIcon = new L.Icon({
          iconUrl:
           "/images/bus.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        const parentIcon = new L.Icon({
          iconUrl:
            "/images/user.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        setIcons({ busIcon, parentIcon });
      });
    }
  }, []);


  
  useEffect(() => {
    const newSocket = io('https://wasslni-backend.onrender.com/', {
      auth: {
        token: getToken()
      }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connecté au serveur de suivi');
    });

    newSocket.on('connect_error', (err) => {
      toast.error(`Erreur de connexion: ${err.message}`);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Déconnecté du serveur de suivi');
    });

    return () => {
      newSocket.disconnect();
      if (positionInterval) clearInterval(positionInterval);
    };
  }, []);

  // Load driver & trips on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const trips = await driverService.getDailyTrips();
        setDailyTrips(trips);
        if (trips.length > 0 && trips[0].trip?.driver) {
          setDriver(trips[0].trip.driver);
        }
        const fetchedNotifications = await driverService.getNotfication();
        setNotifications(fetchedNotifications);
      } catch (error) {
        toast.error("Impossible de charger les données");
      } finally {
        setLoading(false);
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
        (dTrip) =>
          new Date(dTrip.date).toISOString().split('T')[0] === selectedDateString
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
        setDailyTrip(tripDetails);
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
        
        const students = tripDetails.trip?.tripStudents?.map(ts => ts.student) || [];
        setStudentsInSelectedTrip(students);
        
        // Set initial bus position if available
        if (tripDetails.currentPosition) {
          setBusPosition(tripDetails.currentPosition);
        }
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
    
    if (!isTrackingActive) {
     if (typeof window === 'undefined' || !navigator.geolocation) {
    toast.error('La géolocalisation n\'est pas supportée');
    return;
  }

      if (!socket || !dailyTrip?.id) {
        toast.error('Connexion au serveur non établie ou trajet non sélectionné');
        return;
      }

      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude: lat, longitude: lng } = position.coords;
            socket.emit('bus-position', {
              dailyTripId: dailyTrip.id,
              lat,
              lng,
              timestamp: new Date().toISOString()
            });
            setBusPosition({ lat, lng });
          },
          (err) => {
            console.error('Erreur GPS:', err);
            toast.error(`Erreur GPS: ${err.message}`);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }, 3000);

      setPositionInterval(interval);
      setIsTrackingActive(true);
      toast.success('Suivi GPS activé');
    } else {
      if (positionInterval) clearInterval(positionInterval);
      setIsTrackingActive(false);
      toast.success('Suivi GPS désactivé');
    }
  };

  const getAttendanceStatusForStudent = useCallback(
    (studentId) => {
      if (!selectedDailyTrip) return 'EN_COURS';
      
      const attendance = selectedDailyTrip.attendances?.find(
        att => att.studentId === studentId && att.type === 'DEPART'
      );
      
      // Return the status if found, otherwise return 'EN_COURS'
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
      case 'PLANNED':
        return 'blue';
      case 'ONGOING':
        return 'yellow';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTripStatusText = (status) => {
    switch (status) {
      case 'PLANNED':
        return 'Planifié';
      case 'ONGOING':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminé';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };
  
  const getAttendanceColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'green';
      case 'ABSENT':
        return 'red';
      case 'LATE':
        return 'yellow';
      case 'EN_COURS':
        return 'blue';
      default:
        return 'gray';
    }
  };
  
  const getAttendanceText = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'Présent';
      case 'ABSENT':
        return 'Absent';
      case 'LATE':
        return 'En retard';
      case 'EN_COURS':
        return 'En cours';
      default:
        return 'Inconnu';
    }
  };

  const getMapCenter = () => {
    if (busPosition) {
      return [busPosition.lat, busPosition.lng];
    }
    if (parentsCoordinates.length > 0) {
      return [parentsCoordinates[0].lat, parentsCoordinates[0].lng];
    }
    return [36.8065, 10.1815]; // Default to Tunisia coordinates
  };

   

  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Chargement des informations...
      </div>
    );
  }

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
              <p className="text-2xl font-bold">
                {dailyTrips.length}
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Add other stats cards similarly */}
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
                        <p className="text-sm"><strong>Élèves:</strong> {studentsInSelectedTrip.length}</p>
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
  {parentsCoordinates.length > 0 || busPosition ? (
    <div className="w-full h-[400px] rounded-md overflow-hidden border">
      {typeof window !== 'undefined' ? (
        <MapContainer 
          key={`map-${dailyTrip?.id}-${isTrackingActive}`} 
          center={getMapCenter()}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Marqueurs pour les parents */}
          {parentsCoordinates.map((parent, index) => (
            parent.lat && parent.lng && (
              <Marker
                 key={`parent-${parent.parentId}-${parent.studentId}-${index} `}
                position={[parent.lat, parent.lng]}
                icon={icons.parentIcon}
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
              </Marker>
            )
          ))}
          
          {/* Bus position marker */}
          {busPosition && (
            <Marker 
              position={[busPosition.lat, busPosition.lng]} 
              icon={icons.busIcon}
            >
              <Popup>Position actuelle du bus</Popup>
            </Marker>
          )}
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <p className="text-gray-500">Chargement de la carte...</p>
        </div>
      )}
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">Aucun arrêt pour afficher l&apos;itinéraire.</p>
  )}

  {/* Statistiques des parents */}
  {parentsCoordinates.length > 0 && (
    <div className="p-4 bg-green-50 rounded-lg">
      <h4 className="font-semibold text-green-800 mb-2">Domiciles des parents</h4>
      <p className="text-sm text-green-700">
        {parentsCoordinates.length} parent(s) ont partagé leur position
      </p>
    </div>
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
                      <p className="text-sm mt-2">
                        Statut WebSocket: 
                        <Badge variant="outline" className="ml-2">
                          {isConnected ? 'Connecté' : 'Déconnecté'}
                        </Badge>
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