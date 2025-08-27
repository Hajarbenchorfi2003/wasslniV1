'use client';
import { io } from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import parentService from '@/services/parentservice';
import { getToken } from '@/utils/auth';

const BusTrackingMap = dynamic(
  () => import('../components/BusTrackingMap').then(mod => mod.BusTrackingMap),
  { ssr: false }
);

const BusTrackingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId');

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyTripDetails, setDailyTripDetails] = useState(null);
  const [busPosition, setBusPosition] = useState(null);
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(null);
  const [nextStop, setNextStop] = useState(null);
  const [path, setPath] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // Fetch child info
  useEffect(() => {
    const fetchChildInfo = async () => {
      if (!childId || isNaN(parseInt(childId))) {
        setError("ID d'enfant invalide ou manquant dans l'URL.");
        setLoading(false);
        return;
      }

      try {
        const children = await parentService.getChildren();
        const allStudents = children.map(c => c.student); // student is object
        const found = allStudents.find(s => s.id === parseInt(childId));

        if (!found) {
          setError("Enfant non trouvé avec l'ID fourni.");
        } else {
          setChild(found);
        }
      } catch (err) {
        console.error(err);
        setError("Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchChildInfo();
  }, [childId]);

  // Fetch daily trip and bus tracking
  useEffect(() => {
    const fetchDailyTrip = async () => {
      if (!child) return;

      setLoading(true);
      setError(null);

      try {
        const childData = await parentService.getChildDetails(child.id);
        console.log('childedata', childData);
        const dailyTripsToday = childData.dailyTripsToday || [];
        const todayTrip = dailyTripsToday.length > 0 ? dailyTripsToday[0] : null;
        setDailyTripDetails(todayTrip);
        console.log('triday', todayTrip);
        console.log('trippp', dailyTripDetails);

        if (todayTrip) {
          const trackingData = await parentService.trackChildBus(child.id);
          console.log('trackingData', trackingData);
          if (trackingData.hasActiveTrip && trackingData.lastPosition) {
            setBusPosition({
              lat: parseFloat(trackingData.lastPosition.lat),
              lng: parseFloat(trackingData.lastPosition.lng)
            });
          }
          
          // Set additional data if available
          if (trackingData.estimatedArrivalTime) {
            setEstimatedArrivalTime(trackingData.estimatedArrivalTime);
          }
          if (trackingData.nextStop) {
            setNextStop(trackingData.nextStop);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    if (child) {
      fetchDailyTrip();
    }
  }, [child]);

  // WebSocket for real-time bus updates
  useEffect(() => {
    if (!childId || !dailyTripDetails?.id) return;
    
    const token = getToken();
    if (!token) {
      setError("Token d'authentification manquant");
      return;
    }

    const socket = io('https://wasslni-backend.onrender.com', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connecté au serveur WebSocket');
      setIsConnected(true);
      socket.emit('subscribe-to-bus', { childId: parseInt(childId) });
      socket.emit('get-bus-path', { tripId: dailyTripDetails.id });
    });

    socket.on('position-update', (data) => {
      if (data?.position) {
        const newPos = { 
          lat: parseFloat(data.position.lat), 
          lng: parseFloat(data.position.lng) 
        };
        setBusPosition(newPos);
        setPath(prev => [...prev, newPos]);
      }
    });

    socket.on('bus-path', (data) => {
      if (data?.path) {
        const formattedPath = data.path.map(p => ({ 
          lat: parseFloat(p.lat), 
          lng: parseFloat(p.lng) 
        }));
        setPath(formattedPath);
      }
    });

    socket.on('estimated-arrival', (data) => {
      if (data?.estimatedArrivalTime) {
        setEstimatedArrivalTime(data.estimatedArrivalTime);
      }
    });

    socket.on('next-stop', (data) => {
      if (data?.nextStop) {
        setNextStop(data.nextStop);
      }
    });

    socket.on('error', (err) => {
      console.error('Erreur WebSocket:', err);
      setError(`Erreur de connexion: ${err.message || 'Erreur inconnue'}`);
    });

    socket.on('disconnect', () => {
      console.log("❌ Déconnecté du serveur WebSocket");
      setIsConnected(false);
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [childId, dailyTripDetails?.id]);

  const handleGoBackToOverview = () => router.push('/parent/children-overview');

  if (loading) return (
    <div className="flex justify-center items-center h-[calc(100vh-180px)] text-xl text-default-600">
      <Icon icon="heroicons:arrow-path" className="h-6 w-6 animate-spin mr-2" />
      Chargement des données de suivi...
    </div>
  );

  if (error) return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-default-900">Suivi du Bus</h1>
        <Button onClick={handleGoBackToOverview} variant="outline">
          <Icon icon="heroicons:arrow-left" className="h-4 w-4 mr-2" /> Retour
        </Button>
      </div>
      <Card className="shadow-sm border border-red-400">
        <CardContent className="p-6 text-center text-red-700">
          <Icon icon="heroicons:exclamation-triangle" className="h-10 w-10 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm mt-2">Veuillez retourner à la vue d&rsquo;ensemble des enfants et sélectionner un enfant valide pour le suivi.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-default-900">
          Suivi du Bus pour {child?.fullname || 'Enfant Inconnu'}
        </h1>
        <Button onClick={handleGoBackToOverview} variant="outline">
          <Icon icon="heroicons:arrow-left" className="h-4 w-4 mr-2" /> Retour à la vue d&rsquo;ensemble
        </Button>
      </div>

      {dailyTripDetails ? (
        <BusTrackingMap
          busPlateNumber={dailyTripDetails?.trip?.bus?.plateNumber}
          driverName={dailyTripDetails?.trip?.driver?.fullname}
          estimatedArrivalTime={estimatedArrivalTime}
          nextStop={nextStop}
          busCurrentPosition={busPosition}
          path={path}
        />
      ) : (
        <div className="p-6 text-center">
          <Icon icon="heroicons:information-circle" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun trajet actif aujourd&apos;hui</p>
        </div>
      )}
    </div>
  );
};

export default BusTrackingPage;