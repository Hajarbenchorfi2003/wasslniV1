'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import { io } from 'socket.io-client';
import { getToken } from '@/utils/auth';
import parentService from '@/services/parentService';

const BusTrackingMap = dynamic(
  () => import('./BusTrackingMap').then(mod => mod.BusTrackingMap),
  { ssr: false }
);

export const BusTrackingModal = ({ isOpen, setIsOpen, childId }) => {
  const [child, setChild] = useState(null);
  const [dailyTripDetails, setDailyTripDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busPosition, setBusPosition] = useState(null);
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(null);
  const [nextStop, setNextStop] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [path, setPath] = useState([]);
  const socketRef = useRef(null);

  const refreshChildData = useCallback(async () => {
    if (!childId) {
      setError("ID d'enfant manquant.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const childData = await parentService.getChildDetails(childId);
      setChild(childData.student || null);
      
      const dailyTripsToday = childData.dailyTripsToday || [];
      const todayTrip = dailyTripsToday.length > 0 ? dailyTripsToday[0] : null;
      setDailyTripDetails(todayTrip);

      if (todayTrip) {
        const trackingData = await parentService.trackChildBus(childId);
        if (trackingData.hasActiveTrip && trackingData.lastPosition) {
          setBusPosition({
            lat: trackingData.lastPosition.latitude,
            lng: trackingData.lastPosition.longitude
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, [childId]);

  // Gestion du WebSocket
  useEffect(() => {
    if (!isOpen || !childId || !dailyTripDetails?.id) return;

    const token = getToken();
    if (!token) {
      toast.error("Token manquant !");
      return;
    }

    console.log("🔌 Initialisation de la connexion WebSocket...");
    
    // Correction: URL sans espace à la fin
    const socket = io('https://wasslni-backend.onrender.com', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log("✅ Connecté au serveur WebSocket");
      setIsConnected(true);
      socket.emit('subscribe-to-bus', { childId});
      socket.emit('get-bus-path', { tripId: dailyTripDetails.id });
    });
    socket.on('connection-success', (data) => {
      socket.emit('subscribe-to-bus', { childId});
        console.log('Connexion réussie:', data);
        });


    socket.on('position-update', (data) => {
      console.log('📍 Nouvelle position reçue:', data);
      if (data?.position) {
        const { lat, lng } = data.position;
        console.log("at,lang",lat,lng)
        setBusPosition({ lat, lng });
        setPath(prev => [...prev, { lat, lng }]);
      }
    });

    socket.on('bus-path', (data) => {
      console.log('🛣️ Chemin du bus reçu:', data);
      if (data?.path) {
        setPath(data.path.map(p => ({ lat: p.lat, lng: p.lng })));
      }
    });

    socket.on('error', (err) => {
      console.error('Erreur WebSocket:', err);
      toast.error(`Erreur: ${err.message || 'Erreur de connexion'}`);
    });

    return () => {
      console.log("🔌 Nettoyage de la connexion WebSocket");
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [isOpen, childId, dailyTripDetails?.id]);

  useEffect(() => {
    if (isOpen) {
      refreshChildData();
    }
  }, [isOpen, refreshChildData]);
 console.log("data socket",busPosition,"path",path);
 console.log("postionenvoyer",busPosition,"dailytriddata",dailyTripDetails)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suivi du Bus pour {child?.fullname || 'Enfant'}</DialogTitle>
          <DialogDescription>
            {isConnected ? 'Connexion active' : 'En attente de connexion...'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Icon icon="heroicons:arrow-path" className="animate-spin h-8 w-8 mr-2" />
            Chargement...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            <Icon icon="heroicons:exclamation-triangle" className="h-8 w-8 mx-auto mb-2" />
            {error}
          </div>
        ) : dailyTripDetails ? (
          <BusTrackingMap
                busPlateNumber={dailyTripDetails?.trip.bus?.plateNumber}
               driverName={dailyTripDetails?.trip.driver?.fullname}
                estimatedArrivalTime={estimatedArrivalTime}
                nextStop={nextStop}
                  busCurrentPosition={
                     busPosition && {
                       lat: parseFloat(busPosition?.lat),
                       lng: parseFloat(busPosition?.lng)
                    }
                  }
                path={(path || []).map(p => ({
              lat: parseFloat(p?.lat),
              lng: parseFloat(p?.lng)
               }))}
                />
        ) : (
          <div className="p-6 text-center">
            <Icon icon="heroicons:information-circle" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun trajet actif aujourd'hui</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};