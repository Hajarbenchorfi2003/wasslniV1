// components/RouteCard.jsx
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

const RouteCard = ({ route, onEditRoute, onDeleteRoute }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openDeleteModal = () => {
    setModalOpen(true);
  };

  const confirmDelete = () => {
    onDeleteRoute?.(route.id);
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
            <Icon icon="heroicons:map" className="h-6 w-6 text-green-600" />
            {route.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <Icon icon="heroicons:ellipsis-vertical" className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditRoute(route)}>
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
          {route.establishment && (
          <p className="flex items-center gap-2">
          <Icon icon="heroicons:building-office-2" className="w-4 h-4 opacity-70" />
             Établissement : {route.establishment.name}
          </p>
          )}
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:map-pin" className="w-4 h-4 opacity-70" />
            Nombre d'arrêts: {route.stops ? route.stops.length : 0}
          </p>
        </CardContent>
      </Card>

      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer la route "${route.name}" ? Cela supprimera aussi ses arrêts et les trajets associés à cette route.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default RouteCard;