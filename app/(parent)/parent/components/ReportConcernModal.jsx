// components/parent/ReportConcernModal.jsx
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from 'react-hot-toast';
import { addConcernOrFeedback } from '@/data/data';

export const ReportConcernModal = ({ isOpen, setIsOpen, parentId, onConcernReported }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [concernType, setConcernType] = useState('Général');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setMessage('');
      setConcernType('Général');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSendConcern = async () => {
    // Validation des champs
    if (!subject.trim()) {
      toast.error("Veuillez saisir un objet pour votre préoccupation.");
      return;
    }

    if (!message.trim()) {
      toast.error("Veuillez saisir un message pour votre préoccupation.");
      return;
    }

    if (message.trim().length < 5) {
      toast.error("Votre message doit contenir au moins 5 caractères.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Appel de la fonction pour ajouter la préoccupation
      const result = addConcernOrFeedback({
        parentId: parentId || 5, // Fallback au MOCK_PARENT_ID
        type: concernType,
        title: subject.trim(),
        message: message.trim(),
      });

      // Vérification du résultat
      if (result) {
        toast.success("Votre préoccupation a été envoyée avec succès !");
        
        // Appel du callback pour rafraîchir les données
        if (onConcernReported) {
          onConcernReported();
        }
        
        // Fermeture du modal
        setIsOpen(false);
      } else {
        // Si aucun admin/responsable n'est trouvé
        toast.error("Impossible d'envoyer votre message. Aucun administrateur disponible.");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la préoccupation:", error);
      toast.error("Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            Signaler une Préoccupation
          </DialogTitle>
          <DialogDescription>
            Votre avis est important. Envoyez un message à l'administration de l'école.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className=" ">
            <Label htmlFor="concernType" className="text-right font-medium ">
              Type
            </Label>
            <Select value={concernType} onValueChange={setConcernType} className="mt-2">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Général">Général</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Sécurité">Sécurité</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className=" ">
            <Label htmlFor="subject" className="text-right font-medium">
              Objet *
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2"
              placeholder="Ex: Retard du bus, problème avec un élève..."
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message" className="font-medium">
              Message *
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              placeholder="Décrivez votre préoccupation en détail..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 3 caractères requis. ({message.length}/3)
            </p>
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
            onClick={handleSendConcern}
            disabled={isSubmitting || !subject.trim() || !message.trim() || message.trim().length < 5}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Envoi en cours...
              </>
            ) : (
              <>
                
                Envoyer le message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};