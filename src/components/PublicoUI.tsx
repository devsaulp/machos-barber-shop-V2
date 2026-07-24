import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, MapPin, Phone, MessageCircle } from 'lucide-react';
import { NEGOCIO, linkWhatsApp } from '@/lib/config';

/* Barra de navegación pública, fija arriba — con el logo circular y nombre a la derecha */
export function BarraNavegacion() {
  return (
    <header className="sticky top-0 z-40 border-b border-acero bg-humo/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:py-2.5">
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          {/* Logo circular original en 50-60px */}
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full border-2 border-laton/60 shadow-lg shadow-black/60 transition-transform group-hover:scale-105 group-hover:border-laton">
            <Image
              src="/images/logo-machos.jpg"
              alt="Machos Barber Shop Logo"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 48px, 56px"
            />
          </div>
          {/* Nombre a la derecha del logo */}
          <div className="flex flex-col justify-center">
            <span className="titulo-display text-lg sm:text-2xl text-hueso tracking-wider transition-colors group-hover:text-laton">
              MACHOS <span className="text-laton">BARBER SHOP</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-ceniza sm:block">
              {NEGOCIO.eslogan}
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/servicios"
            className="hidden text-sm font-semibold uppercase tracking-widest text-ceniza transition-colors hover:text-laton sm:block"
          >
            Servicios
          </Link>
          <Link href="/reservar" className="btn-oro px-3.5 py-2 text-xs sm:px-6 sm:text-sm">
            Reservar cita
          </Link>
        </nav>
      </div>
      {/* Única franja animada del sitio */}
      <div className="franja-barbero-animada" aria-hidden="true" />
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

/* Pie de página con datos de contacto y redes — franja animada al final */
export function PiePagina() {
  return (
    <footer className="border-t border-acero bg-carbon">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-laton/40">
              <Image
                src="/images/logo-machos.jpg"
                alt="Machos Barber Shop Logo"
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <span className="titulo-display text-xl text-hueso">
              MACHOS <span className="text-laton">BARBER SHOP</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-ceniza">
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
            <a
              href={NEGOCIO.redes.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center border border-acero text-ceniza transition-colors hover:border-laton hover:text-laton"
            >
              <Instagram size={18} />
            </a>
            <a
              href={NEGOCIO.redes.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center border border-acero text-ceniza transition-colors hover:border-laton hover:text-laton"
            >
              <Facebook size={18} />
            </a>
            <a
              href={NEGOCIO.redes.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex h-10 w-10 items-center justify-center border border-acero text-xs font-bold text-ceniza transition-colors hover:border-laton hover:text-laton"
            >
              TT
            </a>
          </div>
        </div>
      </div>
      <p className="border-t border-acero py-4 text-center text-xs text-ceniza/60">
        © {new Date().getFullYear()} {NEGOCIO.nombre} · Developer´s Company
      </p>
      {/* Última franja animada */}
      <div className="franja-barbero-animada" aria-hidden="true" />
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
