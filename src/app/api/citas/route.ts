import { NextRequest, NextResponse } from 'next/server';
import { clienteAdmin } from '@/lib/supabase/admin';
import { calcularDisponibilidad, ErrorDisponibilidad } from '@/lib/disponibilidad';
import { esquemaCrearCita } from '@/lib/validaciones';
import { aHora, aMinutos, fechaLegible } from '@/lib/fechas';
import { LAVADO } from '@/lib/config';

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/citas — crea una reserva SIN registro de usuario.
// Defensa en profundidad contra dobles reservas:
//   1. Se recalcula la disponibilidad en el servidor justo antes de insertar.
//   2. El constraint `citas_sin_superposicion` de PostgreSQL rechaza cualquier
//      superposición que se cuele por una condición de carrera (código 23P01).
// ═══════════════════════════════════════════════════════════════════════════

// ★ MEJORA: rate limiting simple por IP para frenar spam de reservas.
// (En serverless cada instancia tiene su propia memoria: es una primera
// barrera, no un límite perfecto. Para algo estricto usar Upstash/Redis.)
const ventanas = new Map<string, number[]>();
const LIMITE = 5; // máx. reservas
const VENTANA_MS = 60_000; // por minuto

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const marcas = (ventanas.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (marcas.length >= LIMITE) return true;
  marcas.push(ahora);
  ventanas.set(ip, marcas);
  return false;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconocida';
  if (excedeLimite(ip)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.' },
      { status: 429 }
    );
  }

  // ── Validar cuerpo ─────────────────────────────────────────────────────
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido.' }, { status: 400 });
  }
  const parseo = esquemaCrearCita.safeParse(cuerpo);
  if (!parseo.success) {
    return NextResponse.json({ error: parseo.error.issues[0].message }, { status: 400 });
  }
  const datos = parseo.data;

  try {
    // ── Revalidar que el slot sigue libre (nunca confiar en el frontend) ──
    const minutosExtra = datos.con_lavado ? LAVADO.minutosExtra : 0;
    const { servicio, slots } = await calcularDisponibilidad({
      servicioId: datos.servicio_id,
      fecha: datos.fecha,
      barberoId: datos.barbero_id,
      minutosExtra,
    });

    const slot = slots.find((s) => s.hora === datos.hora_inicio);
    if (!slot || slot.barberos.length === 0) {
      return NextResponse.json(
        { error: 'Ese horario acaba de ocuparse. Elige otro, por favor.' },
        { status: 409 }
      );
    }

    // Si eligió "cualquier barbero", se asigna uno libre al azar
    const barberoAsignado =
      datos.barbero_id ?? slot.barberos[Math.floor(Math.random() * slot.barberos.length)];

    const inicioMin = aMinutos(datos.hora_inicio);
    const finMin = inicioMin + servicio.duracion_min + minutosExtra;
    const precioTotal = Number(servicio.precio) + (datos.con_lavado ? LAVADO.precio : 0);

    // ── Insertar (el constraint de exclusión es la última línea de defensa) ─
    const sb = clienteAdmin();
    const { data: cita, error } = await sb
      .from('citas')
      .insert({
        barbero_id: barberoAsignado,
        servicio_id: datos.servicio_id,
        fecha: datos.fecha,
        hora_inicio: datos.hora_inicio,
        hora_fin: aHora(finMin),
        nombre_cliente: datos.nombre_cliente,
        telefono: datos.telefono,
        tipo_cliente: datos.tipo_cliente,
        con_lavado: datos.con_lavado,
        precio_total: precioTotal,
        estado: 'pendiente',
      })
      .select('id, codigo, fecha, hora_inicio, barbero_id')
      .single();

    if (error) {
      // 23P01 = exclusion_violation → dos personas intentaron el mismo slot
      if (error.code === '23P01') {
        return NextResponse.json(
          { error: 'Ese horario acaba de ocuparse. Elige otro, por favor.' },
          { status: 409 }
        );
      }
      console.error('Error al insertar cita:', error);
      return NextResponse.json({ error: 'No se pudo crear la reserva.' }, { status: 500 });
    }

    // Nombre del barbero asignado, para el mensaje de confirmación
    const { data: barbero } = await sb.from('barberos').select('nombre').eq('id', barberoAsignado).single();

    return NextResponse.json(
      {
        cita: {
          codigo: cita.codigo,
          fecha: cita.fecha,
          fecha_legible: fechaLegible(cita.fecha),
          hora: cita.hora_inicio.slice(0, 5),
          servicio: datos.con_lavado ? `${servicio.nombre} + lavado` : servicio.nombre,
          barbero: barbero?.nombre ?? 'nuestro equipo',
          precio_total: precioTotal,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof ErrorDisponibilidad) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('Error al crear cita:', e);
    return NextResponse.json({ error: 'Error inesperado al crear la reserva.' }, { status: 500 });
  }
}
