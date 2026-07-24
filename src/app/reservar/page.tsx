import type { Metadata } from 'next';
import { BarraNavegacion, PiePagina } from '@/components/PublicoUI';
import AsistenteReserva from '@/components/reserva/AsistenteReserva';

export const metadata: Metadata = {
  title: 'Reservar cita',
  description: 'Reserva tu corte en Machos Barber Shop, Tarapoto. Elige servicio, barbero, fecha y hora. Sin registro, en menos de un minuto.',
};

export default function PaginaReservar() {
  return (
    <>
      <BarraNavegacion />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="eyebrow">Sin registro · Sin vueltas</p>
        <h1 className="titulo-display mt-2 text-5xl text-hueso">
          Reserva tu <span className="text-laton">cita</span>
        </h1>
        <AsistenteReserva />
      </main>
      <PiePagina />
    </>
  );
}
