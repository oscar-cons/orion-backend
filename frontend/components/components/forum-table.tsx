"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "./ui/badge";
import { sources } from "@/lib/data";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronRight } from "lucide-react";
import { ReloadButton } from "./ui/reload-button";
export type Forum = {
  id: string;
  name: string;
  description: string;
  url: string;
  status: "Active" | "Inactive" | "Pending";
  country: string;
};

export const columns: ColumnDef<Forum>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "url",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
        >URL</Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("url")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Forum["status"];
      return (
        <Badge variant={status === "Active" ? "default" : status === "Inactive" ? "destructive" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("country")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const forum = row.original;

      return (
        <Link href={`/sources/forum/${forum.id}`}>
          <Button variant="ghost" className="h-8 w-8 p-0 ml-auto">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];

export function ForumTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [countryFilter, setCountryFilter] = React.useState('all');
  const [forumSources, setForumSources] = React.useState<Forum[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [reloadKey, setReloadKey] = React.useState(0);

  const handleReload = () => {
    setReloadKey(k => k + 1);
  };

  React.useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/forums")
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((forum: any) => ({
          id: forum.id,
          name: forum.name,
          description: forum.description || "",
          url: "",
          status: forum.status ? "Active" : "Inactive",
          country: forum.country,
        }));
        setForumSources(mapped);
        setLoading(false);
      });
  }, [reloadKey]);

  const filteredData = React.useMemo(() => {
    return forumSources.filter(forum =>
      (forum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       forum.url.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || forum.status === statusFilter) &&
      (countryFilter === 'all' || forum.country === countryFilter)
    );
  }, [forumSources, searchTerm, statusFilter, countryFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const countries = React.useMemo(() => {
    const countryList = forumSources.map(forum => forum.country);
    return Array.from(new Set(countryList)).sort();
  }, [forumSources]);

  if (loading) return <div>Cargando foros...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search by name or URL..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm mr-4"
        />
         <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger className="w-[180px] mr-4">
                <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
        </Select>
         <Select onValueChange={setCountryFilter} value={countryFilter}>
            <SelectTrigger className="w-[180px] mr-4">
                <SelectValue placeholder="Filter by Country" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <ReloadButton onClick={handleReload} isLoading={loading} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

