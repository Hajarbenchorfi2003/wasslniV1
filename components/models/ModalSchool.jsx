// components/ModalSchool.jsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import FormAdmin from "./FormAdmin";
import { ScrollArea } from "@/components/ui/scroll-area";

const ModalSchool = ({
  isOpen,
  setIsOpen,
  onSave,
  editingSchool,
  schools,
}) => {
  console.log(editingSchool)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-base font-medium text-default-700">
            {editingSchool ? "Modifier l'école" : "Ajouter une école"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] px-6">


        <FormAdmin
          onSubmit={onSave}
          editingSchool={editingSchool}
          schools={schools}
        />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSchool;
