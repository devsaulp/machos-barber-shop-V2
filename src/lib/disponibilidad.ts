// ═══════════════════════════════════════════════════════════════════════════
// MOTOR DE DISPONIBILIDAD (solo servidor)
// Dado servicio + fecha (+ barbero opcional), calcula los slots libres:
//   1. Toma el horario semanal de cada barbero para ese día.
//   2. Genera inicios de slot cada RESERVAS.pasoSlotMin minutos.
//   3. Descarta los que chocan con citas activas o bloqueos.
//   4. Descarta horas pasadas si la fecha es hoy (hora de Lima).
// ═══════════════════════════════════════════════════════════════════════════

import { clienteAdmin } from './supabase/admin';
import { RESERVAS } from './config';
import { aHora, aMinutos, diaSemanaDe, hoyLima, minutosAhoraLima, sumarDias } from './fechas';
import type { Servicio, SlotDisponible } from './tipos';

interface ParametrosDisponibilidad {
  servicioId: string;
  fecha: string; // 'YYYY-MM-DD'
  barberoId?: string | null; // null/undefined = cualquier barbero
  minutosExtra?: number; // ej. lavado opcional: alarga el servicio
}

interface ResultadoDisponibilidad {
  servicio: Servicio;
  slots: SlotDisponible[];
}

/** Error de negocio con mensaje apto para mostrar al usuario */
export class ErrorDisponibilidad extends Error {
  constructor(mensaje: string, public status = 400) {
    super(mensaje);
  }
}

export async function calcularDisponibilidad({
  servicioId,
  fecha,
  barberoId,
  minutosExtra = 0,
}: ParametrosDisponibilidad): Promise<ResultadoDisponibilidad> {
  const sb = clienteAdmin();

  // ── Validar rango de fechas permitido ────────────────────────────────────
  const hoy = hoyLima();
  const maximo = sumarDias(hoy, RESERVAS.diasMaxAnticipacion);
  if (fecha < hoy) throw new ErrorDisponibilidad('No se puede reservar en fechas pasadas.');
  if (fecha > maximo)
    throw new ErrorDisponibilidad(`Solo se puede reservar con máximo ${RESERVAS.diasMaxAnticipacion} días de anticipación.`);

  // ── Servicio ─────────────────────────────────────────────────────────────
  const { data: servicio, error: errServicio } = await sb
    .from('servicios')
    .select('*')
    .eq('id', servicioId)
    .eq('activo', true)
    .single();
  if (errServicio || !servicio) throw new ErrorDisponibilidad('El servicio no existe o no está disponible.', 404);

  // ── Barberos objetivo ────────────────────────────────────────────────────
  let consultaBarberos = sb.from('barberos').select('id').eq('activo', true);
  if (barberoId) consultaBarberos = consultaBarberos.eq('id', barberoId);
  const { data: barberos, error: errBarberos } = await consultaBarberos;
  if (errBarberos || !barberos?.length)
    throw new ErrorDisponibilidad('El barbero no existe o no está disponible.', 404);
  const ids = barberos.map((b) => b.id);

  // ── Horarios del día, citas activas y bloqueos, en paralelo ──────────────
  const dia = diaSemanaDe(fecha);
  const [resHorarios, resCitas, resBloqueos] = await Promise.all([
    sb.from('horarios').select('barbero_id, hora_apertura, hora_cierre').in('barbero_id', ids).eq('dia_semana', dia),
    sb
      .from('citas')
      .select('barbero_id, hora_inicio, hora_fin')
      .eq('fecha', fecha)
      .in('barbero_id', ids)
      .in('estado', ['pendiente', 'confirmada']),
    sb
      .from('bloqueos')
      .select('barbero_id, hora_inicio, hora_fin')
      .eq('fecha', fecha)
      .or(`barbero_id.is.null,barbero_id.in.(${ids.join(',')})`),
  ]);

  const horarios = resHorarios.data ?? [];
  const citas = resCitas.data ?? [];
  const bloqueos = resBloqueos.data ?? [];

  // ── Generar slots por barbero ────────────────────────────────────────────
  const duracion = (servicio.duracion_min as number) + minutosExtra;
  const esHoy = fecha === hoy;
  const minimoHoy = esHoy ? minutosAhoraLima() + RESERVAS.minutosMinAnticipacion : 0;

  /** ¿[inicio, fin) se superpone con algún intervalo de la lista? */
  const chocaCon = (inicio: number, fin: number, lista: { hora_inicio: string; hora_fin: string }[]) =>
    lista.some((x) => inicio < aMinutos(x.hora_fin) && fin > aMinutos(x.hora_inicio));

  const mapa = new Map<number, Set<string>>(); // minutos de inicio → barberos libres

  for (const h of horarios) {
    const apertura = aMinutos(h.hora_apertura);
    const cierre = aMinutos(h.hora_cierre);
    const citasBarbero = citas.filter((c) => c.barbero_id === h.barbero_id);
    const bloqueosBarbero = bloqueos.filter((b) => b.barbero_id === h.barbero_id || b.barbero_id === null);

    for (let inicio = apertura; inicio + duracion <= cierre; inicio += RESERVAS.pasoSlotMin) {
      if (esHoy && inicio < minimoHoy) continue;
      const fin = inicio + duracion;
      if (chocaCon(inicio, fin, citasBarbero)) continue;
      if (chocaCon(inicio, fin, bloqueosBarbero)) continue;
      if (!mapa.has(inicio)) mapa.set(inicio, new Set());
      mapa.get(inicio)!.add(h.barbero_id);
    }
  }

  const slots: SlotDisponible[] = [...mapa.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([min, libres]) => ({ hora: aHora(min), barberos: [...libres] }));

  return { servicio: servicio as Servicio, slots };
}
