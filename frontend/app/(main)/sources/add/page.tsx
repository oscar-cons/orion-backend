"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AddSourcePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    country: "",
    language: "",
    status: "active",
    author: "",
    monitored: "NO",
    user_count: "",
    post_count: "",
    thread_count: "",
    last_member: "",
    categories: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let endpoint = "http://127.0.0.1:8000/sources/";
      let payload = { ...form, status: form.status === "active" };

      if (form.type === "forum") {
        endpoint = "http://127.0.0.1:8000/forums/";
        payload = {
          ...payload,
          user_count: Number(form.user_count),
          post_count: Number(form.post_count),
          thread_count: Number(form.thread_count),
          last_member: form.last_member,
          categories: form.categories.split(",").map((c) => c.trim()),
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al crear la fuente");
      router.push("/sources");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Añadir nueva Source</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        <Textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
        <Select value={form.type} onValueChange={v => handleSelect("type", v)}>
          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="forum">Forum</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Input name="country" placeholder="País" value={form.country} onChange={handleChange} required />
        <Input name="language" placeholder="Idioma" value={form.language} onChange={handleChange} required />
        <Input name="author" placeholder="Autor" value={form.author} onChange={handleChange} required />
        <Select value={form.status} onValueChange={v => handleSelect("status", v)}>
          <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={form.monitored} onValueChange={v => handleSelect("monitored", v)}>
          <SelectTrigger><SelectValue placeholder="Monitoreado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="NO">No</SelectItem>
            <SelectItem value="YES_MANUAL">Sí (Manual)</SelectItem>
            <SelectItem value="YES_AUTOMATED">Sí (Automatizado)</SelectItem>
          </SelectContent>
        </Select>

        {form.type === "forum" && (
          <>
            <Input name="user_count" placeholder="Usuarios" value={form.user_count} onChange={handleChange} required />
            <Input name="post_count" placeholder="Posts" value={form.post_count} onChange={handleChange} required />
            <Input name="thread_count" placeholder="Threads" value={form.thread_count} onChange={handleChange} required />
            <Input name="last_member" placeholder="Último miembro" value={form.last_member} onChange={handleChange} />
            <Input name="categories" placeholder="Categorías (separadas por coma)" value={form.categories} onChange={handleChange} />
          </>
        )}

        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
      </form>
    </div>
  );
} 