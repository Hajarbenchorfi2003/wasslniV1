// components/models/ModalBus.jsx
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
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
import toast from 'react-hot-toast';

export const ModalBus = ({ isOpen, onClose, editingBus, onSave, establishments, fixedEstablishmentId }) => {
  // États locaux pour les champs du formulaire de bus
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [marque, setMarque] = useState('');
  const [establishmentId, setEstablishmentId] = useState('');
  const [isActive, setIsActive] = useState(true); // Nouveau champ pour l'état actif

  // Effet pour pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (editingBus) {
      setPlateNumber(editingBus.plateNumber || '');
      setCapacity(String(editingBus.capacity) || '');
      setMarque(editingBus.marque || '');
      setEstablishmentId(String(editingBus.establishmentId) || '');
      setIsActive(editingBus.isActive !== undefined ? editingBus.isActive : true); // Charge l'état actif
    } else {
      // Réinitialiser le formulaire pour l'ajout
      setPlateNumber('');
      setCapacity('');
      setMarque('');
      setEstablishmentId(fixedEstablishmentId ? String(fixedEstablishmentId) : '');
      setIsActive(true); // Définit comme actif par défaut pour un nouveau bus
    }
  }, [editingBus, isOpen, fixedEstablishmentId]); // Dépend de editingBus, isOpen, fixedEstablishmentId

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation des champs
    if (!plateNumber || !capacity || !marque || !establishmentId) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
        toast.error("La capacité doit être un nombre entier positif.");
        return;
    }

    // Préparer les données pour la sauvegarde
    const busData = {
      plateNumber,
      capacity: parseInt(capacity),
      marque,
      establishmentId: parseInt(establishmentId),
      isActive: isActive, // Inclure l'état actif
    };

    onSave(busData); // Appelle la fonction onSave passée par le parent (BusesPage)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{editingBus ? 'Modifier le Bus' : 'Ajouter un Bus'}</DialogTitle>
          <DialogDescription>
            {editingBus
              ? 'Modifiez les détails de ce bus.'
              : 'Remplissez les informations pour ajouter un nouveau bus.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="">
            <Label htmlFor="plateNumber" className="text-right mb-2">Numéro de Plaque</Label>
            <Input id="plateNumber" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} className="col-span-3" required />
          </div>

          <div className="">
            <Label htmlFor="capacity" className="text-right mb-2">Capacité</Label>
            <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="col-span-3" required min="1" />
          </div>

          <div className="">
            <Label htmlFor="marque" className="text-right mb-2">Marque</Label>
            <Input id="marque" value={marque} onChange={(e) => setMarque(e.target.value)} className="col-span-3" required />
          </div>

          <div className="">
            <Label htmlFor="establishmentId" className="text-right mb-2">Établissement</Label>
            <Select
              value={establishmentId}
              onValueChange={setEstablishmentId}
              className="col-span-3"
              required
              disabled={!!fixedEstablishmentId} // Désactive le select si l'établissement est fixe
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

          {/* Champ pour l'état actif (isActive) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">Actif</Label>
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              className="col-span-3"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit">{editingBus ? 'Modifier' : 'Ajouter'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalBus;