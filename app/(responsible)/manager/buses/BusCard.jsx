// components/BusCard.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ModalSuppression from '@/components/models/ModalSuppression'; // Assuming you have this modal
import { useState } from 'react';

const BusCard = ({ bus, onEditBus, onDeleteBus }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openDeleteModal = () => {
    setModalOpen(true);
  };

  const confirmDelete = () => {
    onDeleteBus?.(bus.id);
    setModalOpen(false);
  };

  const cancelDelete = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between p-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Icon icon="heroicons:truck" className="h-6 w-6 text-primary" />
            {bus.plateNumber}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <Icon icon="heroicons:ellipsis-vertical" className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditBus(bus)}>
                <Icon icon="heroicons:pencil-square" className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openDeleteModal} className="text-red-600">
                <Icon icon="heroicons:trash" className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 text-sm  text-default-600">
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:user-group" className="w-4 h-4 opacity-70" />
            Capacité: {bus.capacity}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:tag" className="w-4 h-4 opacity-70" />
            Marque: {bus.marque}
          </p>
          {bus.establishmentName && (
            <p className="flex items-center gap-2">
              <Icon icon="heroicons:building-office-2" className="w-4 h-4 opacity-70" />
              Établissement: {bus.establishmentName}
            </p>
          )}
        </CardContent>
      </Card>

      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer le bus ${bus.plateNumber} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default BusCard;