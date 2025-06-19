// pages/manager/BusTrackingPage.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
    demoData,
    getDailyTripsByEstablishment,
    getLatestBusPosition,
    getTripById,
    getBusById,
    getUserById,
    addBusPosition,
} from '@/data/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import toast from 'react-hot-toast';
import { Separator } from '@/components/ui/separator';

// Dynamically import MapComponent and related Leaflet components
const MapComponent = dynamic(
    () => import('react-leaflet').then(mod => {
        const L = require('leaflet');
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default.src,
            iconUrl: require('leaflet/dist/images/marker-icon.png').default.src,
            shadowUrl: require('leaflet/dist/images/marker-shadow.png').default.src,
        });
        return mod.MapContainer;
    }),
    { ssr: false }
);
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';


export const BusTrackingPage = ({ managerEstablishmentId = 1 }) => {
    const [currentDemoData, setCurrentDemoData] = useState(demoData);
    const [dailyTripsForTracking, setDailyTripsForTracking] = useState([]);
    const [selectedDailyTripId, setSelectedDailyTripId] = useState('none');
    const [currentBusPosition, setCurrentBusPosition] = useState(null); // Real-time position
    const [busTrackingInterval, setBusTrackingInterval] = useState(null); // Interval for simulated updates
    const [selectedTripDetails, setSelectedTripDetails] = useState(null); // Enriched details of selected trip

    // --- Helper for displaying trip status ---
    const getTripStatusText = (status) => {
        switch (status) {
            case 'PLANNED': return 'Planifié';
            case 'ONGOING': return 'En cours';
            case 'COMPLETED': return 'Terminé';
            case 'CANCELED': return 'Annulé';
            default: return 'Inconnu';
        }
    };

    // Fetch daily trips for the establishment for selection dropdown
    useEffect(() => {
        if (managerEstablishmentId) {
            const fetchedDailyTrips = getDailyTripsByEstablishment(managerEstablishmentId, null);
            setDailyTripsForTracking(fetchedDailyTrips.filter(dt => dt.status === 'PLANNED' || dt.status === 'ONGOING'));
        }
    }, [managerEstablishmentId, currentDemoData]);

    // Effect to update selected trip details and manage tracking interval
    useEffect(() => {
        stopSimulatedBusTracking(); // Always stop previous tracking

        if (selectedDailyTripId && selectedDailyTripId !== 'none') {
            const trip = dailyTripsForTracking.find(dt => dt.id === parseInt(selectedDailyTripId));
            setSelectedTripDetails(trip);

            // Fetch latest recorded position for this trip to initialize map center/marker
            const latestRecordedPos = getLatestBusPosition(trip.id);
            if (latestRecordedPos) {
                setCurrentBusPosition({ lat: latestRecordedPos.lat, lng: latestRecordedPos.lng });
            } else if (trip?.trip?.route?.stops?.[0]) {
                // If no existing position, use the first stop as initial
                setCurrentBusPosition({ lat: trip.trip.route.stops[0].lat, lng: trip.trip.route.stops[0].lng });
            } else {
                setCurrentBusPosition(null); // No valid initial position
            }

            // Start tracking only if the trip is ONGOING
            if (trip?.status === 'ONGOING') {
                startSimulatedBusTracking(trip.id);
            }

        } else {
            setSelectedTripDetails(null);
            setCurrentBusPosition(null); // Clear position if no trip selected
        }
    }, [selectedDailyTripId, dailyTripsForTracking]);

    // --- Simulated GPS Tracking Logic ---
    const startSimulatedBusTracking = (dailyTripId) => {
        if (busTrackingInterval) {
            clearInterval(busTrackingInterval);
        }

        const interval = setInterval(() => {
            const currentPos = getLatestBusPosition(dailyTripId);
            let newLat = currentPos ? currentPos.lat : (selectedTripDetails?.trip?.route?.stops?.[0]?.lat || 33.5898);
            let newLng = currentPos ? currentPos.lng : (selectedTripDetails?.trip?.route?.stops?.[0]?.lng || -7.6116);

            newLat += (Math.random() - 0.5) * 0.0002; // Small random movement
            newLng += (Math.random() - 0.5) * 0.0002;

            addBusPosition(dailyTripId, newLat, newLng);
            setCurrentBusPosition({ lat: newLat, lng: newLng }); // Update local state for map marker
        }, 5000); // Update every 5 seconds

        setBusTrackingInterval(interval);
        toast.success("Suivi GPS simulé activé !");
    };

    const stopSimulatedBusTracking = () => {
        if (busTrackingInterval) {
            clearInterval(busTrackingInterval);
            setBusTrackingInterval(null);
            toast("Suivi GPS simulé désactivé.");
        }
    };

    // Cleanup interval on component unmount
    useEffect(() => {
        return () => {
            if (busTrackingInterval) {
                clearInterval(busTrackingInterval);
            }
        };
    }, [busTrackingInterval]);


    // Map rendering logic - **mapCenter will now prioritize currentBusPosition**
    const mapCenter = currentBusPosition ? [currentBusPosition.lat, currentBusPosition.lng] : (
                       selectedTripDetails?.trip?.route?.stops?.[0] ?
                       [selectedTripDetails.trip.route.stops[0].lat, selectedTripDetails.trip.route.stops[0].lng] :
                       [33.5898, -7.6116] // Default if no position/stops
                     );
    const polylinePositions = selectedTripDetails?.trip?.route?.stops?.map(stop => [stop.lat, stop.lng]) || [];

    if (!managerEstablishmentId) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-default-600">
                Chargement de l'établissement...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-default-900">Suivi des Bus</h1>
            <p className="text-default-600">Suivez les trajets en cours pour votre établissement.</p>

            <Card className="shadow-sm border border-gray-200">
                <CardHeader className="py-4 px-6 border-b border-gray-200">
                    <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
                        <Icon icon="heroicons:map-pin" className="h-6 w-6 text-primary" />
                        Sélectionner un Trajet à Suivre
                    </CardTitle>
                    <CardDescription>Choisissez un trajet planifié ou en cours pour voir sa position.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <Select onValueChange={setSelectedDailyTripId} value={selectedDailyTripId}>
                        <SelectTrigger className="w-full md:max-w-md">
                            <SelectValue placeholder="Sélectionnez un trajet quotidien" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">-- Aucun trajet sélectionné --</SelectItem>
                            {dailyTripsForTracking.length > 0 ? (
                                dailyTripsForTracking.map(dt => (
                                    <SelectItem key={dt.id} value={String(dt.id)}>
                                        {dt.trip?.name} ({dt.displayDate}) - Status: {getTripStatusText(dt.status)}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-trips" disabled>Aucun trajet planifié ou en cours trouvé.</SelectItem>
                            )}
                        </SelectContent>
                    </Select>

                    {selectedTripDetails && (
                        <div className="mt-6 space-y-4 text-sm text-default-600">
                            <p><strong>Trajet:</strong> {selectedTripDetails.trip?.name}</p>
                            <p><strong>Bus:</strong> {selectedTripDetails.trip?.bus?.plateNumber} ({selectedTripDetails.trip?.bus?.marque})</p>
                            <p><strong>Chauffeur:</strong> {selectedTripDetails.trip?.driver?.fullname}</p>
                            <p><strong>Statut du Trajet:</strong> {getTripStatusText(selectedTripDetails.status)}</p>
                            {/* NEW: Conditionally display current position */}
                            {selectedTripDetails.status === 'ONGOING' && currentBusPosition && (
                                <p><strong>Position Actuelle:</strong> {currentBusPosition ? `Lat: ${currentBusPosition.lat.toFixed(4)}, Lng: ${currentBusPosition.lng.toFixed(4)}` : 'N/A'}</p>
                            )}
                            <p><strong>Prochain Arrêt Estimé:</strong> {selectedTripDetails.trip?.route?.stops?.[0]?.name || 'N/A'}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Embedded Map Section - Only shows if a trip is selected, has stops, AND is ONGOING */}
            {selectedTripDetails && selectedTripDetails.status === 'ONGOING' && polylinePositions.length > 0 ? (
                <Card className="shadow-sm border border-gray-200">
                    <CardHeader className="py-4 px-6 border-b border-gray-200">
                        <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
                            <Icon icon="heroicons:globe-alt" className="h-6 w-6 text-green-500" />
                            Carte de Suivi du Trajet
                        </CardTitle>
                        <CardDescription>
                            Position en temps réel du bus sur la carte.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="w-full h-[400px] rounded-md overflow-hidden border">
                            <MapComponent
                                center={mapCenter}
                                zoom={13}
                                scrollWheelZoom={true}
                                className="h-full w-full"
                            >
                                <TileLayer
                                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {/* Markers for stops */}
                                {selectedTripDetails.trip?.route?.stops?.map(stop => (
                                    <Marker key={stop.id} position={[stop.lat, stop.lng]}>
                                        <Popup>{stop.name}</Popup>
                                    </Marker>
                                ))}
                                {/* Polyline for the route path */}
                                {polylinePositions.length > 1 && (
                                    <Polyline positions={polylinePositions} color="blue" weight={5} opacity={0.7} />
                                )}
                                {/* Current Bus Position Marker (only if ONGOING) */}
                                {currentBusPosition && (
                                    <Marker position={[currentBusPosition.lat, currentBusPosition.lng]}>
                                        <Popup>Position actuelle du bus: {selectedTripDetails.trip?.bus?.plateNumber}</Popup>
                                    </Marker>
                                )}
                            </MapComponent>
                        </div>
                    </CardContent>
                </Card>
            ) : selectedTripDetails && selectedTripDetails.status !== 'ONGOING' && selectedTripDetails.trip?.route?.id && polylinePositions.length > 0 ? (
                // Message for PLANNED trips or other statuses with a route
                <p className="text-sm text-muted-foreground text-center py-4">Le trajet n'est pas en cours. La position en temps réel n'est pas disponible.</p>
            ) : selectedTripDetails && selectedTripDetails.trip?.route?.id && polylinePositions.length < 2 ? (
                 <p className="text-sm text-muted-foreground text-center py-4">Pas assez d'arrêts pour afficher la route sur la carte.</p>
            ) : selectedTripDetails ? (
                <p className="text-sm text-muted-foreground text-center py-4">Ce trajet n'a pas de route définie.</p>
            ) : null}
        </div>
    );
};

export default BusTrackingPage;