'use client';

// ═══════════════════════════════════════════════════════════════════════════
// ASISTENTE DE RESERVA (6 pasos, mobile-first, sin registro)
// 1 Servicio → 2 Barbero → 3 Fecha → 4 Hora → 5 Datos → 6 Confirmación
// La disponibilidad SIEMPRE la decide el servidor (/api/disponibilidad).
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Clock, Droplets, Loader2, Scissors, User, Users } from 'lucide-react';
import { LAVADO, linkWhatsApp, mensajeWhatsApp, RESERVAS, TIPOS_CLIENTE, type TipoCliente } from '@/lib/config';
import { DIAS_CORTOS, MESES_CORTOS, fechaLegible, hoyLima, sumarDias, diaSemanaDe } from '@/lib/fechas';
import type { SlotDisponible } from '@/lib/tipos';

interface ServicioCatalogo {
  id: string;
  nombre: string;
  descripcion: string | null;
  duracion_min: number;
  precio: number;
  foto_url?: string | null;
}
interface BarberoCatalogo {
  id: string;
  nombre: string;
  descripcion: string | null;
}
interface Catalogo {
  servicios: ServicioCatalogo[];
  barberos: BarberoCatalogo[];
  horarios: { barbero_id: string; dia_semana: number }[];
}
interface Confirmacion {
  codigo: string;
  fecha: string;
  fecha_legible: string;
  hora: string;
  servicio: string;
  barbero: string;
}

const PASOS = ['Servicio', 'Barbero', 'Fecha', 'Hora', 'Tus datos'];

