// components/models/ModalUser.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormUserRes } from './formResponsableAd'; // Assurez-vous que le chemin est correct
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchSchools } from '@/services/school'; // Service pour récupérer les écoles
import toast from 'react-hot-toast'; // Import react-hot-toast

export function ModalUser1({ isOpen, onClose, editingUser, onSave, role }) {
  


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
            
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ModalUser1;