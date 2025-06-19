'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { mockAttendance } from "./data";

const AttendancePage = () => {
  const [attendance, setAttendance] = useState(mockAttendance);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);

  const handleEditAttendance = (record) => {
    setEditingAttendance(record);
    setIsAddDialogOpen(true);
  };

  const handleDeleteAttendance = (id) => {
    setAttendance(attendance.filter(record => record.id !== id));
  };

  const handleSaveAttendance = (attendanceData) => {
    if (editingAttendance) {
      setAttendance(attendance.map(record => 
        record.id === editingAttendance.id ? { ...record, ...attendanceData } : record
      ));
    } else {
      setAttendance([...attendance, { ...attendanceData, id: attendance.length + 1 }]);
    }
    setIsAddDialogOpen(false);
    setEditingAttendance(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'destructive';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Présent';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'En retard';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suivi des Présences</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
              Ajouter une présence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAttendance ? "Modifier la présence" : "Ajouter une présence"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSaveAttendance({
                date: formData.get('date'),
                route: {
                  id: parseInt(formData.get('routeId')),
                  name: formData.get('routeName'),
                  busNumber: formData.get('busNumber'),
                  driver: formData.get('driver')
                },
                stops: JSON.parse(formData.get('stops'))
              });
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={editingAttendance?.date}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="routeName">Nom du trajet</Label>
                  <Input
                    id="routeName"
                    name="routeName"
                    defaultValue={editingAttendance?.route.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="busNumber">Numéro de bus</Label>
                  <Input
                    id="busNumber"
                    name="busNumber"
                    defaultValue={editingAttendance?.route.busNumber}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="driver">Chauffeur</Label>
                  <Input
                    id="driver"
                    name="driver"
                    defaultValue={editingAttendance?.route.driver}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stops">Arrêts (JSON)</Label>
                  <Input
                    id="stops"
                    name="stops"
                    defaultValue={JSON.stringify(editingAttendance?.stops || [])}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingAttendance ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Trajet</TableHead>
            <TableHead>Bus</TableHead>
            <TableHead>Chauffeur</TableHead>
            <TableHead>Arrêts</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendance.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <div className="font-medium">{record.date}</div>
              </TableCell>
              <TableCell>{record.route.name}</TableCell>
              <TableCell>{record.route.busNumber}</TableCell>
              <TableCell>{record.route.driver}</TableCell>
              <TableCell>
                <div className="space-y-2">
                  {record.stops.map((stop) => (
                    <div key={stop.id} className="text-sm">
                      <div className="font-medium">{stop.name}</div>
                      <div className="text-muted-foreground">
                        Horaire: {stop.time}
                      </div>
                      <div className="mt-1 space-y-1">
                        {stop.students.map((student) => (
                          <div key={student.id} className="flex items-center gap-2">
                            <Badge
                              variant="soft"
                              color={getStatusColor(student.status)}
                              className="capitalize"
                            >
                              {getStatusText(student.status)}
                            </Badge>
                            <span>{student.name}</span>
                            {student.time && (
                              <span className="text-muted-foreground">
                                ({student.time})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-none"
                    onClick={() => handleEditAttendance(record)}
                  >
                    <Icon icon="heroicons:pencil-square" className="h-5 w-5 text-blue-500" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    color="destructive"
                    className="h-7 w-7 border-none"
                    onClick={() => handleDeleteAttendance(record.id)}
                  >
                    <Icon icon="heroicons:trash" className="h-5 w-5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendancePage; 