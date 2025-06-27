// components/models/ModalRoute.jsx
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from 'react-hot-toast';

export const ModalRoute = ({ 
  isOpen, 
  onClose, 
  editingRoute, 
  onSave, 
  establishments, 
  fixedEstablishmentId 
}) => {
  const [name, setName] = useState('');
  const [establishmentId, setEstablishmentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingRoute) {
      setName(editingRoute.name || '');
      setEstablishmentId(String(editingRoute.establishmentId) || '');
    } else {
      setName('');
      setEstablishmentId(fixedEstablishmentId ? String(fixedEstablishmentId) : '');
    }
  }, [editingRoute, isOpen, fixedEstablishmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !establishmentId) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      setIsSubmitting(false);
      return;
    }

    try {
      const routeData = {
        name,
        establishmentId: parseInt(establishmentId),
        // Include ID when editing
        ...(editingRoute && { id: editingRoute.id })
      };

      await onSave(routeData);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error("Une erreur est survenue lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{editingRoute ? 'Modifier la Route' : 'Ajouter une Route'}</DialogTitle>
          <DialogDescription>
            {editingRoute
              ? 'Modifiez les détails de cette route.'
              : 'Remplissez les informations pour ajouter une nouvelle route.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="items-center gap-4">
            <Label htmlFor="name" className="text-right mb-2">Nom</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="col-span-3" 
              required 
            />
          </div>

          <div className="items-center gap-4">
            <Label htmlFor="establishmentId" className="text-right mb-2">Établissement</Label>
            <Select
              value={establishmentId}
              onValueChange={setEstablishmentId}
              className="col-span-3"
              required
              disabled={!!fixedEstablishmentId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez un établissement" />
              </SelectTrigger>
              <SelectContent>
                {establishments.length > 0 ? (
                  establishments.map(est => (
                    <SelectItem key={est.id} value={String(est.id)}>
                      {est.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>Aucun établissement disponible</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : editingRoute ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalRoute;