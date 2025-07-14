// components/models/ModalUser.jsx
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Assuming shadcn/ui Dialog components
import { FormUser } from './UserForm'; // Assuming FormUser is in the same directory or adjust path
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ModalUser({ isOpen, onClose, editingUser, onSave, role ,establishments}) {
  const [editdrive, setEditdrive] = useState(false);
  const roleuser = role?.toLowerCase();
  const title = editingUser ? `Modifier ${roleuser}` : `Ajouter un nouveau ${roleuser}`;
  useEffect(() => {
  if (role === "DRIVER" && editingUser) {
    setEditdrive(true);
  } else {
    setEditdrive(false);
  }
}, [role, editingUser]);


 console.log("data in modal",establishments)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" max-w-2xl">
        <DialogHeader  >
          <DialogTitle className="text-base font-medium text-default-700">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
        <FormUser
          initialData={editingUser}
          onSubmit={onSave}
          onCancel={onClose}
          role={role}
          editdrive={editdrive}
          establishments={establishments}
        />
         
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ModalUser; // Export default as used in ResponsablesPage