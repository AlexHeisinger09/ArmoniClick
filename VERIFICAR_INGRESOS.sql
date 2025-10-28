-- ============================================
-- VERIFICAR PRESUPUESTOS COMPLETADOS EN BD
-- ============================================

-- 1. Contar presupuestos completados por doctor
SELECT
  users.name as doctor,
  COUNT(*) as cantidad_presupuestos,
  SUM(CAST(budgets.total_amount AS DECIMAL)) as total_ingresos
FROM budgets
JOIN users ON budgets.user_id = users.id
WHERE budgets.status = 'completed'
GROUP BY budgets.user_id, users.name
ORDER BY doctor;

-- ============================================

-- 2. Ver presupuestos completados en los últimos 12 meses
SELECT
  budgets.id,
  budgets.patient_id,
  users.name as doctor,
  budgets.total_amount,
  budgets.status,
  budgets.created_at,
  budgets.updated_at,
  EXTRACT(MONTH FROM budgets.updated_at) as mes,
  EXTRACT(YEAR FROM budgets.updated_at) as año
FROM budgets
JOIN users ON budgets.user_id = users.id
WHERE budgets.status = 'completed'
  AND budgets.updated_at >= NOW() - INTERVAL '12 months'
ORDER BY budgets.updated_at DESC;

-- ============================================

-- 3. Agrupar ingresos por mes (últimos 12 meses)
SELECT
  DATE_TRUNC('month', budgets.updated_at) as mes,
  COUNT(*) as cantidad_presupuestos,
  SUM(CAST(budgets.total_amount AS DECIMAL)) as ingresos_mes,
  users.name as doctor
FROM budgets
JOIN users ON budgets.user_id = users.id
WHERE budgets.status = 'completed'
  AND budgets.updated_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', budgets.updated_at), users.id, users.name
ORDER BY mes DESC;

-- ============================================

-- 4. Si NO hay datos completados, ver presupuestos en otros estados
SELECT
  budgets.status,
  COUNT(*) as cantidad,
  SUM(CAST(budgets.total_amount AS DECIMAL)) as total
FROM budgets
GROUP BY budgets.status;

-- ============================================

-- 5. Ver presupuestos del doctor autenticado actual (reemplaza USER_ID)
SELECT
  budgets.id,
  budgets.patient_id,
  budgets.total_amount,
  budgets.status,
  budgets.created_at,
  budgets.updated_at
FROM budgets
WHERE budgets.user_id = 5  -- Reemplaza 5 con tu ID de doctor
  AND budgets.status = 'completed'
ORDER BY budgets.updated_at DESC;

-- ============================================

-- 6. Contar items por accion (tratamientos) en presupuestos completados
SELECT
  budget_items.accion as tratamiento,
  COUNT(*) as cantidad,
  SUM(CAST(budget_items.valor AS DECIMAL)) as valor_total
FROM budget_items
JOIN budgets ON budget_items.budget_id = budgets.id
WHERE budgets.status = 'completed'
  AND budget_items.is_active = true
GROUP BY budget_items.accion
ORDER BY cantidad DESC;
