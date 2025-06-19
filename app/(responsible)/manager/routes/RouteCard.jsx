// components/manager/RouteCard.jsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ModalSuppression from '@/components/models/ModalSuppression'; // Assumed path for delete modal
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge'; // If needed for route status
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const RouteCard = ({ route, onEditRoute, onDeleteRoute }) => {
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
      <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Icon and Route Name */}
            <Icon icon="heroicons:map" className="h-8 w-8 text-indigo-500 flex-shrink-0" /> {/* Icon for route */}
            <div>
              <CardTitle className="text-base font-semibold text-default-900 leading-tight">
                {route.name || 'Route sans nom'}
              </CardTitle>
              <CardDescription className="text-sm text-default-600 leading-tight mt-0.5">
                Établissement ID: {route.establishmentId}
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
              <DropdownMenuItem onClick={() => onEditRoute(route)} className="cursor-pointer">
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
          {/* Route Details */}
          <p className="flex items-center gap-2 text-default-700">
            <Icon icon="heroicons:map-pin" className="w-4 h-4 text-default-500" />
            Nombre d'arrêts: {route.stopCount || '0'} {/* Will be enriched */}
          </p>
          <p className="flex items-center gap-2 text-default-700">
            <Icon icon="heroicons:arrows-right-left" className="w-4 h-4 text-default-500" />
            Nombre de trajets: {route.tripCount || '0'} {/* Will be enriched */}
          </p>
          {/* Add more relevant route details if available */}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer la route "${route.name}" ? Cette action est irréversible et affectera les arrêts et trajets associés.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default RouteCard;