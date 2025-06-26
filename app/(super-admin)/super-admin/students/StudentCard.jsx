// components/StudentCard.jsx
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

const StudentCard = ({ student, onEditStudent, onDeleteStudent }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openDeleteModal = () => {
    setModalOpen(true);
  };

  const confirmDelete = () => {
    onDeleteStudent?.(student.id);
    setModalOpen(false);
  };

  const cancelDelete = () => {
    setModalOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
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
                    {getInitials(student.fullname)}
                  </AvatarFallback>
                </Avatar>
                {/* Students are "active" if not deleted */}
                <Badge color={!student.deletedAt ? 'success' : 'destructive'} className="h-2 w-2 p-0 items-center justify-center absolute left-[calc(100%-8px)] bottom-[calc(100%-8px)]">
                </Badge>
              </div>
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-default-900 leading-tight">
                {student.fullname}
              </CardTitle>
              <h5 className="text-sm text-default-600 leading-tight">
                {student.class} - {student.establishment.name || 'Non attribué'}
              </h5>
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
              <DropdownMenuItem onClick={() => onEditStudent(student)}>
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
            <Icon icon="heroicons:cake" className="w-4 h-4 opacity-70" />
            Naissance: {new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon={student.gender === 'MALE' ? 'heroicons:user' : 'heroicons:user-group'} className="w-4 h-4 opacity-70" />
            Genre: {student.gender === 'MALE' ? 'Masculin' : 'Féminin'}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:map-pin" className="w-4 h-4 opacity-70" />
            Quartier: {student.quartie} ({student.address})
          </p>
          {student.parentLinks?.length > 0 ? (
  <p className="flex items-center gap-2">
    <Icon icon="heroicons:users" className="w-4 h-4 opacity-70" />
    Parents :{' '}
    {student.parentLinks.map((link) => link.parent.fullname).join(', ')}
  </p>
) : (
  <p className="flex items-center gap-2 text-gray-500">
    <Icon icon="heroicons:users" className="w-4 h-4 opacity-70" />
    Aucun parent associé
  </p>
)}
        </CardContent>
      </Card>
      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer l'élève ${student.fullname} ? Cela le marquera comme inactif et le désassociera des parents et trajets.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default StudentCard;