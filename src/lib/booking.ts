import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export type AppointmentStatus = "pendente" | "confirmado" | "cancelado" | "concluido";

export const statusLabels: Record<AppointmentStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  concluido: "Concluído",
};

export const weekdayLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function formatCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function formatLongDate(dateKey: string) {
  return format(parseISO(dateKey), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function shortTime(time: string) {
  return time.slice(0, 5);
}

export function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

export function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as { message: unknown }).message);
    if (msg.includes("appointments_no_overlap")) return "Este horário já está ocupado.";
    return msg;
  }
  return "Algo deu errado. Tente novamente.";
}
