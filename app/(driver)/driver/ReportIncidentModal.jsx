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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from 'react-hot-toast';
import driverService from '@/services/driverService';
import { ScrollArea } from "@/components/ui/scroll-area";

export const ReportIncidentModal = ({
  isOpen,
  setIsOpen,
  dailyTripId,
  onIncidentReported,
}) => {
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('TECHNICAL');
  const [severity, setSeverity] = useState('MEDIUM');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setIncidentType('TECHNICAL');
      setSeverity('MEDIUM');
      setLocation('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleReportIncident = async () => {
  if (!description.trim()) {
    toast.error('Veuillez fournir une description pour l&apos;incident.');
    return;
  }

  if (description.trim().length < 10) {
    toast.error("La description doit contenir au moins 10 caractères.");
    return;
  }

  if (!dailyTripId) {
    toast.error("Aucun trajet sélectionné.");
    return;
  }

  setIsSubmitting(true);
 
  try {
    const incidentData = {
      dailyTripId,
      description: description.trim(),
    };

    const incident = await driverService.reportIncident(incidentData);
    
    toast.success("Incident signalé avec succès !");
    if (onIncidentReported) {
      onIncidentReported(incident);
    }
    setIsOpen(false);
  } catch (error) {
    console.error("Erreur lors du signalement de l'incident:", error);
    toast.error(error.response?.data?.message || "Impossible de signaler l'incident. Vérifiez votre connexion.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleCancel = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px] ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            Signaler un Incident
          </DialogTitle>
          <DialogDescription>
            Décrivez l&apos;incident que vous souhaitez signaler. Cette information sera transmise à l&apos;administration.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh] ">
          <div className="grid gap-4 pr-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">
                Description détaillée *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                placeholder="Décrivez l'incident en détail : ce qui s'est passé, quand, où, et quelles actions ont été prises..."
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 caractères requis. ({description.length}/10)
              </p>
            </div>

            {/* Quick Incident Templates */}
            <div className="space-y-2">
              <Label className="font-medium">Modèles rapides</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIncidentType('TECHNICAL');
                    setDescription('Problème mécanique détecté sur le bus. Vérification nécessaire.');
                  }}
                  disabled={isSubmitting}
                >
                  Problème mécanique
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIncidentType('TRAFFIC');
                    setDescription('Retard important dû au trafic dense. Les élèves seront en retard à l\'école.');
                  }}
                  disabled={isSubmitting}
                >
                  Retard trafic
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIncidentType('STUDENT');
                    setDescription('Comportement inapproprié d\'un élève dans le bus. Intervention nécessaire.');
                  }}
                  disabled={isSubmitting}
                >
                  Problème élève
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIncidentType('WEATHER');
                    setDescription('Conditions météorologiques difficiles. Circulation ralentie.');
                  }}
                  disabled={isSubmitting}
                >
                  Mauvais temps
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleReportIncident}
            disabled={isSubmitting || !description.trim() || description.trim().length < 10}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Envoi en cours...
              </>
            ) : (
              <>
                🚨
                Signaler l&apos;incident
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};