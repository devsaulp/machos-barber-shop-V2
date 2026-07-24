-- ═══════════════════════════════════════════════════════════════════════════
-- MACHOS BARBER SHOP · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- Extensiones necesarias
create extension if not exists btree_gist;   -- para el constraint anti-superposición
create extension if not exists pgcrypto;     -- para gen_random_uuid()

-- Tipo de rango sobre TIME (permite detectar superposición de horas)
do $$ begin
  create type timerange as range (subtype = time);
exception when duplicate_object then null; end $$;

-- Estados posibles de una cita
do $$ begin
  create type estado_cita as enum ('pendiente', 'confirmada', 'completada', 'cancelada');
exception when duplicate_object then null; end $$;

-- ───────────────────────────────────────────────────────────────────────────
-- TABLAS
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists barberos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  foto_url    text,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

create table if not exists servicios (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  descripcion  text,
  duracion_min int not null check (duracion_min > 0),
  precio       numeric(8,2) not null check (precio >= 0),
  activo       boolean not null default true,
  creado_en    timestamptz not null default now()
);

-- Horario semanal de cada barbero.
-- Convención dia_semana: 0 = domingo, 1 = lunes, ... 6 = sábado (igual que JS)
create table if not exists horarios (
  id            uuid primary key default gen_random_uuid(),
  barbero_id    uuid not null references barberos(id) on delete cascade,
  dia_semana    int  not null check (dia_semana between 0 and 6),
  hora_apertura time not null,
  hora_cierre   time not null,
  check (hora_apertura < hora_cierre),
  unique (barbero_id, dia_semana)
);

create table if not exists citas (
  id             uuid primary key default gen_random_uuid(),
  -- Código corto y legible para que el cliente identifique su reserva
  codigo         text not null unique default upper(substr(md5(random()::text), 1, 6)),
  barbero_id     uuid not null references barberos(id),
  servicio_id    uuid not null references servicios(id),
  fecha          date not null,
  hora_inicio    time not null,
  hora_fin       time not null,
  nombre_cliente text not null,
  telefono       text not null,
  -- ¿Para quién es el corte? (pedido del cliente)
  tipo_cliente   text check (tipo_cliente in ('niño', 'adulto')),
  -- Lavado como extra opcional
  con_lavado     boolean not null default false,
  -- Precio total (servicio + extras) congelado al reservar
  precio_total   numeric(8,2),
  estado         estado_cita not null default 'pendiente',
  creado_en      timestamptz not null default now(),
  check (hora_inicio < hora_fin),

  -- ★ MEJORA CLAVE: constraint de exclusión a nivel de base de datos.
  -- Hace IMPOSIBLE que existan dos citas activas del mismo barbero que se
  -- superpongan en el tiempo, incluso si dos personas reservan a la vez.
  constraint citas_sin_superposicion exclude using gist (
    barbero_id with =,
    fecha with =,
    timerange(hora_inicio, hora_fin) with &&
  ) where (estado in ('pendiente', 'confirmada'))
);

-- Índice para consultas de agenda y disponibilidad
create index if not exists idx_citas_barbero_fecha on citas (barbero_id, fecha);
create index if not exists idx_citas_fecha on citas (fecha);

-- Bloqueos de horario: feriados, almuerzo, ausencias.
-- barbero_id NULL = bloqueo para TODA la barbería.
create table if not exists bloqueos (
  id          uuid primary key default gen_random_uuid(),
  barbero_id  uuid references barberos(id) on delete cascade,
  fecha       date not null,
  hora_inicio time not null default '00:00',
  hora_fin    time not null default '23:59',
  motivo      text,
  creado_en   timestamptz not null default now(),
  check (hora_inicio < hora_fin)
);

create index if not exists idx_bloqueos_fecha on bloqueos (fecha);

-- ───────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
--
-- Filosofía de seguridad (mejora sobre el diseño original):
--   · Los visitantes anónimos SOLO pueden LEER servicios, barberos y horarios.
--   · Los visitantes NO leen ni insertan directamente en `citas`: la creación
--     pasa por el endpoint del servidor (service role), que valida y evita
--     exponer nombres y teléfonos de otros clientes al público.
--   · El usuario autenticado (dueño) tiene acceso total desde el panel.
-- ───────────────────────────────────────────────────────────────────────────

alter table barberos  enable row level security;
alter table servicios enable row level security;
alter table horarios  enable row level security;
alter table citas     enable row level security;
alter table bloqueos  enable row level security;

-- Lectura pública del catálogo (solo registros activos)
create policy "publico_lee_barberos"  on barberos  for select using (activo = true);
create policy "publico_lee_servicios" on servicios for select using (activo = true);
create policy "publico_lee_horarios"  on horarios  for select using (true);

-- Acceso total para el dueño autenticado (panel de administración)
create policy "admin_todo_barberos"  on barberos  for all to authenticated using (true) with check (true);
create policy "admin_todo_servicios" on servicios for all to authenticated using (true) with check (true);
create policy "admin_todo_horarios"  on horarios  for all to authenticated using (true) with check (true);
create policy "admin_todo_citas"     on citas     for all to authenticated using (true) with check (true);
create policy "admin_todo_bloqueos"  on bloqueos  for all to authenticated using (true) with check (true);

-- ───────────────────────────────────────────────────────────────────────────
-- DATOS DE EJEMPLO (edítalos con los datos reales de tu cliente)
-- ───────────────────────────────────────────────────────────────────────────

insert into barberos (id, nombre, descripcion) values
  ('11111111-1111-1111-1111-111111111111', 'Carlos «El Patrón» Ramírez', 'Fundador. Cortes clásicos, fades y navaja tradicional. 10 años domando melenas.'),
  ('22222222-2222-2222-2222-222222222222', 'Jorge «El Navaja» Torres',   'Diseños freestyle, cejas y barbas. Pulso de cirujano, actitud de campeón.')
on conflict (id) do nothing;

insert into servicios (nombre, descripcion, duracion_min, precio) values
  ('Corte clásico',   'Máquina y tijera, acabado a navaja en contornos.',                            30, 20.00),
  ('Corte + barba',   'El combo completo: corte a tu estilo más perfilado y ritual de barba.',       45, 35.00),
  ('Ritual de barba', 'Toalla caliente, aceites, navaja y perfilado. Tu barba, en serio.',           30, 25.00),
  ('Diseño freestyle','Líneas, tribales o el diseño que te atrevas a pedir. Precisión milimétrica.', 40, 25.00)
on conflict do nothing;

-- Horario: lunes (1) a sábado (6), de 9:00 a 20:00, para ambos barberos
insert into horarios (barbero_id, dia_semana, hora_apertura, hora_cierre)
select b.id, d, time '09:00', time '20:00'
from barberos b, generate_series(1, 6) as d
on conflict (barbero_id, dia_semana) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════
-- IMPORTANTE: después de ejecutar este script, crea el usuario administrador:
-- Supabase → Authentication → Users → "Add user" → email + contraseña.
-- Con ese usuario entrarás a /admin/login.
-- ═══════════════════════════════════════════════════════════════════════════
