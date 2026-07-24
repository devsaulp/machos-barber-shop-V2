'use client';

// ═══════════════════════════════════════════════════════════════════════════
// HERO ANIMADO — sección principal con imagen de fondo, partículas y texto
// animado. Toda la magia visual del "above the fold".
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Scissors } from 'lucide-react';
import { linkWhatsApp } from '@/lib/config';

export default function HeroAnimado() {
  const [cargado, setCargado] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Trigger entrance animations after mount
    const timer = setTimeout(() => setCargado(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Parallax on mouse move (desktop only)
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    function onMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      hero!.style.setProperty('--mx', `${x * 8}px`);
      hero!.style.setProperty('--my', `${y * 8}px`);
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[100vh] overflow-hidden flex items-center">
      {/* Background image with Ken Burns */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-barber.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          style={{
            animation: 'ken-burns 25s ease-in-out infinite alternate',
            transform: 'translate(var(--mx, 0), var(--my, 0)) scale(1.05)',
            transition: 'transform 0.3s ease-out',
          }}
        />
        {/* Layered overlays for depth */}
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-humo via-transparent to-humo/60" />
      </div>

      {/* Floating decorative elements */}
      <div
        aria-hidden="true"
        className="flotante absolute right-[15%] top-[20%] hidden text-laton/10 lg:block"
      >
        <Scissors size={120} strokeWidth={0.8} />
      </div>
      <div
        aria-hidden="true"
        className="flotante-delay absolute left-[10%] bottom-[25%] hidden text-barbero/10 lg:block"
        style={{ transform: 'rotate(45deg)' }}
      >
        <Scissors size={80} strokeWidth={0.8} />
      </div>

      {/* Animated barber stripe at top */}
      <div className="franja-barbero-animada absolute top-0 left-0 right-0 z-10" />

      {/* Watermark */}
      <div
        aria-hidden="true"
        className="titulo-display pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 select-none text-[22rem] text-hueso/[0.03] lg:block"
        style={{
          transform: 'translate(var(--mx, 0), var(--my, 0)) translateY(-50%)',
          transition: 'transform 0.5s ease-out',
        }}
      >
        M
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <p
          className={`eyebrow mb-4 transition-all duration-700 ${
            cargado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Barbería · Tarapoto, Perú
        </p>

        <h1 className="titulo-display text-6xl sm:text-8xl lg:text-9xl">
          <span
            className={`block text-hueso transition-all duration-700 delay-200 ${
              cargado ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            Machos
          </span>
          <span
            className={`texto-contorno block transition-all duration-700 delay-500 ${
              cargado ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            Barber Shop
          </span>
        </h1>

        <p
          className={`mt-6 max-w-xl text-lg text-ceniza transition-all duration-700 delay-700 ${
            cargado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Cortes con carácter. Máquina, tijera y navaja en manos que saben lo que hacen.
          Entras hecho un desastre,{' '}
          <span className="font-semibold text-hueso">sales hecho un macho</span>.
        </p>

        <div
          className={`mt-8 flex flex-wrap gap-4 transition-all duration-700 delay-1000 ${
            cargado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <Link href="/reservar" className="btn-oro pulso-dorado">
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

      {/* Bottom stripe */}
      <div className="franja-barbero-animada absolute bottom-0 left-0 right-0 z-10" />

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 delay-[1400ms] ${
          cargado ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-ceniza/60">
          <span className="text-[10px] uppercase tracking-widest">Explorar</span>
          <div className="h-8 w-[2px] bg-gradient-to-b from-laton to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}
