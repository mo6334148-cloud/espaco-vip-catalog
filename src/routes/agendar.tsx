import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CalendarCheck, Check, Clock, Loader2, Sparkles, User } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  errorMessage,
  formatDuration,
  formatLongDate,
  formatCents,
  shortTime,
  toDateKey,
} from "@/lib/booking";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Agendar horário | Espaço VIP Cabelo" },
      { name: "description", content: "Escolha o procedimento, a data e o horário e agende online no Espaço VIP Cabelo." },
      { property: "og:title", content: "Agendar horário — Espaço VIP Cabelo" },
      { property: "og:description", content: "Agende seu horário online em poucos passos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookingPage,
});

type Step = "service" | "professional" | "date" | "time" | "details" | "review" | "done";
const steps: Step[] = ["service", "professional", "date", "time", "details", "review"];
const stepTitles: Record<Step, string> = {
  service: "Escolha o procedimento",
  professional: "Escolha a profissional",
  date: "Escolha a data",
  time: "Escolha o horário",
  details: "Seus dados",
  review: "Revise seu agendamento",
  done: "Agendamento confirmado!",
};

function BookingPage() {
  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState<string>();
  const [professionalId, setProfessionalId] = useState<string>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const catalog = useQuery({
    queryKey: ["booking-catalog"],
    queryFn: async () => {
      const [s, p, ps, h] = await Promise.all([
        supabase.from("services").select("*").eq("active", true).order("sort_order"),
        supabase.from("professionals").select("*").eq("active", true).order("name"),
        supabase.from("professional_services").select("*"),
        supabase.from("business_hours").select("*"),
      ]);
      if (s.error || p.error || ps.error || h.error) throw s.error ?? p.error ?? ps.error ?? h.error;
      return { services: s.data, professionals: p.data, links: ps.data, hours: h.data };
    },
  });

  const service = catalog.data?.services.find((s) => s.id === serviceId);
  const professional = catalog.data?.professionals.find((p) => p.id === professionalId);
  const availablePros = useMemo(
    () =>
      catalog.data?.professionals.filter((p) =>
        catalog.data.links.some((l) => l.professional_id === p.id && l.service_id === serviceId),
      ) ?? [],
    [catalog.data, serviceId],
  );
  const closedWeekdays = catalog.data?.hours.filter((h) => !h.is_open).map((h) => h.weekday) ?? [];
  const dateKey = date ? toDateKey(date) : undefined;

  const slots = useQuery({
    queryKey: ["slots", serviceId, professionalId, dateKey],
    enabled: !!serviceId && !!professionalId && !!dateKey && step === "time",
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_available_slots", {
        _service_id: serviceId!,
        _professional_id: professionalId!,
        _date: dateKey!,
      });
      if (error) throw error;
      return data.map((r) => r.slot);
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);

  function back() {
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
  }

  function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setFormError("Informe seu nome.");
    if (digits.length < 10 || digits.length > 11) return setFormError("Informe seu WhatsApp com DDD.");
    if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setFormError("Informe um e-mail válido.");
    setFormError(undefined);
    setStep("review");
  }

  async function confirm() {
    setSubmitting(true);
    setFormError(undefined);
    const { error } = await supabase.rpc("create_booking", {
      _service_id: serviceId!,
      _professional_id: professionalId!,
      _date: dateKey!,
      _start: time!,
      _name: name.trim(),
      _phone: phone,
      _email: email.trim() || undefined,
    });
    setSubmitting(false);
    if (error) {
      setFormError(errorMessage(error));
      return;
    }
    setStep("done");
  }

  const stepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-2 px-4">
          {step !== "service" && step !== "done" ? (
            <Button variant="ghost" size="icon" aria-label="Voltar" onClick={back}><ArrowLeft /></Button>
          ) : (
            <Button asChild variant="ghost" size="icon" aria-label="Voltar ao catálogo"><Link to="/"><ArrowLeft /></Link></Button>
          )}
          <span className="text-sm font-semibold">Agendar horário</span>
        </div>
        {step !== "done" && (
          <div className="mx-auto flex max-w-2xl gap-1 px-4 pb-3">
            {steps.map((s, i) => (
              <span key={s} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= stepIndex ? "bg-primary" : "bg-secondary"}`} />
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-8">
        <div key={step} className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-300">
          {step !== "done" && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase text-gold">Passo {stepIndex + 1} de {steps.length}</p>
              <h1 className="mt-1 font-display text-3xl">{stepTitles[step]}</h1>
            </div>
          )}

          {catalog.isLoading && <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-primary" />}
          {catalog.error && <p className="text-sm text-destructive">Não foi possível carregar os serviços. Atualize a página.</p>}

          {step === "service" && catalog.data && (
            <div className="grid gap-3">
              {catalog.data.services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setServiceId(s.id); setProfessionalId(undefined); setTime(undefined); setStep("professional"); }}
                  className={`rounded-lg border bg-card p-4 text-left shadow-card transition-all hover:border-primary/60 active:scale-[0.99] ${serviceId === s.id ? "border-primary" : "border-border"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold leading-tight">{s.name}</h2>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{formatDuration(s.duration_minutes)}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  <p className="mt-3 text-sm font-bold text-primary">{s.price_label || formatCents(s.price_cents)}</p>
                </button>
              ))}
            </div>
          )}

          {step === "professional" && (
            <div className="grid gap-3">
              {availablePros.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma profissional disponível para este procedimento.</p>}
              {availablePros.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setProfessionalId(p.id); setTime(undefined); setStep("date"); }}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left shadow-card transition-all hover:border-primary/60 active:scale-[0.99]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-gold"><User className="h-5 w-5" /></span>
                  <span>
                    <span className="block font-display text-lg font-semibold">{p.name}</span>
                    <span className="text-sm text-muted-foreground">{service?.name}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === "date" && (
            <div className="rounded-lg border border-border bg-card p-2 shadow-card">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={date}
                onSelect={(d) => { if (d) { setDate(d); setTime(undefined); setStep("time"); } }}
                disabled={[{ before: today }, { after: maxDate }, (d) => closedWeekdays.includes(d.getDay())]}
                className="mx-auto p-3 [--cell-size:2.6rem]"
              />
            </div>
          )}

          {step === "time" && (
            <div>
              {dateKey && <p className="mb-4 text-sm capitalize text-muted-foreground">{formatLongDate(dateKey)}</p>}
              {slots.isLoading && <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-primary" />}
              {slots.data && slots.data.length === 0 && (
                <div className="rounded-lg border border-border bg-secondary/50 p-6 text-center">
                  <p className="font-semibold">Sem horários livres nesta data</p>
                  <Button variant="secondary" className="mt-4" onClick={() => setStep("date")}>Escolher outra data</Button>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.data?.map((slot) => (
                  <Button key={slot} variant={time === slot ? "default" : "secondary"} className="h-12 text-base" onClick={() => { setTime(slot); setStep("details"); }}>
                    {shortTime(slot)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === "details" && (
            <form onSubmit={submitDetails} className="grid gap-4">
              <div className="grid gap-1.5"><Label htmlFor="name">Nome</Label><Input id="name" className="h-12" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
              <div className="grid gap-1.5"><Label htmlFor="phone">WhatsApp</Label><Input id="phone" className="h-12" inputMode="tel" maxLength={20} placeholder="(11) 90000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></div>
              <div className="grid gap-1.5"><Label htmlFor="email">E-mail <span className="text-muted-foreground">(opcional)</span></Label><Input id="email" className="h-12" type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <Button type="submit" size="lg" className="mt-2 h-12">Continuar</Button>
            </form>
          )}

          {step === "review" && service && professional && dateKey && time && (
            <div>
              <Summary service={service.name} price={service.price_label || formatCents(service.price_cents)} professional={professional.name} dateKey={dateKey} time={time} name={name} duration={service.duration_minutes} />
              {formError && <p className="mt-4 text-sm text-destructive">{formError}</p>}
              <Button size="lg" className="mt-6 h-12 w-full" disabled={submitting} onClick={confirm}>
                {submitting ? <Loader2 className="animate-spin" /> : <Check />} Confirmar agendamento
              </Button>
            </div>
          )}

          {step === "done" && service && professional && dateKey && time && (
            <div className="text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-float motion-safe:animate-in motion-safe:zoom-in duration-500">
                <CalendarCheck className="h-9 w-9" />
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold uppercase text-gold"><Sparkles className="h-4 w-4" /> Espaço VIP</p>
              <h1 className="mt-2 font-display text-4xl">Agendamento confirmado!</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">Recebemos seu pedido, {name.split(" ")[0]}. Até breve!</p>
              <div className="mt-8 text-left">
                <Summary service={service.name} price={service.price_label || formatCents(service.price_cents)} professional={professional.name} dateKey={dateKey} time={time} name={name} duration={service.duration_minutes} />
              </div>
              <Button asChild variant="secondary" size="lg" className="mt-6 h-12 w-full"><Link to="/">Voltar ao catálogo</Link></Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Summary(props: { service: string; price: string; professional: string; dateKey: string; time: string; name: string; duration: number }) {
  const [h, m] = props.time.split(":").map(Number);
  const endMinutes = h * 60 + m + props.duration;
  const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
  const rows = [
    ["Procedimento", props.service],
    ["Valor", props.price],
    ["Profissional", props.professional],
    ["Data", formatLongDate(props.dateKey)],
    ["Horário", `${shortTime(props.time)} às ${end}`],
    ["Nome", props.name],
  ];
  return (
    <dl className="divide-y divide-border rounded-lg border border-gold/40 bg-card shadow-card">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4 px-4 py-3.5">
          <dt className="text-sm text-muted-foreground">{k}</dt>
          <dd className="text-right text-sm font-semibold first-letter:uppercase">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
