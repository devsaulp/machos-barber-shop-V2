-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: tipo de cliente (niño/adulto) + lavado opcional
-- Para bases de datos que YA ejecutaron schema.sql.
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- (Si vas a crear la BD desde cero, NO necesitas este archivo: el schema.sql
--  actualizado ya incluye estas columnas.)
-- ═══════════════════════════════════════════════════════════════════════════

alter table citas
  add column if not exists tipo_cliente text
    check (tipo_cliente in ('niño', 'adulto'));

alter table citas
  add column if not exists con_lavado boolean not null default false;

-- Precio total cobrado (servicio + extras) congelado al momento de reservar,
-- así las estadísticas no cambian si luego suben los precios.
alter table citas
  add column if not exists precio_total numeric(8,2);
