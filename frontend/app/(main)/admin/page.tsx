"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { dataService } from "@/lib/dataService";

export default function AdminPage() {
  const router = useRouter();

  // Estados para Borrado Global
  const [clearLoading, setClearLoading] = useState(false);
  const [clearResult, setClearResult] = useState<string | null>(null);

  // Estados para Borrado por Foro
  const [forums, setForums] = useState<{ id: string; name: string }[]>([]);
  const [selectedForumDelete, setSelectedForumDelete] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteLog, setDeleteLog] = useState<string>("");

  // Estados para Importación de Datos
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importLog, setImportLog] = useState<string[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedForumImport, setSelectedForumImport] = useState<string>("");
  
  // Estados para Añadir Fuente
  const [form, setForm] = useState({
    name: "", description: "", type: "", country: "", language: "", 
    status: "active", author: "", monitored: "NO", user_count: "", 
    post_count: "", thread_count: "", last_member: "", categories: "",
  });
  const [addSourceLoading, setAddSourceLoading] = useState(false);
  const [addSourceError, setAddSourceError] = useState("");

  // Estado para actualizar screenshotUrl de un post
  const [postsForScreenshot, setPostsForScreenshot] = useState<any[]>([]);
  const [selectedForumForScreenshot, setSelectedForumForScreenshot] = useState("");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [screenshotUrlInput, setScreenshotUrlInput] = useState("");
  const [screenshotUpdateMsg, setScreenshotUpdateMsg] = useState("");

  // Cargar posts del foro seleccionado
  useEffect(() => {
    if (!selectedForumForScreenshot) {
      setPostsForScreenshot([]);
      setSelectedPostId("");
      return;
    }
    dataService.getForumPosts(selectedForumForScreenshot)
      .then((data: any) => {
        if (Array.isArray(data)) {
          setPostsForScreenshot(data);
        } else if (Array.isArray(data.posts)) {
          setPostsForScreenshot(data.posts);
        } else {
          setPostsForScreenshot([]);
        }
        setSelectedPostId("");
      });
  }, [selectedForumForScreenshot]);

  useEffect(() => {
    dataService.getForums()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setForums(data.map((f: any) => ({ id: f.id, name: f.name })));
        }
      });
  }, []);

  // Cargar posts al montar el componente
  useEffect(() => {
    dataService.getForumPosts("1") // Using a default forum ID for mock data
      .then((data: any) => {
        if (Array.isArray(data)) {
          setPostsForScreenshot(data);
        } else if (Array.isArray(data.posts)) {
          setPostsForScreenshot(data.posts);
        } else {
          setPostsForScreenshot([]);
        }
      });
  }, []);

  const handleClear = async () => {
    setClearLoading(true);
    setClearResult(null);
    try {
      const data = await dataService.clearAllTables() as any;
      setClearResult(data.detail || data.message || "¡Tablas vaciadas!");
    } catch (e: any) {
      setClearResult(e.message || "Error desconocido");
    } finally {
      setClearLoading(false);
    }
  };

  const handleDeleteForumPosts = async () => {
    if (!selectedForumDelete) return;
    setDeleteLoading(true);
    setDeleteLog("");
    try {
      await dataService.deleteForumPosts(selectedForumDelete);
      setDeleteLog("Entradas eliminadas correctamente.");
    } catch (e: any) {
      setDeleteLog(e.message || "Error desconocido");
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const parseCSV = async (file: File) => {
    if (!selectedForumImport) {
      setImportLog(["Debes seleccionar un foro destino."]);
      return;
    }
    setImportLoading(true);
    setImportLog([]);
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.match(/(?:"[^"]*"|[^,])+/g) || line.split(",");
      if (parts.length < 8) {
        setImportLog((prev) => [...prev, `Línea ${i + 1}: Formato incorrecto`]);
        continue;
      }
      try {
        const [url, title, author_username, content, category, comments, number_comments, date] = parts.map(p => p.replace(/^"|"$/g, ""));
        if (!url || !title || !author_username || !content || !category || !date) {
          setImportLog((prev) => [...prev, `Línea ${i + 1}: Campos obligatorios vacíos`]);
          continue;
        }
        let commentsJson;
        try {
          let fixedComments = comments.replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"');
          commentsJson = JSON.parse(fixedComments);
          if (!Array.isArray(commentsJson)) commentsJson = [];
        } catch {
          commentsJson = [];
        }
        let fixedDate = date.replace(/\+0000$/, "+00:00");
        const payload = {
          forum_id: selectedForumImport,
          url, title, author_username, content, category,
          comments: commentsJson,
          number_comments: Number(number_comments) || 0,
          date: fixedDate,
        };
        await dataService.createForumPost(payload);
        setImportLog((prev) => [...prev, `Línea ${i + 1}: Importada correctamente`]);
      } catch (err) {
        setImportLog((prev) => [...prev, `Línea ${i + 1}: Error inesperado`]);
      }
    }
    setImportLoading(false);
  };

  const handleUpdateScreenshot = async () => {
    if (!selectedPostId || !screenshotUrlInput) return;
    
    // Formatear la ruta para que siempre use barras normales (/)
    const formattedPath = screenshotUrlInput.replace(/\\/g, "/");

    setScreenshotUpdateMsg("");
    try {
      await dataService.updateForumPost(selectedPostId, { screenshotUrl: formattedPath });
      setScreenshotUpdateMsg("Screenshot URL updated successfully.");
    } catch {
      setScreenshotUpdateMsg("Error updating screenshot URL.");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSourceLoading(true);
    setAddSourceError("");
    try {
      let endpoint = "http://127.0.0.1:8000/sources/";
      let payload: any = { ...form, status: form.status === "active" };

      if (form.type === "forum") {
        endpoint = "http://127.0.0.1:8000/forums/";
        payload = {
          ...payload,
          user_count: Number(form.user_count) || 0,
          post_count: Number(form.post_count) || 0,
          thread_count: Number(form.thread_count) || 0,
          categories: form.categories.split(",").map((c) => c.trim()),
        };
      }
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al crear la fuente");
      }
      
      router.push("/sources");
    } catch (err: any) {
      setAddSourceError(err.message);
    } finally {
      setAddSourceLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Añadir Nueva Fuente</CardTitle>
            <CardDescription>
              Completa el formulario para añadir una nueva fuente de datos, como un foro u otro tipo.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAddSource}>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" name="description" value={form.description} onChange={handleFormChange} />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select name="type" value={form.type} onValueChange={v => handleFormSelect("type", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forum">Foro</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input id="country" name="country" value={form.country} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Input id="language" name="language" value={form.language} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="author">Autor</Label>
                  <Input id="author" name="author" value={form.author} onChange={handleFormChange} required />
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select name="status" value={form.status} onValueChange={v => handleFormSelect("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monitored">Monitoreado</Label>
                  <Select name="monitored" value={form.monitored} onValueChange={v => handleFormSelect("monitored", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO">No</SelectItem>
                      <SelectItem value="YES_MANUAL">Sí (Manual)</SelectItem>
                      <SelectItem value="YES_AUTOMATED">Sí (Automatizado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.type === "forum" && (
                  <>
                    <hr className="my-4" />
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Datos del Foro</h3>
                      <div>
                        <Label htmlFor="user_count">Nº Usuarios</Label>
                        <Input id="user_count" name="user_count" type="number" value={form.user_count} onChange={handleFormChange} required />
                      </div>
                      <div>
                        <Label htmlFor="post_count">Nº Posts</Label>
                        <Input id="post_count" name="post_count" type="number" value={form.post_count} onChange={handleFormChange} required />
                      </div>
                      <div>
                        <Label htmlFor="thread_count">Nº Hilos</Label>
                        <Input id="thread_count" name="thread_count" type="number" value={form.thread_count} onChange={handleFormChange} required />
                      </div>
                      <div>
                        <Label htmlFor="last_member">Último Miembro</Label>
                        <Input id="last_member" name="last_member" value={form.last_member} onChange={handleFormChange} />
                      </div>
                       <div>
                        <Label htmlFor="categories">Categorías (separadas por coma)</Label>
                        <Input id="categories" name="categories" value={form.categories} onChange={handleFormChange} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
              <Button type="submit" disabled={addSourceLoading}>{addSourceLoading ? "Guardando..." : "Guardar Fuente"}</Button>
              {addSourceError && <div className="text-sm text-destructive">{addSourceError}</div>}
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importar Posts de Foros</CardTitle>
            <CardDescription>
              Selecciona un foro y sube un archivo CSV para importar posts masivamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Foro Destino</label>
              <Select value={selectedForumImport} onValueChange={setSelectedForumImport}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder="-- Selecciona un foro --" />
                </SelectTrigger>
                <SelectContent>
                  {forums.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed rounded-lg p-6 text-center"
            >
              {csvFile ? <span>{csvFile.name}</span> : <span>Arrastra y suelta un CSV aquí</span>}
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mt-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button
              onClick={() => csvFile && parseCSV(csvFile)}
              disabled={!csvFile || importLoading || !selectedForumImport}
            >
              {importLoading ? "Importando..." : "Importar"}
            </Button>
            {importLog.length > 0 && (
              <div className="w-full">
                <h3 className="font-semibold text-sm">Log de Importación:</h3>
                <ul className="text-xs max-h-40 overflow-y-auto bg-muted p-2 rounded-md">
                  {importLog.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardFooter>
        </Card>
      
        <Card>
          <CardHeader>
            <CardTitle>Borrado Global</CardTitle>
            <CardDescription>
              Esta operación eliminará permanentemente todos los datos de todas las tablas de la base de datos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              <strong>Atención:</strong> Esta acción es irreversible.
            </p>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button
              variant="destructive"
        onClick={handleClear}
              disabled={clearLoading}
            >
              {clearLoading ? "Vaciando..." : "Vaciar todas las tablas"}
            </Button>
            {clearResult && (
              <div className="text-sm font-semibold">
                {clearResult}
              </div>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Borrado por Foro</CardTitle>
            <CardDescription>
              Selecciona un foro para eliminar todas sus entradas (posts) asociadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Foro</label>
              <Select value={selectedForumDelete} onValueChange={setSelectedForumDelete}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder="-- Selecciona un foro --" />
                </SelectTrigger>
                <SelectContent>
                  {forums.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button
              variant="destructive"
              disabled={!selectedForumDelete || deleteLoading}
              onClick={handleDeleteForumPosts}
            >
              {deleteLoading ? "Eliminando..." : "Borrar posts de este foro"}
            </Button>
            {deleteLog && (
              <div className="text-sm font-semibold">
                {deleteLog}
        </div>
      )}
          </CardFooter>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Update Forum Post Screenshot</CardTitle>
            <CardDescription>
              Select a forum, then a forum post and set or update its screenshot path.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Forum</label>
              <Select value={selectedForumForScreenshot} onValueChange={setSelectedForumForScreenshot}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a forum..." />
                </SelectTrigger>
                <SelectContent>
                  {forums.map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>{f.name} (ID: {f.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Forum Post</label>
              <Select value={selectedPostId} onValueChange={setSelectedPostId} disabled={!selectedForumForScreenshot || postsForScreenshot.length === 0}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a post..." />
                </SelectTrigger>
                <SelectContent>
                  {postsForScreenshot.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.url} (ID: {p.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Screenshot Path (local)</label>
              <Input
                value={screenshotUrlInput}
                onChange={e => setScreenshotUrlInput(e.target.value)}
                placeholder="screenshots/miimagen.png"
                disabled={!selectedPostId}
              />
            </div>
            <Button onClick={handleUpdateScreenshot} disabled={!selectedPostId || !screenshotUrlInput}>
              Save Screenshot Path
            </Button>
            {screenshotUpdateMsg && <div className="mt-2 text-sm">{screenshotUpdateMsg}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 