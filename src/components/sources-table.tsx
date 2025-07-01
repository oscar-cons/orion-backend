"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { sources as allSources, Source } from '@/lib/data';
import { ChevronRight } from 'lucide-react';

const statusStyles: { [key: string]: string } = {
  Active: 'bg-green-600/20 text-green-400 border-green-600/20',
  Inactive: 'bg-red-600/20 text-red-400 border-red-600/20',
};

const natureStyles: { [key: string]: string } = {
    Hacking: 'bg-red-500/20 text-red-400 border-red-500/20',
    Carding: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    Drugs: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    Leaks: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    General: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
}

export function SourcesTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  const filteredSources = useMemo(() => {
    return allSources.filter(source =>
      (source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       source.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (statusFilter === 'all' || source.status === statusFilter) &&
      (typeFilter === 'all' || source.type === typeFilter) &&
      (countryFilter === 'all' || source.country === countryFilter)
    );
  }, [searchTerm, statusFilter, typeFilter, countryFilter]);

  const uniqueCountries = useMemo(() => [...new Set(allSources.map(s => s.country))], []);
  const uniqueTypes = useMemo(() => [...new Set(allSources.map(s => s.type))], []);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 mb-4 sm:flex-row">
          <Input
            placeholder="Search by name or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-xs"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Nature</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Country</TableHead>
                <TableHead className="text-right"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredSources.map(source => (
                <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{source.type}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className={natureStyles[source.nature]}>{source.nature}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={statusStyles[source.status]}>{source.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{source.country}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/sources/${source.id}`}>
                                <ChevronRight className="w-4 h-4" />
                                <span className="sr-only">View Details</span>
                            </Link>
                        </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
         {filteredSources.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No sources found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
