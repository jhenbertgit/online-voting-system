"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

interface VoteAuditRow {
  timestamp: string;
  candidate: string;
  offChain: number;
  onChain: number;
  discrepancy: boolean;
}

// You may want to move columns and mock data to a separate file for larger projects
const columns: ColumnDef<VoteAuditRow>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="px-0"
      >
        Timestamp
        <ArrowUpDown
          className={`ml-2 h-4 w-4 transition-transform ${
            column.getIsSorted() === "asc"
              ? "text-blue-600 rotate-180"
              : column.getIsSorted() === "desc"
                ? "text-blue-600"
                : "text-muted-foreground"
          }`}
        />
      </Button>
    ),
    cell: (info) =>
      new Date(info.getValue() as string).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    accessorKey: "candidate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="px-0"
      >
        Candidate
        <ArrowUpDown
          className={`ml-2 h-4 w-4 transition-transform ${
            column.getIsSorted() === "asc"
              ? "text-blue-600 rotate-180"
              : column.getIsSorted() === "desc"
                ? "text-blue-600"
                : "text-muted-foreground"
          }`}
        />
      </Button>
    ),
    cell: (info) => info.getValue() as string,
  },
  {
    accessorKey: "offChain",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="px-0"
      >
        Off-chain
        <ArrowUpDown
          className={`ml-2 h-4 w-4 transition-transform ${
            column.getIsSorted() === "asc"
              ? "text-blue-600 rotate-180"
              : column.getIsSorted() === "desc"
                ? "text-blue-600"
                : "text-muted-foreground"
          }`}
        />
      </Button>
    ),
    cell: (info) => info.getValue() as number,
  },
  {
    accessorKey: "onChain",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="px-0"
      >
        On-chain
        <ArrowUpDown
          className={`ml-2 h-4 w-4 transition-transform ${
            column.getIsSorted() === "asc"
              ? "text-blue-600 rotate-180"
              : column.getIsSorted() === "desc"
                ? "text-blue-600"
                : "text-muted-foreground"
          }`}
        />
      </Button>
    ),
    cell: (info) => info.getValue() as number,
  },
  {
    accessorKey: "discrepancy",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="px-0"
      >
        Discrepancy
        <ArrowUpDown
          className={`ml-2 h-4 w-4 transition-transform ${
            column.getIsSorted() === "asc"
              ? "text-blue-600 rotate-180"
              : column.getIsSorted() === "desc"
                ? "text-blue-600"
                : "text-muted-foreground"
          }`}
        />
      </Button>
    ),
    cell: (info) =>
      info.getValue() ? (
        <span className="text-red-600 font-semibold">Yes</span>
      ) : (
        <span className="text-green-600">No</span>
      ),
  },
];

const data: VoteAuditRow[] = [
  {
    timestamp: "2025-05-15T09:00:00+08:00",
    candidate: "Alice",
    offChain: 10,
    onChain: 0,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T09:00:00+08:00",
    candidate: "Bob",
    offChain: 8,
    onChain: 0,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T09:00:00+08:00",
    candidate: "Charlie",
    offChain: 5,
    onChain: 0,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T09:30:00+08:00",
    candidate: "Alice",
    offChain: 30,
    onChain: 20,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T09:30:00+08:00",
    candidate: "Bob",
    offChain: 18,
    onChain: 12,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T09:30:00+08:00",
    candidate: "Charlie",
    offChain: 15,
    onChain: 10,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T10:00:00+08:00",
    candidate: "Alice",
    offChain: 60,
    onChain: 50,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T10:00:00+08:00",
    candidate: "Bob",
    offChain: 40,
    onChain: 32,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T10:00:00+08:00",
    candidate: "Charlie",
    offChain: 30,
    onChain: 25,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T10:30:00+08:00",
    candidate: "Alice",
    offChain: 90,
    onChain: 80,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T10:30:00+08:00",
    candidate: "Bob",
    offChain: 70,
    onChain: 65,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T10:30:00+08:00",
    candidate: "Charlie",
    offChain: 55,
    onChain: 50,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T11:00:00+08:00",
    candidate: "Alice",
    offChain: 120,
    onChain: 115,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T11:00:00+08:00",
    candidate: "Bob",
    offChain: 100,
    onChain: 98,
    discrepancy: true,
  },
  {
    timestamp: "2025-05-15T11:00:00+08:00",
    candidate: "Charlie",
    offChain: 80,
    onChain: 77,
    discrepancy: true,
  },
];

/**
 * VoteTransmissionAudit displays a paginated, sortable table of recent vote transmission events.
 * @returns {React.JSX.Element} The vote transmission audit card.
 */
export const VoteTransmissionAudit: React.FC = (): React.JSX.Element => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-medium text-muted-foreground">
          Recent Vote Transmission Activity
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
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
