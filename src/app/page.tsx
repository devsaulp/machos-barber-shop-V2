import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, Scissors } from 'lucide-react';
import { BarraNavegacion, BotonFlotanteWhatsApp, PiePagina, iniciales } from '@/components/PublicoUI';
import HeroAnimado from '@/components/HeroAnimado';
import AnimarAlVer from '@/components/AnimarAlVer';
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
        <HeroAnimado />

        {/* ── IMAGEN + FRASE IMPACTO ────────────────────────────────────  */}
        <section className="relative overflow-hidden border-y border-acero">
          <div className="mx-auto grid max-w-6xl items-center gap-0 lg:grid-cols-2">
            {/* Imagen de herramientas */}
            <AnimarAlVer tipo="izquierda" className="parallax-img relative h-64 sm:h-80 lg:h-[420px]">
              <Image
                src="/images/barber-tools.jpg"
                alt="Herramientas de barbería profesional: navaja, tijeras, peine y brocha"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-humo/90 lg:block hidden" />
            </AnimarAlVer>
            {/* Texto */}
            <AnimarAlVer tipo="derecha" className="px-6 py-12 lg:px-16">
              <p className="eyebrow">Experiencia premium</p>
              <h2 className="titulo-display mt-3 text-4xl text-hueso sm:text-5xl">
                No es un corte.
                <br />
                <span className="shimmer-gold">Es actitud.</span>
              </h2>
              <p className="mt-5 text-ceniza leading-relaxed">
                Cada servicio es un ritual: toalla caliente, navaja afilada y un barbero que sabe
                exactamente lo que necesitas. Aquí los detalles importan.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="separador-vertical h-12" />
                <p className="text-sm text-ceniza italic">
                  &ldquo;Un hombre con buen corte ya tiene la mitad de la batalla ganada.&rdquo;
                </p>
              </div>
            </AnimarAlVer>
          </div>
        </section>

        {/* ── SERVICIOS ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <AnimarAlVer>
            <p className="eyebrow">El arsenal</p>
            <h2 className="titulo-display mt-2 text-4xl text-hueso sm:text-5xl underline-gold">
              Servicios y <span className="text-laton">precios</span>
            </h2>
          </AnimarAlVer>
          <AnimarAlVer tipo="stagger" className="mt-10 grid gap-4 sm:grid-cols-2">
            {servicios.map((s) => (
              <article
                key={s.id}
                className="tarjeta tarjeta-interactiva group flex items-start justify-between gap-4 p-6 hover:border-laton"
              >
                <div>
                  <h3 className="font-body text-lg font-bold uppercase tracking-wide text-hueso group-hover:text-laton transition-colors">
                    {s.nombre}
                  </h3>
                  {s.descripcion && <p className="mt-1 text-sm text-ceniza">{s.descripcion}</p>}
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ceniza">
                    <Clock size={13} className="text-laton" /> {s.duracion_min} min
                  </p>
                </div>
                <p className="titulo-display shrink-0 text-3xl text-laton group-hover:scale-110 transition-transform">
                  S/{Number(s.precio).toFixed(0)}
                </p>
              </article>
            ))}
          </AnimarAlVer>
          <AnimarAlVer className="mt-8">
            <Link href="/reservar" className="btn-borde group">
              Aparta tu sitio{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </AnimarAlVer>
        </section>

        {/* ── BARBERSHOP INTERIOR (parallax divider) ────────────────────  */}
        <section className="relative h-72 sm:h-96 overflow-hidden">
          <Image
            src="/images/barbershop-interior.jpg"
            alt="Interior de la barbería Machos Barber Shop"
            fill
            className="object-cover"
            style={{ animation: 'ken-burns 30s ease-in-out infinite alternate' }}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-humo/60" />
          <AnimarAlVer tipo="escala" className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="titulo-display text-5xl sm:text-7xl text-hueso text-center">
              Tu segunda <span className="shimmer-gold">casa</span>
            </p>
            <p className="mt-3 text-ceniza text-center max-w-md px-4">
              Un espacio pensado para que te relajes, converses y salgas renovado.
            </p>
          </AnimarAlVer>

        </section>

        {/* ── BARBEROS ─────────────────────────────────────────────────── */}
        <section className="border-y border-acero bg-carbon">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <AnimarAlVer>
              <p className="eyebrow">La cuadrilla</p>
              <h2 className="titulo-display mt-2 text-4xl text-hueso sm:text-5xl">
                Maestros de la <span className="text-laton">navaja</span>
              </h2>
            </AnimarAlVer>
            <AnimarAlVer tipo="stagger" className="mt-10 grid gap-6 sm:grid-cols-2">
              {barberos.map((b) => (
                <article
                  key={b.id}
                  className="tarjeta tarjeta-interactiva flex items-center gap-5 p-6 hover:border-laton group"
                >
                  {b.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.foto_url}
                      alt={b.nombre}
                      className="h-20 w-20 shrink-0 border-2 border-laton object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="titulo-display flex h-20 w-20 shrink-0 items-center justify-center border-2 border-laton text-3xl text-laton group-hover:bg-laton group-hover:text-humo transition-all">
                      {iniciales(b.nombre)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-body text-lg font-bold text-hueso group-hover:text-laton transition-colors">
                      {b.nombre}
                    </h3>
                    {b.descripcion && <p className="mt-1 text-sm text-ceniza">{b.descripcion}</p>}
                  </div>
                </article>
              ))}
            </AnimarAlVer>
          </div>
        </section>

        {/* ── PORTRAIT + STATS ──────────────────────────────────────────  */}
        <section className="overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-0 lg:grid-cols-2">
            {/* Stats */}
            <AnimarAlVer tipo="izquierda" className="order-2 lg:order-1 px-6 py-12 lg:px-16">
              <p className="eyebrow">Por qué elegirnos</p>
              <h2 className="titulo-display mt-3 text-4xl text-hueso">
                Resultado <span className="text-laton">garantizado</span>
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { valor: '10+', texto: 'Años de experiencia' },
                  { valor: '5K+', texto: 'Cortes realizados' },
                  { valor: '100%', texto: 'Satisfacción' },
                  { valor: '⭐ 5', texto: 'Calificación' },
                ].map((stat) => (
                  <div key={stat.texto} className="tarjeta tarjeta-interactiva p-4 text-center">
                    <p className="titulo-display text-3xl text-laton">{stat.valor}</p>
                    <p className="text-xs uppercase tracking-widest text-ceniza mt-1">{stat.texto}</p>
                  </div>
                ))}
              </div>
            </AnimarAlVer>
            {/* Portrait image */}
            <AnimarAlVer tipo="derecha" className="order-1 lg:order-2 parallax-img relative h-72 sm:h-96 lg:h-[500px]">
              <Image
                src="/images/macho-portrait.jpg"
                alt="Cliente satisfecho con un corte impecable"
                fill
                className="object-cover object-top"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-humo/70 lg:block hidden" />
            </AnimarAlVer>
          </div>
        </section>

        {/* ── HORARIO + MAPA ───────────────────────────────────────────── */}
        <section className="border-t border-acero">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2">
            <AnimarAlVer tipo="izquierda">
              <p className="eyebrow">Cuándo atendemos</p>
              <h2 className="titulo-display mt-2 text-4xl text-hueso">Horario</h2>
              <ul className="mt-6 divide-y divide-acero border border-acero">
                <li className="flex justify-between p-4 text-sm group hover:bg-carbon transition-colors">
                  <span className="font-semibold text-hueso">Lunes a sábado</span>
                  <span className="text-laton">9:00 a.m. – 8:00 p.m.</span>
                </li>
                <li className="flex justify-between p-4 text-sm group hover:bg-carbon transition-colors">
                  <span className="font-semibold text-hueso">Domingo</span>
                  <span className="text-ceniza">Cerrado — hasta los machos descansan</span>
                </li>
              </ul>
              <p className="mt-6 flex items-start gap-2 text-sm text-ceniza">
                <MapPin size={16} className="mt-0.5 shrink-0 text-laton" />
                {NEGOCIO.direccion}
              </p>
            </AnimarAlVer>
            <AnimarAlVer tipo="derecha">
              <p className="eyebrow">Dónde estamos</p>
              <h2 className="titulo-display mt-2 text-4xl text-hueso">Ubicación</h2>
              <div className="mt-6 border border-acero overflow-hidden tarjeta-interactiva">
                <iframe
                  src={NEGOCIO.mapaEmbed}
                  title={`Mapa de ubicación de ${NEGOCIO.nombre}`}
                  className="h-72 w-full grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </AnimarAlVer>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────── */}
        <section className="relative border-t border-acero overflow-hidden">
          {/* Subtle background image */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/barber-tools.jpg"
              alt=""
              aria-hidden="true"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <AnimarAlVer tipo="escala" className="relative mx-auto max-w-6xl px-4 py-16 text-center">
            <h2 className="titulo-display text-4xl text-hueso sm:text-6xl">
              ¿Listo para verte{' '}
              <span className="shimmer-gold">bien macho</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ceniza">
              Reserva en menos de un minuto. Sin registro, sin vueltas.
            </p>
            <Link href="/reservar" className="btn-oro mt-8 pulso-dorado">
              Reservar ahora
            </Link>
          </AnimarAlVer>

        </section>
      </main>
      <BotonFlotanteWhatsApp />
      <PiePagina />
    </>
  );
}