export default function AsistenteReserva() {
  const [paso, setPaso] = useState(0);
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [errorCatalogo, setErrorCatalogo] = useState(false);

  // Selecciones del cliente
  const [servicio, setServicio] = useState<ServicioCatalogo | null>(null);
  const [barbero, setBarbero] = useState<BarberoCatalogo | null>(null); // null = cualquiera
  const [eligioBarbero, setEligioBarbero] = useState(false);
  const [fecha, setFecha] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotDisponible[] | null>(null);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [hora, setHora] = useState<string | null>(null);
  const [conLavado, setConLavado] = useState(false);
  const [tipoCliente, setTipoCliente] = useState<TipoCliente | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);

  // ── Cargar catálogo al montar ─────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/catalogo?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setCatalogo)
      .catch(() => setErrorCatalogo(true));
  }, []);

  // Días de la semana en los que atiende el barbero elegido (o cualquiera)
  const diasQueAtiende = useMemo(() => {
    if (!catalogo) return new Set<number>();
    const filas = barbero
      ? catalogo.horarios.filter((h) => h.barbero_id === barbero.id)
      : catalogo.horarios;
    return new Set(filas.map((h) => h.dia_semana));
  }, [catalogo, barbero]);

  // Próximos 30 días para el selector de fecha
  const dias = useMemo(() => {
    const hoy = hoyLima();
    return Array.from({ length: RESERVAS.diasMaxAnticipacion + 1 }, (_, i) => {
      const f = sumarDias(hoy, i);
      return { fecha: f, dia: diaSemanaDe(f), habilitado: diasQueAtiende.has(diaSemanaDe(f)) };
    });
  }, [diasQueAtiende]);

  // ── Buscar slots cuando hay servicio + fecha ──────────────────────────
  const buscarSlots = useCallback(async (srv: ServicioCatalogo, f: string, b: BarberoCatalogo | null, lavado: boolean) => {
    setCargandoSlots(true);
    setSlots(null);
    setError(null);
    try {
      const qs = new URLSearchParams({ servicio_id: srv.id, fecha: f });
      if (b) qs.set('barbero_id', b.id);
      if (lavado) qs.set('lavado', '1');
      const r = await fetch(`/api/disponibilidad?${qs}`);
      const datos = await r.json();
      if (!r.ok) throw new Error(datos.error ?? 'Error al buscar horarios.');
      setSlots(datos.slots);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al buscar horarios.');
      setSlots([]);
    } finally {
      setCargandoSlots(false);
    }
  }, []);

  // ── Enviar la reserva ─────────────────────────────────────────────────
  async function reservar() {
    if (!servicio || !fecha || !hora) return;
    if (!tipoCliente) {
      setError('Indica si el corte es para niño o adulto.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const r = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicio_id: servicio.id,
          barbero_id: barbero?.id ?? null,
          fecha,
          hora_inicio: hora,
          nombre_cliente: nombre,
          telefono,
          tipo_cliente: tipoCliente,
          con_lavado: conLavado,
        }),
      });
      const datos = await r.json();
      if (!r.ok) {
        // Si el slot se ocupó, volvemos al paso de hora con datos frescos
        if (r.status === 409) {
          setPaso(3);
          setHora(null);
          buscarSlots(servicio, fecha, barbero, conLavado);
        }
        throw new Error(datos.error ?? 'No se pudo crear la reserva.');
      }
      setConfirmacion(datos.cita);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la reserva.');
    } finally {
      setEnviando(false);
    }
  }

  // ── Pantalla de confirmación ──────────────────────────────────────────
  if (confirmacion) {
    const mensaje = mensajeWhatsApp({
      nombre,
      servicio: confirmacion.servicio,
      barbero: confirmacion.barbero,
      fecha: confirmacion.fecha_legible,
      hora: confirmacion.hora,
      codigo: confirmacion.codigo,
    });
    return (
      <section className="tarjeta mt-8 p-8 text-center" aria-live="polite">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-laton">
          <Check size={32} className="text-laton" />
        </div>
        <h2 className="titulo-display mt-6 text-4xl text-hueso">¡Cita apartada!</h2>
        <p className="mt-3 text-ceniza">
          {confirmacion.servicio} con {confirmacion.barbero}
          <br />
          <span className="font-semibold text-hueso">
            {confirmacion.fecha_legible} · {confirmacion.hora}
          </span>
        </p>
        <p className="mt-4 text-sm text-ceniza">
          Código de reserva: <span className="font-bold tracking-widest text-laton">{confirmacion.codigo}</span>
        </p>
        <a
          href={linkWhatsApp(mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp mt-8 w-full sm:w-auto"
        >
          Confirmar por WhatsApp
        </a>
        <p className="mt-4 text-xs text-ceniza/70">
          Envíanos el mensaje para dejar tu cita confirmada. Te esperamos, causa.
        </p>
      </section>
    );
  }

  // ── Estado de carga / error del catálogo ──────────────────────────────
  if (errorCatalogo) {
    return (
      <div className="tarjeta mt-8 p-8 text-center text-ceniza">
        No pudimos cargar los servicios. Recarga la página o escríbenos por{' '}
        <a href={linkWhatsApp()} className="text-laton underline" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
      </div>
    );
  }
  if (!catalogo) {
    return (
      <div className="mt-16 flex justify-center text-laton" role="status" aria-label="Cargando">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  return (
    <section className="mt-8">
      {/* Indicador de pasos */}
      <ol className="flex items-center gap-1" aria-label="Progreso de la reserva">
        {PASOS.map((nombrePaso, i) => (
          <li key={nombrePaso} className="flex-1">
            <div className={`h-1 ${i <= paso ? 'bg-laton' : 'bg-acero'}`} />
            <span className={`mt-1 hidden text-[10px] uppercase tracking-wider sm:block ${i === paso ? 'text-laton' : 'text-ceniza/60'}`}>
              {nombrePaso}
            </span>
          </li>
        ))}
      </ol>

      {/* Botón volver */}
      {paso > 0 && (
        <button
          onClick={() => { setError(null); setPaso(paso - 1); if (paso === 4) setHora(null); }}
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-ceniza hover:text-laton"
        >
          <ArrowLeft size={15} /> Volver
        </button>
      )}

      <div className="mt-4">
        {/* PASO 1 · SERVICIO */}
        {paso === 0 && (
          <fieldset>
            <legend className="flex items-center gap-2 text-lg font-bold text-hueso">
              <Scissors size={18} className="text-laton" /> ¿Qué te vas a hacer?
            </legend>
            <label className="tarjeta mt-4 flex cursor-pointer items-center justify-between gap-3 p-4 transition-colors hover:border-laton">
              <span className="flex items-center gap-3">
                <Droplets size={20} className="shrink-0 text-laton" />
                <span>
                  <span className="block font-bold uppercase tracking-wide text-hueso">Agregar lavado</span>
                  <span className="text-xs text-ceniza">Opcional · +S/{LAVADO.precio} · +{LAVADO.minutosExtra} min</span>
                </span>
              </span>
              <input
                type="checkbox"
                checked={conLavado}
                onChange={(e) => setConLavado(e.target.checked)}
                className="h-5 w-5 accent-[#C9A227]"
                aria-label="Agregar lavado opcional"
              />
            </label>
            <div className="mt-3 grid gap-3">
              {catalogo.servicios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setServicio(s); setPaso(1); }}
                  className={`tarjeta flex items-center justify-between gap-4 p-4 text-left transition-colors hover:border-laton ${servicio?.id === s.id ? 'border-laton' : ''}`}
                >
                  <span className="flex items-center gap-3">
                    {s.foto_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.foto_url} alt={s.nombre} className="h-12 w-12 shrink-0 border border-laton object-cover" />
                    )}
                    <span>
                      <span className="block font-bold uppercase tracking-wide text-hueso">{s.nombre}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-ceniza">
                        <Clock size={12} /> {s.duracion_min} min
                      </span>
                    </span>
                  </span>
                  <span className="titulo-display text-2xl text-laton">S/{Number(s.precio).toFixed(0)}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* PASO 2 · BARBERO */}
        {paso === 1 && (
          <fieldset>
            <legend className="flex items-center gap-2 text-lg font-bold text-hueso">
              <User size={18} className="text-laton" /> ¿Con quién?
            </legend>
            <div className="mt-4 grid gap-3">
              <button
                onClick={() => { setBarbero(null); setEligioBarbero(true); setPaso(2); }}
                className={`tarjeta flex items-center gap-3 p-4 text-left transition-colors hover:border-laton ${eligioBarbero && !barbero ? 'border-laton' : ''}`}
              >
                <Users size={20} className="shrink-0 text-laton" />
                <span>
                  <span className="block font-bold uppercase tracking-wide text-hueso">Cualquier barbero disponible</span>
                  <span className="text-xs text-ceniza">Te asignamos al primero libre. Más horarios para elegir.</span>
                </span>
              </button>
              {catalogo.barberos.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setBarbero(b); setEligioBarbero(true); setPaso(2); }}
                  className={`tarjeta p-4 text-left transition-colors hover:border-laton ${barbero?.id === b.id ? 'border-laton' : ''}`}
                >
                  <span className="block font-bold uppercase tracking-wide text-hueso">{b.nombre}</span>
                  {b.descripcion && <span className="text-xs text-ceniza">{b.descripcion}</span>}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* PASO 3 · FECHA */}
        {paso === 2 && servicio && (
          <fieldset>
            <legend className="text-lg font-bold text-hueso">¿Qué día?</legend>
            <p className="mt-1 text-xs text-ceniza">Puedes reservar hasta con {RESERVAS.diasMaxAnticipacion} días de anticipación.</p>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {dias.map((d) => {
                const [, mes, diaNum] = d.fecha.split('-');
                const seleccionado = fecha === d.fecha;
                return (
                  <button
                    key={d.fecha}
                    disabled={!d.habilitado}
                    onClick={() => { setFecha(d.fecha); setHora(null); setPaso(3); buscarSlots(servicio, d.fecha, barbero, conLavado); }}
                    className={`border p-2 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-25 ${
                      seleccionado ? 'border-laton bg-laton text-humo' : 'border-acero bg-carbon text-hueso hover:border-laton'
                    }`}
                  >
                    <span className="block text-[10px] uppercase tracking-wider">{DIAS_CORTOS[d.dia]}</span>
                    <span className="titulo-display block text-xl">{Number(diaNum)}</span>
                    <span className="block text-[10px] uppercase text-ceniza">{MESES_CORTOS[Number(mes) - 1]}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* PASO 4 · HORA */}
        {paso === 3 && fecha && (
          <fieldset>
            <legend className="text-lg font-bold text-hueso">
              Horarios libres · <span className="capitalize text-laton">{fechaLegible(fecha)}</span>
            </legend>
            {cargandoSlots && (
              <div className="mt-8 flex justify-center text-laton" role="status" aria-label="Buscando horarios">
                <Loader2 className="animate-spin" size={28} />
              </div>
            )}
            {!cargandoSlots && slots && slots.length === 0 && (
              <p className="tarjeta mt-4 p-5 text-sm text-ceniza">
                No quedan horarios libres ese día. Prueba con otra fecha
                {!barbero ? '' : ' u otro barbero'}.
              </p>
            )}
            {!cargandoSlots && slots && slots.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button
                    key={s.hora}
                    onClick={() => { setHora(s.hora); setPaso(4); }}
                    className={`border p-3 text-center font-bold tracking-wider transition-colors ${
                      hora === s.hora ? 'border-laton bg-laton text-humo' : 'border-acero bg-carbon text-hueso hover:border-laton'
                    }`}
                  >
                    {s.hora}
                  </button>
                ))}
              </div>
            )}
          </fieldset>
        )}

        {/* PASO 5 · DATOS DEL CLIENTE */}
        {paso === 4 && servicio && fecha && hora && (
          <div>
            <h2 className="text-lg font-bold text-hueso">Últimos datos y listo</h2>
            {/* Resumen de la reserva */}
            <div className="tarjeta mt-4 p-4 text-sm text-ceniza">
              <p>
                <span className="font-bold text-hueso">{servicio.nombre}{conLavado ? ' + lavado' : ''}</span>{' '}
                · S/{(Number(servicio.precio) + (conLavado ? LAVADO.precio : 0)).toFixed(0)} · {servicio.duracion_min + (conLavado ? LAVADO.minutosExtra : 0)} min
              </p>
              <p className="mt-1">
                {barbero ? barbero.nombre : 'Cualquier barbero disponible'} · <span className="capitalize">{fechaLegible(fecha)}</span> · {hora}
              </p>
            </div>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => { e.preventDefault(); reservar(); }}
            >
              <fieldset>
                <legend className="etiqueta">¿El corte es para niño o adulto?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {TIPOS_CLIENTE.map((tc) => (
                    <button
                      type="button"
                      key={tc}
                      onClick={() => { setTipoCliente(tc); setError(null); }}
                      className={`border p-3 text-center text-sm font-bold uppercase tracking-wider transition-colors ${
                        tipoCliente === tc ? 'border-laton bg-laton text-humo' : 'border-acero bg-carbon text-hueso hover:border-laton'
                      }`}
                    >
                      {tc}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="nombre" className="etiqueta">Tu nombre</label>
                <input
                  id="nombre"
                  className="campo"
                  placeholder="Ej. Luis Vargas"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  minLength={2}
                  maxLength={60}
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="telefono" className="etiqueta">Tu WhatsApp (9 dígitos)</label>
                <input
                  id="telefono"
                  className="campo"
                  placeholder="Ej. 942123456"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  required
                  inputMode="numeric"
                  pattern="9[0-9]{8}"
                  title="Celular peruano de 9 dígitos que empiece con 9"
                  autoComplete="tel-national"
                />
              </div>
              <button type="submit" disabled={enviando} className="btn-oro w-full disabled:opacity-60">
                {enviando ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {enviando ? 'Reservando…' : 'Reservar cita'}
              </button>
              <p className="text-center text-xs text-ceniza/70">
                Sin registro ni pago online. Pagas en el local, como debe ser.
              </p>
            </form>
          </div>
        )}

        {/* Errores */}
        {error && (
          <p className="mt-4 border border-barbero bg-barbero/10 p-3 text-sm text-hueso" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
