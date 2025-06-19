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
    return null; // Don't render if no incident details are provided
  }

  // Helper for Incident status display (can be shared or defined here)
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="heroicons:exclamation-triangle" className="h-6 w-6 text-red-500" />
            Détails de l'Incident
          </DialogTitle>
          <DialogDescription>
            Informations détaillées concernant l'incident #{incidentDetails.id}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 text-sm text-default-600">
          <p>
            <strong>Description:</strong> {incidentDetails.description}
          </p>
          <p className="flex items-center gap-2">
            <strong>Statut:</strong>
            <Badge variant="soft" color={getIncidentStatusColor(incidentDetails.status)} className="capitalize">
              {getIncidentStatusText(incidentDetails.status)}
            </Badge>
          </p>

          <Separator className="my-3" />

          <p>
            <strong>Trajet Quotidien:</strong> {incidentDetails.dailyTripName || 'N/A'} (ID: {incidentDetails.dailyTripId})
          </p>
          <p>
            <strong>Date du Trajet:</strong> {incidentDetails.dailyTripDate || 'N/A'}
          </p>
          <p>
            <strong>Rapporté par:</strong> {incidentDetails.reportedByName || 'N/A'} (ID: {incidentDetails.reportedById})
          </p>
          <p>
            <strong>Date/Heure Signalement:</strong> {incidentDetails.timestampFormatted || 'N/A'}
          </p>

          {/* You can add more fields here like incident type, photos, resolution notes, etc. */}
        </div>

        {/* Optional: Actions for manager (e.g., Mark as Acknowledged/Resolved) */}
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