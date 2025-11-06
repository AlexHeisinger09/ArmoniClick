-- ==========================================
-- SCRIPT DE MIGRACIÓN DE DATOS HISTÓRICOS A AUDIT_LOGS
-- ==========================================
-- Este script genera registros de auditoría para todos los datos existentes
-- sin afectar los datos originales. Crea un historial completo de creación.

-- IMPORTANTE: Ejecutar después de aplicar la migración con: npm run drizzle:push

-- ==========================================
-- 1. REGISTROS DE PACIENTES CREADOS
-- ==========================================
INSERT INTO audit_logs
(patient_id, entity_type, entity_id, action, old_values, new_values, changed_by, created_at, notes)
SELECT
  p.id,
  'PACIENTE',
  p.id,
  'CREATED',
  NULL,
  json_build_object(
    'rut', p.rut,
    'nombres', p.nombres,
    'apellidos', p.apellidos,
    'email', p.email,
    'telefono', p.telefono
  ),
  COALESCE(u.id, 1), -- Si no existe usuario, usar ID 1 (admin por defecto)
  COALESCE(p.created_at, NOW()),
  CONCAT('Paciente ', p.nombres, ' ', p.apellidos, ' importado del historial')
FROM patients p
LEFT JOIN users u ON u.id = 1
WHERE NOT EXISTS (
  SELECT 1 FROM audit_logs al
  WHERE al.patient_id = p.id
  AND al.entity_type = 'PACIENTE'
  AND al.entity_id = p.id
  AND al.action = 'CREATED'
);

-- ==========================================
-- 2. REGISTROS DE PRESUPUESTOS CREADOS
-- ==========================================
INSERT INTO audit_logs
(patient_id, entity_type, entity_id, action, old_values, new_values, changed_by, created_at, notes)
SELECT
  b.id_patient,
  'PRESUPUESTO',
  b.id,
  'CREATED',
  NULL,
  json_build_object(
    'status', b.status,
    'budget_type', b.budget_type,
    'total_amount', b.total_amount
  ),
  COALESCE(u.id, 1),
  COALESCE(b.created_at, NOW()),
  CONCAT('Presupuesto ', b.budget_type, ' creado - Total: $', b.total_amount)
FROM budgets b
LEFT JOIN users u ON u.id = 1
WHERE NOT EXISTS (
  SELECT 1 FROM audit_logs al
  WHERE al.patient_id = b.id_patient
  AND al.entity_type = 'PRESUPUESTO'
  AND al.entity_id = b.id
  AND al.action = 'CREATED'
);

-- ==========================================
-- 3. REGISTROS DE TRATAMIENTOS CREADOS
-- ==========================================
INSERT INTO audit_logs
(patient_id, entity_type, entity_id, action, old_values, new_values, changed_by, created_at, notes)
SELECT
  t.id_paciente,
  'TRATAMIENTO',
  t.id,
  'CREATED',
  NULL,
  json_build_object(
    'status', 'pending',
    'nombre_servicio', t.nombre_servicio,
    'fecha_control', t.fecha_control
  ),
  COALESCE(u.id, 1),
  COALESCE(t.created_at, NOW()),
  CONCAT('Tratamiento ', t.nombre_servicio, ' creado (estado: pendiente)')
FROM treatments t
LEFT JOIN users u ON u.id = 1
WHERE NOT EXISTS (
  SELECT 1 FROM audit_logs al
  WHERE al.patient_id = t.id_paciente
  AND al.entity_type = 'TRATAMIENTO'
  AND al.entity_id = t.id
  AND al.action = 'CREATED'
);

-- ==========================================
-- 4. REGISTROS DE TRATAMIENTOS INICIADOS (con fotos)
-- ==========================================
-- Si el tratamiento tiene fotos, registrar como iniciado
INSERT INTO audit_logs
(patient_id, entity_type, entity_id, action, old_values, new_values, changed_by, created_at, notes)
SELECT
  t.id_paciente,
  'TRATAMIENTO',
  t.id,
  'STATUS_CHANGED',
  json_build_object('status', 'pending'),
  json_build_object(
    'status', 'completed',
    'nombre_servicio', t.nombre_servicio,
    'fecha_control', t.fecha_control,
    'foto1', t.foto1,
    'foto2', t.foto2
  ),
  COALESCE(u.id, 1),
  COALESCE(t.updated_at, NOW()),
  CONCAT('Tratamiento ', t.nombre_servicio, ' iniciado', CASE WHEN t.foto1 IS NOT NULL OR t.foto2 IS NOT NULL THEN ' (con fotos)' ELSE '' END)
