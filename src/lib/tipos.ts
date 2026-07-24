// Tipos compartidos por toda la aplicación

export interface Barbero {
  id: string;
  nombre: string;
  descripcion: string | null;
  foto_url: string | null;
  activo: boolean;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  duracion_min: number;
  precio: number;
  activo: boolean;
}

/** Convención: 0 = domingo … 6 = sábado (igual que Date.getDay de JS) */
export interface Horario {
  id: string;
  barbero_id: string;
  dia_semana: number;
  hora_apertura: string; // 'HH:MM:SS'
  hora_cierre: string;
}

export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface Cita {
  id: string;
  codigo: string;
  barbero_id: string;
  servicio_id: string;
  fecha: string; // 'YYYY-MM-DD'
  hora_inicio: string;
  hora_fin: string;
  nombre_cliente: string;
  telefono: string;
  tipo_cliente: 'niño' | 'adulto' | null;
  con_lavado: boolean;
  precio_total: number | null;
  estado: EstadoCita;
  creado_en: string;
}

export interface Bloqueo {
  id: string;
  barbero_id: string | null; // null = toda la barbería
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string | null;
}

/** Slot de disponibilidad que devuelve la API */
export interface SlotDisponible {
  hora: string; // 'HH:MM'
  barberos: string[]; // ids de barberos libres en ese horario
}
