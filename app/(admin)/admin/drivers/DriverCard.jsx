// components/DriverCard.jsx
import { useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ModalSuppression from '@/components/models/ModalSuppression';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DriverCard = ({ driver, onEditDriver, onDeleteDriver }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openDeleteModal = () => {
    setModalOpen(true);
  };

  const confirmDelete = () => {
    onDeleteDriver?.(driver.id); // Call delete handler with the driver's ID
    setModalOpen(false);
  };

  const cancelDelete = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between p-4">
          {/* Group avatar, name, and associated info together */}
          <div className="flex items-center gap-2.5">
            <div className="flex-none w-12 h-12 rounded-full">
              <div className="relative inline-block">
                <Avatar>
                  <AvatarFallback>
                    {/* Generates initials from fullname */}
                    {driver.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Status badge for active/inactive */}
                <Badge color={driver.isActive ? 'success' : 'destructive'} className="h-2 w-2 p-0 items-center justify-center absolute left-[calc(100%-8px)] bottom-[calc(100%-8px)]">
                </Badge>
              </div>
            </div>
            <div>
              {/* Main title for the card, using the driver's full name */}
              <CardTitle className="text-base font-semibold text-default-900 leading-tight">
                {driver.fullname}
              </CardTitle>
              {/* Sub-info for associated establishment(s) - adapted for drivers */}
              <h5 className="text-sm text-default-600 leading-tight">
                {driver.establishmentNames || 'Aucun établissement attribué'}
              </h5>
            </div>
          </div>

          {/* Dropdown menu for actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <Icon icon="heroicons:ellipsis-vertical" className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditDriver(driver)}>
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

        <CardContent className="p-4 pt-0 space-y-2">
          <p className="flex items-center gap-2 text-sm  text-default-600">
            <Icon icon="heroicons:envelope" className="w-4 h-4 opacity-70" />
            {driver.email}
          </p>
          <p className="flex items-center gap-2 text-sm  text-default-600">
            <Icon icon="heroicons:phone" className="w-4 h-4 opacity-70" />
            {driver.phone}
          </p>
          <p className="flex items-center gap-2 text-sm  text-default-600">
            <Icon icon="heroicons:identification" className="w-4 h-4 opacity-70" />
            {driver.cin}
          </p>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer le driver ${driver.fullname} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default DriverCard;