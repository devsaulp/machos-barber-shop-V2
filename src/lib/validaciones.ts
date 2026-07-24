import { z } from 'zod';

// Validaciones compartidas por los endpoints de la API.
// ★ MEJORA: el teléfono se valida como celular peruano (9 dígitos, empieza en 9)
//   y el nombre se recorta y limita para evitar datos basura.

const uuid = z.string().uuid({ message: 'Identificador inválido.' });
const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (se espera YYYY-MM-DD).');
const horaHHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida (se espera HH:MM).');

export const esquemaDisponibilidad = z.object({
  servicio_id: uuid,
  fecha: fechaISO,
  barbero_id: uuid.nullish(), // null o ausente = cualquier barbero
});

export const esquemaCrearCita = z.object({
  servicio_id: uuid,
  barbero_id: uuid.nullish(),
  fecha: fechaISO,
  hora_inicio: horaHHMM,
  nombre_cliente: z
    .string()
    .trim()
    .min(2, 'Ingresa tu nombre completo.')
    .max(60, 'El nombre es demasiado largo.'),
  telefono: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, 'Ingresa un celular peruano válido de 9 dígitos (ej. 942123456).'),
  tipo_cliente: z.enum(['niño', 'adulto'], {
    message: 'Indica si el corte es para niño o adulto.',
  }),
  con_lavado: z.boolean().optional().default(false),
});

export type DatosCrearCita = z.infer<typeof esquemaCrearCita>;
