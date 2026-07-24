import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { BarraNavegacion, BotonFlotanteWhatsApp, PiePagina } from '@/components/PublicoUI';
import { SERVICIOS_FALLBACK } from '@/lib/config';
import { clientePublico } from '@/lib/supabase/publico';
import type { Servicio } from '@/lib/tipos';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Cortes clásicos, fades, diseños freestyle y ritual de barba en Tarapoto. Mira precios y duración de cada servicio.',
};

async function obtenerServicios(): Promise<Servicio[]> {
  try {
    const sb = clientePublico();
    const { data } = await sb.from('servicios').select('*').eq('activo', true).order('precio');
    return data?.length ? data : (SERVICIOS_FALLBACK as Servicio[]);
  } catch {
    return SERVICIOS_FALLBACK as Servicio[];
  }
}

export default async function PaginaServicios() {
  const servicios = await obtenerServicios();

  return (
    <>
      <BarraNavegacion />
      <main className="mx-auto max-w-4xl px-4 py-16">
        <p className="eyebrow">El arsenal completo</p>
        <h1 className="titulo-display mt-2 text-5xl text-hueso sm:text-6xl">
          Nuestros <span className="text-laton">servicios</span>
        </h1>
        <p className="mt-4 max-w-xl text-ceniza">
          Precios claros, sin sorpresas. Todos los servicios incluyen la atención de un
          maestro barbero y el acabado que te mereces.
        </p>

        <div className="mt-10 divide-y divide-acero border border-acero">
          {servicios.map((s) => (
            <article key={s.id} className="flex items-start justify-between gap-4 p-6">
              <div>
                <h2 className="font-body text-xl font-bold uppercase tracking-wide text-hueso">{s.nombre}</h2>
                {s.descripcion && <p className="mt-1 text-sm text-ceniza">{s.descripcion}</p>}
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ceniza">
                  <Clock size={13} className="text-laton" /> {s.duracion_min} minutos
                </p>
              </div>
              <p className="titulo-display shrink-0 text-4xl text-laton">S/{Number(s.precio).toFixed(0)}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/reservar" className="btn-oro">Reservar cita</Link>
        </div>
      </main>
      <BotonFlotanteWhatsApp />
      <PiePagina />
    </>
  );
}
