// components/parent/BusTrackingMap.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import toast from 'react-hot-toast';
import { Separator } from "@/components/ui/separator";

// Import Leaflet components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Make sure Leaflet's CSS is imported

// --- Fix for default Leaflet marker icons (Crucial for correct display) ---
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});
// -------------------------------------------------------------------------

export const BusTrackingMap = ({ busPlateNumber, driverName, estimatedArrivalTime, nextStop, busCurrentPosition }) => {
  const defaultMapCenter = { lat: 33.5898, lng: -7.6116 }; // A central point in El Jadida
  const [position, setPosition] = useState(busCurrentPosition || defaultMapCenter);

  useEffect(() => {
    if (busCurrentPosition && (position.lat !== busCurrentPosition.lat || position.lng !== busCurrentPosition.lng)) {
      setPosition(busCurrentPosition);
    }
  }, [busCurrentPosition, position]);

  const mapCenter = position || defaultMapCenter;

  const handleOpenMapLink = () => {
    if (!busCurrentPosition || typeof busCurrentPosition.lat !== 'number' || typeof busCurrentPosition.lng !== 'number') {
        toast.error("Position du bus non disponible pour ouvrir la carte externe.");
        return;
    }
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${busCurrentPosition.lat},${busCurrentPosition.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium text-default-800">Suivi du Bus</CardTitle>
        <CardDescription>
          Information sur le bus et le suivi de son emplacement.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-6">
        {busPlateNumber ? (
          <>
            <div className="flex justify-center items-center text-center mb-4">
              <Icon icon="heroicons:bus" className="w-8 h-8 text-primary mr-2" />
              <p className="text-lg font-semibold text-default-800">Bus: {busPlateNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-default-600 mb-4">
                <p><strong>Chauffeur:</strong> {driverName || 'N/A'}</p>
                <p><strong>Prochain Arrêt:</strong> {nextStop || 'N/A'}</p>
                <p className="col-span-2"><strong>Arrivée Estimée:</strong> {estimatedArrivalTime || 'N/A'}</p>
            </div>
          </>
        ) : (
          <div className="py-4 text-center text-default-500">
            <Icon icon="heroicons:information-circle" className="h-6 w-6 mx-auto mb-2" />
            <p className="text-base">Aucun bus assigné pour le moment.</p>
            <p className="text-sm">Le suivi ne sera pas disponible.</p>
          </div>
        )}

        {busPlateNumber && busCurrentPosition && (
          <>
            <Separator className="my-4" />
            <h3 className="font-semibold text-lg text-default-800 mb-3 flex items-center gap-2">
              <Icon icon="heroicons:globe-alt" className="h-5 w-5 text-green-500" />
              Localisation en Temps Réel
            </h3>

            <div className="flex-grow w-full h-[300px] rounded-md overflow-hidden mb-4 border">
              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>
                    Position actuelle du bus <br /> <strong>{busPlateNumber}</strong>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <Button onClick={handleOpenMapLink} className="w-full max-w-xs self-center">
              <Icon icon="heroicons:arrow-top-right-on-square" className="h-4 w-4 mr-2" /> Ouvrir sur Google Maps
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              (La position est simulée pour la démo.)
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};