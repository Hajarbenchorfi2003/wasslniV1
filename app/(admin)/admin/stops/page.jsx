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
import { mockStops } from "./data";

const StopsPage = () => {
  const [stops, setStops] = useState(mockStops);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);

  const handleEditStop = (stop) => {
    setEditingStop(stop);
    setIsAddDialogOpen(true);
  };

  const handleDeleteStop = (id) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const handleSaveStop = (stopData) => {
    if (editingStop) {
      setStops(stops.map(stop => 
        stop.id === editingStop.id ? { ...stop, ...stopData } : stop
      ));
    } else {
      setStops([...stops, { ...stopData, id: stops.length + 1 }]);
    }
    setIsAddDialogOpen(false);
    setEditingStop(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Arrêts</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
              Ajouter un arrêt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStop ? "Modifier l'arrêt" : "Ajouter un arrêt"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSaveStop({
                name: formData.get('name'),
                location: formData.get('location'),
                coordinates: {
                  lat: parseFloat(formData.get('lat')),
                  lng: parseFloat(formData.get('lng'))
                },
                status: formData.get('status')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de l'arrêt</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingStop?.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Adresse</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingStop?.location}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      name="lat"
                      type="number"
                      step="any"
                      defaultValue={editingStop?.coordinates.lat}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitude</Label>
                    <Input
                      id="lng"
                      name="lng"
                      type="number"
                      step="any"
                      defaultValue={editingStop?.coordinates.lng}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <select
                    id="status"
                    name="status"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue={editingStop?.status}
                    required
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  {editingStop ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Arrêt</TableHead>
            <TableHead>Localisation</TableHead>
            <TableHead>Coordonnées</TableHead>
            <TableHead>Trajets</TableHead>
            <TableHead>Étudiants</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stops.map((stop) => (
            <TableRow key={stop.id}>
              <TableCell>
                <div className="font-medium">{stop.name}</div>
              </TableCell>
              <TableCell>{stop.location}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>Lat: {stop.coordinates.lat}</div>
                  <div>Lng: {stop.coordinates.lng}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {stop.routes.map((route) => (
                    <div key={route.id} className="text-sm">
                      <div className="font-medium">{route.name}</div>
                      <div className="text-muted-foreground">{route.time}</div>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {stop.students.map((student) => (
                    <div key={student.id} className="text-sm">
                      {student.name}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="soft"
                  color={stop.status === 'active' ? 'success' : 'destructive'}
                  className="capitalize"
                >
                  {stop.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-none"
                    onClick={() => handleEditStop(stop)}
                  >
                    <Icon icon="heroicons:pencil-square" className="h-5 w-5 text-blue-500" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    color="destructive"
                    className="h-7 w-7 border-none"
                    onClick={() => handleDeleteStop(stop.id)}
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

export default StopsPage; 