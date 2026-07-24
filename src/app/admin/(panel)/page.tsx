'use client';

// Agenda del dueño: citas del día o de la semana, agrupadas por barbero.
// Permite confirmar, completar o cancelar citas y contactar al cliente.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, MessageCircle } from 'lucide-react';
import { clienteNavegador } from '@/lib/supabase/navegador';
import { fechaLegible, hoyLima, horaCorta, sumarDias, diaSemanaDe } from '@/lib/fechas';
import type { EstadoCita } from '@/lib/tipos';

interface CitaConDetalle {
  id: string;
  codigo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_cliente: string;
  telefono: string;
  tipo_cliente: 'niño' | 'adulto' | null;
  con_lavado: boolean;
  precio_total: number | null;
  estado: EstadoCita;
  barberos: { nombre: string } | null;
  servicios: { nombre: string; precio: number } | null;
}

const COLORES_ESTADO: Record<EstadoCita, string> = {
  pendiente: 'border-laton text-laton',
  confirmada: 'border-emerald-500 text-emerald-400',
  completada: 'border-ceniza text-ceniza',
  cancelada: 'border-barbero text-red-400',
};

export default function PaginaAgenda() {
  const [vista, setVista] = useState<'dia' | 'semana'>('dia');
  const [fechaBase, setFechaBase] = useState(hoyLima());
  const [citas, setCitas] = useState<CitaConDetalle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rango de fechas según la vista
  const rango = useMemo(() => {
    if (vista === 'dia') return { desde: fechaBase, hasta: fechaBase };
    const inicioSemana = sumarDias(fechaBase, -((diaSemanaDe(fechaBase) + 6) % 7)); // lunes
    return { desde: inicioSemana, hasta: sumarDias(inicioSemana, 6) };
  }, [vista, fechaBase]);

  const cargar = useCallback(async () => {
    setCitas(null);
    setError(null);
    const sb = clienteNavegador();
    const { data, error } = await sb
      .from('citas')
      .select('id, codigo, fecha, hora_inicio, hora_fin, nombre_cliente, telefono, tipo_cliente, con_lavado, precio_total, estado, barberos(nombre), servicios(nombre, precio)')
      .gte('fecha', rango.desde)
      .lte('fecha', rango.hasta)
      .order('fecha')
      .order('hora_inicio');
    if (error) setError('No se pudieron cargar las citas. Revisa tu sesión.');
    else setCitas((data as unknown as CitaConDetalle[]) ?? []);
  }, [rango]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function cambiarEstado(id: string, estado: EstadoCita) {
    const sb = clienteNavegador();
    const { error } = await sb.from('citas').update({ estado }).eq('id', id);
    if (!error) cargar();
  }

  // Estadísticas rápidas del rango (mejora para el dueño)
  const stats = useMemo(() => {
    if (!citas) return null;
    const activas = citas.filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada');
    const ingresos = citas
      .filter((c) => c.estado === 'confirmada' || c.estado === 'completada')
      .reduce((suma, c) => suma + Number(c.precio_total ?? c.servicios?.precio ?? 0), 0);
    return { total: citas.length, activas: activas.length, ingresos };
  }, [citas]);

  // Agrupar por fecha y luego por barbero
  const grupos = useMemo(() => {
    if (!citas) return [];
    const porFecha = new Map<string, CitaConDetalle[]>();
    for (const c of citas) {
      if (!porFecha.has(c.fecha)) porFecha.set(c.fecha, []);
      porFecha.get(c.fecha)!.push(c);
    }
    return [...porFecha.entries()];
  }, [citas]);

  const paso = vista === 'dia' ? 1 : 7;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="titulo-display text-3xl text-hueso">Agenda</h1>
        <div className="flex items-center gap-2">
          <div className="flex border border-acero">
            {(['dia', 'semana'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${vista === v ? 'bg-laton text-humo' : 'text-ceniza hover:text-hueso'}`}
              >
                {v === 'dia' ? 'Día' : 'Semana'}
              </button>
            ))}
          </div>
          <div className="flex items-center border border-acero">
            <button aria-label="Anterior" onClick={() => setFechaBase(sumarDias(fechaBase, -paso))} className="p-2 text-ceniza hover:text-laton">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setFechaBase(hoyLima())} className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-hueso">
              Hoy
            </button>
            <button aria-label="Siguiente" onClick={() => setFechaBase(sumarDias(fechaBase, paso))} className="p-2 text-ceniza hover:text-laton">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-2 text-sm capitalize text-ceniza">
        {vista === 'dia' ? fechaLegible(fechaBase) : `Semana del ${fechaLegible(rango.desde)} al ${fechaLegible(rango.hasta)}`}
      </p>

      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { valor: stats.total, texto: 'Citas' },
            { valor: stats.activas, texto: 'Activas' },
            { valor: `S/${stats.ingresos.toFixed(0)}`, texto: 'Ingresos est.' },
          ].map((kpi) => (
            <div key={kpi.texto} className="tarjeta p-4 text-center">
              <p className="titulo-display text-3xl text-laton">{kpi.valor}</p>
              <p className="text-xs uppercase tracking-widest text-ceniza">{kpi.texto}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-6 border border-barbero bg-barbero/10 p-3 text-sm" role="alert">{error}</p>}

      {!citas && !error && (
        <div className="mt-12 flex justify-center text-laton" role="status" aria-label="Cargando">
          <Loader2 className="animate-spin" size={30} />
        </div>
      )}

      {citas && citas.length === 0 && (
        <p className="tarjeta mt-6 p-8 text-center text-ceniza">
          Sin citas en este rango. Día tranquilo para afilar las navajas.
        </p>
      )}

      <div className="mt-6 space-y-8">
        {grupos.map(([fecha, lista]) => (
          <section key={fecha}>
            {vista === 'semana' && (
              <h2 className="mb-3 border-b border-acero pb-2 text-sm font-bold uppercase tracking-widest capitalize text-laton">
                {fechaLegible(fecha)}
              </h2>
            )}
            <ul className="space-y-3">
              {lista.map((c) => (
                <li key={c.id} className="tarjeta flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="titulo-display shrink-0 text-2xl text-hueso">
                      {horaCorta(c.hora_inicio)}
                    </div>
                    <div>
                      <p className="font-bold text-hueso">
                        {c.nombre_cliente}{' '}
                        <span className="text-xs font-normal tracking-widest text-ceniza">· {c.codigo}</span>
                      </p>
                      <p className="text-sm text-ceniza">
                        {c.servicios?.nombre}
                        {c.con_lavado ? ' + lavado' : ''}
                        {c.tipo_cliente ? ` · ${c.tipo_cliente}` : ''} · {c.barberos?.nombre} · S/
                        {Number(c.precio_total ?? c.servicios?.precio ?? 0).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`chip-estado ${COLORES_ESTADO[c.estado]}`}>{c.estado}</span>
                    <a
                      href={`https://wa.me/51${c.telefono}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp de ${c.nombre_cliente}`}
                      className="flex h-8 w-8 items-center justify-center border border-acero text-[#25d366] hover:border-[#25d366]"
                    >
                      <MessageCircle size={15} />
                    </a>
                    {c.estado === 'pendiente' && (
                      <button onClick={() => cambiarEstado(c.id, 'confirmada')} className="btn-borde px-3 py-1.5 text-[11px]">
                        Confirmar
                      </button>
                    )}
                    {c.estado === 'confirmada' && (
                      <button onClick={() => cambiarEstado(c.id, 'completada')} className="btn-borde px-3 py-1.5 text-[11px]">
                        Completar
                      </button>
                    )}
                    {(c.estado === 'pendiente' || c.estado === 'confirmada') && (
                      <button
                        onClick={() => cambiarEstado(c.id, 'cancelada')}
                        className="btn px-3 py-1.5 text-[11px] border-2 border-barbero text-red-400 hover:bg-barbero hover:text-hueso"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
