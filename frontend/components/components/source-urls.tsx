'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, AlertTriangle } from 'lucide-react';

interface UrlStatus {
  url: string;
  status: "up" | "manual" | "down";
}

type SourceUrlsProps = {
  urls: string[];
  sourceName: string;
};

export function SourceUrls({ urls, sourceName }: SourceUrlsProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Mocked data for url statuses, as it's not provided from the parent component yet.
  const urlStatuses: UrlStatus[] = urls.map((url, index) => ({
    url,
    status: index % 3 === 0 ? "up" : index % 3 === 1 ? "down" : "manual",
  }));

  const handleCopy = (url: string) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
          <CardTitle>Source URLs</CardTitle>
          <CardDescription>Direct links for {sourceName}. Proceed with extreme caution.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Warning: High-Risk Area</AlertTitle>
          <AlertDescription>
            You are about to access URLs that may link to illegal or dangerous content. Ensure you are using a secure, anonymous connection (like the Tor Browser) before proceeding. Visiting these sites can expose you to significant security risks.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          {urls.map((url) => {
            const statusEntry = urlStatuses.find(s => s.url === url);
            const statusColor = statusEntry?.status === "up" ? "bg-green-500" : statusEntry?.status === "manual" ? "bg-yellow-500" : "bg-red-500";
            const statusTooltip = statusEntry?.status === "up" ? "Status: Up and Automated" : statusEntry?.status === "manual" ? "Status: Manual Insertion" : "Status: Down";

            return (
              <div key={url} className="flex items-center justify-between gap-4 p-3 pl-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 truncate">
                  {statusEntry && (
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColor}`} title={statusTooltip}></div>
                  )}
                  <a href={url} className="flex-1 font-mono text-sm truncate text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                    {url}
                  </a>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(url)} aria-label={`Copy ${url}`}>
                  {copiedUrl === url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
