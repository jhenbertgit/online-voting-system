import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const elections = [
  { id: "1", name: "Presidential", date: "2023-11-15", status: "Active" },
  { id: "2", name: "Senate", date: "2023-09-10", status: "Completed" },
];

export function RecentElections() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {elections.map((election) => (
            <TableRow key={election.id}>
              <TableCell>{election.name}</TableCell>
              <TableCell>{election.date}</TableCell>
              <TableCell>{election.status}</TableCell>
              <TableCell className="text-right">
                <button className="text-blue-500 hover:underline">View</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
