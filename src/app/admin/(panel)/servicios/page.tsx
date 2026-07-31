'use client';

// Gestión de servicios: crear, editar, activar/desactivar y subir imagen (.png / .jpg).
// Se desactiva en lugar de borrar para no romper el historial de citas.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { clienteNavegador } from '@/lib/supabase/navegador';
import type { Servicio } from '@/lib/tipos';

const VACIO = { nombre: '', descripcion: '', duracion_min: 30, precio: 20, foto_url: '' };

/** Comprime y convierte un archivo de imagen a una cadena Data URL optimizada */
function procesarImagen(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Exporta en webp/jpg comprimido a buena calidad
        const dataUrl = canvas.toDataURL('image/webp', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

export default function PaginaServiciosAdmin() {
  const [servicios, setServicios] = useState<Servicio[] | null>(null);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion ?? '',
      duracion_min: s.duracion_min,
      precio: Number(s.precio),
      foto_url: s.foto_url ?? '',
    });
    setEditandoId(s.id);
    setMostrarForm(true);
    setError(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Formato no soportado. Sube una imagen en formato .png, .jpg o .webp');
      return;
    }

    try {
      setProcesandoFoto(true);
      setError(null);
      const dataUrl = await procesarImagen(file);
      setForm((prev) => ({ ...prev, foto_url: dataUrl }));
    } catch {
      setError('No se pudo cargar la imagen.');
    } finally {
      setProcesandoFoto(false);
    }
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
      foto_url: form.foto_url.trim() || null,
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

  async function eliminarServicio(s: Servicio) {
    if (!window.confirm(`¿Estás seguro de eliminar el servicio "${s.nombre}"?`)) return;
    const { error } = await clienteNavegador().from('servicios').delete().eq('id', s.id);
    if (error) {
      setError('No se pudo eliminar el servicio. Es posible que tenga citas asociadas.');
      return;
    }
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

          {/* Subir foto del servicio (.png o .jpg) */}
          <div>
            <label className="etiqueta">Foto del servicio (.png, .jpg, .webp)</label>
            <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center">
              {form.foto_url ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-laton bg-humo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.foto_url} alt="Vista previa" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, foto_url: '' })}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-barbero text-hueso"
                    title="Quitar foto"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-dashed border-acero bg-humo text-ceniza">
                  <ImageIcon size={24} />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={procesandoFoto}
                  className="btn-borde py-2 px-3 text-xs w-full sm:w-auto"
                >
                  {procesandoFoto ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Upload size={14} />
                  )}
                  {form.foto_url ? 'Cambiar imagen' : 'Subir foto (.png / .jpg)'}
                </button>
                <p className="text-[11px] text-ceniza">
                  Selecciona una imagen de tu computadora. Se optimizará automáticamente.
                </p>
              </div>
            </div>
          </div>

          {error && <p className="border border-barbero bg-barbero/10 p-3 text-sm text-hueso" role="alert">{error}</p>}
          <button type="submit" disabled={guardando || procesandoFoto} className="btn-oro disabled:opacity-60">
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
              <div className="flex items-center gap-4">
                {s.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.foto_url} alt={s.nombre} className="h-14 w-14 shrink-0 border border-laton object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-acero bg-humo text-ceniza">
                    <ImageIcon size={20} />
                  </div>
                )}
                <div>
                  <p className="font-bold text-hueso">
                    {s.nombre} <span className="titulo-display ml-2 text-laton">S/{Number(s.precio).toFixed(0)}</span>
                  </p>
                  <p className="text-xs text-ceniza">{s.duracion_min} min{s.descripcion ? ` · ${s.descripcion}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => abrirEdicion(s)} className="btn-borde px-3 py-1.5 text-[11px]">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => alternarActivo(s)} className="btn-borde px-3 py-1.5 text-[11px]">
                  {s.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => eliminarServicio(s)} className="btn px-3 py-1.5 text-[11px] border border-barbero text-red-400 hover:bg-barbero hover:text-hueso">
                  <Trash2 size={12} /> Eliminar
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
