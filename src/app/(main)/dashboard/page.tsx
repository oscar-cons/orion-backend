'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { dashboardMetrics, countryDistribution, sources } from "@/lib/data";
import { Globe, Signal, SignalLow } from "lucide-react";
import { WorldMapChart } from "@/components/world-map-chart";

export default function DashboardPage() {
  const recentSources = sources.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of the monitored criminal web ecosystem."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.totalSources}</div>
            <p className="text-xs text-muted-foreground">All monitored entities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <Signal className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.active}</div>
            <p className="text-xs text-muted-foreground">Currently online and accessible</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inactive Sources</CardTitle>
            <SignalLow className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.inactive}</div>
            <p className="text-xs text-muted-foreground">Offline or seized entities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Sources</CardTitle>
            <CardDescription>The latest sources identified and added to the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell>{source.type}</TableCell>
                    <TableCell>
                      <Badge variant={source.status === 'Active' ? 'default' : 'destructive'} className={source.status === 'Active' ? 'bg-green-600/20 text-green-400 border-green-600/20' : 'bg-red-600/20 text-red-400 border-red-600/20'}>
                        {source.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Source Distribution by Country</CardTitle>
            <CardDescription>Top countries hosting the monitored sources.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[350px]">
              <WorldMapChart data={countryDistribution} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
