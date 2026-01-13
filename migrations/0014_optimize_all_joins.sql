-- migrations/0014_optimize_all_joins.sql
-- Índices optimizados para TODOS los JOINs del sistema
-- Fecha: 2026-01-13
-- Propósito: Optimizar rendimiento de queries con múltiples JOINs

-- ============================================
-- APPOINTMENTS: Índices para JOINs frecuentes
-- ============================================

-- ⚡ Índice para LEFT JOIN con patients
-- Soporta: LEFT JOIN patients ON appointments.patient_id = patients.id
DROP INDEX IF EXISTS idx_appointments_patient_id;
CREATE INDEX idx_appointments_patient_id
  ON appointments(patient_id)
  WHERE patient_id IS NOT NULL;

-- ⚡ Índice para INNER JOIN con users (doctor)
-- Soporta: INNER JOIN users ON appointments.doctor_id = users.id
DROP INDEX IF EXISTS idx_appointments_doctor_id;
CREATE INDEX idx_appointments_doctor_id
  ON appointments(doctor_id);

-- ⚡ Índice para LEFT JOIN con locations
-- Soporta: LEFT JOIN locations ON appointments.location_id = locations.id
DROP INDEX IF EXISTS idx_appointments_location_id;
CREATE INDEX idx_appointments_location_id
  ON appointments(location_id)
  WHERE location_id IS NOT NULL;

-- ⚡ Índice compuesto para query principal del dashboard
-- Soporta: WHERE doctor_id = X AND appointment_date >= TODAY ORDER BY appointment_date
DROP INDEX IF EXISTS idx_appointments_doctor_date_status;
CREATE INDEX idx_appointments_doctor_date_status
  ON appointments(doctor_id, appointment_date, status);

-- ⚡ Índice para appointments de una semana específica
DROP INDEX IF EXISTS idx_appointments_doctor_week;
CREATE INDEX idx_appointments_doctor_week
  ON appointments(doctor_id, appointment_date DESC)
  WHERE status IN ('confirmed', 'pending');

-- ============================================
-- PATIENTS: Índices para JOINs
-- ============================================

-- ⚡ Índice principal (ya debería existir, pero aseguramos)
DROP INDEX IF EXISTS idx_patients_id;
CREATE INDEX IF NOT EXISTS idx_patients_id
  ON patients(id);

-- ⚡ Índice para JOIN con appointments
-- Soporta: WHERE patients.id_doctor = X AND isactive = true
DROP INDEX IF EXISTS idx_patients_doctor_active;
CREATE INDEX idx_patients_doctor_active
  ON patients(id_doctor, id, isactive)
  WHERE isactive = true;

-- ⚡ Índice para búsqueda por RUT
DROP INDEX IF EXISTS idx_patients_doctor_rut;
CREATE INDEX idx_patients_doctor_rut
  ON patients(id_doctor, rut)
  WHERE isactive = true;

-- ⚡ Índice para pacientes recientes (dashboard)
DROP INDEX IF EXISTS idx_patients_doctor_created;
CREATE INDEX idx_patients_doctor_created
  ON patients(id_doctor, createdat DESC)
  WHERE isactive = true;

-- ============================================
-- TREATMENTS: Índices para JOINs
-- ============================================

-- ⚡ CRÍTICO: Índice para JOIN con budget_items
-- Soporta: INNER JOIN budget_items ON treatments.budget_item_id = budget_items.id
DROP INDEX IF EXISTS idx_treatments_budget_item_active;
CREATE INDEX idx_treatments_budget_item_active
  ON treatments(budget_item_id, id_doctor)
  WHERE is_active = true;

-- ⚡ Índice compuesto para query de tratamientos por presupuesto
-- Usado en getTreatmentsByBudget (query compleja)
DROP INDEX IF EXISTS idx_treatments_doctor_patient_active;
CREATE INDEX idx_treatments_doctor_patient_active
  ON treatments(id_doctor, id_paciente, is_active, created_at)
  WHERE is_active = true;

-- ⚡ Índice para tratamientos por estado
DROP INDEX IF EXISTS idx_treatments_doctor_status;
CREATE INDEX idx_treatments_doctor_status
  ON treatments(id_doctor, status, fecha_control DESC)
  WHERE is_active = true;

-- ============================================
-- BUDGET_ITEMS: Índices adicionales (complemento)
-- ============================================

-- ⚡ Índice para JOIN desde treatments
-- Soporta: WHERE budget_items.id = X AND budget_items.is_active = true
DROP INDEX IF EXISTS idx_budget_items_id_active;
CREATE INDEX idx_budget_items_id_active
  ON budget_items(id, is_active)
  WHERE is_active = true;

-- ⚡ Índice para query de items por presupuesto con estado
DROP INDEX IF EXISTS idx_budget_items_budget_status;
CREATE INDEX idx_budget_items_budget_status
  ON budget_items(budget_id, status, is_active)
  WHERE is_active = true;

-- ============================================
-- LOCATIONS: Índices para JOINs
-- ============================================

-- ⚡ Índice principal
DROP INDEX IF EXISTS idx_locations_id;
CREATE INDEX IF NOT EXISTS idx_locations_id
  ON locations(id);

