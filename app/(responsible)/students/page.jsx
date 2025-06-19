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
import { Plus } from "lucide-react";

export default async function StudentsPage({ params: { lang } }) {
  const session = await getServerSession(authOptions);
  const trans = await getDictionary(lang);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // TODO: Fetch actual data from API
  const students = [
    {
      id: 1,
      fullname: "John Doe",
      class: "Grade 10A",
      gender: "MALE",
      address: "123 Main St",
      quartie: "Downtown",
    },
    // Add more mock data as needed
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{trans.students.title}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {trans.students.addNew}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{trans.students.fullname}</TableHead>
              <TableHead>{trans.students.class}</TableHead>
              <TableHead>{trans.students.gender}</TableHead>
              <TableHead>{trans.students.address}</TableHead>
              <TableHead>{trans.students.quartie}</TableHead>
              <TableHead className="text-right">{trans.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.fullname}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>{student.gender}</TableCell>
                <TableCell>{student.address}</TableCell>
                <TableCell>{student.quartie}</TableCell>
                <TableCell className="text-right">
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