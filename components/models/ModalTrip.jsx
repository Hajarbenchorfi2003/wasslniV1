// components/models/ModalTrip.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";


export const ModalTrip = ({ isOpen, onClose, editingTrip, onSave, routes, buses, drivers, establishments, students, tripStudents }) => {
  const [formData, setFormData] = useState({
    name: '',
    routeId: null,
    busId: null,
    driverId: null,
    establishmentId: null,
    studentIds: [], // For linking students to this trip
  });

  useEffect(() => {
    if (editingTrip) {
      const linkedStudentIds = tripStudents
        .filter(ts => ts.tripId === editingTrip.id)
        .map(ts => ts.studentId);

      setFormData({
        name: editingTrip.name || '',
        routeId: editingTrip.routeId || null,
        busId: editingTrip.busId || null,
        driverId: editingTrip.driverId || null,
        establishmentId: editingTrip.establishmentId || null,
        studentIds: linkedStudentIds,
      });
    } else {
      setFormData({
        name: '',
        routeId: null,
        busId: null,
        driverId: null,
        establishmentId: null,
        studentIds: [],
      });
    }
  }, [editingTrip, tripStudents]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleStudentCheckboxChange = (id, checked) => {
    setFormData(prev => {
      const newStudentIds = checked
        ? [...prev.studentIds, id]
        : prev.studentIds.filter(studentId => studentId !== id);
      return { ...prev, studentIds: newStudentIds };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation to ensure required fields are selected/filled
    if (!formData.name || !formData.routeId || !formData.busId || !formData.driverId || !formData.establishmentId) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent  className="sm:max-w-[425px]">
        <DialogHeader className="px-6">
          <DialogTitle className="text-base font-medium text-default-700 ">{editingTrip ? 'Modifier le Trajet' : 'Ajouter un nouveau Trajet'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-right">Nom du Trajet</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
          </div>

          {/* Route Selection */}
          {routes && routes.length > 0 && (
            <div>
              <Label htmlFor="route" className="text-right">Route</Label>
              <Select onValueChange={(value) => handleSelectChange('routeId', value)} value={formData.routeId ? String(formData.routeId) : ''} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map(route => (
                    <SelectItem key={route.id} value={String(route.id)}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bus Selection */}
          {buses && buses.length > 0 && (
            <div>
              <Label htmlFor="bus" className="text-right">Bus</Label>
              <Select onValueChange={(value) => handleSelectChange('busId', value)} value={formData.busId ? String(formData.busId) : ''} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un bus" />
                </SelectTrigger>
                <SelectContent>
                  {buses.map(bus => (
                    <SelectItem key={bus.id} value={String(bus.id)}>
                      {bus.plateNumber} ({bus.marque})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Driver Selection */}
          {drivers && drivers.length > 0 && (
            <div>
              <Label htmlFor="driver" className="text-right">Chauffeur</Label>
              <Select onValueChange={(value) => handleSelectChange('driverId', value)} value={formData.driverId ? String(formData.driverId) : ''} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un chauffeur" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map(driver => (
                    <SelectItem key={driver.id} value={String(driver.id)}>
                      {driver.fullname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Establishment Selection (assuming a trip belongs to one establishment) */}
          {establishments && establishments.length > 0 && (
            <div>
              <Label htmlFor="establishment" className="text-right">Établissement</Label>
              <Select onValueChange={(value) => handleSelectChange('establishmentId', value)} value={formData.establishmentId ? String(formData.establishmentId) : ''} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un établissement" />
                </SelectTrigger>
                <SelectContent>
                  {establishments.map(est => (
                    <SelectItem key={est.id} value={String(est.id)}>
                      {est.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Students Multi-Selection */}
          {students && students.length > 0 && (
            <div>
              <Label className="text-right mt-2">Élèves Associés</Label>
              <div className="col-span-3 space-y-2 max-h-48 overflow-y-auto border p-2 rounded">
                {students.map(student => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={formData.studentIds.includes(student.id)}
                      onCheckedChange={(checked) => handleStudentCheckboxChange(student.id, checked)}
                    />
                    <Label htmlFor={`student-${student.id}`}>{student.fullname}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit">Sauvegarder</Button>
          </DialogFooter>
        </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};