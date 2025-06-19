// components/driver/ReportIncidentModal.jsx
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import toast from 'react-hot-toast';
import { addIncident } from '@/data/data';

export const ReportIncidentModal = ({
  isOpen,
  setIsOpen,
  dailyTripId,
  driverId,
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
      toast.error("Veuillez fournir une description pour l'incident.");
      return;
    }

    if (description.trim().length < 10) {
      toast.error("La description doit contenir au moins 10 caractères.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = addIncident({
        dailyTripId: dailyTripId,
        reportedById: driverId,
        description: description.trim(),
        type: incidentType,
        severity: severity,
        location: location.trim() || 'Non spécifié',
      });

      if (result) {
      toast.success("Incident signalé avec succès !");
        onIncidentReported();
      setIsOpen(false);
      } else {
        toast.error("Impossible de signaler l'incident. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors du signalement de l'incident:", error);
      toast.error("Une erreur est survenue lors du signalement de l'incident.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const getIncidentTypeText = (type) => {
    switch (type) {
      case 'TECHNICAL': return 'Problème technique';
      case 'STUDENT': return 'Problème avec un élève';
      case 'ROAD': return 'Problème de route';
      case 'TRAFFIC': return 'Retard trafic';
      case 'WEATHER': return 'Conditions météo';
      case 'OTHER': return 'Autre';
      default: return type;
    }
  };

  const getSeverityText = (sev) => {
    switch (sev) {
      case 'LOW': return 'Faible';
      case 'MEDIUM': return 'Moyen';
      case 'HIGH': return 'Élevé';
      case 'CRITICAL': return 'Critique';
      default: return sev;
    }
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-orange-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            Signaler un Incident
          </DialogTitle>
          <DialogDescription>
            Décrivez l'incident que vous souhaitez signaler. Cette information sera transmise à l'administration.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incidentType" className="font-medium">
                Type d'incident *
              </Label>
              <Select value={incidentType} onValueChange={setIncidentType} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TECHNICAL">Problème technique</SelectItem>
                  <SelectItem value="STUDENT">Problème avec un élève</SelectItem>
                  <SelectItem value="ROAD">Problème de route</SelectItem>
                  <SelectItem value="TRAFFIC">Retard trafic</SelectItem>
                  <SelectItem value="WEATHER">Conditions météo</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="severity" className="font-medium">
                Gravité *
              </Label>
              <Select value={severity} onValueChange={setSeverity} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la gravité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Faible</SelectItem>
                  <SelectItem value="MEDIUM">Moyen</SelectItem>
                  <SelectItem value="HIGH">Élevé</SelectItem>
                  <SelectItem value="CRITICAL">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="font-medium">
              Localisation (Optionnel)
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Rue de la Paix, Centre-ville..."
              disabled={isSubmitting}
            />
          </div>
          
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
                Signaler l'incident
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};