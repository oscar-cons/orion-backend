'use client';

import { useState, useEffect } from 'react';
import { getSourceById, getSourceContent } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Edit, Search, SlidersHorizontal } from 'lucide-react';
import { SourceUrls } from '@/components/source-urls';
import { Input } from '@/components/ui/input';

type DetailItemProps = {
  label: string;
  value: React.ReactNode;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="text-base text-foreground">{value}</div>
    </div>
  );
}

export default function SourceDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('content');
  const source = getSourceById(params.id);

  const [formattedMetrics, setFormattedMetrics] = useState({
    users: source?.userMetrics.users.toString() ?? '',
    posts: source?.userMetrics.posts.toString() ?? '',
    threads: source?.userMetrics.threads.toString() ?? '',
  });

  useEffect(() => {
    if (source) {
      setFormattedMetrics({
        users: source.userMetrics.users.toLocaleString(),
        posts: source.userMetrics.posts.toLocaleString(),
        threads: source.userMetrics.threads.toLocaleString(),
      });
    }
  }, [source]);

  if (!source) {
    notFound();
  }

  const content = getSourceContent(params.id);

  return (
    <>
      <div className="flex items-start justify-between">
         <PageHeader
            title={source.name}
            description={`Detailed profile for ${source.name}.`}
         />
         <div className="flex gap-2 mt-2">
            <Button variant="outline" asChild>
              <Link href="/sources">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to list
              </Link>
            </Button>
            <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
            </Button>
         </div>
      </div>
     

      <Tabs defaultValue="content" onValueChange={(value) => setActiveTab(value)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="content">Latest Content</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="urls">URLs</TabsTrigger>
          </TabsList>
          
          {activeTab === 'content' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground top-1/2 left-3" />
                <Input placeholder="Search..." className="w-64 pl-10" />
              </div>
              <Button variant="outline">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced
              </Button>
            </div>
          )}
        </div>
        <TabsContent value="content">
          <Card>
            <CardHeader>
                <CardTitle>Latest Posts</CardTitle>
                <CardDescription>Recent activity scraped from {source.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.map(post => (
                <Link href={`/sources/${source.id}/${post.id}`} key={post.id} className="block group">
                  <div className="flex items-start justify-between gap-6 p-4 border rounded-lg bg-card/50 group-hover:border-primary/50 group-hover:shadow-lg transition-all">
                      <div className="flex-1">
                          <h4 className="font-semibold text-primary-foreground group-hover:text-primary">{post.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>by {post.author}</span>
                              <span>&bull;</span>
                              <span>{post.date}</span>
                          </div>
                          <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{post.content}</p>
                          <div className="mt-4 text-sm font-medium text-primary group-hover:underline">
                              More Info <ArrowRight className="inline-block w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </div>
                      </div>
                      <div className="flex-shrink-0">
                          <Image
                              src={post.screenshotUrl}
                              alt={`Screenshot for post: ${post.title}`}
                              width={150}
                              height={100}
                              className="object-cover rounded-md"
                              data-ai-hint="forum post"
                          />
                      </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6">
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <h3 className="mb-4 text-lg font-semibold font-headline">Source Details</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <DetailItem label="Type" value={source.type} />
                            <DetailItem label="Nature" value={source.nature} />
                            <DetailItem label="Status" value={<Badge variant={source.status === 'Active' ? 'default' : 'destructive'} className={source.status === 'Active' ? 'bg-green-600/20 text-green-400 border-green-600/20' : 'bg-red-600/20 text-red-400 border-red-600/20'}>{source.status}</Badge>} />
                            <DetailItem label="Origin" value={source.origin} />
                            <DetailItem label="Language" value={source.language} />
                            <DetailItem label="Country" value={source.country} />
                            <DetailItem label="Monitoring" value={<Badge variant={source.monitoringStatus === 'Monitored' ? 'secondary' : 'outline'}>{source.monitoringStatus}</Badge>} />
                            <div className="sm:col-span-2">
                                <DetailItem label="Description" value={source.description} />
                            </div>
                            <div className="sm:col-span-2">
                                <DetailItem label="Tags" value={<div className="flex flex-wrap gap-2">{source.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>} />
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <h3 className="mb-4 text-lg font-semibold font-headline">Admin Details</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <DetailItem label="Admin Name" value={source.admin.name} />
                            <DetailItem label="Admin Contact" value={source.admin.contact} />
                        </div>
                        
                        <Separator className="my-6" />

                        <h3 className="mb-4 text-lg font-semibold font-headline">User Metrics</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <DetailItem label="Users" value={formattedMetrics.users} />
                            <DetailItem label="Posts" value={formattedMetrics.posts} />
                            <DetailItem label="Threads" value={formattedMetrics.threads} />
                        </div>
                    </div>
                    <div className="md:col-span-1">
                         <h3 className="mb-4 text-lg font-semibold font-headline">Screenshot</h3>
                        <Image
                            src={source.screenshotUrl}
                            alt={`Screenshot of ${source.name}`}
                            width={600}
                            height={400}
                            className="object-cover border rounded-lg shadow-md aspect-video"
                            data-ai-hint="dark web forum"
                        />
                    </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="urls">
          <SourceUrls urls={source.urls} sourceName={source.name} />
        </TabsContent>
      </Tabs>
    </>
  );
}
