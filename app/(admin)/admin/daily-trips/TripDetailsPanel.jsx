// components/TripDetailsPanel.jsx
import React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components

// Import Map component dynamically
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse" />
});

export const TripDetailsPanel = ({
  selectedTripDetails,
  getAttendanceStatusColor,
  getAttendanceStatusText,
  getAttendanceTypeText,
}) => {
  if (!selectedTripDetails) {
    return (
      <Card className="flex h-full min-h-[400px] items-center justify-center text-muted-foreground shadow-sm">
        <CardContent className="p-6 text-center">
          Sélectionnez un trajet pour voir les détails (carte, présences, incidents).
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-default-900">Carte du Trajet</CardTitle>
        </CardHeader>
        <CardContent>
          <Map
            stops={selectedTripDetails.trip?.route?.stops || []}
            positions={selectedTripDetails.positions || []}
            height={400}
          />
        </CardContent>
      </Card>

      {/* Attendance Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-default-900">Détails des Présences</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTripDetails.attendance.length > 0 ? (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {selectedTripDetails.attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <div className="font-medium text-default-800">{record.student?.fullname || `Étudiant #${record.studentId}`}</div>
                    <div className="text-sm text-muted-foreground">
                      {getAttendanceTypeText(record.type)} - {new Date(record.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    color={getAttendanceStatusColor(record.status)}
                    className="capitalize"
                  >
                    {getAttendanceStatusText(record.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune donnée de présence pour ce trajet.</p>
          )}
        </CardContent>
      </Card>

      {/* Incidents Card */}
      {selectedTripDetails.incidents.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-default-900">Incidents Signalés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-40 overflow-y-auto">
              {selectedTripDetails.incidents.map((incident) => (
                <div key={incident.id} className="space-y-2 border-b pb-2 last:border-b-0 last:pb-0">
                  <div className="font-medium text-default-800">{incident.description}</div>
                  <div className="text-sm text-muted-foreground">
                    Signalé par {incident.reportedBy?.fullname || `Utilisateur #${incident.reportedById}`} à {new Date(incident.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};