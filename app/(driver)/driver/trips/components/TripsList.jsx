'use client';

import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const TripsList = ({ trips, selectedTrip, onTripSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED':
        return 'default';
      case 'ONGOING':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PLANNED':
        return 'Planifié';
      case 'ONGOING':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminé';
      default:
        return status;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Trajet</TableHead>
          <TableHead>Bus</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trips.map((trip) => (
          <TableRow 
            key={trip.id}
            className={selectedTrip?.id === trip.id ? "bg-muted" : ""}
            onClick={() => onTripSelect(trip)}
          >
            <TableCell>
              <div className="font-medium">{trip.date}</div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{trip.trip.name}</div>
                <div className="text-sm text-muted-foreground">
                  {trip.trip.route.name}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{trip.trip.bus.plateNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {trip.trip.bus.marque} - {trip.trip.bus.capacity} places
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="soft"
                color={getStatusColor(trip.status)}
                className="capitalize"
              >
                {getStatusText(trip.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 border-none"
                onClick={() => onTripSelect(trip)}
              >
                <Icon icon="heroicons:eye" className="h-5 w-5" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TripsList; 