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
import parentService from '@/services/parentService';

export const ReportAttendanceModal = ({ isOpen, setIsOpen, childId, dailyTripId, onAttendanceReported }) => {
  const [status, setStatus] = useState('ABSENT');
  const [description, setDescription] = useState('');
  const [childName, setChildName] = useState('');
  const [tripName, setTripName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && childId && dailyTripId) {
        try {
          // Récupérer les détails de l'enfant (avec tripStudents + dailyTrips)
          const childDetails = await parentService.getChildDetails(childId);
          const student = childDetails?.student;

          setChildName(student?.fullname || 'Enfant inconnu');

          // Trouver le dailyTrip lié au dailyTripId
          let foundDailyTrip = null;
          for (const ts of student?.tripStudents || []) {
            foundDailyTrip = ts.trip.dailyTrips?.find(dt => dt.id === parseInt(dailyTripId));
            if (foundDailyTrip) {
              foundDailyTrip.trip = ts.trip;
              break;
            }
          }

          if (foundDailyTrip) {
            setTripName(`${foundDailyTrip.trip?.name || 'Trajet inconnu'} (${new Date(foundDailyTrip.date).toLocaleDateString()})`);
          } else {
            setTripName('Trajet non trouvé');
          }

          setDescription('');
          setStatus('ABSENT');
          setIsSubmitting(false);
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
          setChildName('Erreur de chargement');
          setTripName('Erreur de chargement');
        }
      }
    };

    fetchData();
  }, [isOpen, childId, dailyTripId]);

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
      // Ici, tu appelles directement ton backend qui crée l'absence
      const response = await parentService.declareChildAbsence(childId);
  
      toast.success("L'absence a été déclarée avec succès.");
  
      if (onAttendanceReported) {
        onAttendanceReported();
      }
  
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      toast.error("Erreur lors de la déclaration d'absence.");
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
            Signaler l&apos;absence/retard
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
              disabled={isSubmitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ABSENT" id="absent" />
                <Label htmlFor="absent" className="cursor-pointer">Absent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LATE" id="late" />
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

export default ReportAttendanceModal;
