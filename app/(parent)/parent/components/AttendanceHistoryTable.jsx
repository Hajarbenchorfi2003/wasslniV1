// components/parent/AttendanceHistoryTable.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const AttendanceHistoryTable = ({ student, attendanceHistory }) => {
  // Determine if we are showing a consolidated view ("Tous les enfants")
  const isConsolidatedView = student?.fullname === "Tous les enfants";

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'green';
      case 'ABSENT': return 'red';
      case 'LATE': return 'yellow';
      default: return 'gray';
    }
  };

  const getAttendanceText = (status) => {
    switch (status) {
      case 'PRESENT': return 'Présent';
      case 'ABSENT': return 'Absent';
      case 'LATE': return 'En Retard';
      default: return 'Non marqué';
    }
  };

  // Calculate colspan dynamically based on whether "Enfant" column is present
  const colSpanValue = isConsolidatedView ? 5 : 4; // 5 columns if 'Enfant' is shown, 4 otherwise

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium text-default-800">
          Historique de Présence {student?.fullname && student.fullname !== "Tous les enfants" ? `de ${student.fullname}` : "des Enfants"}
        </CardTitle>
        <CardDescription>Consultez les enregistrements de présence passés.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-[calc(100%-0px)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Conditionally render 'Enfant' TableHead */}
                  {isConsolidatedView && (
                    <TableHead className="min-w-[120px]">Enfant</TableHead>
                  )}
                  <TableHead className="min-w-[120px]">Date du Trajet</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[100px]">Statut</TableHead>
                  <TableHead className="min-w-[140px]">Heure de Marquage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map(record => (
                    <TableRow key={record.id}>
                      {/* Conditionally render 'Enfant' TableCell */}
                      {isConsolidatedView && (
                        <TableCell className="font-medium text-default-800">{record.childName || 'N/A'}</TableCell>
                      )}
                      <TableCell>{record.dailyTripDate}</TableCell>
                      <TableCell className="capitalize">{record.type === 'DEPART' ? 'Départ' : 'Retour'}</TableCell>
                      <TableCell>
                        <Badge variant="soft" color={getAttendanceColor(record.status)} className="capitalize">
                          {getAttendanceText(record.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.timestampFormatted}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    {/* Use the dynamically calculated colSpanValue */}
                    <TableCell colSpan={colSpanValue} className="h-24 text-center text-muted-foreground">
                      Aucun historique de présence trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};