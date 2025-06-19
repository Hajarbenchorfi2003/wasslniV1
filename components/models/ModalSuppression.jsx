'use client';

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // adapte le chemin

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Make sure Input is available

const ModalSuppression = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  description = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
  confirmText = "Supprimer",
  cancelText = "Annuler",
  loading = false,
  confirmKeyword = "supprimer", // You can change to "delete" if you prefer
}) => {
  const [inputValue, setInputValue] = useState("");

  // Clear input when modal is closed
  useEffect(() => {
    if (!isOpen) setInputValue("");
  }, [isOpen]);

  const isConfirmed = inputValue.trim().toLowerCase() === confirmKeyword.toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-default-500 space-y-4">
          <p>{description}</p>
          <div>
            <p className="mb-2">
              Pour confirmer, tapez <strong>{confirmKeyword}</strong> :
            </p>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Tapez "${confirmKeyword}"`}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="mt-8">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            color="destructive"
            onClick={onConfirm}
            disabled={!isConfirmed || loading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSuppression;