FROM treatments t
LEFT JOIN users u ON u.id = 1
WHERE (t.foto1 IS NOT NULL OR t.foto2 IS NOT NULL)
AND NOT EXISTS (
  SELECT 1 FROM audit_logs al
  WHERE al.patient_id = t.id_paciente
  AND al.entity_type = 'TRATAMIENTO'
  AND al.entity_id = t.id
  AND al.action = 'STATUS_CHANGED'
);

-- ==========================================
-- 5. REGISTROS DE CITAS CREADAS
-- ==========================================
INSERT INTO audit_logs
(patient_id, entity_type, entity_id, action, old_values, new_values, changed_by, created_at, notes)
SELECT
  a.patient_id,
  'CITA',
  a.id,
  'CREATED',
  NULL,
  json_build_object(
    'title', a.title,
    'appointmentDate', a.appointmentDate,
    'status', a.status,
    'type', a.type
  ),
  COALESCE(u.id, 1),
  COALESCE(a.created_at, NOW()),
  CONCAT('Cita creada: ', a.title)
FROM appointments a
LEFT JOIN users u ON u.id = 1
WHERE a.patient_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM audit_logs al
  WHERE al.patient_id = a.patient_id
  AND al.entity_type = 'CITA'
  AND al.entity_id = a.id
  AND al.action = 'CREATED'
);

-- ==========================================
-- 6. REGISTROS DE DOCUMENTOS CREADOS
-- ==========================================
INSERT INTO audit_logs
(patient_id, entity_type, entity_id, action, old_values, new_values, changed_by, created_at, notes)
SELECT
  d.id_patient,
  'DOCUMENTO',
  d.id,
  'CREATED',
  NULL,
  json_build_object(
    'title', d.title,
    'document_type', d.document_type,
    'status', d.status
  ),
  COALESCE(u.id, 1),
  COALESCE(d.createdAt, NOW()),
  CONCAT('Documento "', d.title, '" creado (tipo: ', d.document_type, ')')
FROM documents d
LEFT JOIN users u ON u.id = 1
WHERE NOT EXISTS (
  SELECT 1 FROM audit_logs al
  WHERE al.patient_id = d.id_patient
  AND al.entity_type = 'DOCUMENTO'
  AND al.entity_id = d.id
  AND al.action = 'CREATED'
);

-- ==========================================
-- 7. REGISTROS DE DOCUMENTOS FIRMADOS
-- ==========================================
INSERT INTO audit_logs
(patient_id, entity_type, entity_id, action, old_values, new_values, changed_by, created_at, notes)
SELECT
  d.id_patient,
  'DOCUMENTO',
  d.id,
  'STATUS_CHANGED',
  json_build_object('status', 'pendiente'),
  json_build_object(
    'status', d.status,
    'signed_date', d.signed_date
  ),
  COALESCE(u.id, 1),
  COALESCE(d.updated_at, NOW()),
  CONCAT('Documento "', d.title, '" ', LOWER(d.status))
FROM documents d
LEFT JOIN users u ON u.id = 1
WHERE d.status = 'firmado'
AND d.signature_data IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM audit_logs al
  WHERE al.patient_id = d.id_patient
  AND al.entity_type = 'DOCUMENTO'
  AND al.entity_id = d.id
  AND al.action = 'STATUS_CHANGED'
);

-- ==========================================
-- 8. VERIFICACIÓN Y REPORTE
-- ==========================================
-- Mostrar resumen de registros migrados
SELECT
  entity_type,
  action,
  COUNT(*) as total_registros
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '1 hour' -- Solo mostrar los insertados recientemente
GROUP BY entity_type, action
ORDER BY entity_type, action;

-- ==========================================
-- NOTAS IMPORTANTES:
-- ==========================================
-- 1. Este script solo inserta registros que no existan ya
-- 2. Usa la fecha actual si no hay timestamp original
-- 3. Asigna usuario ID 1 (debe existir) como "changed_by" para registros históricos
-- 4. Mantiene integridad referencial con foreign keys
-- 5. Los registros se crean con timestamps para mantener historial cronológico
--
-- En caso de error:
-- - Verificar que todas las tablas existan (especialmente audit_logs)
-- - Verificar que existe un usuario con ID 1 en la tabla users
-- - Verificar integridad de datos en tablas fuente
