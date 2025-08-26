"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import dynamic from 'next/dynamic';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);
  return null;
}

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Icône personnalisée pour le bus
const busIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const BusTrackingMap = ({ 
  busPlateNumber,
  driverName,
  estimatedArrivalTime,
  nextStop,
  busCurrentPosition,
  path = []
}) => {
  // Centre par défaut (Casablanca)
  const defaultCenter = [33.5731, -7.5898];
  console.log("curent postion reçus",busCurrentPosition)
  // Validation des coordonnées
  const isValidCoordinate = (coord) => {
    return coord !== undefined && coord !== null && !isNaN(coord) && isFinite(coord);
  };

  // Conversion sécurisée des positions
  const getSafePosition = (pos) => {
    if (!pos || !isValidCoordinate(pos.lat) || !isValidCoordinate(pos.lng)) {
      return null;
    }
    return [Number(pos.lat), Number(pos.lng)];
  };

  // Position actuelle validée
  const currentPosition = getSafePosition(busCurrentPosition) || defaultCenter;
   console.log("test", currentPosition);


  // Trajet validé
  const safePath = path
    .map(p => getSafePosition(p))
    .filter(p => p !== null);

  // Formatage des coordonnées pour l'affichage
  const formatCoordinate = (coord) => {
    return isValidCoordinate(coord) ? Number(coord).toFixed(6) : 'N/A';
  };

  // Vérification si la position actuelle est valide
  const hasValidPosition = getSafePosition(busCurrentPosition) !== null;

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Icon icon="heroicons:truck" className="h-5 w-5 text-primary" />
          Suivi du Bus en Temps Réel
        </CardTitle>
        <CardDescription>
          {busPlateNumber ? `Bus ${busPlateNumber}` : 'Position actuelle du bus'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow p-6 gap-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Chauffeur</p>
            <p className="font-medium">{driverName || 'Non disponible'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Prochain arrêt</p>
            <p className="font-medium">{nextStop || 'Non disponible'}</p>
          </div>
          {estimatedArrivalTime && (
            <div>
              <p className="text-sm text-muted-foreground">Arrivée estimée</p>
              <p className="font-medium">{estimatedArrivalTime}</p>
            </div>
          )}
        </div>

        <div className="w-full h-[400px] rounded-md overflow-hidden border">
          {typeof window !== 'undefined' && (
          <MapContainer center={defaultCenter} zoom={14} scrollWheelZoom className="h-full w-full">
  <RecenterMap center={currentPosition} />
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="© OpenStreetMap contributors"
  />

  {hasValidPosition && (
    <Marker position={currentPosition} icon={busIcon}>
      <Popup>Bus en mouvement</Popup>
    </Marker>
  )}

  {safePath.length > 1 && (
    <Polyline positions={safePath} color="blue" weight={5} opacity={0.7} />
  )}
</MapContainer>

          )}
        </div>
        
        {/* Message si pas de position valide */}
        {!hasValidPosition && (
          <div className="text-center text-sm text-muted-foreground mt-2">
            <Icon icon="heroicons:information-circle" className="inline mr-1" />
            {busCurrentPosition 
              ? 'Position du bus invalide (données corrompues)'
              : 'En attente de la position du bus...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};