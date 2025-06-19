// components/models/ModalUser.jsx
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Assuming shadcn/ui Dialog components
import { FormUser } from './UserForm'; // Assuming FormUser is in the same directory or adjust path
import { ScrollArea } from "@/components/ui/scroll-area";

export function ModalUser({ isOpen, onClose, editingUser, onSave, role }) {
  const title = editingUser ? "Modifier le responsable" : "Ajouter un nouveau responsable";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" max-w-2xl">
        <DialogHeader  >
          <DialogTitle className="text-base font-medium text-default-700">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh]">
        <FormUser
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

export default ModalUser; // Export default as used in ResponsablesPage