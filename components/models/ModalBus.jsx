// components/models/ModalBus.jsx
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

export const ModalBus = ({ isOpen, onClose, editingBus, onSave, establishments }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    capacity: 0,
    marque: '',
    establishmentId: null, // To link the bus to an establishment
  });

  // Set form data when editing an existing bus or resetting for a new one
  useEffect(() => {
    if (editingBus) {
      setFormData({
        plateNumber: editingBus.plateNumber || '',
        capacity: editingBus.capacity || 0,
        marque: editingBus.marque || '',
        establishmentId: editingBus.establishmentId || null,
      });
    } else {
      // Reset form for adding new bus
      setFormData({
        plateNumber: '',
        capacity: 0,
        marque: '',
        establishmentId: null,
      });
    }
  }, [editingBus]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value // Parse capacity to number
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10) // Ensure establishmentId is a number
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader   >
          <DialogTitle  className="text-base font-medium text-default-700">{editingBus ? 'Modifier le Bus' : 'Ajouter un nouveau Bus'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} >
        <div className="space-y-4 p-4">
          <div>
            <Label htmlFor="plateNumber" className="text-right">Numéro de Plaque</Label>
            <Input id="plateNumber" name="plateNumber" value={formData.plateNumber} onChange={handleChange} className="col-span-3" required />
          </div>
          <div>
            <Label htmlFor="capacity" className="text-right">Capacité</Label>
            <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} className="col-span-3" required min="1" />
          </div>
          <div>
            <Label htmlFor="marque" className="text-right">Marque</Label>
            <Input id="marque" name="marque" value={formData.marque} onChange={handleChange} className="col-span-3" required />
          </div>

          {/* Dropdown for Establishment Selection */}
          {establishments && establishments.length > 0 && (
            <div>
              <Label htmlFor="establishment" className="text-right">Établissement</Label>
              <Select
                onValueChange={(value) => handleSelectChange('establishmentId', value)}
                value={formData.establishmentId ? String(formData.establishmentId) : ''}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un établissement" />
                </SelectTrigger>
                <SelectContent>
                  {establishments.map(est => (
                    <SelectItem key={est.id} value={String(est.id)}>
                      {est.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
          )}
        </div>
          <DialogFooter>
            <Button type="submit">Sauvegarder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};