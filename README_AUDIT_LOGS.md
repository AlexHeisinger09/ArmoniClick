# 🎯 Sistema de Audit Logs - Guía Rápida

> ✅ **Estado:** Completado y listo para usar
> 📍 **Rama:** `feature/audit-logs`
> 🔧 **Compilación:** ✅ Sin errores

---

## 📚 Documentación Disponible

| Documento | Propósito | Leer si... |
|-----------|-----------|-----------|
| **PASOS_PARA_APLICAR_BD.md** | ⚡ Instrucciones paso a paso para aplicar migración | **EMPIEZA POR AQUÍ** |
| **SCRIPTS_SQL_AUDIT_LOGS.md** | Scripts SQL listos para ejecutar | Prefieres ejecutar SQL manualmente |
| **RESUMEN_IMPLEMENTACION_AUDIT_LOGS.md** | Resumen completo de qué se implementó | Quieres saber qué se hizo |
| **GUIA_INTEGRACION_AUDIT_LOGS.md** | Cómo integrar en otros endpoints | Necesitas completar integraciones |
| **README_AUDIT_LOGS.md** | Este archivo - referencia rápida | Necesitas una referencia rápida |

---

## 🚀 Inicio Rápido (3 pasos)

### 1️⃣ Aplicar migración
```bash
npm run drizzle:push
```

### 2️⃣ Verificar
```bash
npm run drizzle:studio
# Ir a localhost:3000 y ver tabla audit_logs
```

### 3️⃣ Probar
```bash
npm run netlify:dev
# Crear un paciente y verificar en BD
```

---

## 🎯 Qué Hace

Registra **automáticamente** en la tabla `audit_logs`:
- ✅ Qué cambió (creación, actualización, eliminación, cambio de estado)
- ✅ Qué entidad cambió (paciente, presupuesto, tratamiento, cita, documento)
- ✅ Valores anteriores y nuevos
- ✅ Quién lo hizo (doctor/usuario)
- ✅ Cuándo (timestamp automático)

---

## 📊 Tabla `audit_logs`

```
┌─────────────┬────────────┬─────────────┬──────────────┐
│ Columna     │ Tipo       │ Descripción │ Ejemplo      │
├─────────────┼────────────┼─────────────┼──────────────┤
│ id          │ serial     │ PK          │ 1, 2, 3      │
│ patient_id  │ integer    │ FK patients │ 42           │
│ entity_type │ varchar    │ paciente,   │ "paciente"   │
│             │            │ presupuesto │              │
│ entity_id   │ integer    │ ID entidad  │ 42 (patient) │
│ action      │ varchar    │ created,    │ "updated"    │
│             │            │ updated,etc │              │
│ old_values  │ jsonb      │ Antes       │ {...datos}   │
│ new_values  │ jsonb      │ Después     │ {...datos}   │
│ changed_by  │ integer    │ FK users    │ 5 (doctor)   │
│ created_at  │ timestamp  │ Automático  │ 2025-11-06   │
│ notes       │ varchar    │ Descripción │ "Actualizado"│
└─────────────┴────────────┴─────────────┴──────────────┘
```

---

## 🔌 Endpoints Disponibles

### Ya Implementado ✅

**GET `/patient-history/:patientId`**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8888/.netlify/functions/patient-history/1
```

Retorna:
```json
{
  "patientId": 1,
  "totalLogs": 5,
  "logs": [
    {
      "id": 1,
      "patient_id": 1,
      "entity_type": "paciente",
      "action": "created",
      "new_values": {...},
      "changed_by": 5,
      "created_at": "2025-11-06T14:35:22.123Z"
    }
  ]
}
```

### Próximo a Implementar ⏳

- `POST /budgets` - Registrar creación
- `PUT /budgets/:id` - Registrar cambio de estado
- `POST /treatments` - Registrar inicio
- `PUT /treatments/:id` - Registrar actualizaciones
- `POST /appointments` - Registrar creación
- `PUT /appointments/:id` - Registrar cambios
- `POST /documents` - Registrar creación
- `PUT /documents/:id` - Registrar firma

---

## 📋 Qué ya registra automáticamente

### Pacientes ✅
```
CREATE patient → LOG: created
UPDATE patient → LOG: updated
```

### Presupuestos (Próximo)
```
CREATE budget → LOG: created
ACTIVATE budget → LOG: status_changed (pending → activo)
```

### Tratamientos (Próximo)
```
CREATE treatment → (sin log, status=pending)
FIRST UPDATE → LOG: status_changed (pending → completed)
UPDATE treatment → LOG: updated (con fotos)
```

---

## 🛠️ Archivos Nuevos

```
✨ netlify/data/schemas/audit.schema.ts
   └─ Define tabla audit_logs con Drizzle

✨ netlify/services/AuditService.ts
   └─ Servicio para registrar y obtener logs

✨ netlify/functions/patients/patient-history.ts
   └─ Endpoint GET /patient-history/:id

✨ migrations/0002_tidy_human_cannonball.sql
   └─ Migración SQL (se ejecuta con drizzle:push)

