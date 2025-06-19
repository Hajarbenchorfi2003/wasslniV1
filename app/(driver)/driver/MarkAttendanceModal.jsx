// components/driver/MarkAttendanceModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { saveAttendance, getUserById } from '@/data/data';
import { Icon } from '@iconify/react';

export const MarkAttendanceModal = ({
  isOpen,
  setIsOpen,
  dailyTripId,
  studentId,
  currentStatus,
  onAttendanceMarked,
  driverId,
  initialDemoData,
}) => {
  const [status, setStatus] = useState(currentStatus || 'ABSENT');
  const [studentName, setStudentName] = useState('Chargement...');
  const [student, setStudent] = useState(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStatus(currentStatus || 'ABSENT');
    setNote('');
    setIsSubmitting(false);

    if (studentId && initialDemoData) {
      const studentData = initialDemoData.students.find(s => s.id === studentId);
      setStudent(studentData);
      setStudentName(studentData ? studentData.fullname : 'Élève Inconnu');
    }
  }, [isOpen, studentId, currentStatus, initialDemoData]);

  const handleSaveAttendance = async () => {
    if (!status) {
      toast.error("Veuillez sélectionner un statut de présence.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = saveAttendance({
        dailyTripId: dailyTripId,
        studentId: studentId,
        type: 'DEPART',
        status: status,
        markedById: driverId,
        note: note.trim() || null,
      });

      if (result) {
        toast.success(`Présence de ${studentName} marquée comme '${getStatusText(status)}'`);
        onAttendanceMarked(dailyTripId, studentId, status);
      setIsOpen(false);
      } else {
        toast.error("Impossible d'enregistrer la présence. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la présence:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement de la présence.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PRESENT': return 'Présent';
      case 'ABSENT': return 'Absent';
      case 'LATE': return 'En Retard';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600';
      case 'ABSENT': return 'text-red-600';
      case 'LATE': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT': return 'heroicons:check-circle';
      case 'ABSENT': return 'heroicons:x-circle';
      case 'LATE': return 'heroicons:clock';
      default: return 'heroicons:question-mark-circle';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            Marquer la présence
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le statut de présence pour cet élève.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Student Info */}
          {student && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">{student.fullname.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{student.fullname}</p>
                <p className="text-sm text-muted-foreground">
                  Classe: {student.class} | Quartier: {student.quartie}
                </p>
              </div>
            </div>
          )}

          {/* Status Selection */}
          <div className="space-y-3">
            <Label className="font-medium">Statut de présence *</Label>
            <RadioGroup 
              value={status} 
              onValueChange={setStatus} 
              className="grid grid-cols-3 gap-3"
              disabled={isSubmitting}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="PRESENT" id="present" />
                <Label htmlFor="present" className="flex items-center gap-2 cursor-pointer">
                  <Icon icon="heroicons:check-circle" className="h-5 w-5 text-green-600" />
                  Présent
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="ABSENT" id="absent" />
                <Label htmlFor="absent" className="flex items-center gap-2 cursor-pointer">
                  <Icon icon="heroicons:x-circle" className="h-5 w-5 text-red-600" />
                  Absent
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="LATE" id="late" />
                <Label htmlFor="late" className="flex items-center gap-2 cursor-pointer">
                  <Icon icon="heroicons:clock" className="h-5 w-5 text-yellow-600" />
                  En Retard
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="font-medium">
              Note (Optionnel)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Élève malade, retard justifié, comportement..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Label className="font-medium">Actions rapides</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus('PRESENT');
                  setNote('');
                }}
                disabled={isSubmitting}
              >
                <Icon icon="heroicons:check-circle" className="h-4 w-4 mr-2" />
                Présent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus('ABSENT');
                  setNote('Absence non justifiée');
                }}
                disabled={isSubmitting}
              >
                <Icon icon="heroicons:x-circle" className="h-4 w-4 mr-2" />
                Absent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus('LATE');
                  setNote('Retard dû au trafic');
                }}
                disabled={isSubmitting}
              >
                <Icon icon="heroicons:clock" className="h-4 w-4 mr-2" />
                En retard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus('ABSENT');
                  setNote('Élève malade');
                }}
                disabled={isSubmitting}
              >
                <Icon icon="heroicons:heart" className="h-4 w-4 mr-2" />
                Maladie
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSaveAttendance}
            disabled={isSubmitting || !status}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Enregistrement...
              </>
            ) : (
              <>
                <Icon icon={getStatusIcon(status)} className="h-4 w-4" />
                Marquer {getStatusText(status)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};