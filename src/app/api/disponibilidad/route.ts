import { NextRequest, NextResponse } from 'next/server';
import { calcularDisponibilidad, ErrorDisponibilidad } from '@/lib/disponibilidad';
import { esquemaDisponibilidad } from '@/lib/validaciones';
import { LAVADO } from '@/lib/config';

// GET /api/disponibilidad?servicio_id=...&fecha=YYYY-MM-DD[&barbero_id=...][&lavado=1]
// Devuelve los horarios libres SIN exponer datos de otros clientes.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parseo = esquemaDisponibilidad.safeParse({
    servicio_id: params.get('servicio_id'),
    fecha: params.get('fecha'),
    barbero_id: params.get('barbero_id') || null,
  });

  if (!parseo.success) {
    return NextResponse.json({ error: parseo.error.issues[0].message }, { status: 400 });
  }

  try {
    const { slots } = await calcularDisponibilidad({
      servicioId: parseo.data.servicio_id,
      fecha: parseo.data.fecha,
      barberoId: parseo.data.barbero_id,
      minutosExtra: params.get('lavado') === '1' ? LAVADO.minutosExtra : 0,
    });
    return NextResponse.json({ slots });
  } catch (e) {
    if (e instanceof ErrorDisponibilidad) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('Error en disponibilidad:', e);
    return NextResponse.json({ error: 'Error al calcular la disponibilidad.' }, { status: 500 });
  }
}
