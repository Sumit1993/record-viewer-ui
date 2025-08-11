import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export type RecordRow = {
  recordNumber: string;
  recordType: string;
  applicantName: string;
  dateSubmitted: string;
  recordStatus: string;
  addresses?: string[];
  emails?: string[];
  phoneNumbers?: string[];
  description?: string;
  tenure?: number;
};

// columns are now passed in as a prop from parent

export interface RecordsTableProps {
  data: RecordRow[];
  columns?: any[];
  columnVisibility?: Record<string, boolean>;
}

export default function RecordsTable({ data, columns: columnsProp, columnVisibility }: RecordsTableProps) {
  // Use provided columns only, default to [] if not provided
  const table = useReactTable({
    data,
    columns: columnsProp ?? [],
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
  });

  return (
    <Paper elevation={0} sx={{ mt: 2, p: 2, background: "#f7f9fb" }}>
      <Table sx={{ background: "#fff", borderRadius: 2 }}>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell key={header.id} sx={{ fontWeight: 600, color: "#222" }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} sx={{ color: "#222" }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
