'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, LogOut, Scissors, ShieldBan, Users } from 'lucide-react';
import { clienteNavegador } from '@/lib/supabase/navegador';

const SECCIONES = [
  { href: '/admin', etiqueta: 'Agenda', icono: CalendarDays },
  { href: '/admin/servicios', etiqueta: 'Servicios', icono: Scissors },
  { href: '/admin/barberos', etiqueta: 'Barberos', icono: Users },
  { href: '/admin/bloqueos', etiqueta: 'Bloqueos', icono: ShieldBan },
];

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const router = useRouter();

  async function salir() {
    await clienteNavegador().auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-acero bg-carbon">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="titulo-display text-lg text-hueso">
            MACHOS <span className="text-laton">· PANEL</span>
          </Link>
          <button onClick={salir} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ceniza hover:text-laton">
            <LogOut size={14} /> Salir
          </button>
        </div>
        <div className="franja-barbero" aria-hidden="true" />
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {SECCIONES.map(({ href, etiqueta, icono: Icono }) => {
            const activo = ruta === href;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-bold uppercase tracking-wider ${
                  activo ? 'border-laton text-laton' : 'border-transparent text-ceniza hover:text-hueso'
                }`}
              >
                <Icono size={14} /> {etiqueta}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