-- ⚡ Índice para locations por doctor
DROP INDEX IF EXISTS idx_locations_doctor_active;
CREATE INDEX idx_locations_doctor_active
  ON locations(user_id, is_active)
  WHERE is_active = true;

-- ============================================
-- USERS: Índices para JOINs (doctor data)
-- ============================================

-- ⚡ Índice principal (PK, ya debería existir)
DROP INDEX IF EXISTS idx_users_id;
CREATE INDEX IF NOT EXISTS idx_users_id
  ON users(id);

-- ⚡ Índice para usuarios activos
DROP INDEX IF EXISTS idx_users_active;
CREATE INDEX idx_users_active
  ON users(id, "isActive")
  WHERE "isActive" = true;

-- ============================================
-- NOTIFICATIONS: Índices para queries frecuentes
-- ============================================

-- ⚡ Índice para notificaciones no leídas del doctor
DROP INDEX IF EXISTS idx_notifications_doctor_unread;
CREATE INDEX idx_notifications_doctor_unread
  ON notifications(doctor_id, is_read, created_at DESC)
  WHERE is_read = false;

-- ⚡ Índice para notificaciones por tipo
DROP INDEX IF EXISTS idx_notifications_doctor_type;
CREATE INDEX idx_notifications_doctor_type
  ON notifications(doctor_id, type, created_at DESC);

-- ============================================
-- DOCUMENTS: Índices para JOINs
-- ============================================

-- ⚡ Índice para documentos pendientes de firma
DROP INDEX IF EXISTS idx_documents_doctor_pending;
CREATE INDEX idx_documents_doctor_pending
  ON documents(id_doctor, status, createdat DESC)
  WHERE status = 'pendiente';

-- ⚡ Índice para documentos por paciente
DROP INDEX IF EXISTS idx_documents_patient_doctor;
CREATE INDEX idx_documents_patient_doctor
  ON documents(id_patient, id_doctor, createdat DESC);

-- ============================================
-- AUDIT_LOGS: Índices para historial médico
-- ============================================

-- ⚡ Índice para timeline del paciente (query MUY frecuente)
DROP INDEX IF EXISTS idx_audit_logs_patient_created;
CREATE INDEX idx_audit_logs_patient_created
  ON audit_logs(patient_id, created_at DESC);

-- ⚡ Índice para filtrar por tipo de entidad
DROP INDEX IF EXISTS idx_audit_logs_patient_entity;
CREATE INDEX idx_audit_logs_patient_entity
  ON audit_logs(patient_id, entity_type, created_at DESC);

-- ⚡ Índice para auditoría por doctor
DROP INDEX IF EXISTS idx_audit_logs_changedby;
CREATE INDEX idx_audit_logs_changedby
  ON audit_logs(changed_by, created_at DESC);

-- ============================================
-- PRESCRIPTIONS: Índices para recetas
-- ============================================

-- ⚡ Índice para prescripciones por paciente
DROP INDEX IF EXISTS idx_prescriptions_patient_created;
CREATE INDEX idx_prescriptions_patient_created
  ON prescriptions(patient_id, created_at DESC);

-- ⚡ Índice para prescripciones por doctor
DROP INDEX IF EXISTS idx_prescriptions_doctor_created;
CREATE INDEX idx_prescriptions_doctor_created
  ON prescriptions(user_id, created_at DESC);

-- ============================================
-- SERVICES: Índices para catálogo
-- ============================================

-- ⚡ Índice para servicios activos del doctor
DROP INDEX IF EXISTS idx_services_user_active;
CREATE INDEX idx_services_user_active
  ON services(user_id, is_active, tipo)
  WHERE is_active = true;

-- ============================================
-- SCHEDULE_BLOCKS: Índices para bloqueos
-- ============================================

-- ⚡ Índice para bloqueos futuros del doctor
DROP INDEX IF EXISTS idx_schedule_blocks_doctor_future;
CREATE INDEX idx_schedule_blocks_doctor_future
  ON schedule_blocks(doctor_id, block_date, start_time);

-- ============================================
-- ESTADÍSTICAS
-- ============================================

-- Actualizar estadísticas de PostgreSQL para optimizar query planner
ANALYZE appointments;
ANALYZE patients;
ANALYZE treatments;
ANALYZE budget_items;
ANALYZE budgets;
ANALYZE locations;
ANALYZE users;
ANALYZE notifications;
ANALYZE documents;
ANALYZE audit_logs;
ANALYZE prescriptions;
ANALYZE services;
ANALYZE schedule_blocks;

-- ============================================
-- VERIFICACIÓN (comentarios para referencia)
-- ============================================

-- Ver todos los índices creados:
-- SELECT tablename, indexname FROM pg_indexes
-- WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

-- Ver tamaño total de índices:
-- SELECT
--   pg_size_pretty(sum(pg_relation_size(indexrelid))) as total_index_size
-- FROM pg_stat_user_indexes;

-- Ver índices no usados (candidatos a eliminar):
-- SELECT
--   schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0 AND indexname LIKE 'idx_%'
-- ORDER BY pg_relation_size(indexrelid) DESC;
