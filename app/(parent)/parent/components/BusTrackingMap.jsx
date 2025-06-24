// ✅ /components/parent/BusTrackingMap.jsx
"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import toast from 'react-hot-toast';
import parentService from '@/services/parentService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuration des icônes par défaut Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

export const BusTrackingMap = ({ childId }) => {
  const [loading, setLoading] = useState(true);
  const [tripData, setTripData] = useState(null);
  const [lastPosition, setLastPosition] = useState(null);
  const defaultMapCenter = { lat: 33.5898, lng: -7.6116 };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await parentService.trackChildBus(childId);

        if (!response.hasActiveTrip) {
          toast('Aucun trajet en cours pour cet enfant.');
          setTripData(null);
          setLoading(false);
          return;
        }

        setTripData(response.trip);
        setLastPosition(response.lastPosition);
      } catch (error) {
        toast.error("Erreur lors du chargement de la position du bus.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [childId]);

  if (loading) {
    return <p className="text-center py-10">Chargement de la carte...</p>;
  }

  if (!tripData || !lastPosition) {
    return (
      <Card className="text-center p-6">
        <CardTitle>Aucun trajet actif</CardTitle>
        <p>Le bus de votre enfant n'est pas en trajet actuellement.</p>
      </Card>
    );
  }

  const busPosition = {
    lat: lastPosition.latitude,
    lng: lastPosition.longitude
  };

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">Suivi du Bus</CardTitle>
        <CardDescription>Position actuelle et informations du trajet.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow p-6">
      <div className="grid gap-2 mb-4">
        <p><strong>Bus:</strong> {tripData?.bus?.plateNumber || 'N/A'}</p>
        <p><strong>Chauffeur:</strong> {tripData?.driver?.fullname || 'N/A'}</p>
        <p><strong>Trajet:</strong> {tripData?.name || 'N/A'}</p>
        <p><strong>Route:</strong> {tripData?.route?.name || 'N/A'}</p>
        <p><strong>Status:</strong> {tripData?.status || 'N/A'}</p>
      </div>

      {lastPosition ? (
        <div className="w-full h-[300px] rounded-md overflow-hidden border mb-4">
          <MapContainer center={busPosition} zoom={14} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            <Marker position={busPosition}>
              <Popup>Position actuelle du bus</Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <div className="text-center text-muted-foreground italic py-4">
          Le bus n'a pas encore partagé de position.
        </div>
      )}
    </CardContent>
    </Card>
  );
};
