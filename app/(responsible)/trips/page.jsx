import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/app/dictionaries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Users, Bus, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function TripsPage({ params: { lang } }) {
  const session = await getServerSession(authOptions);
  const trans = await getDictionary(lang);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // TODO: Fetch actual data from API
  const trips = [
    {
      id: 1,
      name: "Morning Route 1",
      route: "Route 1",
      driver: "John Smith",
      bus: "Bus 101",
      status: "ONGOING",
      students: 25,
    },
    // Add more mock data as needed
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "PLANNED":
        return "bg-blue-100 text-blue-800";
      case "ONGOING":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{trans.trips.title}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {trans.trips.addNew}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{trans.trips.name}</TableHead>
              <TableHead>{trans.trips.route}</TableHead>
              <TableHead>{trans.trips.driver}</TableHead>
              <TableHead>{trans.trips.bus}</TableHead>
              <TableHead>{trans.trips.status}</TableHead>
              <TableHead>{trans.trips.students}</TableHead>
              <TableHead className="text-right">{trans.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>{trip.name}</TableCell>
                <TableCell>{trip.route}</TableCell>
                <TableCell>{trip.driver}</TableCell>
                <TableCell>{trip.bus}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(trip.status)}>
                    {trip.status}
                  </Badge>
                </TableCell>
                <TableCell>{trip.students}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="mr-2">
                    <Users className="h-4 w-4 mr-1" />
                    {trans.trips.viewStudents}
                  </Button>
                  <Button variant="ghost" size="sm" className="mr-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {trans.trips.track}
                  </Button>
                  <Button variant="ghost" size="sm">
                    {trans.common.edit}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 