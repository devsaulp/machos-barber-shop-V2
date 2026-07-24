import Link from 'next/link';
import { Clock, MapPin, Scissors } from 'lucide-react';
import { BarraNavegacion, BotonFlotanteWhatsApp, PiePagina, iniciales } from '@/components/PublicoUI';
import { NEGOCIO, SERVICIOS_FALLBACK, BARBEROS_FALLBACK, linkWhatsApp } from '@/lib/config';
import { clientePublico } from '@/lib/supabase/publico';
import type { Barbero, Servicio } from '@/lib/tipos';

// Página estática regenerada cada 5 minutos (rendimiento + datos frescos)
export const revalidate = 300;

async function obtenerCatalogo(): Promise<{ servicios: Servicio[]; barberos: Barbero[] }> {
  try {
    const sb = clientePublico();
    const [s, b] = await Promise.all([
      sb.from('servicios').select('*').eq('activo', true).order('precio'),
      sb.from('barberos').select('*').eq('activo', true).order('nombre'),
    ]);
    return {
      servicios: s.data?.length ? s.data : (SERVICIOS_FALLBACK as Servicio[]),
      barberos: b.data?.length ? b.data : (BARBEROS_FALLBACK as Barbero[]),
    };
  } catch {
    // Si Supabase aún no está configurado, el sitio igual carga con datos de respaldo
    return { servicios: SERVICIOS_FALLBACK as Servicio[], barberos: BARBEROS_FALLBACK as Barbero[] };
  }
}

export default async function PaginaInicio() {
  const { servicios, barberos } = await obtenerCatalogo();

  return (
    <>
      <BarraNavegacion />
      <main>
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Marca de agua gigante de fondo */}
          <div
            aria-hidden="true"
            className="titulo-display pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 select-none text-[22rem] text-hueso/[0.03] lg:block"
          >
            M
          </div>
          <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
            <p className="eyebrow mb-4">Barbería · Tarapoto, Perú</p>
            <h1 className="titulo-display text-6xl sm:text-8xl lg:text-9xl">
              <span className="block text-hueso">Machos</span>
              <span className="texto-contorno block">Barber Shop</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ceniza">
              Cortes con carácter. Máquina, tijera y navaja en manos que saben lo que hacen.
              Entras hecho un desastre, <span className="font-semibold text-hueso">sales hecho un macho</span>.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/reservar" className="btn-oro">
                <Scissors size={18} /> Reservar cita
              </Link>
              <a
                href={linkWhatsApp('Hola, quiero reservar una cita en la barbería.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div className="franja-barbero" aria-hidden="true" />
        </section>

        {/* ── SERVICIOS ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="eyebrow">El arsenal</p>
          <h2 className="titulo-display mt-2 text-4xl text-hueso sm:text-5xl">
            Servicios y <span className="text-laton">precios</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {servicios.map((s) => (
              <article key={s.id} className="tarjeta group flex items-start justify-between gap-4 p-6 transition-colors hover:border-laton">
                <div>
                  <h3 className="font-body text-lg font-bold uppercase tracking-wide text-hueso">{s.nombre}</h3>
                  {s.descripcion && <p className="mt-1 text-sm text-ceniza">{s.descripcion}</p>}
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ceniza">
                    <Clock size={13} className="text-laton" /> {s.duracion_min} min
                  </p>
                </div>
                <p className="titulo-display shrink-0 text-3xl text-laton">
                  S/{Number(s.precio).toFixed(0)}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/reservar" className="btn-borde">Aparta tu sitio →</Link>
          </div>
        </section>

        {/* ── BARBEROS ─────────────────────────────────────────────────── */}
        <section className="border-y border-acero bg-carbon">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <p className="eyebrow">La cuadrilla</p>
            <h2 className="titulo-display mt-2 text-4xl text-hueso sm:text-5xl">
              Maestros de la <span className="text-laton">navaja</span>
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {barberos.map((b) => (
                <article key={b.id} className="flex items-center gap-5 border border-acero bg-humo p-6">
                  {b.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.foto_url} alt={b.nombre} className="h-20 w-20 shrink-0 border-2 border-laton object-cover" />
                  ) : (
                    <div className="titulo-display flex h-20 w-20 shrink-0 items-center justify-center border-2 border-laton text-3xl text-laton">
                      {iniciales(b.nombre)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-body text-lg font-bold text-hueso">{b.nombre}</h3>
                    {b.descripcion && <p className="mt-1 text-sm text-ceniza">{b.descripcion}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── HORARIO + MAPA ───────────────────────────────────────────── */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Cuándo atendemos</p>
            <h2 className="titulo-display mt-2 text-4xl text-hueso">Horario</h2>
            <ul className="mt-6 divide-y divide-acero border border-acero">
              <li className="flex justify-between p-4 text-sm">
                <span className="font-semibold text-hueso">Lunes a sábado</span>
                <span className="text-laton">9:00 a.m. – 8:00 p.m.</span>
              </li>
              <li className="flex justify-between p-4 text-sm">
                <span className="font-semibold text-hueso">Domingo</span>
                <span className="text-ceniza">Cerrado — hasta los machos descansan</span>
              </li>
            </ul>
            <p className="mt-6 flex items-start gap-2 text-sm text-ceniza">
              <MapPin size={16} className="mt-0.5 shrink-0 text-laton" />
              {NEGOCIO.direccion}
            </p>
          </div>
          <div>
            <p className="eyebrow">Dónde estamos</p>
            <h2 className="titulo-display mt-2 text-4xl text-hueso">Ubicación</h2>
            <div className="mt-6 border border-acero">
              <iframe
                src={NEGOCIO.mapaEmbed}
                title={`Mapa de ubicación de ${NEGOCIO.nombre}`}
                className="h-72 w-full grayscale contrast-125"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────── */}
        <section className="border-t border-acero">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center">
            <h2 className="titulo-display text-4xl text-hueso sm:text-6xl">
              ¿Listo para verte <span className="text-laton">bien macho</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ceniza">
              Reserva en menos de un minuto. Sin registro, sin vueltas.
            </p>
            <Link href="/reservar" className="btn-oro mt-8">
              Reservar ahora
            </Link>
          </div>
        </section>
      </main>
      <BotonFlotanteWhatsApp />
      <PiePagina />
    </>
  );
}
