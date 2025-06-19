// components/parent/BusTrackingModal.jsx
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

// Import BusTrackingMap dynamically inside the modal component
// to ensure it's loaded only when the modal is open (client-side).
import dynamic from 'next/dynamic';
import {
  demoData,
  getStudentById,
  getLastDailyTripForStudent,
} from '@/data/data';
import { Icon } from '@iconify/react';

const BusTrackingMap = dynamic(
  () => import('./BusTrackingMap').then(mod => mod.BusTrackingMap),
  { ssr: false } // Crucial for Leaflet
);

export const BusTrackingModal = ({ isOpen, setIsOpen, childId }) => {
  const [currentDemoData, setCurrentDemoData] = useState(demoData);
  const [child, setChild] = useState(null);
  const [dailyTripDetails, setDailyTripDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulated real-time data for the bus
  const [simulatedBusPosition, setSimulatedBusPosition] = useState(null);
  const [simulatedArrivalTime, setSimulatedArrivalTime] = useState(null);
  const [simulatedNextStop, setSimulatedNextStop] = useState(null);

  const refreshChildData = useCallback(() => {
    setLoading(true);
    setError(null);
    const idNum = parseInt(childId);

    if (isNaN(idNum) || !childId) {
      setError("ID d'enfant invalide ou manquant.");
      setLoading(false);
      return;
    }

    const fetchedChild = getStudentById(idNum);
    if (!fetchedChild) {
      setError("Enfant non trouvé avec l'ID fourni.");
      setLoading(false);
      return;
    }
    setChild(fetchedChild);

    const fetchedDailyTripDetails = getLastDailyTripForStudent(fetchedChild.id);
    setDailyTripDetails(fetchedDailyTripDetails);

    if (fetchedDailyTripDetails) {
      setSimulatedBusPosition({
        lat: 33.5898 + (Math.random() - 0.5) * 0.005,
        lng: -7.6116 + (Math.random() - 0.5) * 0.005
      });
      setSimulatedArrivalTime("18:30");
      setSimulatedNextStop("Lycée Anfa");
    } else {
      setSimulatedBusPosition(null);
      setSimulatedArrivalTime(null);
      setSimulatedNextStop(null);
    }
    setLoading(false);
  }, [childId, currentDemoData]);

  useEffect(() => {
    if (isOpen && childId) { // Only refresh when modal is open and childId is available
      refreshChildData();
    }
  }, [isOpen, childId, refreshChildData]);

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
            <Icon icon="heroicons:arrow-path" className="h-6 w-6 animate-spin mr-2" /> Chargement des données de suivi...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-700 bg-red-50 border border-red-400 rounded-md">
            <Icon icon="heroicons:exclamation-triangle" className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <BusTrackingMap
            busPlateNumber={dailyTripDetails?.trip?.bus?.plateNumber}
            driverName={dailyTripDetails?.trip?.driver?.fullname}
            estimatedArrivalTime={simulatedArrivalTime}
            nextStop={simulatedNextStop}
            busCurrentPosition={simulatedBusPosition}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};