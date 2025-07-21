"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPage() {
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

  useEffect(() => {
    // Cargar foros para ambos selectores
    fetch("http://127.0.0.1:8000/forums")
      .then(res => res.json())
      .then(data => {
        setForums(data.map((f: any) => ({ id: f.id, name: f.name })));
      });
  }, []);

  const handleClear = async () => {
    setClearLoading(true);
    setClearResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/admin/clear-all-tables", { method: "DELETE" });
      if (!res.ok) throw new Error("Error al vaciar las tablas");
      const data = await res.json();
      setClearResult(data.detail || "¡Tablas vaciadas!");
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
      const res = await fetch(`http://127.0.0.1:8000/delete-forum-posts?forum_id=${selectedForumDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteLog("Entradas eliminadas correctamente.");
      } else {
        const errorData = await res.json().catch(() => ({ detail: "Error al eliminar las entradas." }));
        setDeleteLog(errorData.detail);
      }
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
        const res = await fetch("http://127.0.0.1:8000/forum-posts/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setImportLog((prev) => [...prev, `Línea ${i + 1}: Importada correctamente`]);
        } else {
          setImportLog((prev) => [...prev, `Línea ${i + 1}: Error al importar (${res.status})`]);
        }
      } catch (err) {
        setImportLog((prev) => [...prev, `Línea ${i + 1}: Error inesperado`]);
      }
    }
    setImportLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      <div className="grid gap-6">
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
      </div>
    </div>
  );
} 