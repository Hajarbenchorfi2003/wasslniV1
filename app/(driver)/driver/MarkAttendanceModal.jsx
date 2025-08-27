// components/driver/MarkAttendanceModal.jsx
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import driverService from '@/services/driverservice';
import { Icon } from '@iconify/react';

export const MarkAttendanceModal = ({
  isOpen,
  setIsOpen,
  dailyTripId,
  studentId,
  currentStatus,
  onAttendanceMarked,
}) => {
  const [status, setStatus] = useState(currentStatus || 'ABSENT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les infos de l'élève quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && studentId) {
      // Simuler le chargement des données élève (tu peux remplacer ça par un appel API si nécessaire)
      setStatus(currentStatus || 'ABSENT');
      setIsSubmitting(false);
    }
  }, [isOpen, studentId, currentStatus]);

   

  const handleSaveAttendance = async () => {
    if (!status) {
      toast.error('Veuillez sélectionner un statut de présence.');
      return;
    }
  
    if (!dailyTripId || !studentId) {
      toast.error('Données manquantes pour enregistrer la présence.');
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const result = await driverService.markAttendance({
        dailyTripId,
        studentId,
        type: 'DEPART', // ou 'RETURN' selon votre logique
        status
      });
  
      toast.success(`Présence de   marquée comme '${getStatusText(status)}'`);
      
      if (onAttendanceMarked) {
        onAttendanceMarked(result);
      }
  
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur API:', error.response?.data);
     
      if (error.response?.status === 403) {
        toast.error('Impossible de marquer la présence : le trajet  est pas en cours');
      }  else if(error.response?.data?.error) {
        toast.error(error.response.data.error);
      }else if (typeof error.response?.data === 'string') {
        const match = error.response.data.match(/Error:\s(.+?)<br>/);
        const message = match ? match[1] : defaultMessage;
        toast.error(message);
      } 
      else {
        toast.error(defaultMessage);
      }
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
      case 'PRESENT': return 'Présent';
      case 'ABSENT': return 'Absent';
      case 'LATE': return 'En Retard';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600';
      case 'ABSENT': return 'text-red-600';
      case 'LATE': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT': return 'heroicons:check-circle';
      case 'ABSENT': return 'heroicons:x-circle';
      case 'LATE': return 'heroicons:clock';
      default: return 'heroicons:question-mark-circle';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            Marquer la présence
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le statut de présence pour cet élève.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          

          {/* Statut de présence */}
          <div className="space-y-3">
            <Label className="font-medium">Statut de présence *</Label>
            <RadioGroup 
  value={status} 
  onValueChange={setStatus} 
  className="grid grid-cols-2 gap-3" // Changé de 3 à 2 colonnes
  disabled={isSubmitting}
>
  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
    <RadioGroupItem value="PRESENT" id="present" />
    <Label htmlFor="present" className="flex items-center gap-2 cursor-pointer">
      <Icon icon="heroicons:check-circle" className="h-5 w-5 text-green-600" />
      Présent
    </Label>
  </div>
  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
    <RadioGroupItem value="ABSENT" id="absent" />
    <Label htmlFor="absent" className="flex items-center gap-2 cursor-pointer">
      <Icon icon="heroicons:x-circle" className="h-5 w-5 text-red-600" />
      Absent
    </Label>
  </div>
</RadioGroup>
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
            onClick={handleSaveAttendance}
            disabled={isSubmitting || !status}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Enregistrement...
              </>
            ) : (
              <>
                <Icon icon={getStatusIcon(status)} className="h-4 w-4" />
                Marquer comme {getStatusText(status)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};