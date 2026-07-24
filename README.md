# 💈 MACHOS BARBER SHOP — Web de reservas

Sitio web completo para barbería con reservas online **sin registro**, confirmación por **WhatsApp** y **panel de administración** para el dueño.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL + Auth) · Vercel

---

## 🚀 Puesta en marcha (paso a paso)

### 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo (región recomendada: `South America (São Paulo)`).
2. Ve a **SQL Editor → New query**, pega TODO el contenido de `supabase/schema.sql` y presiona **Run**.
   - Esto crea las tablas, la seguridad (RLS), el constraint anti dobles-reservas y datos de ejemplo.
3. Crea el usuario administrador (el dueño):
   - **Authentication → Users → Add user → Create new user**
   - Ingresa un correo y una contraseña fuertes. Marca **Auto Confirm User**.
   - Con esas credenciales se entra a `/admin/login`.

### 2. Obtener las claves

En **Project Settings → API** copia:

| Variable | Dónde está |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key ⚠️ **secreta, solo servidor** |

### 3. Correr en local

```bash
npm install
cp .env.example .env.local   # y completa las variables
npm run dev                  # http://localhost:3000
```

### 4. Desplegar en Vercel

1. Sube el proyecto a GitHub.
2. En [vercel.com](https://vercel.com): **Add New → Project → Import** tu repo.
3. En **Environment Variables** agrega las 4 variables de `.env.example`
   (en `NEXT_PUBLIC_SITE_URL` pon la URL final, ej. `https://machosbarbershop.vercel.app`).
4. **Deploy**. Listo: la web queda en producción con HTTPS.

---

## ✏️ Personalizar los datos del negocio

Todo lo editable está centralizado en **`src/lib/config.ts`**:

- Dirección real del local
- Número de WhatsApp (formato `51XXXXXXXXX`, solo dígitos)
- Link del mapa de Google (Compartir → Insertar mapa → copiar el `src` del iframe)
- Redes sociales
- Reglas de reserva (días de anticipación, paso de los horarios, etc.)

Los **servicios, barberos y horarios reales** se gestionan desde el panel (`/admin`), no hace falta tocar código.

---

## 🗺️ Mapa del sitio

| Ruta | Descripción |
|---|---|
| `/` | Inicio: hero, servicios, barberos, horario, mapa |
| `/servicios` | Catálogo completo con precios |
| `/reservar` | Asistente de reserva en 5 pasos (sin registro) |
| `/admin/login` | Acceso del dueño |
| `/admin` | Agenda del día/semana + estadísticas |
| `/admin/servicios` | Crear/editar servicios y precios |
| `/admin/barberos` | Barberos + editor de horario semanal |
| `/admin/bloqueos` | Feriados, almuerzos y ausencias |

---

## 🛡️ Decisiones de seguridad e integridad

- **Imposible reservar dos veces el mismo horario:** además de validar en el servidor, la tabla `citas` tiene un *constraint de exclusión* de PostgreSQL (`citas_sin_superposicion`). Aunque dos clientes confirmen al mismo tiempo, la base de datos rechaza la segunda (el sitio muestra "ese horario acaba de ocuparse").
- **Privacidad de clientes:** los visitantes anónimos **no** pueden leer la tabla de citas (nombres y teléfonos). La disponibilidad se calcula en el servidor y solo se exponen horarios libres.
- **Validación doble:** el navegador valida el formulario y el servidor vuelve a validar todo con Zod (celular peruano de 9 dígitos, fechas dentro del rango, etc.).
- **Rate limiting:** máximo 5 intentos de reserva por minuto por IP como primera barrera anti-spam.
- **Zona horaria fija:** todas las validaciones de "hoy" y "hora pasada" usan `America/Lima`, sin importar dónde corra el servidor.

## 💪 Extras incluidos

- Código corto de reserva (ej. `A3F9K2`) para identificar la cita por WhatsApp.
- Botón flotante de WhatsApp en todo el sitio público.
- Estadísticas del día/semana en la agenda (citas activas e ingresos estimados).
- El sitio público funciona incluso si Supabase no responde (datos de respaldo).
- SEO: metadata Open Graph en español, `sitemap.xml` y `robots.txt` (con `/admin` excluido).
- Accesibilidad: navegación por teclado, `aria-labels`, `prefers-reduced-motion`.

---

## 🔧 Ajustes frecuentes

**Cambiar el paso de los horarios (cada 30 min → cada 15):** en `src/lib/config.ts` cambia `pasoSlotMin`.

**Agregar fotos de barberos:** en el panel → Barberos → Editar → pega la URL de una imagen (puedes subirla a Supabase Storage y usar su URL pública).

**Cambiar colores:** paleta en `tailwind.config.ts` (colores `humo`, `laton`, `barbero`, etc.).
