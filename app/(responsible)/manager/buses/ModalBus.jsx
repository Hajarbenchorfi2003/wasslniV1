// app/(responsible)/manager/buses/ModalBus.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchUserEstablishments } from '@/services/etablissements';
import toast from 'react-hot-toast';
import { ScrollArea } from "@/components/ui/scroll-area";

export const ModalBus = ({
  isOpen,
  onClose,
  editingBus,
  onSave,
  availableDrivers = [],
}) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    capacity: '',
    marque: '',
    driverId: '',
    establishmentId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userEstablishments, setUserEstablishments] = useState([]);

  // Fetch establishments when modal opens
  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        const establishments = await fetchUserEstablishments();
        setUserEstablishments(establishments);
        
        // Set default establishment if editing or if new bus
        if (editingBus) {
          setFormData(prev => ({
            ...prev,
            establishmentId: String(editingBus.establishment?.id || '')
          }));
        } else if (establishments.length) {
          setFormData(prev => ({
            ...prev,
            establishmentId: String(establishments[0].id)
          }));
        }
      } catch (error) {
        console.error('Error fetching establishments:', error);
        toast.error('Erreur lors du chargement des établissements');
      }
    };
    
    if (isOpen) fetchEstablishments();
  }, [isOpen, editingBus]);

  // Initialize form with editingBus data if provided
  useEffect(() => {
    if (editingBus) {
      setFormData({
        plateNumber: editingBus.plateNumber || '',
        capacity: editingBus.capacity?.toString() || '',
        marque: editingBus.marque || '',
        driverId: editingBus.driverId || '',
        establishmentId: String(editingBus.establishment?.id || '')
      });
    } else {
      setFormData({
        plateNumber: '',
        capacity: '',
        marque: '',
        driverId: '',
        establishmentId: userEstablishments[0] ? String(userEstablishments[0].id) : ''
      });
    }
  }, [editingBus, userEstablishments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.establishmentId) {
      toast.error("Veuillez sélectionner un établissement");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        plateNumber: formData.plateNumber,
        capacity: parseInt(formData.capacity),
        marque: formData.marque,
        driverId: formData.driverId || null,
        establishmentId: parseInt(formData.establishmentId)
      });
      onClose();
    } catch (error) {
      console.error('Error saving bus:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {editingBus ? 'Modifier le bus' : 'Ajouter un nouveau bus'}
          </DialogTitle>
          <DialogDescription>
            {editingBus
              ? 'Modifiez les détails du bus ci-dessous'
              : 'Remplissez les détails du nouveau bus ci-dessous'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="plateNumber">Numéro de plaque</Label>
              <Input
                id="plateNumber"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                required
                placeholder="ABC-1234"
              />
            </div>

            <div>
              <Label htmlFor="capacity">Capacité</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                placeholder="50"
              />
            </div>

            <div>
              <Label htmlFor="marque">Marque</Label>
              <Input
                id="marque"
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                required
                placeholder="Mercedes"
              />
            </div>

            <div>
              <Label>Établissement</Label>
              <Select
                value={formData.establishmentId}
                onValueChange={(value) => handleSelectChange('establishmentId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un établissement" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea>
                    {userEstablishments.map(est => (
                      <SelectItem key={est.id} value={String(est.id)}>
                        {est.name}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Icon icon="heroicons:arrow-path" className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Icon icon="heroicons:check" className="h-4 w-4 mr-2" />
                )}
                {editingBus ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModalBus;