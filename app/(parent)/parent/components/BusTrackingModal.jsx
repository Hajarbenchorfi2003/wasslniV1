'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

import parentService from '@/services/parentService';

// Chargement dynamique (pour éviter SSR avec leaflet)
const BusTrackingMap = dynamic(
  () => import('./BusTrackingMap').then(mod => mod.BusTrackingMap),
  { ssr: false }
);

export const BusTrackingModal = ({ isOpen, setIsOpen, childId }) => {
  const [child, setChild] = useState(null);
  const [dailyTripDetails, setDailyTripDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Données temps réel
  const [busPosition, setBusPosition] = useState(null);
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(null);
  const [nextStop, setNextStop] = useState(null);

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

      // On récupère le student
      setChild(childData.student || null);

      // ✅ Correction: Utiliser la bonne structure des données
      const dailyTripsToday = childData.dailyTripsToday || [];
      const todayTrip = dailyTripsToday.length > 0 ? dailyTripsToday[0] : null;
      setDailyTripDetails(todayTrip);

      if (todayTrip) {
        // Récupérer la position du bus en temps réel
        const trackingData = await parentService.trackChildBus(childId);

        if (trackingData.hasActiveTrip && trackingData.lastPosition) {
          setBusPosition({
            lat: trackingData.lastPosition.latitude,
            lng: trackingData.lastPosition.longitude,
          });
          setEstimatedArrivalTime(trackingData.estimatedArrivalTime || null);
          setNextStop(trackingData.nextStop || null);
        } else {
          setBusPosition(null);
          setEstimatedArrivalTime(null);
          setNextStop(null);
          toast("Position du bus non disponible actuellement.");
        }
      } else {
        // Pas de trajet aujourd'hui
        setDailyTripDetails(null);
        setBusPosition(null);
        setEstimatedArrivalTime(null);
        setNextStop(null);
        toast("Aucun trajet prévu pour cet enfant aujourd'hui.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors du chargement des données.");
      toast.error(err.message || "Erreur lors du chargement des données.");
      setChild(null);
      setDailyTripDetails(null);
      setBusPosition(null);
      setEstimatedArrivalTime(null);
      setNextStop(null);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    if (isOpen) {
      refreshChildData();
    }
  }, [isOpen, refreshChildData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suivi du Bus pour {child?.fullname || 'Enfant'}</DialogTitle>
          <DialogDescription>
            Position en temps réel du bus de {child?.fullname || 'l\'enfant'}.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-[350px] text-xl text-default-600">
            <Icon icon="heroicons:arrow-path" className="h-6 w-6 animate-spin mr-2" />
            Chargement des données de suivi...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-700 bg-red-50 border border-red-400 rounded-md">
            <Icon icon="heroicons:exclamation-triangle" className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="font-medium">{error}</p>
          </div>
        ) : dailyTripDetails && busPosition ? (
          <BusTrackingMap
            busPlateNumber={dailyTripDetails.bus?.plateNumber}
            driverName={dailyTripDetails.driver?.fullname}
            estimatedArrivalTime={estimatedArrivalTime}
            nextStop={nextStop}
            busCurrentPosition={busPosition}
          />
        ) : (
          <div className="p-6 text-center text-default-500">
            <Icon icon="heroicons:information-circle" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Aucune donnée de suivi disponible pour le moment.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
