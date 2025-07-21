"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReloadButton } from "./ui/reload-button";
import { PaginationControls } from "./ui/pagination-controls";

export type Ransomware = {
  id: string;
  BreachName: string;
  Domain?: string;
  Rank?: string;
  Category?: string;
  DetectionDate: string;
  Country: string;
  OriginalSource?: string;
  Group: string;
  Download?: string;
};

export function RansomwareTable() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [ransomwareSources, setRansomwareSources] = React.useState<Ransomware[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [reloadKey, setReloadKey] = React.useState(0);

  const handleReload = () => {
    setReloadKey(k => k + 1);
  };

  React.useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/ransomware")
      .then(res => res.json())
      .then(data => {
        setRansomwareSources(data);
        setLoading(false);
      });
  }, [reloadKey]);

  const filteredData = React.useMemo(() => {
    const filtered = ransomwareSources.filter(rw =>
      (rw.BreachName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rw.Domain || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rw.Group || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Ordenar por fecha
    return filtered.sort((a, b) => {
      const dateA = a.DetectionDate ? new Date(a.DetectionDate).getTime() : 0;
      const dateB = b.DetectionDate ? new Date(b.DetectionDate).getTime() : 0;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [ransomwareSources, searchTerm, sortOrder]);

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Si el filtro cambia, vuelve a la primera página
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  if (loading) return <div>Cargando ransomware...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 flex-wrap">
        <Input
          placeholder="Buscar por Breach Name, Domain o Group..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm mr-4"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="rowsPerPage" className="text-sm">Entradas por página:</label>
          <Select value={String(rowsPerPage)} onValueChange={v => setRowsPerPage(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Entradas por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sortOrder" className="text-sm">Ordenar por fecha:</label>
          <Select value={sortOrder} onValueChange={v => setSortOrder(v as 'asc' | 'desc')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Más reciente primero</SelectItem>
              <SelectItem value="asc">Más antiguo primero</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ReloadButton onClick={handleReload} isLoading={loading} />
      </div>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Breach Name</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Detection Date</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Original Source</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((rw, index) => (
              <TableRow key={rw.id || `${rw.BreachName}-${rw.DetectionDate}-${index}`}>
                <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{rw.BreachName}</TableCell>
                <TableCell>{rw.Domain}</TableCell>
                <TableCell>{rw.Rank}</TableCell>
                <TableCell>{rw.Category}</TableCell>
                <TableCell>{rw.DetectionDate ? new Date(rw.DetectionDate).toLocaleDateString() : ""}</TableCell>
                <TableCell>{rw.Country}</TableCell>
                <TableCell>{rw.OriginalSource ? <a href={rw.OriginalSource} target="_blank" rel="noopener noreferrer">Link</a> : ""}</TableCell>
                <TableCell>{rw.Group}</TableCell>
                <TableCell>{rw.Download ? <a href={rw.Download} target="_blank" rel="noopener noreferrer">Link</a> : ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
      />
      {filteredData.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No ransomware sources found matching your criteria.
        </div>
      )}
    </div>
  );
} 