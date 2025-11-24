# Guía de Integración de Audit Logs - Próximas Integraciones

## 📍 Estado Actual

✅ **Completado:**
- Schema de audit_logs creado
- AuditService implementado
- Endpoint de historial creado (`GET /patient-history/:patientId`)
- Logs en creación/actualización de pacientes
- Migración generada

⏳ **Pendiente de integrar en:**
1. Presupuestos (crear, actualizar, cambio de estado a "activo")
2. Tratamientos (primera actualización, actualizaciones posteriores con fotos)
3. Citas (crear, editar, cambios de estado)
4. Documentos (crear, firmar/cambio de estado)

---

## 🔧 Patrón de Integración para Cada Endpoint

### Estructura base para cualquier use case:

```typescript
import { AuditService } from "../../../services/AuditService";
import { db } from "../../../data/db";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

export class MyUseCase {
  constructor(
    private readonly myService = new MyService(),
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(dto, userId: number) {
    try {
      // 1. Obtener valores previos (si es update/delete)
      const oldValues = await this.myService.findById(dto.id);

      // 2. Realizar la acción principal
      const result = await this.myService.create(dto);

      // 3. 📝 Registrar en auditoría
      await this.auditService.logChange({
        patientId: dto.patientId || result.patientId,
        entityType: AUDIT_ENTITY_TYPES.MiEntidad,
        entityId: result.id,
        action: AUDIT_ACTIONS.CREATED, // o UPDATED, DELETED, STATUS_CHANGED
        oldValues: oldValues ? { /* campos relevantes */ } : undefined,
        newValues: { /* campos relevantes */ },
        changedBy: userId,
        notes: `Descripción legible del cambio`,
      });

      return { /* response */ };
    } catch (error) {
      // manejo de errores
    }
  }
}
```

---

## 1️⃣ Integración en Presupuestos

### Archivo: `netlify/functions/budgets/use-cases/create-budget.ts`

**Qué registrar:**
- ✅ Creación de presupuesto
- ✅ Cambio de estado a "activo" (status_changed)
- ✅ Actualización de monto total

**Ejemplo de log al activar presupuesto:**
```json
{
  "entityType": "presupuesto",
  "action": "status_changed",
  "oldValues": { "status": "pendiente", "total_amount": 0 },
  "newValues": { "status": "activo", "total_amount": 1500000 },
  "notes": "Presupuesto activado con 5 items"
}
```

**Cambios necesarios:**
1. Importar AuditService en el constructor
2. Después de crear/actualizar presupuesto, llamar a `auditService.logChange()`
3. Incluir parámetro `patientId` desde el presupuesto

---

## 2️⃣ Integración en Tratamientos

### Archivos:
- `netlify/functions/treatments/use-cases/create-treatment.ts`
- `netlify/functions/treatments/use-cases/update-treatment.ts`

**Qué registrar:**
- ✅ Creación de tratamiento (cuando se inicia por primera vez)
- ✅ Primera actualización (cambio de pending a completed)
- ✅ Actualizaciones posteriores con fotos

**Importante:** Solo mostrar en historial cuando `status = 'completed'` (se inició el tratamiento)

**Ejemplo de log al iniciar tratamiento:**
```json
{
  "entityType": "tratamiento",
  "action": "status_changed",
  "oldValues": { "status": "pending" },
  "newValues": {
    "status": "completed",
    "descripcion": "Aplicó Botox en zona frente",
    "fecha_control": "2025-11-06",
    "fotos": ["foto1.jpg", "foto2.jpg"]
  },
  "notes": "Tratamiento iniciado - Limpieza facial"
}
```

---

## 3️⃣ Integración en Citas

### Archivo: `netlify/functions/appointments/appointments.ts`

**Qué registrar:**
- ✅ Creación de cita
- ✅ Edición de cita
- ✅ Cambios de estado (pending → confirmed, cancelled, etc.)
- ✅ Eliminación de cita

