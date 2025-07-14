'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import EditSchoolForm from './EditSchoolForm';

export default function EditSchoolModal({ isOpen, setIsOpen, editingSchool, onSave }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !editingSchool || !editingSchool.school) {
    return null;
  }

  const getInitialDefaultValues = () => ({
    school: {
      id: editingSchool.id,
      name: editingSchool.school.name || '',
      email: editingSchool.school.email || '',
      phone: editingSchool.school.phone || '',
      address: editingSchool.school.address || '',
      city: editingSchool.school.city || '',
      isActive: editingSchool.school.isActive !== undefined 
        ? editingSchool.school.isActive 
        : true,
    }
  });

  const currentDefaultValues = getInitialDefaultValues();

  const handleSave = async (formData) => {
    setLoading(true);
    try {
      // Appel API pour mettre à jour l'école
      await updateSchool(editingSchool.id, formData.school);

      // Formatage des nouvelles données
      const updatedSchool = {
        id: editingSchool.id,
        ...editingSchool.school,
        ...formData.school,
      };

      toast.success('École mise à jour avec succès');
      onSave(updatedSchool); // Met à jour l'UI
      setIsOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent modal={false} className="p-0 max-w-2xl" size="2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-base font-medium text-default-700">
            Modifier l’école
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] px-6">
          <EditSchoolForm
            defaultValues={currentDefaultValues}
            onSubmit={handleSave}
            loading={loading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}