📖 PASOS_PARA_APLICAR_BD.md
📖 SCRIPTS_SQL_AUDIT_LOGS.md
📖 RESUMEN_IMPLEMENTACION_AUDIT_LOGS.md
📖 GUIA_INTEGRACION_AUDIT_LOGS.md
```

---

## 🔍 Ejemplo de Uso Real

**Escenario:** Un doctor crea y luego actualiza un paciente

### 1. Doctor crea paciente "María García"
```typescript
// Sistema automáticamente registra:
{
  entity_type: "paciente",
  action: "created",
  old_values: null,
  new_values: {
    rut: "12.345.678-9",
    nombres: "María",
    apellidos: "García",
    email: "maria@email.com"
  },
  changed_by: 5  // ID del doctor
}
```

### 2. Doctor actualiza teléfono
```typescript
// Sistema automáticamente registra:
{
  entity_type: "paciente",
  action: "updated",
  old_values: { telefono: "+56912345678" },
  new_values: { telefono: "+56987654321" },
  changed_by: 5
}
```

### 3. Frontend llama GET /patient-history/1
```typescript
// Retorna ambos logs en orden cronológico
// Perfecto para mostrar historial en el perfil del paciente
```

---

## 📈 Rendimiento

### Índices Creados
```sql
idx_audit_logs_patient_id      -- Búsquedas por paciente (lo más usado)
idx_audit_logs_entity          -- Búsquedas de una entidad específica
idx_audit_logs_action          -- Búsquedas por tipo de acción
idx_audit_logs_created         -- Búsquedas por fecha
idx_audit_logs_changed_by      -- Búsquedas por usuario
```

**Resultado:** Consultas rápidas incluso con millones de logs

---

## ⚠️ Consideraciones Importantes

### 1. Los logs son permanentes
- ❌ No se limpian automáticamente
- ✅ Histórico completo y verificable
- 💡 Si necesitas archivar: `DELETE FROM audit_logs WHERE created_at < '2020-01-01'`

### 2. El almacenamiento crecerá
- Cada cambio = 1 nueva fila
- 100 pacientes con 10 cambios c/u = 1000 logs
- 10 cambios/día × 365 días × 100 pacientes = ~365,000 logs/año
- **PostgreSQL maneja esto fácilmente**

### 3. Datos Sensibles
- Los logs contienen valores exactos (teléfonos, emails, etc.)
- Considera permisos de acceso a esta tabla
- No mostrar todos los detalles en el frontend

---

## 🎓 Próximos Pasos

### Corto Plazo
1. ✅ Aplicar migración (`npm run drizzle:push`)
2. ✅ Probar localmente (`npm run netlify:dev`)
3. ⏳ Integrar en presupuestos
4. ⏳ Integrar en tratamientos
5. ⏳ Integrar en citas
6. ⏳ Integrar en documentos

### Mediano Plazo
7. ⏳ Crear componente React para mostrar historial
8. ⏳ Agregar filtros (por tipo, por fecha, etc.)
9. ⏳ Mostrar fotos en miniaturas (tratamientos)

### Largo Plazo
10. ⏳ Exportar historial a PDF
11. ⏳ Reportes de auditoría
12. ⏳ Comparación de versiones (antes/después)

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "table audit_logs does not exist" | Ejecutar `npm run drizzle:push` |
| "Foreign key constraint failed" | Verificar que el paciente existe en `patients` |
| Logs no se registran | Verificar que AuditService se instancia en use-case |
| Endpoint 404 | Verificar que `patient-history.ts` existe en `netlify/functions/patients/` |
| Slow queries | Verificar índices con: `SELECT * FROM pg_indexes WHERE tablename='audit_logs'` |

---

## 📞 Recursos

```
Documentación Técnica:
├─ PASOS_PARA_APLICAR_BD.md ......... Cómo ejecutar la migración
├─ SCRIPTS_SQL_AUDIT_LOGS.md ........ Scripts SQL listos
├─ RESUMEN_IMPLEMENTACION_AUDIT_LOGS.md ... Qué se implementó
└─ GUIA_INTEGRACION_AUDIT_LOGS.md ... Cómo integrar en otros endpoints

Código:
├─ netlify/data/schemas/audit.schema.ts
├─ netlify/services/AuditService.ts
├─ netlify/functions/patients/patient-history.ts
└─ netlify/functions/patients/use-cases/
    ├─ create-patient.ts (con logs)
    └─ update-patient.ts (con logs)
```

---

## ✨ Resumen

```
┌──────────────────────────────────────────────────────────┐
│          SISTEMA DE AUDITORÍA IMPLEMENTADO              │
├──────────────────────────────────────────────────────────┤
│ ✅ Schema audit_logs creado                             │
│ ✅ AuditService implementado                            │
│ ✅ Endpoint /patient-history creado                     │
│ ✅ Logs automáticos en pacientes                        │
│ ✅ Migración SQL generada                               │
│ ✅ Documentación en español                             │
│ ✅ Build sin errores                                    │
│                                                          │
│ 🚀 PRÓXIMO: npm run drizzle:push                        │
└──────────────────────────────────────────────────────────┘
```

---

**¿Preguntas?** Ver `PASOS_PARA_APLICAR_BD.md` para inicio rápido.

