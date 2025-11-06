# Scripts SQL para Implementación de Audit Logs

## 📋 Descripción
Este documento contiene los scripts SQL necesarios para implementar el sistema de auditoría (audit logs) en la base de datos.

## 🚀 Pasos para Ejecutar

### Opción 1: Usar Drizzle Push (RECOMENDADO)
Si estás usando Drizzle ORM, simplemente ejecuta:

```bash
npm run drizzle:push
```

Este comando aplicará automáticamente la migración `migrations/0002_tidy_human_cannonball.sql` a tu base de datos.

### Opción 2: Ejecutar Script SQL Directamente
Si prefieres ejecutar el SQL manualmente en tu base de datos Neon:

```sql
-- Crear tabla audit_logs
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"notes" varchar
);

-- Agregar restricciones de clave foránea
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id")
  ON DELETE cascade ON UPDATE cascade;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_changed_by_users_id_fk"
  FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id")
  ON DELETE restrict ON UPDATE cascade;

-- Crear índices para optimizar búsquedas
CREATE INDEX "idx_audit_logs_patient_id" ON "audit_logs" USING btree ("patient_id");
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id");
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");
CREATE INDEX "idx_audit_logs_created" ON "audit_logs" USING btree ("created_at");
CREATE INDEX "idx_audit_logs_changed_by" ON "audit_logs" USING btree ("changed_by");
```

---

## 📊 Estructura de la Tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | Identificador único del log |
| `patient_id` | INTEGER | ID del paciente (FK) |
| `entity_type` | VARCHAR(50) | Tipo de entidad: paciente, presupuesto, tratamiento, cita, documento |
| `entity_id` | INTEGER | ID de la entidad modificada |
| `action` | VARCHAR(50) | Acción realizada: created, updated, deleted, status_changed |
| `old_values` | JSONB | Valores anteriores (antes de la modificación) |
| `new_values` | JSONB | Valores nuevos (después de la modificación) |
| `changed_by` | INTEGER | ID del usuario que realizó la acción (FK) |
| `created_at` | TIMESTAMP | Fecha y hora del cambio (automático) |
| `notes` | VARCHAR | Notas adicionales (opcional) |

---

## 🔑 Relaciones de Clave Foránea

- `patient_id` → `patients.id` (CASCADE on DELETE and UPDATE)
- `changed_by` → `users.id` (RESTRICT on DELETE, CASCADE on UPDATE)

---

## 📈 Índices Creados

1. **idx_audit_logs_patient_id**: Búsquedas rápidas por paciente
2. **idx_audit_logs_entity**: Búsquedas de cambios de una entidad específica
3. **idx_audit_logs_action**: Búsquedas por tipo de acción
4. **idx_audit_logs_created**: Búsquedas por fecha
5. **idx_audit_logs_changed_by**: Búsquedas por usuario que realizó el cambio

---

## 🛠️ Cómo Verificar que Todo Fue Correcto

### 1. Verificar que la tabla fue creada:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name = 'audit_logs';
```

### 2. Ver la estructura de la tabla:
```sql
\d audit_logs
```

### 3. Verificar los índices:
```sql
SELECT indexname FROM pg_indexes
WHERE tablename = 'audit_logs';
```

### 4. Contar registros de auditoría de un paciente:
```sql
SELECT COUNT(*) FROM audit_logs WHERE patient_id = 1;
```

---

## 🔄 Flujo de Registros de Auditoría

### Cuando se crea un paciente:
```
Acción: CREATED
Entidad: paciente
Old Values: NULL
New Values: { rut, nombres, apellidos, email, telefono }
```

### Cuando se actualiza un paciente:
```
Acción: UPDATED
Entidad: paciente
Old Values: { valores anteriores }
New Values: { valores nuevos }
```

### Cuando se activa un presupuesto:
```
Acción: STATUS_CHANGED
Entidad: presupuesto
Old Values: { status: "pendiente" }
New Values: { status: "activo" }
```

### Cuando se inicia un tratamiento:
```
Acción: STATUS_CHANGED / UPDATED
Entidad: tratamiento
Old Values: { status: "pending" }
New Values: { status: "completed", fecha_control, fotos, etc. }
```

---

## 📝 Notas Importantes

- ✅ Los logs se crean automáticamente desde el código backend
- ✅ Los valores JSONB permiten auditoría flexible y detallada
- ✅ Los índices garantizan rendimiento en consultas
- ✅ La tabla crece automáticamente con cada cambio
- ⚠️ Los logs nunca se eliminan automáticamente (histórico permanente)
- 💡 Para archivar logs antiguos, ejecutar: `DELETE FROM audit_logs WHERE created_at < '2023-01-01'`

---

## 🚨 Próximos Pasos

Una vez ejecutados los scripts:

1. ✅ Ejecutar `npm run build` para verificar compilación
2. ✅ Ejecutar `npm run netlify:dev` para probar localmente
3. ✅ Hacer un commit con los cambios
4. ✅ Los logs comenzarán a registrarse automáticamente

