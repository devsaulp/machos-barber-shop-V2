import { NextResponse } from 'next/server';
import { clienteAdmin } from '@/lib/supabase/admin';

// Catálogo público: servicios y barberos activos + días de atención.
// Lo consume el asistente de reservas. Siempre dinámico (datos frescos).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sb = clienteAdmin();
    const [servicios, barberos, horarios] = await Promise.all([
      sb.from('servicios').select('id, nombre, descripcion, duracion_min, precio').eq('activo', true).order('precio'),
      sb.from('barberos').select('id, nombre, descripcion, foto_url').eq('activo', true).order('nombre'),
      sb.from('horarios').select('barbero_id, dia_semana'),
    ]);

    return NextResponse.json({
      servicios: servicios.data ?? [],
      barberos: barberos.data ?? [],
      horarios: horarios.data ?? [],
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo cargar el catálogo.' }, { status: 500 });
  }
}
