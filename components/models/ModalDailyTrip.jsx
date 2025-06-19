// components/models/ModalDailyTrip.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ModalDailyTrip = ({ isOpen, onClose, editingDailyTrip, onSave, trips, tripStatuses }) => {
  const [formData, setFormData] = useState({
    tripId: null,
    date: '',
    status: 'PLANNED', // Default status
  });

  useEffect(() => {
    if (editingDailyTrip) {
      const tripDate = editingDailyTrip.date ? new Date(editingDailyTrip.date).toISOString().split('T')[0] : '';
      setFormData({
        tripId: editingDailyTrip.tripId || null,
        date: tripDate,
        status: editingDailyTrip.status || 'PLANNED',
      });
    } else {
      setFormData({
        tripId: null,
        date: '',
        status: 'PLANNED',
      });
    }
  }, [editingDailyTrip]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: name === 'tripId' ? parseInt(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tripId || !formData.date || !formData.status) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">{editingDailyTrip ? 'Modifier le Trajet Quotidien' : 'Ajouter un nouveau Trajet Quotidien'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Trip Selection */}
          {trips && trips.length > 0 && (
            <div>
              <Label htmlFor="trip" className="text-right">Trajet</Label>
              <Select onValueChange={(value) => handleSelectChange('tripId', value)} value={formData.tripId ? String(formData.tripId) : ''} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un trajet" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map(trip => (
                    <SelectItem key={trip.id} value={String(trip.id)}>
                      {trip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="date" className="text-right">Date du Trajet</Label>
            <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} className="col-span-3" required />
          </div>

          {/* Status Selection */}
          {tripStatuses && tripStatuses.length > 0 && (
            <div>
              <Label htmlFor="status" className="text-right">Statut</Label>
              <Select onValueChange={(value) => handleSelectChange('status', value)} value={formData.status} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {tripStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="submit">Sauvegarder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};