import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con service role: SALTA el RLS. Úsalo SOLO en el servidor
 * (route handlers). Nunca importar desde componentes de cliente.
 */
export function clienteAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
