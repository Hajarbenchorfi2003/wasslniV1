
// pages/driver/DailyTripDetailsPage.jsx
'use client';
import { io } from 'socket.io-client';
import React, { useState, useEffect, useCallback } from 'react';
import driverService from '@/services/driverService';
import { MarkAttendanceModal } from '../MarkAttendanceModal';
import { ReportIncidentModal } from '../ReportIncidentModal';

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// Leaflet
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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


export const DailyTripDetailsPage = ({ dailyTripId, onGoBackToDashboard }) => {
    console.log("🧪 Component mounted");

export const DailyTripDetailsPage = () => {
  const [dailyTrips, setDailyTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const [dailyTrip, setDailyTrip] = useState(null);
  const [students, setStudents] = useState([]);
  const [stops, setStops] = useState([]);
  const [busPosition, setBusPosition] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyTrips, setDailyTrips] = useState([]);
  const [socket, setSocket] = useState(null);
const [isConnected, setIsConnected] = useState(false);
const [positionInterval, setPositionInterval] = useState(null);


  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalStudentId, setAttendanceModalStudentId] = useState(null);
  const [attendanceModalCurrentStatus, setAttendanceModalCurrentStatus] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
console.log("Token JWT:", getToken());
// Vérifiez que le token est valide et non expiré
useEffect(() => {
  console.log("je suis dans connect server");
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



  const fetchDailyTripData = useCallback(async () => {
    try {
      setLoading(true);

      
      // Fetch all daily trips first
      const tripsResponse = await driverService.getDailyTrips();
      setDailyTrips(tripsResponse);
      
      
      // If no specific trip ID is provided, use the first one
      const tripIdToFetch = dailyTripId || (tripsResponse.length > 0 ? tripsResponse[0].id : null);
      
      if (tripIdToFetch) {
        const tripDetails = await driverService.getTripDetails(tripIdToFetch);=======
      const trips = await driverService.getDailyTrips();
      setDailyTrips(trips);
      console.log("Current dailyTrips:", trips);
      if (selectedTripId) {
        const tripDetails = await driverService.getTripDetails(selectedTripId);

        setDailyTrip(tripDetails);
        setStudents(tripDetails.trip?.tripStudents?.map(ts => ts.student) || []);
        setStops(tripDetails.trip?.route?.stops || []);
       
      } else {
        setDailyTrip(null);
        setStudents([]);
        setStops([]);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [dailyTripId]);
  
console.log("all dailytrip",dailyTrips);

  }, [selectedTripId]);


  useEffect(() => {
    fetchDailyTripData();
  }, [fetchDailyTripData]);
  const getAttendanceStatusForStudent = useCallback((studentId) => {
    if (!dailyTrip?.attendances) return 'NON_MARQUE'; // Return a specific value for "Non marqué"
    const a = dailyTrip.attendances.find(att => att.studentId === studentId && att.type === 'DEPART');
    return a?.status || 'NON_MARQUE'; // Use 'NON_MARQUE' if status is not found
}, [dailyTrip]);
 
const getAttendanceText = (status) => ({
    PRESENT: 'Présent',
    ABSENT: 'Absent',
    LATE: 'En Retard',
    NON_MARQUE: 'Non marqué', // Add the text for 'NON_MARQUE'
}[status] || 'Non marqué'); // Fallback in case of unexpected status

const getAttendanceColor = (status) => ({
    PRESENT: 'green',
    ABSENT: 'red',
    LATE: 'yellow',
    NON_MARQUE: 'gray', // Add the color for 'NON_MARQUE'
}[status] || 'gray');

  const getTripStatusText = (s) => ({
    PENDING: 'En attente',
    ONGOING: 'En cours',
    COMPLETED: 'Terminé',
    CANCELED: 'Annulé',
  }[s] || 'Inconnu');

  const getTripStatusColor = (s) => ({
    PENDING: 'blue',
    ONGOING: 'yellow',
    COMPLETED: 'green',
    CANCELED: 'red',
  }[s] || 'gray');
  const mapStatusColorToTailwind = (statusColor) => {
    switch (statusColor) {
      case 'blue':
        return 'text-blue-600 border-blue-600';
      case 'yellow':
        return 'text-yellow-600 border-yellow-600';
      case 'green':
        return 'text-green-600 border-green-600';
      case 'red':
        return 'text-red-600 border-red-600';
      case 'gray':
        return 'text-gray-600 border-gray-600';
      default:
        return 'text-gray-600 border-gray-600'; // Default for unknown colors
    }
  };

  const handleUpdateTripStatus = async (newStatus) => {
    try {
      await driverService.updateTripStatus(dailyTrip.id, newStatus);
      const updated = await driverService.getTripDetails(dailyTrip.id);
      setDailyTrip(updated);
      toast.success(`Statut mis à jour à "${getTripStatusText(newStatus)}"`);
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleOpenAttendanceModal = (studentId) => {
    setAttendanceModalStudentId(studentId);
    setAttendanceModalCurrentStatus(getAttendanceStatusForStudent(studentId));
    setIsAttendanceModalOpen(true);
  };

  const handleAttendanceMarked = async () => {
    await fetchDailyTripData();
    toast.success("Présence mise à jour !");
  };

  const handleIncidentReported = async () => {
    await fetchDailyTripData();
    toast.success("Incident signalé !");
  };
 

  // Define handleOpenIncidentModal
  const handleOpenIncidentModal = () => {
    setIsIncidentModalOpen(true);
  };

// Ajoutez ce useEffect pour écouter les mises à jour de position
useEffect(() => {
  if (!socket) return;

  const handlePositionUpdate = (data) => {
    console.log('📡 Reçu position-update:', data);
    if (data.position) {
      setBusPosition({
        lat: data.position.lat,
        lng: data.position.lng
      });
    }
  };

  socket.on('position-update', handlePositionUpdate);

  return () => {
    socket.off('position-update', handlePositionUpdate);
  };
}, [socket, dailyTrip?.id]);

// Modifiez la fonction handleToggleTracking comme ceci :
const handleToggleTracking = () => {
  if (!isTrackingActive) {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    // Vérifiez que le socket et le trip sont bien disponibles
    if (!socket || !dailyTrip?.id) {
      toast.error('Connexion au serveur non établie ou trajet non sélectionné');
      return;
    }

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          console.log("Envoi position pour le trajet:", dailyTrip.id);
          
          socket.emit('bus-position', {
            dailyTripId: dailyTrip.id,
            lat,
            lng,
            timestamp: new Date().toISOString()
          }, (ack) => {
            console.log('Accusé de réception du serveur:', ack);
          });
          
          setBusPosition({ lat, lng });
        },
        (err) => {
          console.error('Erreur GPS:', err);
          toast.error(`Erreur GPS: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
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
console.log(dailyTrip)

  if (loading) {

  const handleToggleTracking = () => {
    setIsTrackingActive(prev => !prev);
    toast(isTrackingActive ? "Suivi désactivé" : "Suivi activé");
  };

  // ----------- AFFICHAGE DE LA LISTE DES TRAJETS -----------
  if (!selectedTripId) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Liste des Trajets du Jour</h1>
        {loading ? (
          <div className="text-center py-8">
            <Icon icon="heroicons:arrow-path" className="h-8 w-8 animate-spin mx-auto" />
            <p>Chargement...</p>
          </div>
        ) : dailyTrips.length === 0 ? (
          <p>Aucun trajet disponible.</p>
        ) : (
          <div>
          

            {/* Table for assigned trips */}
            <Card className="shadow-sm">
  <CardContent className="p-0">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Trajet Principal</TableHead>
            <TableHead className="min-w-[150px]">Bus</TableHead>
            {/* Changed "Chauffeur" to "Période" */}
            <TableHead className="min-w-[150px]">Période</TableHead>
            <TableHead className="min-w-[120px]">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dailyTrips.map((dTrip) => (
            <TableRow
              key={dTrip.id}
              className={cn(
                selectedTripId === dTrip.id ? "bg-muted" : "hover:bg-default-50",
                "cursor-pointer"
              )}
              onClick={() => setSelectedTripId(dTrip.id)}
            >
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-default-800">{dTrip.trip?.name || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">
                    {dTrip.trip?.route?.name || 'N/A'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-default-800">{dTrip.trip?.bus?.plateNumber || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">
                    {dTrip.trip?.bus?.marque || 'N/A'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {/* Displaying "Matin" or "Soir" based on dTrip.timeSlot */}
                  <div className="font-medium text-default-800">
                    {dTrip.timeSlot ? (dTrip.timeSlot.toLowerCase() === 'morning' ? 'Matin' : 'Soir') : 'N/A'}
                  </div>
                  {/* If you had a different piece of data to display here for "Période" secondary info, you'd put it here */}
                  <div className="text-sm text-muted-foreground">
                    {/* You could add more detail here, e.g., actual time, if available */}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm font-medium",
                    mapStatusColorToTailwind(getTripStatusColor(dTrip.status))
                  )}
                >
                  <Icon icon="heroicons:signal" className="h-3 w-3 mr-1" />
                  {getTripStatusText(dTrip.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {dailyTrips.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                Aucun trajet assigné pour le moment.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
          </div>
        )}
      </div>
    );
  }

  // Affichage erreur
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div>
          <Icon icon="heroicons:exclamation-triangle" className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-red-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Recharger</Button>
        </div>
      </div>
    );
  }

  // Affichage si loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div>
        <Icon icon="heroicons:arrow-path" className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Chargement du trajet...</p>
        </div>
      </div>
    );
  }

 

  if (!dailyTrip) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
       
           <Button onClick={() => setSelectedTripId(null)} variant="ghost" size="icon">
              <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
            </Button>
       
          <div>
            <h1 className="text-3xl font-bold text-default-900">Mon Trajet du Jour</h1>
            <p className="text-default-600">Détails du trajet actuel et actions.</p>
          </div>
        </div>
        
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
            <Icon icon="heroicons:information-circle" className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun trajet trouvé</h3>
            <p className="text-gray-500">Le trajet demandé n'existe pas ou n'est pas disponible.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        <Button onClick={() => setSelectedTripId(null)} variant="ghost" size="icon">
              <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
            </Button>
          <div>
            <h1 className="text-3xl font-bold text-default-900">Mon Trajet du Jour</h1>
            <p className="text-default-600">Gestion complète du trajet et des élèves</p>
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
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
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
                      <span className="text-sm font-medium">Plaque d'immatriculation</span>
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
                      <span className="text-sm font-medium">Nombre d'arrêts</span>
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
                  {/* Dans la section "Suivi GPS en Temps Réel" */}
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
                <h3 className="font-semibold text-lg text-default-700">Carte de l'Itinéraire</h3>
                
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
                    <p className="text-gray-500">Aucun arrêt pour afficher l'itinéraire.</p>
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
        dailyTripId={selectedTripId}
        studentId={attendanceModalStudentId}
        currentStatus={attendanceModalCurrentStatus}
        onAttendanceMarked={handleAttendanceMarked}
        driverId={dailyTrip.driverId}
      />

      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        setIsOpen={setIsIncidentModalOpen}
        dailyTripId={selectedTripId}
        driverId={dailyTrip.driverId}
        onIncidentReported={handleIncidentReported}
      />
    </div>
  );
};

export default DailyTripDetailsPage;