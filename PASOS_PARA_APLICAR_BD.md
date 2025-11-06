# 📋 PASOS EXACTOS PARA APLICAR CAMBIOS EN LA BASE DE DATOS

## 🚀 Opción 1: Automática con Drizzle (RECOMENDADA)

### Paso 1: Asegúrate de estar en la rama feature/audit-logs
```bash
git branch
# Deberías ver: * feature/audit-logs
```

### Paso 2: Ejecutar Drizzle Push
```bash
npm run drizzle:push
```

**Esto hará automáticamente:**
- ✅ Leer la migración en `migrations/0002_tidy_human_cannonball.sql`
- ✅ Conectarse a tu base de datos Neon (usando DATABASE_URL del .env)
- ✅ Crear la tabla `audit_logs`
- ✅ Crear los índices
- ✅ Agregar las restricciones de clave foránea

### Paso 3: Verificar que se aplicó correctamente
```bash
npm run drizzle:studio
```
- Se abrirá Drizzle Studio en `localhost:3000`
- Ir a la tabla `audit_logs`
- Deberías ver que existe con 10 columnas y 5 índices

---

## 🔧 Opción 2: Manual en Neon SQL Editor

Si prefieres hacerlo manualmente:

### Paso 1: Abre tu base de datos Neon
1. Ir a https://console.neon.tech
2. Selecciona tu proyecto
3. Ir a "SQL Editor"

### Paso 2: Copiar y ejecutar el script

Abre el archivo `migrations/0002_tidy_human_cannonball.sql` y copia TODO el contenido:

```sql
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
--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "patient_name" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "patient_rut" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;
--> statement-breakpoint
CREATE INDEX "idx_audit_logs_patient_id" ON "audit_logs" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_type","entity_id");
--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");
--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created" ON "audit_logs" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "idx_audit_logs_changed_by" ON "audit_logs" USING btree ("changed_by");
```

### Paso 3: En Neon SQL Editor
1. Pega el script completo
2. Haz clic en "Execute"
3. Deberías ver mensajes de éxito (sin errores)

---

## ✅ Verificación Después de Ejecutar

### Verificación 1: ¿La tabla existe?
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name = 'audit_logs';
```
**Resultado esperado:** Una fila con `audit_logs`

### Verificación 2: ¿Tiene las columnas correctas?
```sql
\d audit_logs
```
**O en Neon:**
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;
```

**Resultado esperado:** 10 columnas
- id (integer)
- patient_id (integer)
- entity_type (character varying)
- entity_id (integer)
- action (character varying)
- old_values (jsonb)
- new_values (jsonb)
- changed_by (integer)
- created_at (timestamp)
- notes (character varying)

### Verificación 3: ¿Existen los índices?
```sql
SELECT indexname FROM pg_indexes
WHERE tablename = 'audit_logs';
```

**Resultado esperado:** 5 índices
- idx_audit_logs_patient_id
- idx_audit_logs_entity
- idx_audit_logs_action
- idx_audit_logs_created
- idx_audit_logs_changed_by

### Verificación 4: ¿Existen las restricciones?
```sql
SELECT constraint_name, constraint_type FROM information_schema.table_constraints
WHERE table_name = 'audit_logs';
```

**Resultado esperado:** 3 restricciones
- audit_logs_pkey (PRIMARY KEY)
- audit_logs_patient_id_patients_id_fk (FOREIGN KEY)
- audit_logs_changed_by_users_id_fk (FOREIGN KEY)

---

## 🧪 Probar que Funciona

### Paso 1: Ejecutar localmente
```bash
npm run netlify:dev
```

### Paso 2: Crear un paciente nuevo
- Ir a http://localhost:8888
- Crear un nuevo paciente
- Llenar todos los campos

### Paso 3: Verificar que se registró
En tu base de datos:
```sql
SELECT * FROM audit_logs
ORDER BY created_at DESC
LIMIT 1;
```

**Deberías ver:**
- Una fila con `entity_type = 'paciente'`
- `action = 'created'`
- `new_values` con los datos del paciente
- `changed_by` con el ID de tu usuario
- `created_at` con la fecha actual

### Paso 4: Probar el endpoint de historial
```bash
curl http://localhost:8888/.netlify/functions/patient-history/1 \
  -H "Authorization: Bearer TU_JWT_TOKEN_AQUI"
```

**Deberías recibir:**
```json
{
  "patientId": 1,
  "totalLogs": 1,
  "logs": [
    {
      "id": 1,
      "patient_id": 1,
      "entity_type": "paciente",
      "action": "created",
      "old_values": null,
      "new_values": { /* datos del paciente */ },
      "changed_by": 5,
      "created_at": "2025-11-06T...",
      "notes": "..."
    }
  ]
}
```

---

## 🚨 Si Hay Errores

### Error: "Error: column "patient_name" is still NOT NULL"
**Causa:** Las columnas de documents ya tenían este cambio
**Solución:** Ejecutar solo las líneas de `CREATE TABLE` y `CREATE INDEX`, saltarse los `ALTER TABLE documents`

### Error: "Foreign key constraint failed"
**Causa:** Hay patients sin id o usuarios sin id
**Solución:** Asegúrate que los datos de `patients` y `users` existen

### Error: "relation does not exist"
**Causa:** Probablemente la migración anterior no se aplicó
**Solución:** Verificar que `migrations/0001_*.sql` ya se ejecutó

---

## 📞 Resumen en 3 Pasos

1. **Ejecutar migración:**
   ```bash
   npm run drizzle:push
   ```

2. **Verificar que se aplicó:**
   ```bash
   npm run drizzle:studio
   ```

3. **Probar localmente:**
   ```bash
   npm run netlify:dev
   # Crear un paciente y verificar que aparece en audit_logs
   ```

---

## ✨ Después de Aplicar

El sistema está listo para:
- ✅ Registrar automáticamente cambios de pacientes
- ✅ Mostrar historial con `GET /patient-history/:patientId`
- ✅ Próximas integraciones en presupuestos, tratamientos, citas, documentos

Ver `GUIA_INTEGRACION_AUDIT_LOGS.md` para integrar en otros endpoints.

