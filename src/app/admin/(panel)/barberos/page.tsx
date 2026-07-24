'use client';

// Gestión de barberos y su horario semanal.
// El horario se edita como 7 filas (Dom–Sáb) con checkbox + hora de apertura
// y cierre; al guardar se reemplazan los horarios del barbero.

import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Loader2, Pencil, Plus, X } from 'lucide-react';
import { clienteNavegador } from '@/lib/supabase/navegador';
import { DIAS_SEMANA, horaCorta } from '@/lib/fechas';
import type { Barbero, Horario } from '@/lib/tipos';

interface FilaHorario {
  activo: boolean;
  apertura: string;
  cierre: string;
}

const HORARIO_DEFECTO: FilaHorario[] = Array.from({ length: 7 }, (_, d) => ({
  activo: d >= 1 && d <= 6, // lunes a sábado
  apertura: '09:00',
  cierre: '20:00',
}));

export default function PaginaBarberosAdmin() {
  const [barberos, setBarberos] = useState<Barbero[] | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Formulario de barbero
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', foto_url: '' });
  const [guardando, setGuardando] = useState(false);

  // Editor de horario
  const [horarioDe, setHorarioDe] = useState<Barbero | null>(null);
  const [filas, setFilas] = useState<FilaHorario[]>(HORARIO_DEFECTO);
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  const cargar = useCallback(async () => {
    const sb = clienteNavegador();
    const [b, h] = await Promise.all([
      sb.from('barberos').select('*').order('nombre'),
      sb.from('horarios').select('*'),
    ]);
    if (b.error || h.error) setError('No se pudieron cargar los barberos.');
    else {
      setBarberos(b.data ?? []);
      setHorarios((h.data as Horario[]) ?? []);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ── CRUD de barbero ─────────────────────────────────────────────────────
  function abrirNuevo() {
    setForm({ nombre: '', descripcion: '', foto_url: '' });
    setEditandoId(null);
    setMostrarForm(true);
    setHorarioDe(null);
  }

  function abrirEdicion(b: Barbero) {
    setForm({ nombre: b.nombre, descripcion: b.descripcion ?? '', foto_url: b.foto_url ?? '' });
    setEditandoId(b.id);
    setMostrarForm(true);
    setHorarioDe(null);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const sb = clienteNavegador();
    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      foto_url: form.foto_url.trim() || null,
    };
    const { error } = editandoId
      ? await sb.from('barberos').update(datos).eq('id', editandoId)
      : await sb.from('barberos').insert(datos);
    setGuardando(false);
    if (error) {
      setError('No se pudo guardar el barbero.');
      return;
    }
    setMostrarForm(false);
    cargar();
  }

  async function alternarActivo(b: Barbero) {
    await clienteNavegador().from('barberos').update({ activo: !b.activo }).eq('id', b.id);
    cargar();
  }

  // ── Editor de horario semanal ───────────────────────────────────────────
  function abrirHorario(b: Barbero) {
    const propios = horarios.filter((h) => h.barbero_id === b.id);
    setFilas(
      Array.from({ length: 7 }, (_, d) => {
        const fila = propios.find((h) => h.dia_semana === d);
        return fila
          ? { activo: true, apertura: horaCorta(fila.hora_apertura), cierre: horaCorta(fila.hora_cierre) }
          : { activo: false, apertura: '09:00', cierre: '20:00' };
      })
    );
    setHorarioDe(b);
    setMostrarForm(false);
    setError(null);
  }

  async function guardarHorario(e: React.FormEvent) {
    e.preventDefault();
    if (!horarioDe) return;
    // Validar rangos
    for (let d = 0; d < 7; d++) {
      if (filas[d].activo && filas[d].apertura >= filas[d].cierre) {
        setError(`${DIAS_SEMANA[d]}: la hora de apertura debe ser menor que la de cierre.`);
        return;
      }
    }
    setGuardandoHorario(true);
    setError(null);
    const sb = clienteNavegador();
    // Estrategia simple y robusta: borrar el horario del barbero y reinsertar
    const { error: errBorrar } = await sb.from('horarios').delete().eq('barbero_id', horarioDe.id);
    const nuevos = filas
      .map((f, d) => ({ barbero_id: horarioDe.id, dia_semana: d, hora_apertura: f.apertura, hora_cierre: f.cierre, activo: f.activo }))
      .filter((f) => f.activo)
      .map(({ activo, ...resto }) => resto);
    const { error: errInsertar } = nuevos.length ? await sb.from('horarios').insert(nuevos) : { error: null };
    setGuardandoHorario(false);
    if (errBorrar || errInsertar) {
      setError('No se pudo guardar el horario.');
      return;
    }
    setHorarioDe(null);
    cargar();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="titulo-display text-3xl text-hueso">Barberos</h1>
        <button onClick={abrirNuevo} className="btn-oro px-4 py-2 text-xs">
          <Plus size={15} /> Nuevo barbero
        </button>
      </div>

      {/* Formulario de barbero */}
      {mostrarForm && (
        <form onSubmit={guardar} className="tarjeta mt-6 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold uppercase tracking-wider text-hueso">{editandoId ? 'Editar barbero' : 'Nuevo barbero'}</h2>
            <button type="button" aria-label="Cerrar" onClick={() => setMostrarForm(false)} className="text-ceniza hover:text-hueso">
              <X size={18} />
            </button>
          </div>
          <div>
            <label htmlFor="b-nombre" className="etiqueta">Nombre</label>
            <input id="b-nombre" className="campo" required maxLength={60} value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder='Ej. Carlos «El Patrón» Ramírez' />
          </div>
          <div>
            <label htmlFor="b-desc" className="etiqueta">Descripción (opcional)</label>
            <input id="b-desc" className="campo" maxLength={160} value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Especialidades, experiencia…" />
          </div>
          <div>
            <label htmlFor="b-foto" className="etiqueta">URL de foto (opcional)</label>
            <input id="b-foto" type="url" className="campo" value={form.foto_url}
              onChange={(e) => setForm({ ...form, foto_url: e.target.value })} placeholder="https://…" />
          </div>
          {error && <p className="border border-barbero bg-barbero/10 p-3 text-sm" role="alert">{error}</p>}
          <button type="submit" disabled={guardando} className="btn-oro disabled:opacity-60">
            {guardando && <Loader2 className="animate-spin" size={15} />} Guardar
          </button>
        </form>
      )}

      {/* Editor de horario semanal */}
      {horarioDe && (
        <form onSubmit={guardarHorario} className="tarjeta mt-6 space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold uppercase tracking-wider text-hueso">Horario de {horarioDe.nombre}</h2>
            <button type="button" aria-label="Cerrar" onClick={() => setHorarioDe(null)} className="text-ceniza hover:text-hueso">
              <X size={18} />
            </button>
          </div>
          {filas.map((f, d) => (
            <div key={d} className="flex flex-wrap items-center gap-3 border-b border-acero pb-3">
              <label className="flex w-32 items-center gap-2 text-sm font-semibold text-hueso">
                <input
                  type="checkbox"
                  checked={f.activo}
                  onChange={(e) => setFilas(filas.map((x, i) => (i === d ? { ...x, activo: e.target.checked } : x)))}
                  className="h-4 w-4 accent-[#C9A227]"
                />
                {DIAS_SEMANA[d]}
              </label>
              {f.activo && (
                <>
                  <input
                    type="time"
                    aria-label={`Apertura ${DIAS_SEMANA[d]}`}
                    className="campo w-32"
                    value={f.apertura}
                    onChange={(e) => setFilas(filas.map((x, i) => (i === d ? { ...x, apertura: e.target.value } : x)))}
                  />
                  <span className="text-ceniza">a</span>
                  <input
                    type="time"
                    aria-label={`Cierre ${DIAS_SEMANA[d]}`}
                    className="campo w-32"
                    value={f.cierre}
                    onChange={(e) => setFilas(filas.map((x, i) => (i === d ? { ...x, cierre: e.target.value } : x)))}
                  />
                </>
              )}
            </div>
          ))}
          {error && <p className="border border-barbero bg-barbero/10 p-3 text-sm" role="alert">{error}</p>}
          <button type="submit" disabled={guardandoHorario} className="btn-oro disabled:opacity-60">
            {guardandoHorario && <Loader2 className="animate-spin" size={15} />} Guardar horario
          </button>
        </form>
      )}

      {/* Lista */}
      {!barberos ? (
        <div className="mt-12 flex justify-center text-laton" role="status" aria-label="Cargando">
          <Loader2 className="animate-spin" size={30} />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-acero border border-acero">
          {barberos.map((b) => {
            const dias = horarios.filter((h) => h.barbero_id === b.id).length;
            return (
              <li key={b.id} className={`flex flex-wrap items-center justify-between gap-3 p-4 ${b.activo ? '' : 'opacity-50'}`}>
                <div>
                  <p className="font-bold text-hueso">{b.nombre}</p>
                  <p className="text-xs text-ceniza">
                    {b.descripcion ?? 'Sin descripción'} · Atiende {dias} día{dias === 1 ? '' : 's'}/semana
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => abrirHorario(b)} className="btn-borde px-3 py-1.5 text-[11px]">
                    <CalendarClock size={12} /> Horario
                  </button>
                  <button onClick={() => abrirEdicion(b)} className="btn-borde px-3 py-1.5 text-[11px]">
                    <Pencil size={12} /> Editar
                  </button>
                  <button onClick={() => alternarActivo(b)} className="btn-borde px-3 py-1.5 text-[11px]">
                    {b.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </li>
            );
          })}
          {barberos.length === 0 && <li className="p-8 text-center text-ceniza">Aún no hay barberos registrados.</li>}
        </ul>
      )}
    </div>
  );
}
