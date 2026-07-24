import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente para componentes de cliente ('use client') del panel de admin.
 * Mantiene la sesión del dueño en cookies; RLS limita lo que puede hacer.
 */
export function clienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
