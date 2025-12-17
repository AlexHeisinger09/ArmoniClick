-- ============================================
-- EJECUTAR EN BASE DE DATOS - MULTI-TENANCY
-- ============================================
-- Este archivo contiene todos los scripts SQL que debes ejecutar
-- en la base de datos de producción para completar la implementación
-- de multi-tenancy con RLS.
--
-- INSTRUCCIONES:
-- 1. Conectarte a la base de datos en Neon Dashboard
-- 2. Ejecutar este archivo completo (o ejecutar sección por sección)
-- 3. Verificar que no haya errores
-- ============================================

-- ============================================
-- PASO 1: CREAR ÍNDICES COMPUESTOS OPTIMIZADOS
-- ============================================

-- PATIENTS: Índices compuestos con id_doctor
-- ============================================

-- Eliminar índices simples antiguos (si existen)
DROP INDEX IF EXISTS idx_patients_doctor;
DROP INDEX IF EXISTS idx_patients_active;
DROP INDEX IF EXISTS idx_patients_created;

-- Crear índices compuestos optimizados
-- Índice principal: doctor + activos (query más común)
CREATE INDEX IF NOT EXISTS idx_patients_doctor_active
  ON patients(id_doctor, isActive)
  WHERE isActive = true;

-- Búsqueda por RUT dentro del tenant
CREATE INDEX IF NOT EXISTS idx_patients_doctor_rut
  ON patients(id_doctor, rut)
  WHERE isActive = true;

-- Ordenar pacientes por fecha de creación
CREATE INDEX IF NOT EXISTS idx_patients_doctor_created
  ON patients(id_doctor, createdAt DESC)
  WHERE isActive = true;

-- ============================================
-- APPOINTMENTS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_appointments_doctor;
DROP INDEX IF EXISTS idx_appointments_date;
DROP INDEX IF EXISTS idx_appointments_status;

-- Doctor + fecha (para calendario)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date
  ON appointments(doctorId, appointmentDate DESC);

-- Doctor + estado (para filtros)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_status
  ON appointments(doctorId, status);

-- Doctor + fecha + estado (query compuesta)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_status
  ON appointments(doctorId, appointmentDate DESC, status);

-- ============================================
-- TREATMENTS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_treatments_id_doctor;
DROP INDEX IF EXISTS idx_treatments_id_paciente;
DROP INDEX IF EXISTS idx_treatments_fecha_control;

-- Doctor + paciente (query más común)
CREATE INDEX IF NOT EXISTS idx_treatments_doctor_patient
  ON treatments(id_doctor, id_paciente, fecha_control DESC)
  WHERE is_active = true;

-- Doctor + fecha de control
CREATE INDEX IF NOT EXISTS idx_treatments_doctor_date
  ON treatments(id_doctor, fecha_control DESC)
  WHERE is_active = true;

-- Doctor + estado (para filtrar tratamientos pendientes/completados)
CREATE INDEX IF NOT EXISTS idx_treatments_doctor_status
  ON treatments(id_doctor, status)
  WHERE is_active = true;

-- ============================================
-- BUDGETS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_budgets_user;
DROP INDEX IF EXISTS idx_budgets_status;

-- Doctor + paciente + estado
CREATE INDEX IF NOT EXISTS idx_budgets_user_patient_status
  ON budgets(user_id, patient_id, status);

-- Doctor + fecha (para listados cronológicos)
CREATE INDEX IF NOT EXISTS idx_budgets_user_created
  ON budgets(user_id, created_at DESC);

-- ============================================
-- DOCUMENTS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_documents_doctor;
DROP INDEX IF EXISTS idx_documents_patient;

-- Doctor + paciente + tipo
CREATE INDEX IF NOT EXISTS idx_documents_doctor_patient
  ON documents(id_doctor, id_patient, document_type);

-- Doctor + estado (pendientes de firma)
CREATE INDEX IF NOT EXISTS idx_documents_doctor_status
  ON documents(id_doctor, status, createdAt DESC);

-- ============================================
-- AUDIT_LOGS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_audit_logs_changed_by;
DROP INDEX IF EXISTS idx_audit_logs_patient_id;

-- Paciente + fecha (para timeline del paciente)
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_created
  ON audit_logs(patient_id, created_at DESC);

-- Doctor que hizo el cambio + fecha
CREATE INDEX IF NOT EXISTS idx_audit_logs_changedby_created
  ON audit_logs(changed_by, created_at DESC);

-- Paciente + tipo de entidad (para filtrar por tipo de cambio)
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_entity
  ON audit_logs(patient_id, entity_type, created_at DESC);

-- ============================================
-- SERVICES: Índice compuesto
-- ============================================

