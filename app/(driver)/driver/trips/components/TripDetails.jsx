'use client';

import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';

// Import Map component dynamically to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse" />
});

const TripDetails = ({
  trip,
  isTrackingActive,
  onStartTracking,
  onStopTracking,
  onReportIncident,
  onMarkAttendance
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Carte du trajet</h2>
        <Map
          stops={trip.trip.route.stops}
          positions={trip.positions}
          height={400}
        />
      </div>

      <Tabs defaultValue="stops">
        <TabsList>
          <TabsTrigger value="stops">Arrêts</TabsTrigger>
          <TabsTrigger value="students">Étudiants</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="stops" className="space-y-4">
          {trip.trip.route.stops.map((stop, index) => (
            <div key={stop.id} className="bg-card rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{stop.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Ordre: {stop.stopOrder}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => onMarkAttendance(stop.id)}
                >
                  <Icon icon="heroicons:clipboard-document-check" className="h-5 w-5 mr-2" />
                  Marquer les présences
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {trip.attendance.map((record) => (
            <div key={record.id} className="bg-card rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Étudiant #{record.studentId}</h3>
                  <p className="text-sm text-muted-foreground">
                    {record.timestamp}
                  </p>
                </div>
                <Badge
                  variant="soft"
                  color={record.status === 'PRESENT' ? 'success' : 'destructive'}
                  className="capitalize"
                >
                  {record.status === 'PRESENT' ? 'Présent' : 'Absent'}
                </Badge>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          {trip.incidents.map((incident) => (
            <div key={incident.id} className="bg-card rounded-lg p-4">
              <div className="space-y-2">
                <h3 className="font-semibold">{incident.description}</h3>
                <p className="text-sm text-muted-foreground">
                  Signalé par {incident.reportedBy.name} à {incident.timestamp}
                </p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TripDetails; 