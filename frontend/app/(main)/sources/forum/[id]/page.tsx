"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Copy, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

// Utilidades para copiar al portapapeles
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function ForumDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posts");
  const [forum, setForum] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/forums/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setForum(data);
        setLoading(false);
      });
    fetch(`http://127.0.0.1:8000/forums/${params.id}/posts`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
      });
  }, [params.id]);

  if (loading || !forum) {
    return <div className="p-8 text-center">Cargando foro...</div>;
  }

  // Filtrar posts por búsqueda
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.content || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-start justify-between">
        <PageHeader
          title={forum.name}
          description={`Detailed profile for forum: ${forum.name}.`}
        />
        <div className="flex gap-2 mt-2">
          <Button variant="outline" asChild>
            <Link href="/sources/forum">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to forums
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="urls">URLs</TabsTrigger>
          </TabsList>
          {activeTab === "posts" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground top-1/2 left-3" />
                <Input
                  placeholder="Search posts..."
                  className="w-64 pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced
              </Button>
            </div>
          )}
        </div>
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Latest Posts</CardTitle>
              <CardDescription>Recent posts from {forum.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No posts found.</div>
              ) : (
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border">Título</th>
                      <th className="px-2 py-1 border">Autor</th>
                      <th className="px-2 py-1 border">Fecha</th>
                      <th className="px-2 py-1 border">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map(post => (
                      <tr key={post.id} className="hover:bg-muted/30">
                        <td className="border px-2 py-1">{post.title}</td>
                        <td className="border px-2 py-1">{post.author_username}</td>
                        <td className="border px-2 py-1">{new Date(post.date).toLocaleString()}</td>
                        <td className="border px-2 py-1">
                          <Button size="sm" variant="outline" onClick={() => router.push(`/sources/forum/${params.id}/post/${post.id}`)}>
                            Ver detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                  <h3 className="mb-4 text-lg font-semibold font-headline">Forum Details</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <div className="text-base text-foreground">{forum.name}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <div className="text-base text-foreground">{forum.description}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <div className="text-base text-foreground">{forum.type}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nature</p>
                      <div className="text-base text-foreground">{forum.nature}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Country</p>
                      <div className="text-base text-foreground">{forum.country}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant={forum.status ? "default" : "destructive"}>{forum.status ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Language</p>
                      <div className="text-base text-foreground">{forum.language}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Owner</p>
                      <div className="text-base text-foreground">{forum.owner}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Author</p>
                      <div className="text-base text-foreground">{forum.author}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monitored</p>
                      <Badge variant="secondary">{forum.monitored}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Discovery Source</p>
                      <div className="text-base text-foreground">{forum.discovery_source}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Member</p>
                      <div className="text-base text-foreground">{forum.last_member}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Users</p>
                      <div className="text-base text-foreground">{forum.user_count}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Posts</p>
                      <div className="text-base text-foreground">{forum.post_count}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Threads</p>
                      <div className="text-base text-foreground">{forum.thread_count}</div>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <h3 className="mb-4 text-lg font-semibold font-headline">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {(forum.categories || []).map((cat: string) => (
                      <Badge key={cat} variant="outline">{cat}</Badge>
                    ))}
                  </div>
                  <h3 className="mb-4 text-lg font-semibold font-headline">Associated Domains</h3>
                  <div className="flex flex-wrap gap-2">
                    {(forum.associated_domains || []).map((domain: string) => (
                      <Badge key={domain} variant="outline">{domain}</Badge>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-1">
                  <h3 className="mb-4 text-lg font-semibold font-headline">Screenshot</h3>
                  {forum.screenshotUrl ? (
                    <Image
                      src={forum.screenshotUrl}
                      alt={`Screenshot of ${forum.name}`}
                      width={600}
                      height={400}
                      className="object-cover border rounded-lg shadow-md aspect-video"
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">No screenshot</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="urls">
          <Card>
            <CardHeader>
              <CardTitle>Forum URLs</CardTitle>
              <CardDescription>Associated URLs for {forum.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(forum.urls || []).map((url: string) => (
                  <li key={url} className="flex items-center gap-2">
                    <span className="truncate max-w-xs">{url}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(url)}
                      title="Copiar URL"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
                {(!forum.urls || forum.urls.length === 0) && (
                  <li className="text-muted-foreground">No URLs found.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
