import { getSourceById, getSourceContent, Source } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

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
  const source = getSourceById(params.id);

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
     

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="content">Latest Content</TabsTrigger>
        </TabsList>
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
                                <DetailItem label="URLs" value={source.urls.map(url => <a href={url} key={url} className="block text-accent hover:underline" target="_blank" rel="noopener noreferrer">{url}</a>)} />
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
                            <DetailItem label="Users" value={source.userMetrics.users.toLocaleString()} />
                            <DetailItem label="Posts" value={source.userMetrics.posts.toLocaleString()} />
                            <DetailItem label="Threads" value={source.userMetrics.threads.toLocaleString()} />
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
        <TabsContent value="content">
          <Card>
            <CardHeader>
                <CardTitle>Latest Posts</CardTitle>
                <CardDescription>Recent activity scraped from {source.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.map(post => (
                <div key={post.id} className="p-4 border rounded-lg bg-card/50">
                    <h4 className="font-semibold text-primary-foreground">{post.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>by {post.author}</span>
                        <span>&bull;</span>
                        <span>{post.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/80">{post.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
