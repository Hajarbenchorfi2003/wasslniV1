// pages/driver/DailyTripDetailsPage.jsx
'use client';
import { io } from 'socket.io-client';
import React, { useState, useEffect, useCallback } from 'react';
import driverService from '@/services/driverservice';
import { MarkAttendanceModal } from '../MarkAttendanceModal';
import { ReportIncidentModal } from '../ReportIncidentModal';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import Leaflet components for the embedded map
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {getToken, isAuthenticated } from '@/utils/auth';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const DailyTripDetailsPage = () => {
  const [dailyTrips, setDailyTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [dailyTrip, setDailyTrip] = useState(null);
  const [students, setStudents] = useState([]);
  const [stops, setStops] = useState([]);
  const [busPosition, setBusPosition] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [positionInterval, setPositionInterval] = useState(null);

  // Modal states
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalStudentId, setAttendanceModalStudentId] = useState(null);
  const [attendanceModalCurrentStatus, setAttendanceModalCurrentStatus] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Connect to socket server
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

  // Fetch all daily trips on component mount
  useEffect(() => {
    const fetchDailyTrips = async () => {
      try {
        setLoading(true);
        const tripsResponse = await driverService.getDailyTrips();
        setDailyTrips(tripsResponse);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDailyTrips();
  }, []);

  // Fetch details when a trip is selected
  const fetchTripDetails = useCallback(async (tripId) => {
    try {
      setLoading(true);
      const tripDetails = await driverService.getTripDetails(tripId);
      setDailyTrip(tripDetails);
      
      // Extract students from tripDetails
      const tripStudents = tripDetails.trip?.tripStudents?.map(ts => ts.student) || [];
      setStudents(tripStudents);
      
      // Extract stops from tripDetails
      const routeStops = tripDetails.trip?.route?.stops || [];
      setStops(routeStops);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Handle trip selection
  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    fetchTripDetails(trip.id);
  };

  // Return to trip list
  const handleReturnToList = () => {
    setSelectedTrip(null);
    setDailyTrip(null);
  };

  // Helper Functions
  const getAttendanceStatusForStudent = useCallback((studentId) => {
    if (!dailyTrip || !dailyTrip.attendances) return null;
    const attendance = dailyTrip.attendances.find(a => a.studentId === studentId && a.type === 'DEPART');
    return attendance?.status || 'ABSENT';
  }, [dailyTrip]);

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
      case 'PENDING': return 'blue';
      case 'ONGOING': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELED': return 'red';
      default: return 'gray';
    }
  };

  const getTripStatusText = (s) => {
    switch (s) {
      case 'PENDING': return 'En attente';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELED': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  // Handlers
  const handleUpdateTripStatus = async (newStatus) => {
    try {
      await driverService.updateTripStatus(dailyTrip.id, newStatus);
      const updatedTrip = await driverService.getTripDetails(dailyTrip.id);
      setDailyTrip(updatedTrip);
      toast.success(`Statut du trajet mis à jour à "${getTripStatusText(newStatus)}"`);
    } catch (err) {
      toast.error("Échec de la mise à jour du statut du trajet.");
    }
  };

  const handleOpenAttendanceModal = (studentId) => {
    setAttendanceModalStudentId(studentId);
    setAttendanceModalCurrentStatus(getAttendanceStatusForStudent(studentId));
    setIsAttendanceModalOpen(true);
  };

  const handleAttendanceMarked = async () => {
    await fetchTripDetails(dailyTrip.id);
    toast.success('Présence mise à jour!');
  };

  const handleOpenIncidentModal = () => {
    setIsIncidentModalOpen(true);
  };

  const handleIncidentReported = async () => {
    await fetchTripDetails(dailyTrip.id);
    toast.success('Incident signalé avec succès !');
  };

  // GPS Tracking
  const handleToggleTracking = () => {
    if (!isTrackingActive) {
      if (!navigator.geolocation) {
        toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
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

  // Listen for position updates
  useEffect(() => {
    if (!socket) return;

    const handlePositionUpdate = (data) => {
      if (data.position) {
        setBusPosition({
          lat: data.position.lat,
          lng: data.position.lng
        });
      }
    };

    socket.on('position-update', handlePositionUpdate);
    return () => socket.off('position-update', handlePositionUpdate);
  }, [socket, dailyTrip?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="h-8 w-8 mx-auto animate-spin" />
          <p className="mt-2">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <Icon icon="heroicons:exclamation-triangle" className="h-8 w-8 mx-auto" />
          <p className="mt-2">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Show trip list if no trip is selected
  if (!selectedTrip) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-default-900">Mes Trajets du Jour</h1>
            <p className="text-default-600">Sélectionnez un trajet pour voir les détails</p>
          </div>
        </div>

        {dailyTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyTrips.map((trip) => (
              <Card 
                key={trip.id} 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSelectTrip(trip)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2" >
                      <Icon icon="heroicons:truck" className="h-5 w-5 text-blue-500" />
                       {trip.trip.name}
                    </div>
                     <Badge 
                      variant="outline" 
                      className={cn(
                        "text-sm font-medium",
                        trip.status === 'ONGOING' ? 'text-green-600 border-green-600' : 
                        trip.status === 'COMPLETED' ? 'text-blue-600 border-blue-600' :
                        trip.status === 'CANCELED' ? 'text-red-600 border-red-600' :
                        'text-yellow-600 border-yellow-600'
                      )}
                    >
                      {getTripStatusText(trip.status)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {new Date(trip.date).toLocaleDateString()} | Bus: {trip.trip.bus.plateNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end items-center">
                    <Button size="sm" variant="outline">
                      Voir détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
              <Icon icon="heroicons:information-circle" className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun trajet trouvé</h3>
              <p className="text-gray-500">Aucun trajet disponible pour aujourd&apos;hui.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show trip details when a trip is selected
  const { trip, date, status } = dailyTrip;
  const { name: tripName, bus, route, driver, establishment } = trip || {};

  // Determine map center for the Polyline
  const polylinePositions = stops.map(stop => [parseFloat(stop.lat), parseFloat(stop.lng)]);
  const mapInitialCenter = polylinePositions.length > 0 ? polylinePositions[0] : [33.5898, -7.6116];

  // Calculate attendance statistics
  const attendanceStats = students.reduce((stats, student) => {
    const studentStatus = getAttendanceStatusForStudent(student.id);
    stats[studentStatus] = (stats[studentStatus] || 0) + 1;
    return stats;
  }, {});

  return (
    <div className="space-y-6 p-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleReturnToList} variant="ghost" size="icon">
            <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-default-900">Détails du Trajet</h1>
            <p className="text-default-600">{tripName} - {new Date(date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(
            "text-sm font-medium",
            status === 'ONGOING' ? 'text-green-600 border-green-600' : 
            status === 'COMPLETED' ? 'text-blue-600 border-blue-600' :
            status === 'CANCELED' ? 'text-red-600 border-red-600' :
            'text-yellow-600 border-yellow-600'
          )}>
            <Icon icon="heroicons:signal" className="h-3 w-3 mr-1" />
            {getTripStatusText(status)}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:users" className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Élèves</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:check-circle" className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Présents</p>
                <p className="text-2xl font-bold">{attendanceStats.PRESENT || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:x-circle" className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absents</p>
                <p className="text-2xl font-bold">{attendanceStats.ABSENT || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:map-pin" className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Arrêts</p>
                <p className="text-2xl font-bold">{stops.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
                <Icon icon="heroicons:truck" className="h-6 w-6 text-blue-500" />
                {tripName || 'N/A'}
              </CardTitle>
              <CardDescription className="mt-1">
                Date: {new Date(date).toLocaleDateString()} | Bus: {bus?.plateNumber || 'N/A'} | Route: {route?.name || 'N/A'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {status === 'PENDING' && (
                <Button onClick={() => handleUpdateTripStatus('ONGOING')} variant="default" size="sm">
                  <Icon icon="heroicons:play" className="h-4 w-4 mr-2" /> Démarrer
                </Button>
              )}
              {status === 'ONGOING' && (
                <Button onClick={() => handleUpdateTripStatus('COMPLETED')} variant="default" size="sm">
                  <Icon icon="heroicons:check" className="h-4 w-4 mr-2" /> Terminer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d&rsquo;ensemble</TabsTrigger>
              <TabsTrigger value="students">Élèves</TabsTrigger>
              <TabsTrigger value="route">Itinéraire</TabsTrigger>
              <TabsTrigger value="tracking">Suivi GPS</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6 space-y-6">
              {/* Trip Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-default-700">Informations Bus</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                      <span className="text-sm font-medium">Plaque &rsquo;immatriculation</span>
                      <span className="font-mono text-sm">{bus?.plateNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                      <span className="text-sm font-medium">Marque</span>
                      <span className="text-sm">{bus?.marque || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                      <span className="text-sm font-medium">Capacité</span>
                      <span className="text-sm">{bus?.capacity || 'N/A'} places</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-default-700">Informations Route</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                      <span className="text-sm font-medium">Nom de la route</span>
                      <span className="text-sm">{route?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                      <span className="text-sm font-medium">Nombre d&rsquo;arrêts</span>
                      <span className="text-sm">{stops.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                      <span className="text-sm font-medium">Élèves assignés</span>
                      <span className="text-sm">{students.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-default-700">Actions rapides</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Dans la section &quot;Suivi GPS en Temps Réel&quot; */}
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
                  <Button 
                    onClick={handleOpenIncidentModal} 
                    variant="outline"
                    className="flex gap-2"
                  >
                    <Icon icon="heroicons:exclamation-triangle" className="h-6 w-6" />
                    Signaler Incident
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="students" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-default-700">Liste des Élèves & Présence</h3>
                  <Badge variant="outline">
                    {students.length} élève{students.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {students.length > 0 ? (
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
                        {students.map(student => {
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
                  <div className="text-center py-8">
                    <Icon icon="heroicons:users" className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Aucun élève assigné à ce trajet.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="route" className="p-6">
              <div className="space-y-6">
                <h3 className="font-semibold text-lg text-default-700">Carte de l&apos;Itinéraire</h3>
                
                {stops.length > 0 ? (
                  <div className="w-full h-[400px] rounded-md overflow-hidden border">
                    <MapContainer
                      center={mapInitialCenter}
                      zoom={13}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {stops.map((stop, index) => (
                        <Marker key={stop.id} position={[parseFloat(stop.lat), parseFloat(stop.lng)]}>
                          <Popup>
                            <div>
                              <strong>Arrêt {index + 1}: {stop.name}</strong>
                              <br />
                              {stop.address}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                      {polylinePositions.length > 1 && (
                        <Polyline positions={polylinePositions} color="blue" weight={5} opacity={0.7} />
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
                  <div className="text-center py-8">
                    <Icon icon="heroicons:map" className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Aucun arrêt pour afficher l&apos;itinéraire.</p>
                  </div>
                )}

                <Separator />

                <h3 className="font-semibold text-lg text-default-700">Liste des Arrêts</h3>
                {stops.length > 0 ? (
                  <div className="space-y-2">
                    {stops.map((stop, index) => (
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
                  <div className="text-center py-8">
                    <Icon icon="heroicons:map-pin" className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Aucun arrêt défini pour cette route.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="p-6">
              <div className="space-y-6">
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

                {!busPosition && (
                  <div className="text-center py-8">
                    <Icon icon="heroicons:map-pin" className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Aucune position GPS disponible.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
    
 
     <MarkAttendanceModal
        isOpen={isAttendanceModalOpen}
        setIsOpen={setIsAttendanceModalOpen}
        dailyTripId={dailyTrip.id}
        studentId={attendanceModalStudentId}
        currentStatus={attendanceModalCurrentStatus}
        onAttendanceMarked={handleAttendanceMarked}
        driverId={dailyTrip.driverId}
      />

      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        setIsOpen={setIsIncidentModalOpen}
        dailyTripId={dailyTrip.id}
        driverId={dailyTrip.driverId}
        onIncidentReported={handleIncidentReported}
      />
    </div>

  );
};

export default DailyTripDetailsPage;