**Ejemplo de log al confirmar cita:**
```json
{
  "entityType": "cita",
  "action": "status_changed",
  "oldValues": { "status": "pending" },
  "newValues": { "status": "confirmed", "tiempo_confirmacion": "2025-11-06T14:30:00Z" },
  "notes": "Cita confirmada - María García - Limpieza facial"
}
```

---

## 4️⃣ Integración en Documentos

### Archivo: `netlify/functions/documents/documents.ts`

**Qué registrar:**
- ✅ Creación de documento
- ✅ Firma de documento (cambio de estado pendiente → firmado)
- ✅ Actualización de documento

**Ejemplo de log al firmar documento:**
```json
{
  "entityType": "documento",
  "action": "status_changed",
  "oldValues": { "status": "pendiente", "firma": null },
  "newValues": {
    "status": "firmado",
    "firma": "datos_firma.jpg",
    "fecha_firma": "2025-11-06T14:30:00Z"
  },
  "notes": "Documento \"Consentimiento\" firmado por paciente"
}
```

---

## 🔄 Flujo Completo de Ejemplo: Tratamiento

1. **Presupuesto se activa:**
   ```
   LOG: presupuesto CREATED → status = "activo"
   ```

2. **Sistema auto-genera tratamientos con status = "pending":**
   ```
   (Sin log aún, porque status es "pending")
   ```

3. **Doctor edita tratamiento por primera vez:**
   ```
   LOG: tratamiento STATUS_CHANGED
   - De: status = "pending"
   - A: status = "completed" + descripción + fotos
   ```

4. **Doctor edita tratamiento nuevamente:**
   ```
   LOG: tratamiento UPDATED
   - Old values: descripción anterior, fotos anteriores
   - New values: nueva descripción, nuevas fotos
   ```

5. **En historial del paciente se muestran:**
   - Log de presupuesto activado
   - Primer log de tratamiento (con fotos iniciales)
   - Logs de actualizaciones posteriores (con fotos en miniaturas)

---

## 📋 Checklist para Cada Integración

Para cada endpoint que integres, verifica:

- [ ] ¿Se importó AuditService?
- [ ] ¿Se inicializa AuditService en el constructor?
- [ ] ¿Se obtienen valores previos (para updates)?
- [ ] ¿Se llama a auditService.logChange() después de la acción?
- [ ] ¿Se incluye patientId correctamente?
- [ ] ¿Se especifica entityType correcto?
- [ ] ¿Se usa action correcto (CREATED, UPDATED, STATUS_CHANGED, DELETED)?
- [ ] ¿Se registran oldValues y newValues relevantes?
- [ ] ¿Se incluye una nota descriptiva?
- [ ] ¿El código sigue el mismo patrón que pacientes?

---

## 🧪 Cómo Probar

1. **Ejecutar localmente:**
   ```bash
   npm run netlify:dev
   ```

2. **Hacer una acción (crear presupuesto, tratamiento, etc.)**

3. **Verificar en la DB:**
   ```sql
   SELECT * FROM audit_logs
   WHERE patient_id = 1
   ORDER BY created_at DESC
   LIMIT 10;
   ```

4. **Llamar al endpoint de historial:**
   ```
   GET /patient-history/1
   ```

   Deberías ver un array con todos los logs del paciente.

---

## 💡 Tips

- Los `oldValues` pueden ser `null` para CREATE
- Los `newValues` pueden ser un objeto parcial (solo campos modificados)
- El `notes` debe ser legible para un auditor
- Los fotosURls se guardan en `new_values.fotos` para luego mostrarlas en miniaturas
- Para STATUS_CHANGED, es útil incluir ambos status en oldValues y newValues

---

## 📞 Próximos Pasos Después de Esta Implementación

1. Completar las 4 integraciones pendientes
2. Crear componente React para mostrar el historial
3. Formatear los logs para mostrar de forma legible al usuario
4. Agregar filtros: por tipo de entidad, por rango de fechas, etc.
5. Exportar historial a PDF/Excel

