'use client';

// Gestión de servicios: crear, editar, activar/desactivar.
// Se desactiva en lugar de borrar para no romper el historial de citas.

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, X } from 'lucide-react';
import { clienteNavegador } from '@/lib/supabase/navegador';
import type { Servicio } from '@/lib/tipos';

const VACIO = { nombre: '', descripcion: '', duracion_min: 30, precio: 20 };

export default function PaginaServiciosAdmin() {
  const [servicios, setServicios] = useState<Servicio[] | null>(null);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data, error } = await clienteNavegador()
      .from('servicios')
      .select('*')
      .order('precio');
    if (error) setError('No se pudieron cargar los servicios.');
    else setServicios(data ?? []);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function abrirNuevo() {
    setForm(VACIO);
    setEditandoId(null);
    setMostrarForm(true);
    setError(null);
  }

  function abrirEdicion(s: Servicio) {
    setForm({ nombre: s.nombre, descripcion: s.descripcion ?? '', duracion_min: s.duracion_min, precio: Number(s.precio) });
    setEditandoId(s.id);
    setMostrarForm(true);
    setError(null);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const sb = clienteNavegador();
    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      duracion_min: Number(form.duracion_min),
      precio: Number(form.precio),
    };
    const { error } = editandoId
      ? await sb.from('servicios').update(datos).eq('id', editandoId)
      : await sb.from('servicios').insert(datos);
    setGuardando(false);
    if (error) {
      setError('No se pudo guardar. Verifica los datos.');
      return;
    }
    setMostrarForm(false);
    cargar();
  }

  async function alternarActivo(s: Servicio) {
    await clienteNavegador().from('servicios').update({ activo: !s.activo }).eq('id', s.id);
    cargar();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="titulo-display text-3xl text-hueso">Servicios</h1>
        <button onClick={abrirNuevo} className="btn-oro px-4 py-2 text-xs">
          <Plus size={15} /> Nuevo servicio
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={guardar} className="tarjeta mt-6 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold uppercase tracking-wider text-hueso">
              {editandoId ? 'Editar servicio' : 'Nuevo servicio'}
            </h2>
            <button type="button" aria-label="Cerrar" onClick={() => setMostrarForm(false)} className="text-ceniza hover:text-hueso">
              <X size={18} />
            </button>
          </div>
          <div>
            <label htmlFor="s-nombre" className="etiqueta">Nombre</label>
            <input id="s-nombre" className="campo" required maxLength={60} value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label htmlFor="s-desc" className="etiqueta">Descripción (opcional)</label>
            <textarea id="s-desc" className="campo" rows={2} maxLength={200} value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="s-dur" className="etiqueta">Duración (min)</label>
              <input id="s-dur" type="number" className="campo" required min={10} max={240} step={5} value={form.duracion_min}
                onChange={(e) => setForm({ ...form, duracion_min: Number(e.target.value) })} />
            </div>
            <div>
              <label htmlFor="s-precio" className="etiqueta">Precio (S/)</label>
              <input id="s-precio" type="number" className="campo" required min={0} step={0.5} value={form.precio}
                onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
            </div>
          </div>
          {error && <p className="border border-barbero bg-barbero/10 p-3 text-sm" role="alert">{error}</p>}
          <button type="submit" disabled={guardando} className="btn-oro disabled:opacity-60">
            {guardando && <Loader2 className="animate-spin" size={15} />} Guardar
          </button>
        </form>
      )}

      {!servicios ? (
        <div className="mt-12 flex justify-center text-laton" role="status" aria-label="Cargando">
          <Loader2 className="animate-spin" size={30} />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-acero border border-acero">
          {servicios.map((s) => (
            <li key={s.id} className={`flex flex-wrap items-center justify-between gap-3 p-4 ${s.activo ? '' : 'opacity-50'}`}>
              <div>
                <p className="font-bold text-hueso">
                  {s.nombre} <span className="titulo-display ml-2 text-laton">S/{Number(s.precio).toFixed(0)}</span>
                </p>
                <p className="text-xs text-ceniza">{s.duracion_min} min{s.descripcion ? ` · ${s.descripcion}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => abrirEdicion(s)} className="btn-borde px-3 py-1.5 text-[11px]">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => alternarActivo(s)} className="btn-borde px-3 py-1.5 text-[11px]">
                  {s.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </li>
          ))}
          {servicios.length === 0 && <li className="p-8 text-center text-ceniza">Aún no hay servicios. Crea el primero.</li>}
        </ul>
      )}
    </div>
  );
}
