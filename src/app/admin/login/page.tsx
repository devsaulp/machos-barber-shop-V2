'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { clienteNavegador } from '@/lib/supabase/navegador';

export default function PaginaLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    const sb = clienteNavegador();
    const { error } = await sb.auth.signInWithPassword({ email, password: clave });
    if (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      setCargando(false);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="franja-barbero" aria-hidden="true" />
        <div className="tarjeta border-t-0 p-8">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-laton" />
            <h1 className="titulo-display text-2xl text-hueso">Panel del jefe</h1>
          </div>
          <p className="mt-1 text-sm text-ceniza">Acceso solo para el dueño de la barbería.</p>
          <form onSubmit={entrar} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="etiqueta">Correo</label>
              <input
                id="email"
                type="email"
                className="campo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="clave" className="etiqueta">Contraseña</label>
              <input
                id="clave"
                type="password"
                className="campo"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="border border-barbero bg-barbero/10 p-3 text-sm text-hueso" role="alert">{error}</p>}
            <button type="submit" disabled={cargando} className="btn-oro w-full disabled:opacity-60">
              {cargando && <Loader2 className="animate-spin" size={16} />} Entrar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
