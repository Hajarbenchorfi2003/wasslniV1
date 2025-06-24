// components/models/ModalUser.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormUserRes } from './formResponsable'; // Assurez-vous que le chemin est correct
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchSchools } from '@/services/school'; // Service pour récupérer les écoles
import toast from 'react-hot-toast'; // Import react-hot-toast

export function ModalUser1({ isOpen, onClose, editingUser, onSave, role }) {
  const [schoolsList, setSchoolsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSchools() {
      setLoading(true);
      try {
        const data = await fetchSchools();
        setSchoolsList(data);
      } catch (error) {
        toast.error('Erreur lors du chargement des écoles');
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      loadSchools();
    }
  }, [isOpen]);

  const title = editingUser ? "Modifier le responsable" : "Ajouter un nouveau responsable";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] px-1">
          <FormUserRes
            initialData={editingUser}
            onSubmit={onSave}
            onCancel={onClose}
            role={role}
            schools={schoolsList}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ModalUser1;