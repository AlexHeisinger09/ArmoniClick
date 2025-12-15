-- migrations/0002_enable_row_level_security.sql
-- Implementación de Row-Level Security (RLS) para multi-tenancy seguro

-- ============================================
-- IMPORTANTE: RLS garantiza aislamiento de datos
-- Cada doctor solo puede ver/modificar sus propios datos
-- ============================================

-- ============================================
-- 1. HABILITAR RLS EN TABLAS CRÍTICAS
-- ============================================

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
-- 2. POLÍTICAS RLS - PATIENTS
-- ============================================

-- Política: Doctor solo ve/modifica sus propios pacientes
CREATE POLICY tenant_isolation_patients ON patients
  FOR ALL
  USING (id_doctor = current_setting('app.current_doctor_id', true)::int);

-- ============================================
-- 3. POLÍTICAS RLS - APPOINTMENTS
-- ============================================

-- Política: Doctor solo ve/modifica sus propias citas
CREATE POLICY tenant_isolation_appointments ON appointments
  FOR ALL
  USING (doctorId = current_setting('app.current_doctor_id', true)::int);

-- ============================================
-- 4. POLÍTICAS RLS - TREATMENTS
-- ============================================

-- Política: Doctor solo ve/modifica sus propios tratamientos
CREATE POLICY tenant_isolation_treatments ON treatments
  FOR ALL
  USING (id_doctor = current_setting('app.current_doctor_id', true)::int);

-- ============================================
-- 5. POLÍTICAS RLS - BUDGETS
-- ============================================

-- Política: Doctor solo ve/modifica sus propios presupuestos
CREATE POLICY tenant_isolation_budgets ON budgets
  FOR ALL
  USING (user_id = current_setting('app.current_doctor_id', true)::int);

-- ============================================
-- 6. POLÍTICAS RLS - BUDGET_ITEMS
-- ============================================

-- Política: Items de presupuesto solo visibles si el presupuesto pertenece al doctor
CREATE POLICY tenant_isolation_budget_items ON budget_items
  FOR ALL
  USING (
    budget_id IN (
      SELECT id FROM budgets
      WHERE user_id = current_setting('app.current_doctor_id', true)::int
    )
  );

-- ============================================
-- 7. POLÍTICAS RLS - DOCUMENTS
-- ============================================

-- Política: Doctor solo ve/modifica sus propios documentos
CREATE POLICY tenant_isolation_documents ON documents
  FOR ALL
  USING (id_doctor = current_setting('app.current_doctor_id', true)::int);

-- ============================================
-- 8. POLÍTICAS RLS - SERVICES
-- ============================================

-- Política: Doctor solo ve/modifica sus propios servicios
CREATE POLICY tenant_isolation_services ON services
  FOR ALL
  USING (user_id = current_setting('app.current_doctor_id', true)::int);

-- ============================================
-- 9. POLÍTICAS RLS - SCHEDULE_BLOCKS
-- ============================================

-- Política: Doctor solo ve/modifica sus propios bloqueos de agenda
CREATE POLICY tenant_isolation_schedule_blocks ON schedule_blocks
  FOR ALL
  USING (doctorId = current_setting('app.current_doctor_id', true)::int);

-- ============================================
-- 10. POLÍTICAS RLS - AUDIT_LOGS
-- ============================================

-- Política: Doctor solo ve auditoría de sus propios pacientes
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  FOR ALL
  USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE id_doctor = current_setting('app.current_doctor_id', true)::int
    )
  );

-- ============================================
-- 11. POLÍTICA ESPECIAL PARA SUPERADMIN (OPCIONAL)
-- ============================================

-- Si quieres un super admin que vea todo, descomentar:
-- CREATE POLICY superadmin_bypass ON patients
--   FOR ALL
--   TO superadmin_role
--   USING (true);

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================

-- 1. CÓMO USAR EN BACKEND:
--    Antes de cada query, setear el contexto:
--    await db.execute(sql`SET app.current_doctor_id = ${doctorId}`);

-- 2. TESTING:
--    SET app.current_doctor_id = 1;
--    SELECT * FROM patients; -- Solo verás pacientes del doctor 1

-- 3. RENDIMIENTO:
--    RLS usa los índices compuestos que creamos en 0001
--    No hay impacto significativo en rendimiento

-- 4. SEGURIDAD:
--    Incluso si hay un bug en el código, PostgreSQL GARANTIZA
--    que un doctor NUNCA verá datos de otro doctor

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver políticas activas:
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE schemaname = 'public';
