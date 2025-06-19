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
import { Textarea } from "@/components/ui/textarea";
import { mockRoutes } from "./data";

const RoutesPage = () => {
  const [routes, setRoutes] = useState(mockRoutes);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setIsAddDialogOpen(true);
  };

  const handleDeleteRoute = (id) => {
    setRoutes(routes.filter(route => route.id !== id));
  };

  const handleSaveRoute = (routeData) => {
    if (editingRoute) {
      setRoutes(routes.map(route => 
        route.id === editingRoute.id ? { ...route, ...routeData } : route
      ));
    } else {
      setRoutes([...routes, { ...routeData, id: routes.length + 1 }]);
    }
    setIsAddDialogOpen(false);
    setEditingRoute(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Itinéraires</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
              Ajouter un itinéraire
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRoute ? "Modifier l'itinéraire" : "Ajouter un itinéraire"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSaveRoute({
                name: formData.get('name'),
                busNumber: formData.get('busNumber'),
                driver: formData.get('driver'),
                stops: JSON.parse(formData.get('stops')),
                schedule: {
                  monday: formData.get('monday') === 'true',
                  tuesday: formData.get('tuesday') === 'true',
                  wednesday: formData.get('wednesday') === 'true',
                  thursday: formData.get('thursday') === 'true',
                  friday: formData.get('friday') === 'true',
                  saturday: formData.get('saturday') === 'true',
                  sunday: formData.get('sunday') === 'true'
                },
                status: formData.get('status')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de l'itinéraire</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingRoute?.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="busNumber">Numéro de bus</Label>
                  <Input
                    id="busNumber"
                    name="busNumber"
                    defaultValue={editingRoute?.busNumber}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="driver">Chauffeur</Label>
                  <Input
                    id="driver"
                    name="driver"
                    defaultValue={editingRoute?.driver}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stops">Arrêts (JSON)</Label>
                  <Textarea
                    id="stops"
                    name="stops"
                    defaultValue={JSON.stringify(editingRoute?.stops || [])}
                    required
                  />
                </div>
                <div>
                  <Label>Jours de service</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={day}
                          name={day}
                          defaultChecked={editingRoute?.schedule[day]}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={day} className="capitalize">
                          {day === 'monday' ? 'Lundi' :
                           day === 'tuesday' ? 'Mardi' :
                           day === 'wednesday' ? 'Mercredi' :
                           day === 'thursday' ? 'Jeudi' :
                           day === 'friday' ? 'Vendredi' :
                           day === 'saturday' ? 'Samedi' : 'Dimanche'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <select
                    id="status"
                    name="status"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue={editingRoute?.status}
                    required
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  {editingRoute ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Bus</TableHead>
            <TableHead>Chauffeur</TableHead>
            <TableHead>Arrêts</TableHead>
            <TableHead>Jours de service</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            <TableRow key={route.id}>
              <TableCell>
                <div className="font-medium">{route.name}</div>
              </TableCell>
              <TableCell>{route.busNumber}</TableCell>
              <TableCell>{route.driver}</TableCell>
              <TableCell>
                <div className="space-y-2">
                  {route.stops.map((stop) => (
                    <div key={stop.id} className="text-sm">
                      <div className="font-medium">{stop.name}</div>
                      <div className="text-muted-foreground">
                        {stop.time} - {stop.location}
                      </div>
                      {stop.students.length > 0 && (
                        <div className="mt-1">
                          <div className="text-xs text-muted-foreground">
                            Étudiants: {stop.students.map(s => s.name).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {Object.entries(route.schedule)
                    .filter(([_, value]) => value)
                    .map(([day]) => (
                      <Badge key={day} variant="soft" className="mr-1">
                        {day === 'monday' ? 'Lun' :
                         day === 'tuesday' ? 'Mar' :
                         day === 'wednesday' ? 'Mer' :
                         day === 'thursday' ? 'Jeu' :
                         day === 'friday' ? 'Ven' :
                         day === 'saturday' ? 'Sam' : 'Dim'}
                      </Badge>
                    ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="soft"
                  color={getStatusColor(route.status)}
                  className="capitalize"
                >
                  {getStatusText(route.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-none"
                    onClick={() => handleEditRoute(route)}
                  >
                    <Icon icon="heroicons:pencil-square" className="h-5 w-5 text-blue-500" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    color="destructive"
                    className="h-7 w-7 border-none"
                    onClick={() => handleDeleteRoute(route.id)}
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

export default RoutesPage; 