-- Doctor + tipo + activos
CREATE INDEX IF NOT EXISTS idx_services_user_type_active
  ON services(user_id, tipo)
  WHERE is_active = true;

-- ============================================
-- SCHEDULE_BLOCKS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_schedule_blocks_doctor;
DROP INDEX IF EXISTS idx_schedule_blocks_date;

-- Doctor + fecha (query principal para bloqueos)
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_doctor_date
  ON schedule_blocks(doctorId, blockDate, startTime);

-- ============================================
-- PASO 2: HABILITAR ROW-LEVEL SECURITY
-- ============================================

-- Habilitar RLS en tablas críticas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: CREAR POLÍTICAS RLS
-- ============================================

-- PATIENTS
DROP POLICY IF EXISTS tenant_isolation_patients ON patients;
CREATE POLICY tenant_isolation_patients ON patients
  FOR ALL
  USING (id_doctor = current_setting('app.current_doctor_id', true)::int);

-- APPOINTMENTS
DROP POLICY IF EXISTS tenant_isolation_appointments ON appointments;
CREATE POLICY tenant_isolation_appointments ON appointments
  FOR ALL
  USING (doctorId = current_setting('app.current_doctor_id', true)::int);

-- TREATMENTS
DROP POLICY IF EXISTS tenant_isolation_treatments ON treatments;
CREATE POLICY tenant_isolation_treatments ON treatments
  FOR ALL
  USING (id_doctor = current_setting('app.current_doctor_id', true)::int);

-- BUDGETS
DROP POLICY IF EXISTS tenant_isolation_budgets ON budgets;
CREATE POLICY tenant_isolation_budgets ON budgets
  FOR ALL
  USING (user_id = current_setting('app.current_doctor_id', true)::int);

-- BUDGET_ITEMS
DROP POLICY IF EXISTS tenant_isolation_budget_items ON budget_items;
CREATE POLICY tenant_isolation_budget_items ON budget_items
  FOR ALL
  USING (
    budget_id IN (
      SELECT id FROM budgets
      WHERE user_id = current_setting('app.current_doctor_id', true)::int
    )
  );

-- DOCUMENTS
DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
CREATE POLICY tenant_isolation_documents ON documents
  FOR ALL
  USING (id_doctor = current_setting('app.current_doctor_id', true)::int);

-- SERVICES
DROP POLICY IF EXISTS tenant_isolation_services ON services;
CREATE POLICY tenant_isolation_services ON services
  FOR ALL
  USING (user_id = current_setting('app.current_doctor_id', true)::int);

-- SCHEDULE_BLOCKS
DROP POLICY IF EXISTS tenant_isolation_schedule_blocks ON schedule_blocks;
CREATE POLICY tenant_isolation_schedule_blocks ON schedule_blocks
  FOR ALL
  USING (doctorId = current_setting('app.current_doctor_id', true)::int);

-- AUDIT_LOGS
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  FOR ALL
  USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE id_doctor = current_setting('app.current_doctor_id', true)::int
    )
  );

-- ============================================
-- PASO 4: VERIFICAR QUE USERS NO TENGA RLS
-- ============================================

-- MUY IMPORTANTE: La tabla users NO debe tener RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_users ON users;

-- ============================================
-- PASO 5: ACTUALIZAR ESTADÍSTICAS
-- ============================================

-- Actualizar estadísticas de PostgreSQL para optimizar query planner
ANALYZE patients;
ANALYZE appointments;
ANALYZE treatments;
ANALYZE budgets;
ANALYZE budget_items;
ANALYZE documents;
ANALYZE audit_logs;
ANALYZE services;
ANALYZE schedule_blocks;
ANALYZE users;

-- ============================================
-- VERIFICACIONES
-- ============================================

-- Verificar índices en patients
SELECT
    indexname AS "Índice",
    indexdef AS "Definición"
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'patients'
ORDER BY indexname;

-- Verificar tablas con RLS habilitado
SELECT
    tablename AS "Tabla",
    rowsecurity AS "RLS Habilitado"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'appointments', 'treatments', 'budgets',
                     'budget_items', 'documents', 'services', 'schedule_blocks',
                     'audit_logs', 'users')
ORDER BY tablename;

-- Verificar políticas RLS creadas
SELECT
    tablename AS "Tabla",
    policyname AS "Política",
    cmd AS "Comando"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
--
-- Si todo salió bien, deberías ver:
-- - 15+ índices nuevos creados
-- - 9 tablas con RLS habilitado (users NO debe tener RLS)
-- - 9 políticas RLS creadas
--
-- Para probar que funciona:
-- SET app.current_doctor_id = 1;
-- SELECT * FROM patients; -- Solo verás pacientes del doctor 1
-- ============================================
