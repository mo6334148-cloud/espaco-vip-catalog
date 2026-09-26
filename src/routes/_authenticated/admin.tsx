import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ptBR } from "date-fns/locale";
import { parseISO } from "date-fns";
import { CalendarDays, Check, Loader2, LogOut, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  type AppointmentStatus,
  errorMessage,
  formatCents,
  formatDuration,
  formatLongDate,
  formatPhone,
  shortTime,
  statusLabels,
  toDateKey,
  weekdayLabels,
} from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo | Espaço VIP" },
      { name: "description", content: "Gerencie agendamentos, serviços e horários do Espaço VIP." },
      { property: "og:title", content: "Painel — Espaço VIP" },
      { property: "og:description", content: "Área restrita do Espaço VIP Cabelo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const statusStyles: Record<AppointmentStatus, string> = {
  pendente: "bg-gold/15 text-foreground border-gold/40",
  confirmado: "bg-primary/15 text-foreground border-primary/40",
  cancelado: "bg-muted text-muted-foreground border-border line-through",
  concluido: "bg-secondary text-foreground border-border",
};

function useCatalog() {
  return useQuery({
    queryKey: ["admin-catalog"],
    queryFn: async () => {
      const [s, p, ps, h, st] = await Promise.all([
        supabase.from("services").select("*").order("sort_order"),
        supabase.from("professionals").select("*").order("name"),
        supabase.from("professional_services").select("*"),
        supabase.from("business_hours").select("*").order("weekday"),
        supabase.from("salon_settings").select("*").eq("id", 1).maybeSingle(),
      ]);
      const err = s.error ?? p.error ?? ps.error ?? h.error ?? st.error;
      if (err) throw err;
      return { services: s.data ?? [], professionals: p.data ?? [], links: ps.data ?? [], hours: h.data ?? [], settings: st.data };
    },
  });
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return !!data;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isAdmin.isLoading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAdmin.data)
    return (
      <div className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="font-display text-3xl">Acesso não autorizado</h1>
          <p className="mt-2 text-sm text-muted-foreground">Esta área é exclusiva da administração.</p>
          <Button className="mt-6" onClick={signOut}>Sair</Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div>
            <p className="font-display text-xl font-semibold leading-none">Espaço VIP</p>
            <p className="text-xs text-muted-foreground">Painel administrativo</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut /> Sair</Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Tabs defaultValue="agenda">
          <div className="scrollbar-none -mx-4 overflow-x-auto px-4">
            <TabsList className="w-max">
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="novo">Novo agendamento</TabsTrigger>
              <TabsTrigger value="bloqueios">Bloqueios</TabsTrigger>
              <TabsTrigger value="servicos">Serviços</TabsTrigger>
              <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
              <TabsTrigger value="funcionamento">Funcionamento</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="agenda" className="mt-6"><AgendaTab /></TabsContent>
          <TabsContent value="novo" className="mt-6"><NewAppointmentTab /></TabsContent>
          <TabsContent value="bloqueios" className="mt-6"><BlocksTab /></TabsContent>
          <TabsContent value="servicos" className="mt-6"><ServicesTab /></TabsContent>
          <TabsContent value="profissionais" className="mt-6"><ProfessionalsTab /></TabsContent>
          <TabsContent value="funcionamento" className="mt-6"><HoursTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ---------------- Agenda ---------------- */

function AgendaTab() {
  const catalog = useCatalog();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"dia" | "proximos">("dia");
  const [date, setDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [pro, setPro] = useState("");
  const [svc, setSvc] = useState("");
  const dateKey = toDateKey(date);
  const todayKey = toDateKey(new Date());

  const appts = useQuery({
    queryKey: ["appointments", view, dateKey, pro, svc],
    queryFn: async () => {
      let q = supabase.from("appointments").select("*").order("appointment_date").order("start_time");
      q = view === "dia" ? q.eq("appointment_date", dateKey) : q.gte("appointment_date", todayKey).in("status", ["pendente", "confirmado"]).limit(100);
      if (pro) q = q.eq("professional_id", pro);
      if (svc) q = q.eq("service_id", svc);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const monthStart = toDateKey(new Date(month.getFullYear(), month.getMonth(), 1));
  const monthEnd = toDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const monthDays = useQuery({
    queryKey: ["appointments-month", monthStart, pro, svc],
    queryFn: async () => {
      let q = supabase.from("appointments").select("appointment_date").gte("appointment_date", monthStart).lte("appointment_date", monthEnd).in("status", ["pendente", "confirmado"]);
      if (pro) q = q.eq("professional_id", pro);
      if (svc) q = q.eq("service_id", svc);
      const { data, error } = await q;
      if (error) throw error;
      return [...new Set(data.map((d) => d.appointment_date))].map((d) => parseISO(d));
    },
  });

  async function setStatus(id: string, status: AppointmentStatus) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return void toast.error(errorMessage(error));
    toast.success(`Agendamento ${statusLabels[status].toLowerCase()}`);
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["appointments-month"] });
  }

  const serviceName = (id: string) => catalog.data?.services.find((s) => s.id === id)?.name ?? "—";
  const proName = (id: string) => catalog.data?.professionals.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-2 shadow-card">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={date}
            month={month}
            onMonthChange={setMonth}
            onSelect={(d) => { if (d) { setDate(d); setView("dia"); } }}
            modifiers={{ booked: monthDays.data ?? [] }}
            modifiersClassNames={{ booked: "[&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:rounded-full [&>button]:after:bg-primary [&>button]:relative" }}
            className="mx-auto p-2"
          />
        </div>
        <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
          <div className="grid gap-1.5"><Label>Profissional</Label>
            <select className={selectClass} value={pro} onChange={(e) => setPro(e.target.value)}>
              <option value="">Todas</option>
              {catalog.data?.professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5"><Label>Procedimento</Label>
            <select className={selectClass} value={svc} onChange={(e) => setSvc(e.target.value)}>
              <option value="">Todos</option>
              {catalog.data?.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button size="sm" variant={view === "dia" && dateKey === todayKey ? "default" : "secondary"} onClick={() => { setDate(new Date()); setMonth(new Date()); setView("dia"); }}>Hoje</Button>
          <Button size="sm" variant={view === "proximos" ? "default" : "secondary"} onClick={() => setView("proximos")}>Próximos</Button>
          <Label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <Input type="date" className="h-9 w-auto" value={dateKey} onChange={(e) => { if (e.target.value) { const d = parseISO(e.target.value); setDate(d); setMonth(d); setView("dia"); } }} />
          </Label>
        </div>
        <h2 className="mb-4 font-display text-2xl first-letter:uppercase">{view === "dia" ? formatLongDate(dateKey) : "Próximos agendamentos"}</h2>
        {appts.isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        {appts.data?.length === 0 && <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhum agendamento.</p>}
        <ul className="grid gap-3">
          {appts.data?.map((a) => (
            <li key={a.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-primary">{shortTime(a.start_time)} – {shortTime(a.end_time)}{view === "proximos" && <span className="ml-2 font-normal capitalize text-muted-foreground">{formatLongDate(a.appointment_date)}</span>}</p>
                  <p className="mt-1 font-display text-lg font-semibold">{a.client_name}</p>
                  <p className="text-sm text-muted-foreground">{serviceName(a.service_id)} · {proName(a.professional_id)}</p>
                  <a className="text-sm text-muted-foreground underline-offset-2 hover:underline" href={`https://wa.me/55${a.client_phone.replace(/^55/, "")}`} target="_blank" rel="noreferrer">{formatPhone(a.client_phone)}</a>
                  {a.client_email && <p className="text-xs text-muted-foreground">{a.client_email}</p>}
                  {a.notes && <p className="mt-1 text-xs italic text-muted-foreground">{a.notes}</p>}
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[a.status]}`}>{statusLabels[a.status]}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {a.status === "pendente" && <Button size="sm" onClick={() => setStatus(a.id, "confirmado")}><Check /> Confirmar</Button>}
                {(a.status === "pendente" || a.status === "confirmado") && <Button size="sm" variant="secondary" onClick={() => setStatus(a.id, "concluido")}>Concluir</Button>}
                {(a.status === "pendente" || a.status === "confirmado") && <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, "cancelado")}><X /> Cancelar</Button>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- New appointment ---------------- */

function NewAppointmentTab() {
  const catalog = useCatalog();
  const queryClient = useQueryClient();
  const [svc, setSvc] = useState("");
  const [pro, setPro] = useState("");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("confirmado");
  const [saving, setSaving] = useState(false);

  const pros = useMemo(() => catalog.data?.professionals.filter((p) => p.active && catalog.data.links.some((l) => l.professional_id === p.id && l.service_id === svc)) ?? [], [catalog.data, svc]);
  const slots = useQuery({
    queryKey: ["slots", svc, pro, date],
    enabled: !!svc && !!pro && !!date,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_available_slots", { _service_id: svc, _professional_id: pro, _date: date });
      if (error) throw error;
      return data.map((r) => r.slot);
    },
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.rpc("create_booking", {
      _service_id: svc, _professional_id: pro, _date: date, _start: time, _name: name, _phone: phone,
      _email: email.trim(), _status: status, _notes: notes.trim(),
    });
    setSaving(false);
    if (error) return void toast.error(errorMessage(error));
    toast.success("Agendamento criado");
    setTime(""); setName(""); setPhone(""); setEmail(""); setNotes("");
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["appointments-month"] });
    queryClient.invalidateQueries({ queryKey: ["slots"] });
  }

  return (
    <form onSubmit={save} className="grid max-w-xl gap-4 rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="grid gap-1.5"><Label>Procedimento</Label>
        <select required className={selectClass} value={svc} onChange={(e) => { setSvc(e.target.value); setPro(""); setTime(""); }}>
          <option value="">Selecione</option>
          {catalog.data?.services.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name} · {formatDuration(s.duration_minutes)}</option>)}
        </select>
      </div>
      <div className="grid gap-1.5"><Label>Profissional</Label>
        <select required className={selectClass} value={pro} onChange={(e) => { setPro(e.target.value); setTime(""); }}>
          <option value="">Selecione</option>
          {pros.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5"><Label>Data</Label><Input required type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} /></div>
        <div className="grid gap-1.5"><Label>Horário livre</Label>
          <select required className={selectClass} value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="">{slots.isLoading ? "Carregando…" : slots.data?.length === 0 ? "Sem horários" : "Selecione"}</option>
            {slots.data?.map((s) => <option key={s} value={s}>{shortTime(s)}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-1.5"><Label>Nome da cliente</Label><Input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5"><Label>WhatsApp</Label><Input required inputMode="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>E-mail (opcional)</Label><Input type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      </div>
      <div className="grid gap-1.5"><Label>Status</Label>
        <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus)}>
          <option value="confirmado">Confirmado</option><option value="pendente">Pendente</option>
        </select>
      </div>
      <div className="grid gap-1.5"><Label>Observações</Label><Textarea maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      <Button type="submit" size="lg" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Plus />} Criar agendamento</Button>
    </form>
  );
}

/* ---------------- Blocks ---------------- */

function BlocksTab() {
  const catalog = useCatalog();
  const [date, setDate] = useState(toDateKey(new Date()));
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [pro, setPro] = useState("");
  const [reason, setReason] = useState("");
  const blocks = useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("time_blocks").select("*").gte("block_date", toDateKey(new Date())).order("block_date").order("start_time");
      if (error) throw error;
      return data;
    },
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (end <= start) return void toast.error("O fim deve ser depois do início.");
    const { error } = await supabase.from("time_blocks").insert({ block_date: date, start_time: start, end_time: end, professional_id: pro || null, reason: reason || null });
    if (error) return void toast.error(errorMessage(error));
    toast.success("Horário bloqueado");
    setReason("");
    blocks.refetch();
  }
  async function remove(id: string) {
    const { error } = await supabase.from("time_blocks").delete().eq("id", id);
    if (error) return void toast.error(errorMessage(error));
    blocks.refetch();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={add} className="grid content-start gap-4 rounded-lg border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-2xl">Bloquear horário</h2>
        <div className="grid gap-1.5"><Label>Data</Label><Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label>Início</Label><Input required type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Fim</Label><Input required type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        </div>
        <div className="grid gap-1.5"><Label>Profissional</Label>
          <select className={selectClass} value={pro} onChange={(e) => setPro(e.target.value)}>
            <option value="">Todo o salão</option>
            {catalog.data?.professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid gap-1.5"><Label>Motivo (opcional)</Label><Input maxLength={120} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <Button type="submit"><Plus /> Bloquear</Button>
      </form>
      <div>
        <h2 className="mb-3 font-display text-2xl">Próximos bloqueios</h2>
        {blocks.data?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum bloqueio.</p>}
        <ul className="grid gap-2">
          {blocks.data?.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
              <div>
                <p className="text-sm font-semibold capitalize">{formatLongDate(b.block_date)}</p>
                <p className="text-sm text-muted-foreground">{shortTime(b.start_time)} – {shortTime(b.end_time)} · {catalog.data?.professionals.find((p) => p.id === b.professional_id)?.name ?? "Todo o salão"}{b.reason ? ` · ${b.reason}` : ""}</p>
              </div>
              <Button size="icon" variant="ghost" aria-label="Remover bloqueio" onClick={() => remove(b.id)}><Trash2 /></Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Services ---------------- */

function ServicesTab() {
  const catalog = useCatalog();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });

  async function addService() {
    const sort = (catalog.data?.services.length ?? 0) + 1;
    const { data, error } = await supabase.from("services").insert({ name: "Novo serviço", duration_minutes: 60, price_cents: 0, sort_order: sort }).select().single();
    if (error) return void toast.error(errorMessage(error));
    const prosIds = catalog.data?.professionals.map((p) => ({ professional_id: p.id, service_id: data.id })) ?? [];
    if (prosIds.length) await supabase.from("professional_services").insert(prosIds);
    refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">Serviços</h2>
        <Button size="sm" onClick={addService}><Plus /> Novo serviço</Button>
      </div>
      <div className="grid gap-3">
        {catalog.data?.services.map((s) => <ServiceEditor key={s.id} service={s} onSaved={refresh} />)}
      </div>
    </div>
  );
}

type ServiceRow = NonNullable<ReturnType<typeof useCatalog>["data"]>["services"][number];

function ServiceEditor({ service, onSaved }: { service: ServiceRow; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: service.name,
    description: service.description,
    duration: String(service.duration_minutes),
    price: (service.price_cents / 100).toFixed(2).replace(".", ","),
    label: service.price_label ?? "",
    active: service.active,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    const duration = parseInt(form.duration, 10);
    const price = Math.round(parseFloat(form.price.replace(/\./g, "").replace(",", ".")) * 100);
    if (!form.name.trim() || !duration || duration <= 0 || Number.isNaN(price) || price < 0) return void toast.error("Confira nome, duração e preço.");
    setSaving(true);
    const { error } = await supabase.from("services").update({
      name: form.name.trim(), description: form.description.trim(), duration_minutes: duration, price_cents: price, price_label: form.label.trim() || null, active: form.active,
    }).eq("id", service.id);
    setSaving(false);
    if (error) return void toast.error(errorMessage(error));
    toast.success("Serviço salvo");
    onSaved();
  }

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Input className="font-semibold" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Ativo</label>
      </div>
      <Textarea rows={2} maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
        <div className="grid gap-1"><Label className="text-xs">Duração (min)</Label><Input inputMode="numeric" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
        <div className="grid gap-1"><Label className="text-xs">Preço (R$)</Label><Input inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        <div className="col-span-2 grid gap-1 sm:col-span-1"><Label className="text-xs">Texto do preço (opcional)</Label><Input maxLength={80} placeholder={formatCents(service.price_cents)} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
        <Button className="col-span-2 sm:col-span-1" onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin" />} Salvar</Button>
      </div>
    </div>
  );
}

/* ---------------- Professionals ---------------- */

function ProfessionalsTab() {
  const catalog = useCatalog();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("professionals").insert({ name: name.trim() });
    if (error) return void toast.error(errorMessage(error));
    setName("");
    refresh();
  }
  async function toggleActive(id: string, active: boolean) {
    const { error } = await supabase.from("professionals").update({ active }).eq("id", id);
    if (error) return void toast.error(errorMessage(error));
    refresh();
  }
  async function toggleService(proId: string, svcId: string, on: boolean) {
    const { error } = on
      ? await supabase.from("professional_services").insert({ professional_id: proId, service_id: svcId })
      : await supabase.from("professional_services").delete().eq("professional_id", proId).eq("service_id", svcId);
    if (error) return void toast.error(errorMessage(error));
    refresh();
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={add} className="flex max-w-md gap-2">
        <Input placeholder="Nome da profissional" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit"><Plus /> Cadastrar</Button>
      </form>
      {catalog.data?.professionals.map((p) => (
        <div key={p.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold">{p.name}</h3>
            <label className="flex items-center gap-2 text-xs text-muted-foreground"><Switch checked={p.active} onCheckedChange={(v) => toggleActive(p.id, v)} /> Atendendo</label>
          </div>
          <p className="mt-3 text-xs font-semibold uppercase text-gold">Procedimentos que realiza</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {catalog.data.services.map((s) => {
              const on = catalog.data.links.some((l) => l.professional_id === p.id && l.service_id === s.id);
              return (
                <Button key={s.id} size="sm" variant={on ? "default" : "secondary"} className="rounded-full" onClick={() => toggleService(p.id, s.id, !on)}>
                  {on && <Check />} {s.name}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Business hours ---------------- */

function HoursTab() {
  const catalog = useCatalog();
  if (!catalog.data) return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  return (
    <div className="grid gap-6">
      <SettingsEditor step={catalog.data.settings?.slot_step_minutes ?? 30} buffer={catalog.data.settings?.buffer_minutes ?? 0} />
      <div className="grid gap-3">
        {catalog.data.hours.map((h) => <HourRow key={h.weekday} hour={h} />)}
      </div>
    </div>
  );
}

function SettingsEditor({ step, buffer }: { step: number; buffer: number }) {
  const queryClient = useQueryClient();
  const [s, setS] = useState(String(step));
  const [b, setB] = useState(String(buffer));
  async function save() {
    const { error } = await supabase.from("salon_settings").update({ slot_step_minutes: parseInt(s, 10) || 30, buffer_minutes: parseInt(b, 10) || 0 }).eq("id", 1);
    if (error) return void toast.error(errorMessage(error));
    toast.success("Configurações salvas");
    queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
  }
  return (
    <div className="grid gap-3 rounded-lg border border-gold/40 bg-card p-5 shadow-card sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div className="grid gap-1"><Label className="text-xs">Horários de início a cada (min)</Label><Input inputMode="numeric" value={s} onChange={(e) => setS(e.target.value)} /></div>
      <div className="grid gap-1"><Label className="text-xs">Intervalo entre atendimentos (min)</Label><Input inputMode="numeric" value={b} onChange={(e) => setB(e.target.value)} /></div>
      <Button onClick={save}>Salvar</Button>
    </div>
  );
}

type HourRowData = NonNullable<ReturnType<typeof useCatalog>["data"]>["hours"][number];

function HourRow({ hour }: { hour: HourRowData }) {
  const queryClient = useQueryClient();
  const [f, setF] = useState({
    open: hour.is_open,
    from: shortTime(hour.open_time),
    to: shortTime(hour.close_time),
    bs: hour.break_start ? shortTime(hour.break_start) : "",
    be: hour.break_end ? shortTime(hour.break_end) : "",
  });
  async function save() {
    if (f.to <= f.from) return void toast.error("O fechamento deve ser depois da abertura.");
    if ((f.bs && !f.be) || (!f.bs && f.be) || (f.bs && f.be <= f.bs)) return void toast.error("Confira o horário de almoço.");
    const { error } = await supabase.from("business_hours").update({
      is_open: f.open, open_time: f.from, close_time: f.to, break_start: f.bs || null, break_end: f.be || null,
    }).eq("weekday", hour.weekday);
    if (error) return void toast.error(errorMessage(error));
    toast.success(`${weekdayLabels[hour.weekday]} salvo`);
    queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
  }
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-card sm:grid-cols-[120px_1fr_auto] sm:items-center">
      <label className="flex items-center gap-3 font-semibold"><Switch checked={f.open} onCheckedChange={(v) => setF({ ...f, open: v })} />{weekdayLabels[hour.weekday]}</label>
      {f.open ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="grid gap-1"><Label className="text-xs">Abre</Label><Input type="time" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div>
          <div className="grid gap-1"><Label className="text-xs">Fecha</Label><Input type="time" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
          <div className="grid gap-1"><Label className="text-xs">Almoço início</Label><Input type="time" value={f.bs} onChange={(e) => setF({ ...f, bs: e.target.value })} /></div>
          <div className="grid gap-1"><Label className="text-xs">Almoço fim</Label><Input type="time" value={f.be} onChange={(e) => setF({ ...f, be: e.target.value })} /></div>
        </div>
      ) : <p className="text-sm text-muted-foreground">Fechado</p>}
      <Button variant="secondary" onClick={save}>Salvar</Button>
    </div>
  );
}
