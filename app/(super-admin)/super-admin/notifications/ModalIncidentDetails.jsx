// components/manager/ModalIncidentDetails.jsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'; // Assuming cn is available

export const ModalIncidentDetails = ({ isOpen, setIsOpen, incidentDetails }) => {
  if (!incidentDetails) {
    return null; // Ne rien afficher si pas d'incident
  }

  // Fonction pour afficher le statut
  const getIncidentStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'red';
      case 'ACKNOWLEDGED': return 'yellow';
      case 'RESOLVED': return 'green';
      default: return 'gray';
    }
  };

  const getIncidentStatusText = (status) => {
    switch (status) {
      case 'NEW': return 'Nouveau';
      case 'ACKNOWLEDGED': return 'Reconnu';
      case 'RESOLVED': return 'Résolu';
      default: return 'Inconnu';
    }
  };

  // Formatage de date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date invalide': date.toLocaleString();
  };

  // Extraction des données avec sécurité
  const tripName = incidentDetails.dailyTrip?.trip?.name ||'N/A';
  const establishmentName = incidentDetails.dailyTrip?.trip?.establishment?.name || 'N/A';
  const reportedByName = incidentDetails.reportedBy?.fullname ||'Inconnu';
  const incidentDate = incidentDetails.dailyTrip?.date ? new Date(incidentDetails.dailyTrip.date).toLocaleDateString() : 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="heroicons:exclamation-triangle" className="h-6 w-6 text-red-500" />
            Détails de l&rsquo;Incident #{incidentDetails.id}
          </DialogTitle>
          <DialogDescription>
            Informations détaillées concernant l&rsquo;incident signalé.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 text-sm text-default-600">
          {/* Description */}
          <p>
            <strong>Description:</strong> {incidentDetails.description || 'Aucune description fournie'}
          </p>

          {/* Statut */}
          <p className="flex items-center gap-2">
            <strong>Statut:</strong>
            <Badge variant="soft" color={getIncidentStatusColor(incidentDetails.status)} className="capitalize">
              {getIncidentStatusText(incidentDetails.status)}
            </Badge>
          </p>

          <Separator className="my-3" />

          {/* Trajet Quotidien */}
          <p>
            <strong>Trajet:</strong> {tripName}
          </p>

          {/* Établissement */}
          <p>
            <strong>Établissement:</strong> {establishmentName}
          </p>

          {/* Date du trajet */}
          <p>
            <strong>Date du Trajet:</strong> {incidentDate}
          </p>

          {/* Rapporté par */}
          <p>
            <strong>Rapporté par:</strong> {reportedByName}
          </p>

          {/* Date de signalement */}
          <p>
            <strong>Date/Heure Signalement:</strong> {formatDate(incidentDetails.timestamp)}
          </p>
        </div>

        {/* Actions optionnelles (à implémenter côté backend) */}
        {/* 
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline">Marquer comme Reconnu</Button>
          <Button variant="default">Marquer comme Résolu</Button>
        </div>
        */}
      </DialogContent>
    </Dialog>
  );
};

export default ModalIncidentDetails;