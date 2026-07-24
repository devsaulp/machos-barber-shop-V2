import type { Metadata } from 'next';
import { NEGOCIO } from '@/lib/config';
// Fuentes auto-hospedadas (sin depender de Google Fonts en cada build):
// Anton: display condensada tipo cartel de boxeo. Barlow: cuerpo legible.
import '@fontsource/anton';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(NEGOCIO.url),
  title: {
    default: `${NEGOCIO.nombre} | Barbería en Tarapoto`,
    template: `%s | ${NEGOCIO.nombre}`,
  },
  description: NEGOCIO.descripcion,
  keywords: ['barbería', 'Tarapoto', 'corte de cabello', 'barba', 'fade', 'reservar cita', 'barber shop'],
  openGraph: {
    title: `${NEGOCIO.nombre} | Barbería en Tarapoto`,
    description: NEGOCIO.descripcion,
    url: NEGOCIO.url,
    siteName: NEGOCIO.nombre,
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${NEGOCIO.nombre} | Barbería en Tarapoto`,
    description: NEGOCIO.descripcion,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
