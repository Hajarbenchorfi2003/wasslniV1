// components/ParentCard.jsx
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

const ParentCard = ({ parent, onEditParent, onDeleteParent }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openDeleteModal = () => {
    setModalOpen(true);
  };

  const confirmDelete = () => {
    onDeleteParent?.(parent.id);
    setModalOpen(false);
  };

  const cancelDelete = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex-none w-12 h-12 rounded-full">
              <div className="relative inline-block">
                <Avatar>
                  <AvatarFallback>
                    {parent.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge color={parent.isActive ? 'success' : 'destructive'} className="h-2 w-2 p-0 items-center justify-center absolute left-[calc(100%-8px)] bottom-[calc(100%-8px)]">
                </Badge>
              </div>
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-default-900 leading-tight">
                {parent.fullname}
              </CardTitle>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <Icon icon="heroicons:ellipsis-vertical" className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditParent(parent)}>
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
            <Icon icon="heroicons:envelope" className="w-4 h-4 opacity-70" />
            {parent.email}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:phone" className="w-4 h-4 opacity-70" />
            {parent.phone}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:identification" className="w-4 h-4 opacity-70" />
            {parent.cin}
          </p>
        </CardContent>
      </Card>
      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer le parent ${parent.fullname} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default ParentCard;