"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Type for a single election event in the activity log.
 */
type ElectionEvent = {
  id: number;
  timestamp: string;
  eventType:
    | "Election Created"
    | "Election Opened"
    | "Election Closed"
    | "Vote Cast"
    | "Voter Registered"
    | "Merkle Root Published"
    | "Contract Upgraded";
  description: string;
  actor: string;
  blockchainRef?: string;
};

/**
 * Color mapping for event types.
 */
const eventTypeColor: Record<ElectionEvent["eventType"], string> = {
  "Election Created": "bg-blue-100 text-blue-800",
  "Election Opened": "bg-green-100 text-green-800",
  "Election Closed": "bg-red-100 text-red-800",
  "Vote Cast": "bg-emerald-100 text-emerald-800",
  "Voter Registered": "bg-purple-100 text-purple-800",
  "Merkle Root Published": "bg-yellow-100 text-yellow-800",
  "Contract Upgraded": "bg-pink-100 text-pink-800",
};

/**
 * Mock data for recent election events.
 */
const mockEvents: ElectionEvent[] = [
  {
    id: 1,
    timestamp: "2025-05-04 16:00 UTC",
    eventType: "Vote Cast",
    description: "Bob cast a vote in Election #3",
    actor: "Bob",
    blockchainRef: "0x123...abc",
  },
  {
    id: 2,
    timestamp: "2025-05-04 15:45 UTC",
    eventType: "Election Closed",
    description: "Election #3 was closed",
    actor: "Admin Alice",
    blockchainRef: "0x456...def",
  },
  {
    id: 3,
    timestamp: "2025-05-04 15:30 UTC",
    eventType: "Merkle Root Published",
    description: "Merkle root published for batch #12",
    actor: "System",
    blockchainRef: "0x789...ghi",
  },
  {
    id: 4,
    timestamp: "2025-05-04 15:20 UTC",
    eventType: "Voter Registered",
    description: "Diana registered as a voter",
    actor: "Diana",
  },
  {
    id: 5,
    timestamp: "2025-05-04 15:10 UTC",
    eventType: "Contract Upgraded",
    description: "Voting contract upgraded to v2.1",
    actor: "Admin Charlie",
    blockchainRef: "0xabc...123",
  },
  {
    id: 6,
    timestamp: "2025-05-04 15:05 UTC",
    eventType: "Election Opened",
    description: "Election #3 was opened",
    actor: "Admin Alice",
    blockchainRef: "0x456...def",
  },
];

/**
 * Table columns definition for election events.
 */
const columns: ColumnDef<ElectionEvent>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Timestamp
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => info.getValue() as string,
  },
  {
    accessorKey: "eventType",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Event Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => (
      <Badge
        className={
          eventTypeColor[info.getValue() as ElectionEvent["eventType"]]
        }
      >
        {info.getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: (info) => info.getValue() as string,
  },
  {
    accessorKey: "actor",
    header: "Actor",
    cell: (info) => info.getValue() as string,
  },
  {
    accessorKey: "blockchainRef",
    header: "Blockchain Ref",
    cell: (info) => {
      const ref = info.getValue() as string | undefined;
      return ref ? (
        <a
          href={`${process.env.NEXT_PUBLIC_POLYGONSCAN_URL}/${ref}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 hover:text-blue-800"
        >
          {ref}
        </a>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
];

/**
 * DashboardRecentActivity displays a paginated, sortable table of recent election-related events.
 * @returns {React.JSX.Element} The recent activity card.
 */
export const DashboardRecentActivity: React.FC = (): React.JSX.Element => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const table = useReactTable({
    data: mockEvents,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(mockEvents.length / 5),
  });
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-medium text-muted-foreground">
          Recent Election Events
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-2 px-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="odd:bg-muted">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2 px-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
