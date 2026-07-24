// ═══════════════════════════════════════════════════════════════════════════
// Utilidades de fecha y hora — TODO el sistema opera en America/Lima (UTC-5).
// Se usa Intl para obtener la hora de Lima sin importar dónde corra el server
// (Vercel corre en UTC), así las validaciones de "hoy" y "hora pasada" son
// correctas para los clientes en Tarapoto.
// ═══════════════════════════════════════════════════════════════════════════

export const ZONA = 'America/Lima';

/** Fecha de hoy en Lima, formato 'YYYY-MM-DD' */
export function hoyLima(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date());
}

/** Minutos transcurridos del día actual en Lima (0–1439) */
export function minutosAhoraLima(): number {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());
  const [h, m] = partes.split(':').map(Number);
  return h * 60 + m;
}

/** 'HH:MM' o 'HH:MM:SS' → minutos desde medianoche */
export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/** minutos desde medianoche → 'HH:MM' */
export function aHora(min: number): string {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** Suma días a una fecha 'YYYY-MM-DD' (aritmética en UTC, sin sorpresas de TZ) */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Día de la semana de una fecha 'YYYY-MM-DD' (0 = domingo … 6 = sábado) */
export function diaSemanaDe(fecha: string): number {
  return new Date(`${fecha}T00:00:00Z`).getUTCDay();
}

/** 'YYYY-MM-DD' → 'jueves 23 de julio' */
export function fechaLegible(fecha: string): string {
  return new Date(`${fecha}T00:00:00Z`).toLocaleDateString('es-PE', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** 'HH:MM:SS' | 'HH:MM' → 'HH:MM' */
export function horaCorta(hora: string): string {
  return hora.slice(0, 5);
}

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
