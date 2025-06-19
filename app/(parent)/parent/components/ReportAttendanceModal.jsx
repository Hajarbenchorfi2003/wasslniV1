// components/parent/ReportAttendanceModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { addConcernOrFeedback, getUserById, getTripById, getDailyTripsForDriver } from '@/data/data';
import { demoData, getChildren } from '@/data/data';

export const ReportAttendanceModal = ({ isOpen, setIsOpen, parentId, childId, dailyTripId, onAttendanceReported }) => {
  const [status, setStatus] = useState('ABSENT');
  const [description, setDescription] = useState('');
  const [childName, setChildName] = useState('');
  const [tripName, setTripName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
console.log(childId);
  useEffect(() => {
    if (isOpen && childId && dailyTripId) {
      // Récupérer les détails de l'enfant et du trajet
      const numericDailyTripId = typeof dailyTripId === 'string' ? parseInt(dailyTripId) : dailyTripId;
      const children = getChildren(childId);
      const child = children.length > 0 ? children[0] : null;
      // Récupérer directement depuis demoData.dailyTrips
    const dailyTrip = demoData.dailyTrips.find(dt => dt.id === numericDailyTripId);
    
    // Récupérer les infos du trajet
    const trip = dailyTrip ? demoData.trips.find(t => t.id === dailyTrip.tripId) : null;
      
      setChildName(child ? child.fullname : 'Enfant inconnu');
      if (dailyTrip && trip) {
        setTripName(`${trip.name} (${new Date(dailyTrip.date).toLocaleDateString()})`);
      } else {
        setTripName('Trajet inconnu');
      }
      setDescription('');
      setStatus('ABSENT');
      setIsSubmitting(false);
    }
  }, [isOpen, childId, dailyTripId]);
  console.log('childId:', childId, typeof childId);
  console.log('getChildren result:', getChildren(childId));
  const handleReport = async () => {
    if (!status) {
      toast.error("Veuillez sélectionner un statut (Absent ou Retard).");
      return;
    }

    if (!childId || !dailyTripId) {
      toast.error("Informations manquantes pour le signalement.");
      return;
    }

    setIsSubmitting(true);
  

    try {
      // Trouver un responsable ou admin pour recevoir la notification
      const adminOrResponsible = demoData.users.find(u => u.role === 'ADMIN' || u.role === 'RESPONSIBLE');
      const recipientUserId = adminOrResponsible?.id;

      if (!recipientUserId) {
        toast.error("Impossible d'envoyer le rapport : aucun administrateur disponible.");
        return;
      }

      // Appel de la fonction pour ajouter le rapport
      const result = addConcernOrFeedback({
        parentId: parentId || 5, // Fallback au MOCK_PARENT_ID
        type: `ABSENCE_RETARD_${status}`,
        title: `${childName} : Statut ${status} pour le trajet ${tripName}`,
        message: `L'élève ${childName} a été signalé comme ${status} pour le trajet "${tripName}".\nDescription: ${description || 'Aucune.'}`,
        recipientUserId: recipientUserId,
      });

      if (result) {
        toast.success("Statut d'absence/retard signalé avec succès !");
        
        if (onAttendanceReported) {
          onAttendanceReported();
        }
        
        setIsOpen(false);
      } else {
        toast.error("Impossible d'envoyer le rapport. Veuillez réessayer.");
      }
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      toast.error("Une erreur est survenue lors du signalement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ABSENT': return 'Absent';
      case 'LATE': return 'En Retard';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Signaler l'absence/retard
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-1">
              <p><strong>Élève :</strong> {childName}</p>
              <p><strong>Trajet :</strong> {tripName}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <Label className="font-medium">Statut *</Label>
            <RadioGroup 
              value={status} 
              onValueChange={setStatus} 
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ABSENT" id="absent" disabled={isSubmitting} />
                <Label htmlFor="absent" className="cursor-pointer">Absent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LATE" id="late" disabled={isSubmitting} />
                <Label htmlFor="late" className="cursor-pointer">En Retard</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description (Optionnel)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Maladie, rendez-vous médical, réveil tardif..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleReport}
            disabled={isSubmitting || !status}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Envoi en cours...
              </>
            ) : (
              `Signaler ${getStatusText(status)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};