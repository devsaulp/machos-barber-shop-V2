// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL NEGOCIO
// ★ MEJORA: todos los datos del cliente viven aquí. Para lanzar el sitio solo
//   se edita este archivo (y el schema.sql con los datos reales).
// ═══════════════════════════════════════════════════════════════════════════

export const NEGOCIO = {
  nombre: 'MACHOS BARBER SHOP',
  eslogan: 'Cortes con carácter',
  descripcion:
    'Barbería en Tarapoto. Cortes clásicos, fades, diseños freestyle y ritual de barba. Máquina, navaja y cero floro. Reserva tu cita online.',
  // ✏️ Reemplaza con la dirección real del local
  direccion: 'Jr. San Pablo de la Cruz N° 123, Tarapoto, San Martín',
  // ✏️ Número de WhatsApp SOLO dígitos, con código de país (51 = Perú)
  whatsapp: '51960063993',
  whatsappBonito: '+51 960 063 993',
  horarioTexto: 'Lunes a sábado · 9:00 a.m. – 8:00 p.m.',
  // ✏️ En Google Maps: buscar el local → Compartir → Insertar mapa → copiar el src del iframe
  mapaEmbed:
    'https://www.google.com/maps?q=Plaza+de+Armas+Tarapoto+Peru&output=embed',
  redes: {
    instagram: 'https://instagram.com/machosbarbershop',
    facebook: 'https://facebook.com/machosbarbershop',
    tiktok: 'https://tiktok.com/@machosbarbershop',
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://machosbarbershop.vercel.app',
} as const;

// ★ Extra opcional de lavado (pedido del cliente). Edita precio y minutos aquí.
export const LAVADO = {
  /** Precio adicional en soles */
  precio: 5,
  /** Minutos extra que agrega al servicio */
  minutosExtra: 10,
} as const;

// Etiquetas del tipo de cliente (niño / adulto)
export const TIPOS_CLIENTE = ['niño', 'adulto'] as const;
export type TipoCliente = (typeof TIPOS_CLIENTE)[number];

// Reglas del sistema de reservas
export const RESERVAS = {
  /** Máximo de días de anticipación para reservar */
  diasMaxAnticipacion: 30,
  /** Minutos mínimos de anticipación para reservar hoy mismo */
  minutosMinAnticipacion: 30,
  /** Cada cuántos minutos se genera un slot de inicio */
  pasoSlotMin: 30,
} as const;

/** Mensaje prellenado de WhatsApp al confirmar una reserva */
export function mensajeWhatsApp(datos: {
  nombre: string;
  servicio: string;
  barbero: string;
  fecha: string;
  hora: string;
  codigo?: string;
}): string {
  const base = `Hola, soy ${datos.nombre}, reservé ${datos.servicio} con ${datos.barbero} el ${datos.fecha} a las ${datos.hora}.`;
  return datos.codigo ? `${base} Código de reserva: ${datos.codigo}.` : base;
}

/** Link wa.me con mensaje prellenado */
export function linkWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${NEGOCIO.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

// ── Datos de respaldo ────────────────────────────────────────────────────────
// ★ MEJORA: si Supabase no responde (o aún no está configurado), el sitio
//   público igual se renderiza con estos datos en vez de romperse.
export const SERVICIOS_FALLBACK = [
  { id: 'f1', nombre: 'Corte clásico', descripcion: 'Máquina y tijera, acabado a navaja en contornos.', duracion_min: 30, precio: 20, activo: true },
  { id: 'f2', nombre: 'Corte + barba', descripcion: 'El combo completo: corte a tu estilo más perfilado y ritual de barba.', duracion_min: 45, precio: 35, activo: true },
  { id: 'f3', nombre: 'Ritual de barba', descripcion: 'Toalla caliente, aceites, navaja y perfilado. Tu barba, en serio.', duracion_min: 30, precio: 25, activo: true },
  { id: 'f4', nombre: 'Diseño freestyle', descripcion: 'Líneas, tribales o el diseño que te atrevas a pedir. Precisión milimétrica.', duracion_min: 40, precio: 25, activo: true },
];

export const BARBEROS_FALLBACK = [
  { id: 'b1', nombre: 'Carlos «El Patrón» Ramírez', descripcion: 'Fundador. Cortes clásicos, fades y navaja tradicional. 10 años domando melenas.', foto_url: null, activo: true },
  { id: 'b2', nombre: 'Jorge «El Navaja» Torres', descripcion: 'Diseños freestyle, cejas y barbas. Pulso de cirujano, actitud de campeón.', foto_url: null, activo: true },
];
