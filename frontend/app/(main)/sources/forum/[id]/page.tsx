"use client";

/**
 * ForumDetailPage component displays detailed information about a forum,
 * including tabs for Posts, Profile, and URLs.
 * 
 * Usage:
 * Place this component in a Next.js app page under the appropriate route (e.g., /sources/forum/[id])
 * and ensure the backend API at `http://127.0.0.1:8000/forums/{id}` and related endpoints are available.
 * 
 * The "Profile" tab shows forum details. 
 * Fix included here to correctly display forum details in the Profile tab.
 */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trash,
  ArrowLeft,
  Copy,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dataService } from "@/lib/dataService";

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

  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [deletedPostIds, setDeletedPostIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [forumData, postsData] = await Promise.all([
          dataService.getForum(params.id),
          dataService.getForumPosts(params.id)
        ]);
        
        setForum(forumData);
        setPosts(Array.isArray(postsData) ? postsData : []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading forum data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  if (loading || !forum) {
    return <div className="p-8 text-center">Cargando foro...</div>;
  }

  const filteredPosts = Array.isArray(posts) ? posts.filter(
    (post) =>
      (post.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.content || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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

      {/* Confirmation Dialog */}
      {postToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-black bg-opacity-70 rounded-lg p-6 shadow-md w-full max-w-sm">
            <p className="mb-4 text-sm">
              ¿Estás seguro de que deseas eliminar este post?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPostToDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await dataService.deleteForumPost(postToDelete);
                    setDeletedPostIds((prev) => [...prev, postToDelete]);
                    setTimeout(() => {
                      setPosts((prev) => Array.isArray(prev) ? prev.filter((p) => p.id !== postToDelete) : []);
                    }, 600);
                  } catch (error) {
                    console.error('Error deleting post:', error);
                    alert('Error deleting post');
                  }
                  setPostToDelete(null);
                }}
              >
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      <Tabs
        defaultValue="posts"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-4"
      >
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="text-center text-muted-foreground py-8">
                  No posts found.
                </div>
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
                    {filteredPosts.map((post) => (
                      <tr
                        key={post.id}
                        className={`hover:bg-muted/30 ${
                          deletedPostIds.includes(post.id) ? "bg-red-100" : ""
                        }`}
                      >
                        <td className="border px-2 py-1">{post.title}</td>
                        <td className="border px-2 py-1">{post.author_username}</td>
                        <td className="border px-2 py-1">
                          {new Date(post.date).toLocaleString()}
                        </td>
                        <td className="border px-2 py-1">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/sources/forum/${params.id}/post/${post.id}`
                                )
                              }
                            >
                              Ver detalle
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPostToDelete(post.id)}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==== FIXED PROFILE TAB: Show forum details here ==== */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Forum Profile</CardTitle>
              <CardDescription>Details about the forum.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>ID:</strong> {forum.id}
              </p>
              <p>
                <strong>Name:</strong> {forum.name}
              </p>
              <p>
                <strong>Description:</strong> {forum.description || "No description"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {forum.created_at
                  ? new Date(forum.created_at).toLocaleString()
                  : "Unknown"}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {forum.updated_at
                  ? new Date(forum.updated_at).toLocaleString()
                  : "Unknown"}
              </p>
              {/* Add other forum details as needed */}
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
                      onClick={() => copyToClipboard(url)}
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
