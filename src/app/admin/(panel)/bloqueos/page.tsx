'use client';

// Bloqueos: feriados, horas de almuerzo o ausencias.
// Un bloqueo sin barbero aplica a TODA la barbería.

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { clienteNavegador } from '@/lib/supabase/navegador';
import { fechaLegible, hoyLima, horaCorta } from '@/lib/fechas';
import type { Barbero } from '@/lib/tipos';

interface BloqueoConBarbero {
  id: string;
  barbero_id: string | null;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string | null;
  barberos: { nombre: string } | null;
}

export default function PaginaBloqueosAdmin() {
  const [bloqueos, setBloqueos] = useState<BloqueoConBarbero[] | null>(null);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    barbero_id: '', // '' = toda la barbería
    fecha: hoyLima(),
    hora_inicio: '09:00',
    hora_fin: '20:00',
    motivo: '',
  });

  const cargar = useCallback(async () => {
    const sb = clienteNavegador();
    const [bl, ba] = await Promise.all([
      sb
        .from('bloqueos')
        .select('id, barbero_id, fecha, hora_inicio, hora_fin, motivo, barberos(nombre)')
        .gte('fecha', hoyLima())
        .order('fecha')
        .order('hora_inicio'),
      sb.from('barberos').select('*').eq('activo', true).order('nombre'),
    ]);
    if (bl.error || ba.error) setError('No se pudieron cargar los bloqueos.');
    else {
      setBloqueos((bl.data as unknown as BloqueoConBarbero[]) ?? []);
      setBarberos(ba.data ?? []);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (form.hora_inicio >= form.hora_fin) {
      setError('La hora de inicio debe ser menor que la de fin.');
      return;
    }
    setGuardando(true);
    setError(null);
    const { error } = await clienteNavegador().from('bloqueos').insert({
      barbero_id: form.barbero_id || null,
      fecha: form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      motivo: form.motivo.trim() || null,
    });
    setGuardando(false);
    if (error) {
      setError('No se pudo crear el bloqueo.');
      return;
    }
    setForm({ ...form, motivo: '' });
    cargar();
  }

  async function eliminar(id: string) {
    await clienteNavegador().from('bloqueos').delete().eq('id', id);
    cargar();
  }

  return (
    <div>
      <h1 className="titulo-display text-3xl text-hueso">Bloqueos de horario</h1>
      <p className="mt-1 text-sm text-ceniza">
        Feriados, almuerzos o ausencias. Los horarios bloqueados desaparecen de la web de reservas.
      </p>

      <form onSubmit={crear} className="tarjeta mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <label htmlFor="bl-barbero" className="etiqueta">Aplica a</label>
          <select
            id="bl-barbero"
            className="campo"
            value={form.barbero_id}
            onChange={(e) => setForm({ ...form, barbero_id: e.target.value })}
          >
            <option value="">Toda la barbería</option>
            {barberos.map((b) => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bl-fecha" className="etiqueta">Fecha</label>
          <input id="bl-fecha" type="date" className="campo" required min={hoyLima()} value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        </div>
        <div>
          <label htmlFor="bl-inicio" className="etiqueta">Desde</label>
          <input id="bl-inicio" type="time" className="campo" required value={form.hora_inicio}
            onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
        </div>
        <div>
          <label htmlFor="bl-fin" className="etiqueta">Hasta</label>
          <input id="bl-fin" type="time" className="campo" required value={form.hora_fin}
            onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="bl-motivo" className="etiqueta">Motivo (opcional)</label>
          <input id="bl-motivo" className="campo" maxLength={120} placeholder="Ej. Feriado, almuerzo, cita médica…"
            value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
        </div>
        {error && <p className="border border-barbero bg-barbero/10 p-3 text-sm sm:col-span-2" role="alert">{error}</p>}
        <div className="sm:col-span-2">
          <button type="submit" disabled={guardando} className="btn-oro disabled:opacity-60">
            {guardando ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />} Crear bloqueo
          </button>
        </div>
      </form>

      {!bloqueos ? (
        <div className="mt-12 flex justify-center text-laton" role="status" aria-label="Cargando">
          <Loader2 className="animate-spin" size={30} />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-acero border border-acero">
          {bloqueos.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-bold capitalize text-hueso">
                  {fechaLegible(b.fecha)} · {horaCorta(b.hora_inicio)}–{horaCorta(b.hora_fin)}
                </p>
                <p className="text-xs text-ceniza">
                  {b.barberos?.nombre ?? 'Toda la barbería'}
                  {b.motivo ? ` · ${b.motivo}` : ''}
                </p>
              </div>
              <button
                onClick={() => eliminar(b.id)}
                aria-label="Eliminar bloqueo"
                className="btn px-3 py-1.5 text-[11px] border-2 border-barbero text-red-400 hover:bg-barbero hover:text-hueso"
              >
                <Trash2 size={12} /> Eliminar
              </button>
            </li>
          ))}
          {bloqueos.length === 0 && (
            <li className="p-8 text-center text-ceniza">No hay bloqueos próximos. Todo el horario está abierto.</li>
          )}
        </ul>
      )}
    </div>
  );
}
