// components/DailyTripCard.jsx
import { useState } from 'react';
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

const DailyTripCard = ({ dailyTrip, onEditDailyTrip, onDeleteDailyTrip }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openDeleteModal = () => {
    setModalOpen(true);
  };

  const confirmDelete = () => {
    onDeleteDailyTrip?.(dailyTrip.id);
    setModalOpen(false);
  };

  const cancelDelete = () => {
    setModalOpen(false);
  };

  // Helper to get badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED': return'default';
      case 'ONGOING': return 'info';
      case 'COMPLETED': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between p-4">
          <CardTitle className="text-lg font-semibold flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:calendar-days" className="h-6 w-6 text-orange-600" />
              {dailyTrip.trip?.name ? dailyTrip.trip.name : 'Trajet inconnu'}
            </div>
            <span className="text-sm text-gray-500 font-normal">
              {new Date(dailyTrip.date).toLocaleDateString("fr-FR", {
                year: 'numeric', month: 'long', day:'numeric'
              })}
            </span>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <Icon icon="heroicons:ellipsis-vertical" className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditDailyTrip(dailyTrip)}>
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
            <Icon icon="heroicons:bolt" className="w-4 h-4 opacity-70" />
            Statut: <Badge variant={getStatusColor(dailyTrip.status)}>{dailyTrip.status}</Badge>
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:map" className="w-4 h-4 opacity-70" />
            Route: {dailyTrip.trip?.name ? dailyTrip.trip.name : 'Trajet inconnu'}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:truck" className="w-4 h-4 opacity-70" />
            Bus: {dailyTrip.trip?.bus?.plateNumber || 'Inconnu'}
          </p>
          <p className="flex items-center gap-2">
            <Icon icon="heroicons:user" className="w-4 h-4 opacity-70" />
            Chauffeur:   {dailyTrip.trip?.driver?.fullname ||'Aucun chauffeur'}
          </p>
        </CardContent>
      </Card>

      <ModalSuppression
        isOpen={modalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer le trajet quotidien du ${new Date(dailyTrip.date).toLocaleDateString('fr-FR')} pour "${dailyTrip.tripName}" ? Cela supprimera aussi les présences et positions liées.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </>
  );
};

export default DailyTripCard;