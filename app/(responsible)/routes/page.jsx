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
import { Plus, MapPin } from "lucide-react";

export default async function RoutesPage({ params: { lang } }) {
  const session = await getServerSession(authOptions);
  const trans = await getDictionary(lang);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // TODO: Fetch actual data from API
  const routes = [
    {
      id: 1,
      name: "Route 1",
      stops: 5,
      activeTrips: 2,
      totalStudents: 25,
    },
    // Add more mock data as needed
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{trans.routes.title}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {trans.routes.addNew}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{trans.routes.name}</TableHead>
              <TableHead>{trans.routes.stops}</TableHead>
              <TableHead>{trans.routes.activeTrips}</TableHead>
              <TableHead>{trans.routes.totalStudents}</TableHead>
              <TableHead className="text-right">{trans.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>{route.name}</TableCell>
                <TableCell>{route.stops}</TableCell>
                <TableCell>{route.activeTrips}</TableCell>
                <TableCell>{route.totalStudents}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="mr-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {trans.routes.viewStops}
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