-- migrations/0003_add_rut_to_users.sql
ALTER TABLE "users" ADD COLUMN "rut" varchar;

-- Crear índice para el RUT para mejorar búsquedas
CREATE INDEX "idx_users_rut" ON "users" ("rut");

-- Opcional: Si quieres que el RUT sea único, descomenta la siguiente línea
-- ALTER TABLE "users" ADD CONSTRAINT "users_rut_unique" UNIQUE("rut");