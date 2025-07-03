import { getSourceById, getPostById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PostDetailPage({ params }: { params: { id: string; postId: string } }) {
  const source = getSourceById(params.id);
  const post = getPostById(params.id, params.postId);

  if (!source || !post) {
    notFound();
  }

  return (
    <>
      <div className="flex items-start justify-between">
         <PageHeader
            title={post.title}
            description={`Posted by ${post.author} on ${post.date} in ${source.name}`}
         />
         <div className="flex gap-2 mt-2">
            <Button variant="outline" asChild>
              <Link href={`/sources/${source.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Source
              </Link>
            </Button>
         </div>
      </div>
     
      <Card>
        <CardContent className="p-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold font-headline mb-4">Post Content</h3>
            <p className="text-foreground/80 whitespace-pre-wrap">{post.content}</p>
          </div>
          <div className="md:col-span-1">
             <h3 className="text-lg font-semibold font-headline mb-4">Original Screenshot</h3>
            <Image
                src={post.screenshotUrl}
                alt={`Screenshot for post: ${post.title}`}
                width={600}
                height={400}
                className="rounded-lg border object-cover aspect-video shadow-md"
                data-ai-hint="forum post content"
              />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
