import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { catalogCategories, fetchCatalogItems } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel | Espaço VIP" },
      { name: "description", content: "Painel administrativo do Espaço VIP." },
      { property: "og:title", content: "Painel | Espaço VIP" },
      { property: "og:description", content: "Painel administrativo do Espaço VIP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const items = useQuery({ queryKey: ["catalog-items"], queryFn: fetchCatalogItems });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(catalogCategories[0]);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function signOut() {
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim()) return toast.error("Informe o nome e escolha uma foto.");
    setSaving(true);
    const path = `${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
    const up = await supabase.storage.from("catalog").upload(path, file, { contentType: file.type });
    if (up.error) { setSaving(false); return toast.error("Não foi possível enviar a foto."); }
    const { error } = await supabase.from("catalog_items").insert({
      name: name.trim(), description: description.trim(), price_label: price.trim() || null, category, image_url: path,
    });
    setSaving(false);
    if (error) return toast.error("Não foi possível salvar.");
    toast.success("Adicionado ao catálogo!");
    setName(""); setDescription(""); setPrice(""); setFile(null);
    (e.target as HTMLFormElement).reset();
    queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
  }

  async function remove(id: string, path: string) {
    if (!confirm("Remover este item do catálogo?")) return;
    await supabase.from("catalog_items").delete().eq("id", id);
    await supabase.storage.from("catalog").remove([path]);
    queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <span className="font-display text-xl">Painel Espaço VIP</span>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut /> Sair</Button>
        </div>
      </header>
      <main className="mx-auto grid max-w-2xl gap-8 px-4 py-8">
        <form onSubmit={add} className="grid gap-4 rounded-lg border border-gold/40 bg-card p-5 shadow-card">
          <h1 className="font-display text-2xl">Adicionar ao catálogo</h1>
          <div className="grid gap-1.5"><Label htmlFor="photo">Foto</Label><Input id="photo" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          {file && <img src={URL.createObjectURL(file)} alt="Prévia" className="h-32 w-32 rounded-md object-cover" />}
          <div className="grid gap-1.5"><Label htmlFor="n">Nome</Label><Input id="n" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="d">Descrição</Label><Textarea id="d" maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="p">Preço <span className="text-muted-foreground">(opcional)</span></Label><Input id="p" maxLength={60} placeholder="Ex.: R$ 50,00" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div className="grid gap-1.5">
            <Label htmlFor="c">Categoria</Label>
            <select id="c" value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              {catalogCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Button type="submit" size="lg" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <ImagePlus />} Adicionar</Button>
        </form>

        <section className="grid gap-3">
          <h2 className="font-display text-2xl">Itens adicionados</h2>
          {items.isLoading && <Loader2 className="animate-spin text-primary" />}
          {items.data?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item ainda.</p>}
          {items.data?.map((it) => (
            <div key={it.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <img src={it.imageSrc} alt={it.name} className="h-16 w-16 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase text-gold">{it.category}</p>
                <p className="truncate font-semibold">{it.name}</p>
                {it.price_label && <p className="text-sm text-primary">{it.price_label}</p>}
              </div>
              <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remove(it.id, it.image_url)}><Trash2 /></Button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
