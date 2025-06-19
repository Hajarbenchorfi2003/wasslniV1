'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { mockDailyTrips } from "@/app/[lang]/(admin)/admin/daily-trips/data";
import TripsList from "./components/TripsList";
import TripDetails from "./components/TripDetails";
import IncidentDialog from "./components/IncidentDialog";
import AttendanceList from "./components/AttendanceList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DriverTripsPage = () => {
  const [dailyTrips, setDailyTrips] = useState(mockDailyTrips);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  const handleStartTracking = (tripId) => {
    setIsTrackingActive(true);
    // TODO: Implement real GPS tracking
  };

  const handleStopTracking = () => {
    setIsTrackingActive(false);
    // TODO: Stop GPS tracking
  };

  const handleMarkAttendance = (stopId) => {
    setSelectedStop(stopId);
    setIsAttendanceDialogOpen(true);
  };

  const handleReportIncident = () => {
    setIsIncidentDialogOpen(true);
  };

  const handleIncidentSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle incident submission
    setIsIncidentDialogOpen(false);
  };

  const handleAttendanceSubmit = async (attendance) => {
    try {
      // Update the selected trip's attendance records
      setDailyTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.id === selectedTrip.id
            ? {
                ...trip,
                attendance: [
                  ...trip.attendance,
                  ...attendance.map(record => ({
                    id: Date.now() + Math.random(), // Generate unique ID
                    studentId: record.id,
                    studentName: record.name,
                    status: record.status,
                    timestamp: record.timestamp,
                    stopId: selectedStop
                  }))
                ]
              }
            : trip
        )
      );

      // Mettre à jour le statut du trajet si nécessaire
      setDailyTrips(prevTrips =>
        prevTrips.map(trip =>
          trip.id === selectedTrip.id
            ? {
                ...trip,
                status: 'ONGOING'
              }
            : trip
        )
      );

      setIsAttendanceDialogOpen(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      throw error; // Propager l'erreur pour que le composant AttendanceList puisse l'afficher
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Trajets</h1>
        <div className="flex gap-2">
          {selectedTrip && (
            <>
              {isTrackingActive ? (
                <Button
                  variant="destructive"
                  onClick={handleStopTracking}
                >
                  <Icon icon="heroicons:stop-circle" className="h-5 w-5 mr-2" />
                  Arrêter le suivi
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => handleStartTracking(selectedTrip.id)}
                >
                  <Icon icon="heroicons:play-circle" className="h-5 w-5 mr-2" />
                  Démarrer le suivi
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleReportIncident}
              >
                <Icon icon="heroicons:exclamation-circle" className="h-5 w-5 mr-2" />
                Signaler un incident
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TripsList
            trips={dailyTrips}
            selectedTrip={selectedTrip}
            onTripSelect={setSelectedTrip}
          />
        </div>

        <div className="space-y-6">
          {selectedTrip ? (
            <TripDetails
              trip={selectedTrip}
              isTrackingActive={isTrackingActive}
              onStartTracking={handleStartTracking}
              onStopTracking={handleStopTracking}
              onReportIncident={handleReportIncident}
              onMarkAttendance={handleMarkAttendance}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Sélectionnez un trajet pour voir les détails
            </div>
          )}
        </div>
      </div>

      <IncidentDialog
        isOpen={isIncidentDialogOpen}
        onOpenChange={setIsIncidentDialogOpen}
        onSubmit={handleIncidentSubmit}
      />

      <Dialog 
        open={isAttendanceDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            // Réinitialiser l'arrêt sélectionné lors de la fermeture
            setSelectedStop(null);
          }
          setIsAttendanceDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer les présences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <AttendanceList
              students={[
                { id: 1, name: "Étudiant 1" },
                { id: 2, name: "Étudiant 2" },
                { id: 3, name: "Étudiant 3" },
                { id: 4, name: "Étudiant 4" },
                { id: 5, name: "Étudiant 5" }
              ]}
              onSave={handleAttendanceSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverTripsPage; 