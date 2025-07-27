// components/manager/StopCard.jsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ModalSuppression from '@/components/models/ModalSuppression'; // Assumed path for delete modal
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge'; // If you want to use badges for any stop status
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const StopCard = ({ stop, onEditStop, onDeleteStop }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openDeleteModal = () => {
    setModalOpen(true);
  };

  const confirmDelete = () => {
    onDeleteStop?.(stop.id);
    setModalOpen(false);
  };

  const cancelDelete = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Icon and Stop Name */}
            <Icon icon="heroicons:map-pin" className="h-8 w-8 text-blue-500 flex-shrink-0" /> {/* Icon for map pin */}
            <div>
              <CardTitle className="text-base font-semibold text-default-900 leading-tight">
                {stop.name || 'Arrêt sans nom'}
              </CardTitle>
              <CardDescription className="text-sm text-default-600 leading-tight mt-0.5">
                Route: {stop.routeName || 'N/A'} (Ordre: {stop.stopOrder || 'N/A'})
              </CardDescription>
            </div>
          </div>

          {/* Dropdown menu for actions (Edit/Delete) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-default-500 hover:text-default-900">
                <span className="sr-only">Ouvrir le menu</span>
                <Icon icon="heroicons:ellipsis-vertical" className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditStop(stop)} className="cursor-pointer">
                <Icon icon="heroicons:pencil-square" className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openDeleteModal} className="text-red-600 cursor-pointer">
                <Icon icon="heroicons:trash" className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-4 pt-4 space-y-2 text-sm">
          {/* Stop Details */}
          <p className="flex items-center gap-2 text-default-700">
            <Icon icon="heroicons:globe-alt" className="w-4 h-4 text-default-500" />
            Latitude: {stop.lat ||'N/A'}
          </p>
          <p className="flex items-center gap-2 text-default-700">
            <Icon icon="heroicons:globe-alt" className="w-4 h-4 text-default-500" />
            Longitude: {stop.lng || 'N/A'}
          </p>
          {/* Add more relevant stop details if available, e.g., associated students, estimated times */}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer l'arrêt "${stop.name}" ? Cette action est irréversible et pourrait affecter les routes et trajets.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default StopCard;