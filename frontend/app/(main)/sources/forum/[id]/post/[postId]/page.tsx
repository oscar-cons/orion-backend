"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Copy, ArrowRight, Sparkles, ArrowLeft, ZoomIn, ZoomOut, Expand, RotateCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { dataService } from "@/lib/dataService";

export default function ForumPostDetailPage() {
  const params = useParams<{ id: string; postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [postIds, setPostIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Estados para el resumen de IA
  const [summary, setSummary] = useState<string | null>(null);
  const [tags, setTags] = useState<string[] | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [hasInitialAISummary, setHasInitialAISummary] = useState(false);

  // Estados para el visor de imágenes
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageWrapperRef = React.useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel(prev => prev + 0.1);
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.2, prev - 0.1));
  const handleZoomReset = () => setZoomLevel(1);
  const handleFullscreen = () => {
    if (imageWrapperRef.current) {
      imageWrapperRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };

  // Cargar post y resumen/tags iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [postData, postListData] = await Promise.all([
          dataService.getForumPost(params.postId),
          dataService.getForumPosts(params.id)
        ]);
        
        setPost(postData);
        setSummary((postData as any)?.ai_summary || null);
        setTags((postData as any)?.ai_tags || null);
        setHasInitialAISummary(!!(postData as any)?.ai_summary);
        
        // Handle post list data
        if (Array.isArray(postListData)) {
          const ids = postListData.map((p: any) => p.id);
          setPostIds(ids);
          const index = ids.findIndex((id: string) => id === params.postId);
          setCurrentIndex(index);
        } else {
          setPostIds([]);
          setCurrentIndex(-1);
        }
      } catch (error) {
        console.error('Error loading post data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, params.postId]);

  const navigateToNextPost = () => {
    if (currentIndex > -1 && currentIndex < postIds.length - 1) {
      const nextPostId = postIds[currentIndex + 1];
      router.push(`/sources/forum/${params.id}/post/${nextPostId}`);
    }
  };

  async function handleScreenshot() {
    setScreenshotLoading(true);
    setScreenshotError(null);
    setZoomLevel(1); // Reset zoom on new screenshot
    setShowScreenshot(true);
    try {
      const blob = await dataService.getScreenshot(params.postId);
      setScreenshotUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setScreenshotError("Could not load screenshot.");
      setScreenshotUrl(null);
    } finally {
      setScreenshotLoading(false);
    }
  }

  // Generar o regenerar resumen
  const handleGenerateSummary = async (force = false) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      // 1. Generate summary using dataService
      const summaryData = await dataService.summarizePost(params.postId, force);
      
      // 2. Update the post with new summary
      const updatedPost = await dataService.updateForumPost(params.postId, {
        ai_summary: (summaryData as any).summary,
        ai_tags: (summaryData as any).tags
      });
      
      setSummary((updatedPost as any)?.ai_summary || null);
      setTags((updatedPost as any)?.ai_tags || null);
      setHasInitialAISummary(!!(updatedPost as any)?.ai_summary);
    } catch (e: any) {
      setSummaryError(e.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  function splitContentAndReactions(text: string) {
    if (!text) return { content: "", reactions: "" };
    let clean = text.replace(/^"+|"+$/g, "");
    clean = clean.replace(/\\n/g, "\n").replace(/\r/g, "");
    const match = clean.match(/Reactions:([\s\S]*)$/i);
    let reactions = "";
    if (match) {
      reactions = match[1].trim();
      clean = clean.slice(0, match.index).trim();
    }
    return { content: clean.trim(), reactions };
  }

  function parsePostHeader(text: string) {
    if (!text) return { meta: {}, body: text, warning: false };
    let clean = text.replace(/^"+|"+$/g, "").replace(/\\n/g, "\n").replace(/\r/g, "");
    const lines = clean.split("\n").map(l => l.trim()).filter(Boolean);
    let meta: any = { user: "", role: "", date: "", tags: [], number: "" };
    let i = 0;
    let foundMeta = false;
    if (lines[i] && !/^#/.test(lines[i]) && !/at|AM|PM|Yesterday|Today|[0-9]{4}/i.test(lines[i]) && !/thread|author|starter|user|mod|admin|staff|member|guest|vip|[A-Z ]{3,}/i.test(lines[i])) {
      meta.user = lines[i];
      i++;
      foundMeta = true;
    }
    if (lines[i] && /at|AM|PM|Yesterday|Today|[0-9]{4}/i.test(lines[i])) {
      meta.date = lines[i];
      i++;
      foundMeta = true;
    }
    if (lines[i] && (/^[A-Z ]+$/.test(lines[i]) || /user|mod|admin|staff|member|guest|vip/i.test(lines[i]))) {
      meta.role = lines[i];
      i++;
      foundMeta = true;
    }
    while (lines[i] && (lines[i].toUpperCase() === lines[i] || lines[i].startsWith("#") || /thread|author|starter/i.test(lines[i]))) {
      if (lines[i].startsWith("#")) meta.number = lines[i];
      else meta.tags.push(lines[i]);
      i++;
      foundMeta = true;
    }
    const body = lines.slice(i).join("\n").trim();
    return { meta, body, warning: !foundMeta };
  }

  const hasNextPost = currentIndex > -1 && currentIndex < postIds.length - 1;
  const hasPrevPost = currentIndex > 0;

  const navigateToPrevPost = () => {
    if (currentIndex > 0) {
      const prevPostId = postIds[currentIndex - 1];
      router.push(`/sources/forum/${params.id}/post/${prevPostId}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando post...</div>;
  }
  if (!post) {
    return <div className="p-8 text-center text-red-500">Post no encontrado.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <PageHeader
          title={post.title}
          description={`Post de ${post.author_username} en la categoría ${post.category}`}
        />
      </div>
      <div className="flex gap-4 mb-4">
        <Button asChild variant="outline">
          <Link href={`/sources/forum/${params.id}`}>Volver al foro</Link>
        </Button>
        <Button variant="secondary" onClick={handleScreenshot}>
          Screenshot
        </Button>
        <Button variant="default" onClick={navigateToPrevPost} disabled={!hasPrevPost}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior Post
        </Button>
        <Button variant="default" onClick={navigateToNextPost} disabled={!hasNextPost}>
          Siguiente Post
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      
      <Tabs defaultValue="post-info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="post-info">Información del Post</TabsTrigger>
          <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>
          <TabsTrigger value="more-details">Más Detalles</TabsTrigger>
        </TabsList>

        <TabsContent value="post-info">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                <span className="text-muted-foreground">por {post.author_username}</span>
                <span className="mx-2">|</span>
                <span className="text-muted-foreground">{new Date(post.date).toLocaleString()}</span>
                <span className="mx-2">|</span>
                <span className="text-muted-foreground">Categoría: {post.category}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Contenido</h4>
                {(() => {
                  const { content: mainContent, reactions } = splitContentAndReactions(post.content);
                  const { meta, body, warning } = parsePostHeader(mainContent);
                  return <>
                    {(meta.user || meta.role || meta.date || (meta.tags && meta.tags.length) || meta.number) && (
                      <div className="flex items-center gap-2 mb-2">
                        {meta.user && <span className="font-bold">{meta.user}</span>}
                        {meta.role && <span className="text-xs bg-muted px-2 py-0.5 rounded">{meta.role}</span>}
                        {meta.date && <span className="text-xs text-muted-foreground">{meta.date}</span>}
                        {meta.tags && meta.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{tag}</span>
                        ))}
                        {meta.number && <span className="text-xs text-muted-foreground">{meta.number}</span>}
                      </div>
                    )}
                    <div className="bg-muted rounded p-3 whitespace-pre-wrap text-foreground/90 text-sm border">
                      {body}
                    </div>
                    {warning && (
                      <div className="mt-2 text-xs text-yellow-600">Formato no reconocido, mostrando texto plano.</div>
                    )}
                    {reactions && (
                      <div className="mt-2 p-2 bg-muted/50 rounded border text-xs text-muted-foreground">
                        <b>Reactions:</b> {reactions}
                      </div>
                    )}
                  </>;
                })()}
              </div>
              <div>
                <h4 className="font-semibold mb-1">URL</h4>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-xs bg-muted rounded px-2 py-1 border text-sm select-all">{post.url}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(post.url)}
                    title="Copiar URL"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Comentarios ({post.number_comments})</h4>
                {(() => {
                  let commentsArr = post.comments;
                  if (typeof commentsArr === "string") {
                    try {
                      commentsArr = JSON.parse(commentsArr);
                    } catch {
                      commentsArr = [];
                    }
                  }
                  if (!Array.isArray(commentsArr)) commentsArr = [];
                  return commentsArr.length > 0 ? (
                    <ul className="space-y-2">
                      {commentsArr.map((c: any, idx: number) => (
                        <li key={idx} className="border rounded p-2 bg-muted/50">
                          <div className="font-medium">{c.author || "Sin autor"}</div>
                          <div className="text-sm whitespace-pre-wrap text-foreground/90 border-l-2 pl-2 mt-1">
                            {(() => {
                              const { content: commentContent, reactions: commentReactions } = splitContentAndReactions(c.content);
                              const { meta, body, warning } = parsePostHeader(commentContent);
                              return <>
                                {(meta.user || meta.role || meta.date || (meta.tags && meta.tags.length) || meta.number) && (
                                  <div className="flex items-center gap-2 mb-1">
                                    {meta.user && <span className="font-bold">{meta.user}</span>}
                                    {meta.role && <span className="text-xs bg-muted px-2 py-0.5 rounded">{meta.role}</span>}
                                    {meta.date && <span className="text-xs text-muted-foreground">{meta.date}</span>}
                                    {meta.tags && meta.tags.map((tag: string, idx: number) => (
                                      <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{tag}</span>
                                    ))}
                                    {meta.number && <span className="text-xs text-muted-foreground">{meta.number}</span>}
                                  </div>
                                )}
                                {body}
                                {warning && (
                                  <div className="mt-1 text-xs text-yellow-600">Formato no reconocido, mostrando texto plano.</div>
                                )}
                                {commentReactions && (
                                  <div className="mt-1 text-xs text-muted-foreground"><b>Reactions:</b> {commentReactions}</div>
                                )}
                              </>;
                            })()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted-foreground">Sin comentarios</div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-summary">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
              <CardDescription>
                Resumen y tags generados por IA para un análisis rápido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="flex items-center justify-center h-24">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  <span className="ml-2">Generando...</span>
                </div>
              ) : summaryError ? (
                <div className="flex flex-col items-center gap-4">
                <div className="text-destructive">{summaryError}</div>
                  <Button onClick={() => handleGenerateSummary(true)} variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              ) : summary ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Resumen</h3>
                    <p className="text-sm text-muted-foreground">{summary}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button onClick={() => handleGenerateSummary(true)} variant="outline">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-muted-foreground">Aún no se ha generado un resumen para este post.</p>
                  <Button onClick={() => handleGenerateSummary(false)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar Resumen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="more-details">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>More Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Post ID:</span>
                <span className="truncate">{post.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Forum ID:</span>
                <span className="truncate">{post.forum_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Category:</span>
                <span className="truncate">{post.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Date:</span>
                <span className="truncate">{new Date(post.date).toISOString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Comments:</span>
                <span>{post.number_comments}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Screenshot Path:</span>
                <span>{post.screenshotUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-muted-foreground">Country:</span>
                <span>{post.country}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

{/* Visor de Imágenes Mejorado */}
<Dialog open={showScreenshot} onOpenChange={setShowScreenshot}>
<DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 gap-0">
  <DialogHeader className="p-2 border-b flex-row flex items-center justify-between space-y-0">
    <DialogTitle className="pl-2">Screenshot</DialogTitle>
    <div className="flex-1 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In"><ZoomIn className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out"><ZoomOut className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" onClick={handleZoomReset} title="Reset Zoom"><RotateCw className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" onClick={handleFullscreen} title="Fullscreen"><Expand className="h-5 w-5" /></Button>
      </div>
      {/* El botón de cierre de Dialog ya está alineado a la derecha por defecto */}
    </div>
  </DialogHeader>
  <div className="flex-1 p-2 flex items-center justify-center overflow-auto bg-muted/20" ref={imageWrapperRef}>
    {screenshotLoading && (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-5 w-5 animate-spin" />
        <span>Loading screenshot...</span>
      </div>
    )}
    {screenshotError && <div className="text-red-500">{screenshotError}</div>}
    {screenshotUrl && (
      <div className="flex items-center justify-center h-full w-full">
        <img
          src={screenshotUrl}
          alt="Forum Post Screenshot"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
          className="transition-transform duration-200 max-w-full max-h-full object-contain"
        />
      </div>
    )}
  </div>
</DialogContent>
</Dialog>
</div>
);
} 
