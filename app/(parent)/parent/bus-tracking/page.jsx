// app/[lang]/(parent)/parent/bus-tracking/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  demoData,
  getStudentById,
  getLastDailyTripForStudent,
} from '@/data/data';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card'; // For better loading state

// Dynamically import BusTrackingMap

const BusTrackingMap = dynamic(
  () => import('../components/BusTrackingMap').then(mod => mod.BusTrackingMap),
  { ssr: false }
);
export const BusTrackingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childIdFromUrl = searchParams.get('childId'); // Get childId as string

  const [currentDemoData, setCurrentDemoData] = useState(demoData);
  const [child, setChild] = useState(null);
  const [dailyTripDetails, setDailyTripDetails] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state
  const [error, setError] = useState(null); // New error state

  const [simulatedBusPosition, setSimulatedBusPosition] = useState(null);
  const [simulatedArrivalTime, setSimulatedArrivalTime] = useState(null);
  const [simulatedNextStop, setSimulatedNextStop] = useState(null);

  const refreshChildData = useCallback(() => {
    setLoading(true);
    setError(null);
    const idNum = parseInt(childIdFromUrl);

    if (isNaN(idNum) || !childIdFromUrl) {
      setError("ID d'enfant invalide ou manquant dans l'URL.");
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
  }, [childIdFromUrl, currentDemoData]);

  useEffect(() => {
    refreshChildData();
  }, [refreshChildData]);

  const handleGoBackToOverview = () => {
    router.push('/parent/children-overview');
  };

  // --- Render Loading, Error, or Content ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-180px)] text-xl text-default-600">
        <Icon icon="heroicons:arrow-path" className="h-6 w-6 animate-spin mr-2" /> Chargement des données de suivi...
      </div>
    );
  }

  if (error) {
    return (
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
            <p className="text-sm mt-2">Veuillez retourner à la vue d'ensemble des enfants et sélectionner un enfant valide pour le suivi.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no error and not loading, display the content
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-default-900">
          Suivi du Bus pour {child?.fullname || 'Enfant Inconnu'}
        </h1>
        <Button onClick={handleGoBackToOverview} variant="outline">
          <Icon icon="heroicons:arrow-left" className="h-4 w-4 mr-2" /> Retour à la vue d'ensemble
        </Button>
      </div>

      <BusTrackingMap
        busPlateNumber={dailyTripDetails?.trip?.bus?.plateNumber}
        driverName={dailyTripDetails?.trip?.driver?.fullname}
        estimatedArrivalTime={simulatedArrivalTime}
        nextStop={simulatedNextStop}
        busCurrentPosition={simulatedBusPosition}
      />
    </div>
  );
};

export default BusTrackingPage;