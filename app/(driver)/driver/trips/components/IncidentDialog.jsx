'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const IncidentDialog = ({ isOpen, onOpenChange, onSubmit }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler un incident</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type d&apos;incident</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="TECHNICAL">Problème technique</option>
                <option value="STUDENT">Problème avec un étudiant</option>
                <option value="ROAD">Problème routier</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Photo (optionnel)</label>
              <input
                type="file"
                accept="image/*"
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Envoyer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDialog; 