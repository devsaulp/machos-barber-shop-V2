import Link from 'next/link';
import { Instagram, Facebook, MapPin, Phone, MessageCircle } from 'lucide-react';
import { NEGOCIO, linkWhatsApp } from '@/lib/config';

/* Barra de navegación pública, fija arriba */
export function BarraNavegacion() {
  return (
    <header className="sticky top-0 z-40 border-b border-acero bg-humo/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="titulo-display text-xl text-hueso sm:text-2xl">
          MACHOS <span className="text-laton">BARBER SHOP</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/servicios" className="hidden text-sm font-semibold uppercase tracking-widest text-ceniza hover:text-laton sm:block">
            Servicios
          </Link>
          <Link href="/reservar" className="btn-oro px-4 py-2 text-xs sm:px-6 sm:text-sm">
            Reservar cita
          </Link>
        </nav>
      </div>
      <div className="franja-barbero" aria-hidden="true" />
    </header>
  );
}

/* Botón flotante de WhatsApp (mejora mobile-first: siempre a un toque) */
export function BotonFlotanteWhatsApp() {
  return (
    <a
      href={linkWhatsApp('Hola, quiero información sobre la barbería.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-humo shadow-lg shadow-black/50 transition-transform hover:scale-110"
    >
      <MessageCircle size={28} strokeWidth={2.2} />
    </a>
  );
}

/* Pie de página con datos de contacto y redes */
export function PiePagina() {
  return (
    <footer className="border-t border-acero bg-carbon">
      <div className="franja-barbero" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="titulo-display text-2xl text-hueso">
            MACHOS <span className="text-laton">BARBER SHOP</span>
          </p>
          <p className="mt-2 text-sm text-ceniza">
            {NEGOCIO.eslogan}. Tarapoto, Perú.
          </p>
        </div>
        <div className="space-y-2 text-sm text-ceniza">
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0 text-laton" />
            {NEGOCIO.direccion}
          </p>
          <p className="flex items-center gap-2">
            <Phone size={16} className="shrink-0 text-laton" />
            {NEGOCIO.whatsappBonito}
          </p>
          <p className="text-ceniza">{NEGOCIO.horarioTexto}</p>
        </div>
        <div>
          <p className="etiqueta">Síguenos</p>
          <div className="flex gap-3">
            <a href={NEGOCIO.redes.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center border border-acero text-ceniza hover:border-laton hover:text-laton">
              <Instagram size={18} />
            </a>
            <a href={NEGOCIO.redes.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center border border-acero text-ceniza hover:border-laton hover:text-laton">
              <Facebook size={18} />
            </a>
            <a href={NEGOCIO.redes.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
              className="flex h-10 w-10 items-center justify-center border border-acero text-ceniza hover:border-laton hover:text-laton text-xs font-bold">
              TT
            </a>
          </div>
        </div>
      </div>
      <p className="border-t border-acero py-4 text-center text-xs text-ceniza/60">
        © {new Date().getFullYear()} {NEGOCIO.nombre} · Hecho con carácter en Tarapoto
      </p>
    </footer>
  );
}

/* Iniciales para el avatar de un barbero sin foto */
export function iniciales(nombre: string): string {
  return nombre
    .replace(/«[^»]*»/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}
