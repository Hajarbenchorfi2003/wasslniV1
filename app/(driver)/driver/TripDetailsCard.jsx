// components/driver/TripDetailsCard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from '@iconify/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils'; // Assuming this utility is available

export const TripDetailsCard = ({
  selectedDailyTrip,
  studentsInTrip,
  stopsInRoute,
  onMarkAttendance,
  getAttendanceStatusForStudent, // Function to get attendance status for a student in THIS daily trip
  getAttendanceText, // Function to get display text for attendance status
  getAttendanceColor, // Function to get color for attendance status
  onViewRouteOnMap, // Placeholder for map view
  onReportIncident,
  onGoBack,
}) => {
  if (!selectedDailyTrip) {
    return (
      <Card className="shadow-sm h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          Sélectionnez un trajet quotidien pour voir les détails.
        </CardContent>
      </Card>
    );
  }

  const { trip, displayDate, status } = selectedDailyTrip;
  const { name: tripName, bus, route } = trip || {};

  const getStatusColor = (s) => {
    switch (s) {
      case 'PLANNED': return 'blue';
      case 'ONGOING': return 'yellow';
      case 'COMPLETED': return 'green';
      default: return 'gray';
    }
  };

  const getStatusText = (s) => {
    switch (s) {
      case 'PLANNED': return 'Planifié';
      case 'ONGOING': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  return (
    <Card className="shadow-sm h-full flex flex-col">
     <CardHeader className="pb-4">
  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
    <div>
      <CardTitle className="text-xl font-medium text-default-800 flex items-center gap-2">
        <Button onClick={onGoBack} variant="ghost" size="icon" className="mr-2">
          <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
        </Button>
        Détails du Trajet Quotidien: {tripName || 'N/A'}
      </CardTitle>
      <CardDescription className="mt-1">
        Date: {displayDate}{' '}
        <Badge className={cn("ml-2 capitalize")} color={getStatusColor(status)} variant="soft">
          {getStatusText(status)}
        </Badge>
      </CardDescription>
    </div>

    <div className="flex flex-wrap gap-2 self-end sm:self-auto">
      <Button variant="outline" onClick={onViewRouteOnMap} size="sm">
        <Icon icon="heroicons:map" className="h-4 w-4 mr-2" /> Voir Itinéraire
      </Button>
      <Button
        variant="outline"
        onClick={onReportIncident}
        size="sm"
        className="text-red-500 border-red-500 hover:text-red-600 hover:border-red-600"
      >
        <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4 mr-2" /> Incident
      </Button>
    </div>
  </div>
</CardHeader>

      <CardContent className="flex-grow overflow-y-auto">
        <h3 className="font-semibold text-lg mb-2 text-default-700">Informations Bus & Route</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
          <div>
            <p><strong>Bus:</strong> {bus?.plateNumber || 'N/A'} ({bus?.marque || 'N/A'})</p>
            <p><strong>Capacité:</strong> {bus?.capacity || 'N/A'} places</p>
          </div>
          <div>
            <p><strong>Route:</strong> {route?.name || 'N/A'}</p>
          </div>
        </div>

        <Separator className="my-4" />

        <h3 className="font-semibold text-lg mb-2 text-default-700">Arrêts du Trajet</h3>
        {(stopsInRoute?.length ?? 0) > 0 ? (
          <ol className="list-decimal list-inside space-y-1 mb-6 text-sm text-muted-foreground">
            {stopsInRoute.map(stop => (
              <li key={stop.id}>
                {stop.name} (Lat: {stop.lat}, Lng: {stop.lng})
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">Aucun arrêt défini pour cette route.</p>
        )}

        <Separator className="my-4" />

        <h3 className="font-semibold text-lg mb-2 text-default-700">Élèves Assignés & Présence</h3>
         {(studentsInTrip?.length ?? 0) > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de l&apos;élève</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Quartier</TableHead>
                  <TableHead>Statut Présence</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsInTrip.map(student => {
                  const studentAttendanceStatus = getAttendanceStatusForStudent(student.id);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.fullname}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.quartie}</TableCell>
                      <TableCell>
                        <Badge
                          variant="soft"
                          color={getAttendanceColor(studentAttendanceStatus)}
                          className="capitalize"
                        >
                          {getAttendanceText(studentAttendanceStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMarkAttendance(selectedDailyTrip.id, student.id)}
                          className="text-primary-foreground bg-primary hover:bg-primary/90"
                        >
                          <Icon icon="heroicons:check-circle" className="h-4 w-4 mr-2" /> Marquer
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun élève assigné à ce trajet.</p>
        )}
      </CardContent>
    </Card>
  );
};