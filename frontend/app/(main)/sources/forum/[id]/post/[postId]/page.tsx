"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Copy } from "lucide-react";

export default function ForumPostDetailPage() {
  const params = useParams<{ id: string; postId: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/forum-posts/${params.postId}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.postId]);

  async function handleScreenshot() {
    setScreenshotLoading(true);
    setScreenshotError(null);
    setShowScreenshot(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/forum-posts/${params.postId}/screenshot`);
      if (!res.ok) throw new Error("Failed to fetch screenshot");
      const blob = await res.blob();
      setScreenshotUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setScreenshotError("Could not load screenshot.");
      setScreenshotUrl(null);
    } finally {
      setScreenshotLoading(false);
    }
  }

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
        <Button variant="outline" asChild>
          <Link href={`/sources/forum/${params.id}`}>
            Volver al foro
          </Link>
        </Button>
      </div>
      <div className="flex gap-4 mb-4">
        <Button asChild variant="outline">
          <Link href={`/sources/forum/${params.id}`}>Back to Forum</Link>
        </Button>
        <Button variant="secondary" onClick={handleScreenshot}>
          Screenshot
        </Button>
      </div>
      <Card>
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
      {/* Screenshot Popup */}
      {showScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowScreenshot(false)}
        >
          <div
            className="bg-white rounded shadow-lg p-4 max-w-full max-h-full flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between w-full mb-2">
              <span className="font-semibold">Screenshot</span>
              <Button size="sm" variant="ghost" onClick={() => setShowScreenshot(false)}>
                Close
              </Button>
            </div>
            {screenshotLoading && <div>Loading screenshot...</div>}
            {screenshotError && <div className="text-red-500">{screenshotError}</div>}
            {screenshotUrl && (
              <img
                src={screenshotUrl}
                alt="Forum Post Screenshot"
                className="max-w-[80vw] max-h-[70vh] border rounded"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
