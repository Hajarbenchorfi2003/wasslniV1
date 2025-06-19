// components/TripCard.jsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ModalSuppression from '@/components/models/ModalSuppression';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TripCard = ({ trip, onEditTrip, onDeleteTrip }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openDeleteModal = () => {
    setModalOpen(true);
  };

  const confirmDelete = () => {
    onDeleteTrip?.(trip.id);
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
            <Icon icon="heroicons:map-pin" className="h-6 w-6 text-purple-600" />
            {trip.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <Icon icon="heroicons:ellipsis-vertical" className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditTrip(trip)}>
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
            <Icon icon="heroicons:globe-americas" className="w-4 h-4 opacity-70" />
            Route: {trip.routeName}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:truck" className="w-4 h-4 opacity-70" />
            Bus: {trip.busPlate}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:user" className="w-4 h-4 opacity-70" />
            Chauffeur: {trip.driverName}
          </p>
          {trip.establishmentName && (
            <p className="flex items-center gap-2">
              <Icon icon="heroicons:building-office-2" className="w-4 h-4 opacity-70" />
              Établissement: {trip.establishmentName}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:users" className="w-4 h-4 opacity-70" />
            Élèves: {trip.studentCount}
          </p>
        </CardContent>
      </Card>

      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer le trajet "${trip.name}" ? Cela supprimera aussi les trajets quotidiens, présences et positions liés.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default TripCard;