// components/StudentCard.jsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleDelete = () => {
    if (!student?.id) {
      console.error('Impossible de supprimer : ID de l&apos;étudiant manquant');
      return;
    }
    onDeleteStudent(student.id);
  };

  return (
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
              {/* Statut actif/inactif */}
              <Badge 
                color={!student.deletedAt ? 'success' : 'destructive'} 
                className="h-2 w-2 p-0 absolute left-[calc(100%-8px)] bottom-[calc(100%-8px)]"
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-default-900 leading-tight">
              {student.fullname}
            </CardTitle>
            <h5 className="text-sm text-default-600 leading-tight">
              {student.class}
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
            <DropdownMenuItem 
              onClick={handleDelete} 
              className="text-red-600 cursor-pointer"
            >
              <Icon icon="heroicons:trash" className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-2 text-sm text-default-600">
        <p className="flex items-center gap-2">
          <Icon icon="heroicons:cake" className="w-4 h-4 opacity-70" />
          Naissance: {new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}
        </p>
        <p className="flex items-center gap-2">
          <Icon 
            icon={student.gender === 'MALE' ? 'heroicons:user' : 'heroicons:user-group'} 
            className="w-4 h-4 opacity-70" 
          />
          Genre: {student.gender === 'MALE' ? 'Masculin' : 'Féminin'}
        </p>
        <p className="flex items-center gap-2">
          <Icon icon="heroicons:map-pin" className="w-4 h-4 opacity-70" />
          Quartier: {student.quartie} ({student.address})
        </p>
        {student.parentNames && (
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:users" className="w-4 h-4 opacity-70" />
            Parents: {student.parentNames}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCard;