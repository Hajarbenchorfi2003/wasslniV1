'use client';
import React, { useState, useEffect } from 'react';
import { demoData as initialDemoData } from '@/data/data';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {confirmToast} from './confirmetost' ;

function TripStudentManagementPage() {
  const [demoData, setDemoData] = useState(initialDemoData);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [studentsInTrip, setStudentsInTrip] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searchTermAvailable, setSearchTermAvailable] = useState('');
  const [searchTermInTrip, setSearchTermInTrip] = useState('');

  const getStudentsForTrip = (tripId) => {
    const tripStudentsLinks = demoData.tripStudents.filter(ts => ts.tripId === tripId);
    const studentIdsInTrip = tripStudentsLinks.map(ts => ts.studentId);
    return demoData.students.filter(student => studentIdsInTrip.includes(student.id));
  };

  const getAvailableStudents = (currentTripId) => {
    const studentsCurrentlyInTrip = getStudentsForTrip(currentTripId).map(s => s.id);
    return demoData.students.filter(student =>
      !studentsCurrentlyInTrip.includes(student.id) && student.deletedAt === null
    );
  };

  useEffect(() => {
    if (demoData.trips.length > 0 && !selectedTrip) {
      setSelectedTrip(demoData.trips[0]);
    }
  }, [selectedTrip, demoData.trips]);

  useEffect(() => {
    if (selectedTrip) {
      setStudentsInTrip(getStudentsForTrip(selectedTrip.id));
      setAvailableStudents(getAvailableStudents(selectedTrip.id));
      setSearchTermAvailable('');
      setSearchTermInTrip('');
    } else {
      setStudentsInTrip([]);
      setAvailableStudents([]);
    }
  }, [selectedTrip, demoData.tripStudents, demoData.students]);

  const handleTripChange = (value) => {
    const tripId = parseInt(value, 10);
    const trip = demoData.trips.find(t => t.id === tripId);
    setSelectedTrip(trip);
  };

  const handleAddStudent = (studentId) => {
    if (!selectedTrip) {
      toast.error('Veuillez sélectionner un voyage.');
      return;
    }
    const alreadyInTrip = demoData.tripStudents.some(
      link => link.tripId === selectedTrip.id && link.studentId === studentId
    );
    if (alreadyInTrip) {
      toast.error("Cet élève est déjà dans le voyage.");
      return;
    }
    const newLink = { tripId: selectedTrip.id, studentId };
    setDemoData(prev => ({
      ...prev,
      tripStudents: [...prev.tripStudents, newLink],
    }));
    toast.success(`${demoData.students.find(s => s.id === studentId)?.fullname} ajouté au voyage.`);
  };

  const handleRemoveStudent = (studentId) => {
    if (!selectedTrip) {
      toast.error("Sélectionnez d'abord un voyage.");
      return;
    }
  
    confirmToast("Êtes-vous sûr de vouloir retirer cet élève ?", () => {
      const updated = demoData.tripStudents.filter(
        link => !(link.tripId === selectedTrip.id && link.studentId === studentId)
      );
      setDemoData(prev => ({ ...prev, tripStudents: updated }));
      toast.success("Élève retiré du voyage.");
    });
  };
  

  const filteredAvailable = availableStudents.filter(s =>
    s.fullname.toLowerCase().includes(searchTermAvailable.toLowerCase()) ||
    s.class.toLowerCase().includes(searchTermAvailable.toLowerCase())
  );

  const filteredInTrip = studentsInTrip.filter(s =>
    s.fullname.toLowerCase().includes(searchTermInTrip.toLowerCase()) ||
    s.class.toLowerCase().includes(searchTermInTrip.toLowerCase())
  );

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-start sm:items-center">
        <h2 className="text-3xl font-medium text-default-800"> Gestion des Élèves par Trajet</h2> 
      </div>
      <div>
      <div className="w-full sm:w-[310px]">
          <Select onValueChange={handleTripChange} value={selectedTrip ? String(selectedTrip.id) : ''}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- Choisissez un voyage --" />
            </SelectTrigger>
            <SelectContent>
              {demoData.trips.map(trip => (
                <SelectItem key={trip.id} value={String(trip.id)}>
                  {trip.name} ({demoData.routes.find(r => r.id === trip.routeId)?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedTrip ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    {/* Élèves disponibles */}
    <Card>
      <CardHeader>
        <CardTitle>Élèves disponibles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Icon icon="lucide:search" className="absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchTermAvailable}
            onChange={(e) => setSearchTermAvailable(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {filteredAvailable.length > 0 ? filteredAvailable.map(student => (
            <div key={student.id} className="flex justify-between items-center  bg-default-50 rounded-lg hover:bg-default-100 transition-colors 0 p-3 rounded-md border">
              <span>{student.fullname} <span className="text-sm text-default-500">({student.class})</span></span>
              <Button
                onClick={() => handleAddStudent(student.id)}
                variant="success"
                size="sm"
                className="flex items-center gap-1"
              >
                <Icon icon="lucide:plus" width="16" /> Ajouter
              </Button>
            </div>
          )) : (
            <p className="text-default--500 text-center py-6">Aucun élève disponible.</p>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Élèves dans le voyage */}
    <Card>
      <CardHeader>
        <CardTitle>Élèves dans le trajet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Icon icon="lucide:search" className="absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchTermInTrip}
            onChange={(e) => setSearchTermInTrip(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {filteredInTrip.length > 0 ? filteredInTrip.map(student => (
            <div key={student.id} className="flex justify-between items-center  bg-default-50 rounded-lg hover:bg-default-100 transition-colors p-3 rounded-md border">
              <span>{student.fullname} <span className="text-sm text-default-500">({student.class})</span></span>
              <Button
                onClick={() => handleRemoveStudent(student.id)}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
              >
                <Icon icon="lucide:minus" width="16" /> Retirer
              </Button>
            </div>
          )) : (
            <p className="text-default-500 text-center py-6">Aucun élève dans ce voyage.</p>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
) : (
  <Card>
    <CardContent>
      <p className="text-center text-lg text-default-500 p-6">
        Veuillez sélectionner un voyage.
      </p>
    </CardContent>
  </Card>
)}

    </div>
  );
}

export default TripStudentManagementPage;
