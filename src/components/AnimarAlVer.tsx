'use client';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMADOR AL VER (Intersection Observer)
// Agrega clases de animación cuando el elemento entra en el viewport.
// Usa las clases CSS definidas en globals.css (animar-entrada, animar-izq, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Tipo de animación */
  tipo?: 'entrada' | 'izquierda' | 'derecha' | 'escala' | 'stagger';
  /** Clase adicional */
  className?: string;
  /** Tag HTML a usar */
  as?: keyof JSX.IntrinsicElements;
  /** Umbral de visibilidad (0–1) */
  threshold?: number;
  /** Delay CSS adicional en ms */
  delay?: number;
}

const CLASES_TIPO: Record<string, string> = {
  entrada: 'animar-entrada',
  izquierda: 'animar-izq',
  derecha: 'animar-der',
  escala: 'animar-escala',
  stagger: 'stagger-children',
};

export default function AnimarAlVer({
  children,
  tipo = 'entrada',
  className = '',
  as: Tag = 'div',
  threshold = 0.15,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add('visible');
      return;
    }

    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay]);

  const Component = Tag as React.ElementType;

  return (
    <Component ref={ref} className={`${CLASES_TIPO[tipo] ?? 'animar-entrada'} ${className}`}>
      {children}
    </Component>
  );
}
