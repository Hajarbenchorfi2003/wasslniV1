// components/models/ModalStop.jsx
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
import toast from 'react-hot-toast'; // For notifications

export const ModalStop = ({ isOpen, onClose, editingStop, onSave, routes }) => {
  // États locaux pour les champs du formulaire d'arrêt
  const [name, setName] = useState('');
  const [routeId, setRouteId] = useState(''); // ID de la route associée
  const [stopOrder, setStopOrder] = useState(''); // Ordre de l'arrêt sur la route
  const [lat, setLat] = useState(''); // Latitude
  const [lng, setLng] = useState(''); // Longitude

  // Effet pour pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (editingStop) {
      setName(editingStop.name || '');
      setRouteId(String(editingStop.routeId) || ''); // Convertir en chaîne pour le Select
      setStopOrder(String(editingStop.stopOrder) || '');
      setLat(String(editingStop.lat) || '');
      setLng(String(editingStop.lng) || '');
    } else {
      // Réinitialiser le formulaire pour l'ajout
      setName('');
      setRouteId('');
      setStopOrder('');
      setLat('');
      setLng('');
    }
  }, [editingStop, isOpen]); // Dépend de editingStop et isOpen pour réinitialiser à l'ouverture/changement

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation des champs
    if (!name || !routeId || !stopOrder || !lat || !lng) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        toast.error("La latitude et la longitude doivent être des nombres valides.");
        return;
    }
    if (isNaN(parseInt(stopOrder)) || parseInt(stopOrder) <= 0) {
        toast.error("L'ordre d'arrêt doit être un nombre entier positif.");
        return;
    }

    // Préparer les données pour la sauvegarde
    const stopData = {
      name,
      routeId: parseInt(routeId),
      stopOrder: parseInt(stopOrder),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    onSave(stopData); // Appelle la fonction onSave passée par le parent (StopsPage)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}> {/* onOpenChange gère la fermeture */}
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{editingStop ? 'Modifier l\'Arrêt' : 'Ajouter un Arrêt'}</DialogTitle>
          <DialogDescription>
            {editingStop
              ? 'Modifiez les détails de cet arrêt.'
              : 'Remplissez les informations pour ajouter un nouvel arrêt.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="items-center gap-4">
            <Label htmlFor="name" className="text-right  mb-2">Nom</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 w-full" required />
          </div>

          <div className=" items-center gap-4">
            <Label htmlFor="routeId" className="text-right mb-2">Route</Label>
            <Select value={routeId} onValueChange={setRouteId} className="col-span-3" required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez une route" />
              </SelectTrigger>
              <SelectContent>
                {routes.length > 0 ? (
                  routes.map(route => (
                    <SelectItem key={route.id} value={String(route.id)}>
                      {route.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>Aucune route disponible</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="  items-center gap-4">
            <Label htmlFor="stopOrder" className="text-right mb-2">Ordre</Label>
            <Input id="stopOrder" type="number" value={stopOrder} onChange={(e) => setStopOrder(e.target.value)} className="col-span-3" required min="1" />
          </div>

          <div className="  items-center gap-4">
            <Label htmlFor="lat" className="text-right mb-2">Latitude</Label>
            <Input id="lat" type="number" step="0.000001" value={lat} onChange={(e) => setLat(e.target.value)} className="col-span-3" required />
          </div>

          <div className=" items-center">
            <Label htmlFor="lng" className="text-right mb-2">Longitude</Label>
            <Input id="lng" type="number" step="0.000001" value={lng} onChange={(e) => setLng(e.target.value)} className="col-span-3" required />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit">{editingStop ? 'Modifier' : 'Ajouter'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalStop;