// components/DailyTripsTable.jsx
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
import { Card, CardContent } from "@/components/ui/card"; // Import Card components

export const DailyTripsTable = ({
  dailyTrips,
  currentPage,
  totalPages,
  onPageChange,
  onEditDailyTrip,
  onDeleteDailyTrip,
  selectedTripDetails,
  onSelectTrip,
  getStatusColor,
  getStatusText,
  // Attendance helpers are passed but not used directly in table display
}) => {
  return (
    <Card className="shadow-sm"> {/* Wrapped in Card */}
      <CardContent className="p-0"> {/* Remove padding from CardContent as table has its own */}
        <div className="overflow-x-auto"> {/* Ensures table is scrollable on small screens */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Date</TableHead> {/* Added min-width */}
                <TableHead className="min-w-[180px]">Trajet</TableHead>
                <TableHead className="min-w-[150px]">Bus</TableHead>
                <TableHead className="min-w-[150px]">Chauffeur</TableHead>
                <TableHead className="min-w-[120px]">Statut</TableHead>
                <TableHead className="text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyTrips.length > 0 ? (
                dailyTrips.map((dTrip) => (
                  <TableRow
                    key={dTrip.id}
                    className={cn(
                      selectedTripDetails?.id === dTrip.id ? "bg-muted" : "hover:bg-default-50",
                      "cursor-pointer"
                    )}
                    onClick={() => onSelectTrip(dTrip)}
                  >
                    <TableCell>
                      <div className="font-medium text-default-800">{dTrip.date}</div>
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
                          {dTrip.trip?.bus?.marque || 'N/A'} - {dTrip.trip?.bus?.capacity || 'N/A'} places
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
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 border-none text-blue-500 hover:text-blue-600"
                          onClick={(e) => { e.stopPropagation(); onEditDailyTrip(dTrip); }}
                        >
                          <Icon icon="heroicons:pencil-square" className="h-5 w-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          color="destructive"
                          className="h-7 w-7 border-none hover:text-red-600"
                          onClick={(e) => { e.stopPropagation(); onDeleteDailyTrip(dTrip.id); }}
                        >
                          <Icon icon="heroicons:trash" className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Aucun trajet quotidien trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination Controls - outside the CardContent but inside the Card if desired,
          or as a standalone element for more layout flexibility */}
      {totalPages > 1 && (
        <div className="flex gap-2 items-center mt-4 justify-center p-4"> {/* Added padding */}
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