import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        humo: '#0C0B09',      // fondo principal (negro cálido)
        carbon: '#15130F',    // superficies / tarjetas
        acero: '#2B2820',     // bordes
        hueso: '#EDE8DD',     // texto principal
        ceniza: '#9C948A',    // texto secundario
        laton: '#C9A227',     // dorado latón (acento principal)
        latonclaro: '#E3BE45',
        barbero: '#A32633',   // rojo de poste de barbero (acento secundario)
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        body: ['Barlow', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        rotulo: '0.25em',
      },
    },
  },
  plugins: [],
};
export default config;
