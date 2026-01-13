-- migrations/0013_optimize_budget_joins.sql
-- Índices optimizados para LEFT JOIN queries de presupuestos
-- Fecha: 2026-01-13
-- Propósito: Mejorar rendimiento de findAllByPatientId y findActiveByPatientId

-- ============================================
-- BUDGET_ITEMS: Índices para LEFT JOIN
-- ============================================

-- ⚡ CRÍTICO: Índice compuesto para el LEFT JOIN con filtro is_active
-- Soporta: WHERE budget_id = X AND is_active = true
DROP INDEX IF EXISTS idx_budget_items_budget_active;
CREATE INDEX idx_budget_items_budget_active
  ON budget_items(budget_id, is_active)
  WHERE is_active = true;

-- ⚡ Índice compuesto para ORDER BY dentro del LEFT JOIN
-- Soporta: ORDER BY orden, created_at
DROP INDEX IF EXISTS idx_budget_items_budget_orden_created;
CREATE INDEX idx_budget_items_budget_orden_created
  ON budget_items(budget_id, orden, created_at)
  WHERE is_active = true;

-- ============================================
-- BUDGETS: Índices para consultas multi-tenant
-- ============================================

-- ⚡ Índice compuesto para query principal (patient + user)
-- Soporta: WHERE patient_id = X AND user_id = Y
DROP INDEX IF EXISTS idx_budgets_patient_user;
CREATE INDEX idx_budgets_patient_user
  ON budgets(patient_id, user_id, updated_at DESC, created_at DESC);

-- ⚡ Índice para presupuesto activo (query frecuente)
-- Soporta: WHERE patient_id = X AND user_id = Y AND status = 'activo'
DROP INDEX IF EXISTS idx_budgets_patient_user_active;
CREATE INDEX idx_budgets_patient_user_active
  ON budgets(patient_id, user_id, status)
  WHERE status = 'activo';

-- ⚡ Índice para JOIN con users (ya debería existir, pero aseguramos)
-- Soporta: INNER JOIN users ON budgets.user_id = users.id
DROP INDEX IF EXISTS idx_budgets_user_id;
CREATE INDEX idx_budgets_user_id
  ON budgets(user_id);

-- ============================================
-- USERS: Índice para JOIN (si no existe)
-- ============================================

-- Soporta: INNER JOIN users ON budgets.user_id = users.id
DROP INDEX IF EXISTS idx_users_id;
CREATE INDEX IF NOT EXISTS idx_users_id
  ON users(id);

-- ============================================
-- ESTADÍSTICAS
-- ============================================

-- Actualizar estadísticas de PostgreSQL para que use los nuevos índices
ANALYZE budget_items;
ANALYZE budgets;
ANALYZE users;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Puedes verificar los índices con:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'budget_items';
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'budgets';

-- Puedes ver el plan de ejecución con:
-- EXPLAIN ANALYZE
-- SELECT ... FROM budgets
-- INNER JOIN users ON budgets.user_id = users.id
-- LEFT JOIN budget_items ON budget_items.budget_id = budgets.id AND budget_items.is_active = true
-- WHERE budgets.patient_id = 1 AND budgets.user_id = 1;
