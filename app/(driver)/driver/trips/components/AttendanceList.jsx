'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

const AttendanceList = ({ students, onSave }) => {
  const [attendance, setAttendance] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize attendance state when students prop changes
  useEffect(() => {
    setAttendance(
      students.map(student => ({
        ...student,
        status: 'PRESENT', // Default status
        timestamp: new Date().toISOString()
      }))
    );
  }, [students]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prevAttendance => 
      prevAttendance.map(student => 
        student.id === studentId 
          ? { 
              ...student, 
              status,
              timestamp: new Date().toISOString()
            } 
          : student
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Vérifier si tous les étudiants ont un statut
      const hasUnmarkedStudents = attendance.some(student => !student.status);
      if (hasUnmarkedStudents) {
        toast.error("Veuillez marquer le statut de tous les étudiants");
        return;
      }

      // Préparer les données à sauvegarder
      const validAttendance = attendance.map(record => ({
        id: record.id,
        name: record.name,
        status: record.status,
        timestamp: record.timestamp
      }));

      // Sauvegarder les données
      await onSave(validAttendance);
      toast.success("Présences enregistrées avec succès");
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error("Erreur lors de l'enregistrement des présences");
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonVariant = (studentStatus, buttonStatus) => {
    if (studentStatus === buttonStatus) {
      switch (buttonStatus) {
        case 'PRESENT':
          return 'default';
        case 'ABSENT':
          return 'destructive';
        case 'LATE':
          return 'warning';
        default:
          return 'outline';
      }
    }
    return 'outline';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'ABSENT':
        return 'destructive';
      case 'LATE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'Présent';
      case 'ABSENT':
        return 'Absent';
      case 'LATE':
        return 'En retard';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {attendance.map((student) => (
          <div key={student.id} className="bg-card rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{student.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {student.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={getButtonVariant(student.status, 'PRESENT')}
                  onClick={() => handleStatusChange(student.id, 'PRESENT')}
                  type="button"
                  className="min-w-[100px]"
                >
                  <Icon icon="heroicons:check-circle" className="h-4 w-4 mr-2" />
                  Présent
                </Button>
                <Button
                  size="sm"
                  variant={getButtonVariant(student.status, 'ABSENT')}
                  onClick={() => handleStatusChange(student.id, 'ABSENT')}
                  type="button"
                  className="min-w-[100px]"
                >
                  <Icon icon="heroicons:x-circle" className="h-4 w-4 mr-2" />
                  Absent
                </Button>
                <Button
                  size="sm"
                  variant={getButtonVariant(student.status, 'LATE')}
                  onClick={() => handleStatusChange(student.id, 'LATE')}
                  type="button"
                  className="min-w-[100px]"
                >
                  <Icon icon="heroicons:clock" className="h-4 w-4 mr-2" />
                  En retard
                </Button>
              </div>
            </div>
            {student.timestamp && (
              <p className="text-xs text-muted-foreground mt-2">
                Dernière mise à jour: {new Date(student.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        ))}
      </div>

      <Button 
        onClick={handleSave} 
        className="w-full"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
            Enregistrement...
          </>
        ) : (
          'Enregistrer les présences'
        )}
      </Button>
    </div>
  );
};

export default AttendanceList; 