// components/driver/AssignedTripsList.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AssignedTripsList = ({
  dailyTrips,
  onSelectDailyTrip,      // This prop can now be optional or used differently
  selectedDailyTripId,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,          // This prop is used for the "details" button
}) => {

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED': return 'blue';
      case 'ONGOING': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELED': return 'red'; // Added CANCELED
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PLANNED': return 'Planifié';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELED': return 'Annulé'; // Added CANCELED
      default: return 'Inconnu';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-default-800">Trajets Assignés</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Date & Heure</TableHead>
                <TableHead className="min-w-[180px]">Trajet Principal</TableHead>
                <TableHead className="min-w-[150px]">Bus</TableHead>
                <TableHead className="min-w-[150px]">Chauffeur</TableHead>
                <TableHead className="min-w-[120px]">Statut</TableHead>
                <TableHead className="text-right min-w-[80px]">Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyTrips.length > 0 ? (
                dailyTrips.map((dTrip) => (
                  <TableRow
                    key={dTrip.id}
                    className={cn(
                      selectedDailyTripId === dTrip.id ? "bg-muted" : "hover:bg-default-50",
                      "cursor-pointer"
                    )}
                    // CORRECTED LINE: Make row click conditional on onSelectDailyTrip being provided
                    onClick={onSelectDailyTrip ? () => onSelectDailyTrip(dTrip) : undefined}
                  >
                    <TableCell>
                      <div className="font-medium text-default-800">{dTrip.displayDate}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-default-800">{dTrip.trip?.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {dTrip.trip?.route?.name || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-default-800">{dTrip.trip?.bus?.plateNumber || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {dTrip.trip?.bus?.marque || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-default-800">{dTrip.trip?.driver?.fullname || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {dTrip.trip?.driver?.phone || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="soft"
                        color={getStatusColor(dTrip.status)}
                        className="capitalize"
                      >
                        {getStatusText(dTrip.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* CORRECTED LINE: Make button click conditional on onViewDetails being provided */}
                      {onViewDetails && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none text-blue-500 hover:text-blue-600"
                          onClick={(e) => { e.stopPropagation(); onViewDetails(dTrip); }}
                        >
                          <Icon icon="heroicons:arrow-right" className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Aucun trajet assigné trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {totalPages > 1 && (
        <div className="flex gap-2 items-center justify-center p-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={`page-${page}`}
              onClick={() => onPageChange(page)}
              variant={page === currentPage ? "default" : "outline"}
              className={cn("w-8 h-8", page === currentPage ? "bg-primary text-primary-foreground" : "text-default-700")}
            >
              {page}
            </Button>
          ))}

          <Button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
          </Button>
        </div>
      )}
    </Card>
  );
};