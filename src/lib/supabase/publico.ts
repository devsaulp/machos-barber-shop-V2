import { createClient } from '@supabase/supabase-js';

/**
 * Cliente público (anon key). Solo puede leer el catálogo gracias a RLS.
 * Se usa en Server Components públicos (inicio, servicios).
 */
export function clientePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
