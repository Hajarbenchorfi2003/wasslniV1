// components/parent/ChildInfoCard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const ChildInfoCard = ({ child, dailyTripDetails, busPosition, onTrackBus, onReportAttendance }) => {
  const { fullname, class: studentClass, quartie, address } = child;
  const { trip, bus, route, driver, displayDate, status } = dailyTripDetails || {};

  const getTripStatusColor = (s) => {
    switch (s) {
      case 'PLANNED': return 'blue';
      case 'ONGOING': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELED': return 'red';
      default: return 'gray';
    }
  };

  const getTripStatusText = (s) => {
    switch (s) {
      case 'PLANNED': return 'Planifié';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELED': return 'Annulé';
      default: return 'N/A';
    }
  };

  const getChildStatus = () => {
    if (!dailyTripDetails) return { status: 'NO_TRIP', text: 'Pas de trajet', color: 'gray' };
    
    switch (status) {
      case 'ONGOING': return { status: 'ON_BUS', text: 'Dans le bus', color: 'green' };
      case 'COMPLETED': return { status: 'ARRIVED', text: 'Arrivé', color: 'blue' };
      case 'PLANNED': return { status: 'WAITING', text: 'En attente', color: 'yellow' };
      default: return { status: 'UNKNOWN', text: 'Inconnu', color: 'gray' };
    }
  };

  const childStatus = getChildStatus();

  return (
    <Card className="border border-gray-200">
      <CardHeader className="py-4 px-6">
        <div className="flex items-center justify-between">
          <div>
        <CardTitle className="text-xl font-semibold text-default-800 flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {fullname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {fullname}
        </CardTitle>
            <CardDescription className="text-sm text-default-600 mt-1">
              <span className="font-medium">Classe:</span> {studentClass} &bull; <span className="font-medium">Quartier:</span> {quartie}
        </CardDescription>
          </div>
          <Badge variant="soft" color={childStatus.color} className="capitalize">
            {childStatus.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {dailyTripDetails ? (
          <>
            {/* Bus and Driver Information */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-default-800 mb-4 flex items-center gap-2">
                <Icon icon="heroicons:truck" className="h-5 w-5 text-blue-500" />
                Informations du Bus & Chauffeur
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bus Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                    <Icon icon="heroicons:truck" className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">{trip.bus?.plateNumber || 'N/A'}</p>
                      <p className="text-sm text-blue-700">{trip.bus?.marque || 'N/A'} - {trip.bus?.modele || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Driver Info */}
                  <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-600 text-white">
                        {trip.driver?.fullname?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-green-900">{trip.driver?.fullname || 'N/A'}</p>
                      <p className="text-sm text-green-700">{trip.driver?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                    <Icon icon="heroicons:map" className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-900">{trip?.name || 'N/A'}</p>
                      <p className="text-sm text-purple-700">{trip.route?.name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                    <Icon icon="heroicons:clock" className="h-6 w-6 text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-900">{displayDate || 'N/A'}</p>
                      <p className="text-sm text-orange-700">Départ prévu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-gray-200" />

            {/* Route Stops */}
            {route?.stops && route.stops.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-default-800 mb-3 flex items-center gap-2">
                  <Icon icon="heroicons:map-pin" className="h-5 w-5 text-indigo-500" />
                  Arrêts du Trajet
                </h3>
                <div className="space-y-2">
                  {route.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-3 p-2 bg-default-50 rounded">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{stop.name}</p>
                        <p className="text-sm text-gray-600">{stop.address}</p>
                      </div>
                      {index === 0 && (
                        <Badge variant="soft" color="green" className="text-xs">
                          Départ
                        </Badge>
                      )}
                      {index === route.stops.length - 1 && (
                        <Badge variant="soft" color="blue" className="text-xs">
                          Arrivée
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6 bg-gray-200" />

            {/* Real-time Status */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-default-800 mb-3 flex items-center gap-2">
                <Icon icon="heroicons:signal" className="h-5 w-5 text-green-500" />
                Statut en Temps Réel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-default-50 rounded-lg">
                  <Icon icon="heroicons:map-pin" className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                  <p className="font-semibold text-gray-900">Position</p>
                  <p className="text-sm text-gray-600">
                    {busPosition ? 'En cours de suivi' : 'Non disponible'}
                  </p>
                </div>
                <div className="text-center p-3 bg-default-50 rounded-lg">
                  <Icon icon="heroicons:clock" className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                  <p className="font-semibold text-gray-900">Heure d'arrivée</p>
                  <p className="text-sm text-gray-600">
                    {status === 'ONGOING' ? 'En cours' : status === 'COMPLETED' ? 'Arrivé' : 'À déterminer'}
                  </p>
                </div>
                <div className="text-center p-3 bg-default-50 rounded-lg">
                  <Icon icon="heroicons:check-circle" className="h-6 w-6 mx-auto text-green-500 mb-2" />
                  <p className="font-semibold text-gray-900">Statut</p>
                  <Badge variant="soft" color={getTripStatusColor(status)} className="capitalize">
                    {getTripStatusText(status)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button 
                onClick={() => onReportAttendance(child.id, dailyTripDetails.id)} 
                variant="outline" 
                className="text-orange-500 border-orange-500 hover:bg-orange-50 hover:text-orange-600"
              >
                <Icon icon="heroicons:clock" className="h-4 w-4 mr-2" /> 
                Signaler absence/retard
              </Button>
              <Button 
                onClick={() => onTrackBus(child.id)} 
                variant="default" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              >
                <Icon icon="heroicons:map-pin" className="h-4 w-4 mr-2" /> 
                Suivre le Bus en Temps Réel
              </Button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-default-500">
            <Icon icon="heroicons:information-circle" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Aucun trajet assigné</h3>
            <p className="text-sm">Aucun trajet n'est actuellement assigné à cet enfant.</p>
            <p className="text-xs mt-1">Veuillez contacter l'administration pour plus d'informations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};