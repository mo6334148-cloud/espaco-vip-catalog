import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { usernameToEmail } from "@/lib/admin-login";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso administrativo | Espaço VIP" },
      { name: "description", content: "Área restrita do Espaço VIP Cabelo." },
      { property: "og:title", content: "Acesso administrativo — Espaço VIP" },
      { property: "og:description", content: "Área restrita do Espaço VIP Cabelo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(user), password });
    setLoading(false);
    if (error) return setError("Usuário ou senha incorretos.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-gold/40 bg-card p-7 shadow-card">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-gold"><Lock className="h-5 w-5" /></span>
        <h1 className="mt-5 font-display text-3xl">Área administrativa</h1>
        <p className="mt-1 text-sm text-muted-foreground">Espaço VIP</p>
        <div className="mt-6 grid gap-4">
          <div className="grid gap-1.5"><Label htmlFor="user">Usuário</Label><Input id="user" className="h-12" autoComplete="username" autoCapitalize="none" value={user} onChange={(e) => setUser(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="password">Senha</Label><Input id="password" type="password" className="h-12" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="h-12" disabled={loading || !user || !password}>{loading && <Loader2 className="animate-spin" />} Entrar</Button>
        </div>
      </form>
    </div>
  );
}
