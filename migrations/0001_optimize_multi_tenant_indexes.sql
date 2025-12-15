-- migrations/0001_optimize_multi_tenant_indexes.sql
-- Optimización de índices para multi-tenancy eficiente

-- ============================================
-- PATIENTS: Índices compuestos con id_doctor
-- ============================================

-- Eliminar índices simples antiguos (si existen)
DROP INDEX IF EXISTS idx_patients_doctor;
DROP INDEX IF EXISTS idx_patients_active;
DROP INDEX IF EXISTS idx_patients_created;

-- Crear índices compuestos optimizados
-- Índice principal: doctor + activos (query más común)
CREATE INDEX idx_patients_doctor_active
  ON patients(id_doctor, isActive)
  WHERE isActive = true;

-- Búsqueda por RUT dentro del tenant
CREATE INDEX idx_patients_doctor_rut
  ON patients(id_doctor, rut)
  WHERE isActive = true;

-- Ordenar pacientes por fecha de creación
CREATE INDEX idx_patients_doctor_created
  ON patients(id_doctor, createdAt DESC)
  WHERE isActive = true;

-- ============================================
-- APPOINTMENTS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_appointments_doctor;
DROP INDEX IF EXISTS idx_appointments_date;
DROP INDEX IF EXISTS idx_appointments_status;

-- Doctor + fecha (para calendario)
CREATE INDEX idx_appointments_doctor_date
  ON appointments(doctorId, appointmentDate DESC);

-- Doctor + estado (para filtros)
CREATE INDEX idx_appointments_doctor_status
  ON appointments(doctorId, status);

-- Doctor + fecha + estado (query compuesta)
CREATE INDEX idx_appointments_doctor_date_status
  ON appointments(doctorId, appointmentDate DESC, status);

-- ============================================
-- TREATMENTS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_treatments_id_doctor;
DROP INDEX IF EXISTS idx_treatments_id_paciente;
DROP INDEX IF EXISTS idx_treatments_fecha_control;

-- Doctor + paciente (query más común)
CREATE INDEX idx_treatments_doctor_patient
  ON treatments(id_doctor, id_paciente, fecha_control DESC)
  WHERE is_active = true;

-- Doctor + fecha de control
CREATE INDEX idx_treatments_doctor_date
  ON treatments(id_doctor, fecha_control DESC)
  WHERE is_active = true;

-- Doctor + estado (para filtrar tratamientos pendientes/completados)
CREATE INDEX idx_treatments_doctor_status
  ON treatments(id_doctor, status)
  WHERE is_active = true;

-- ============================================
-- BUDGETS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_budgets_user;
DROP INDEX IF EXISTS idx_budgets_status;

-- Doctor + paciente + estado
CREATE INDEX idx_budgets_user_patient_status
  ON budgets(user_id, patient_id, status);

-- Doctor + fecha (para listados cronológicos)
CREATE INDEX idx_budgets_user_created
  ON budgets(user_id, created_at DESC);

-- ============================================
-- DOCUMENTS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_documents_doctor;
DROP INDEX IF EXISTS idx_documents_patient;

-- Doctor + paciente + tipo
CREATE INDEX idx_documents_doctor_patient
  ON documents(id_doctor, id_patient, document_type);

-- Doctor + estado (pendientes de firma)
CREATE INDEX idx_documents_doctor_status
  ON documents(id_doctor, status, createdAt DESC);

-- ============================================
-- AUDIT_LOGS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_audit_logs_changed_by;
DROP INDEX IF EXISTS idx_audit_logs_patient_id;

-- Paciente + fecha (para timeline del paciente)
CREATE INDEX idx_audit_logs_patient_created
  ON audit_logs(patient_id, created_at DESC);

-- Doctor que hizo el cambio + fecha
CREATE INDEX idx_audit_logs_changedby_created
  ON audit_logs(changed_by, created_at DESC);

-- Paciente + tipo de entidad (para filtrar por tipo de cambio)
CREATE INDEX idx_audit_logs_patient_entity
  ON audit_logs(patient_id, entity_type, created_at DESC);

-- ============================================
-- SERVICIOS: Índice compuesto
-- ============================================

-- Doctor + tipo + activos
CREATE INDEX idx_services_user_type_active
  ON services(user_id, tipo)
  WHERE is_active = true;

-- ============================================
-- SCHEDULE_BLOCKS: Índices compuestos
-- ============================================

DROP INDEX IF EXISTS idx_schedule_blocks_doctor;
DROP INDEX IF EXISTS idx_schedule_blocks_date;

-- Doctor + fecha (query principal para bloqueos)
CREATE INDEX idx_schedule_blocks_doctor_date
  ON schedule_blocks(doctorId, blockDate, startTime);

-- ============================================
-- ESTADÍSTICAS
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
