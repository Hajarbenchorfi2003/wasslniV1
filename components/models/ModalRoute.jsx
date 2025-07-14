// components/models/ModalRoute.jsx
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
import { ScrollArea } from "@/components/ui/scroll-area";
export const ModalRoute = ({ isOpen, onClose, editingRoute, onSave, establishments }) => {
  const [formData, setFormData] = useState({
    name: '',
    establishmentId: null,
  });

  useEffect(() => {
    if (editingRoute) {
      setFormData({
        name: editingRoute.name || '',
        establishmentId: editingRoute.establishmentId || null,
      });
    } else {
      setFormData({
        name: '',
        establishmentId: null,
      });
    }
  }, [editingRoute]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">{editingRoute ? 'Modifier la Route' : 'Ajouter une nouvelle Route'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nom de la Route</Label>
          <div className="col-span-3 w-full">
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full"
             required
          />
  </div>
</div>

          {/* Establishment Selection */}
          {establishments && establishments.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="establishment" className="text-right">Établissement</Label>
              <Select
                onValueChange={(value) => handleSelectChange('establishmentId', value)}
                value={formData.establishmentId ? String(formData.establishmentId) : ''}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un établissement" />
                </SelectTrigger>
                <SelectContent>
                <ScrollArea className="h-[100px]">
                  {establishments.map(est => (
                    <SelectItem key={est.id} value={String(est.id)}>
                      {est.name}
                    </SelectItem>
                  ))}
                  </ScrollArea>
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