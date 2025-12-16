# Implementación del Sistema de Evoluciones de Tratamientos

## Resumen del Cambio

Se está implementando un sistema donde cada tratamiento del presupuesto puede tener múltiples sesiones/evoluciones registradas. Esto permite a los doctores ir registrando el progreso de cada tratamiento a lo largo del tiempo.

## Estructura de Datos

### Antes
- 1 presupuesto → N budget_items
- Al activar presupuesto → se crea 1 treatment por cada budget_item con status='pending'
- Cada tratamiento era independiente

### Ahora
- 1 presupuesto → N budget_items
- Al activar presupuesto → se crea 1 treatment por cada budget_item con status='planificado'
- **Cada tratamiento puede tener N sesiones/evoluciones**
- Todas las sesiones comparten el mismo `budget_item_id`

## Estados del Tratamiento

```typescript
export const TREATMENT_STATUS = {
  PLANIFICADO: 'planificado',     // Del presupuesto, aún no iniciado
  EN_PROCESO: 'en_proceso',       // Al menos 1 sesión registrada
  COMPLETADO: 'completado',       // Tratamiento finalizado
  CANCELADO: 'cancelado'          // Tratamiento cancelado (opcional)
}
```

## Flujo de Estados

1. **Activar presupuesto** → Crea tratamientos con status='planificado'
2. **Primera sesión registrada** → Tratamiento principal cambia a 'en_proceso'
3. **Sesiones adicionales** → Se registran con status='en_proceso'
4. **Completar tratamiento** → Solo el tratamiento PRINCIPAL se marca como 'completado'

## Lógica de Ingresos (CRÍTICO)

### Problema
Con múltiples sesiones por `budget_item_id`, si varias sesiones tienen status='completed', podríamos contar el ingreso múltiples veces.

### Solución
**SOLO el tratamiento principal debe marcarse como 'completado'**. Las sesiones individuales NUNCA deben tener status='completado'.

### Regla de Negocio
- **1 budget_item → 1 ingreso** (cuando el tratamiento principal se completa)
- Las sesiones son solo registros de evolución, NO ingresos independientes
- La query de ingresos debe agrupar o usar DISTINCT por `budget_item_id`

## Cambios Implementados

### Backend

1. **treatment.schema.ts**
   - ✅ Actualizadas constantes TREATMENT_STATUS
   - ✅ budget_item_id y status ya existen en DB

2. **budget.service.ts**
   - ✅ Cambiado status de 'pending' a 'planificado' al activar presupuesto
   - ✅ Actualizado getRevenueByCompletedTreatments para deduplicar por budget_item_id (línea 730-741)

3. **add-session.ts** (NUEVO)
   - ✅ Endpoint POST /treatments/patient/{patientId}/session
   - ✅ Crea nueva sesión con mismo budget_item_id
   - ✅ Actualiza tratamiento principal a 'en_proceso' si estaba 'planificado'
   - ✅ Status de sesión: 'en_proceso'

4. **complete-treatment.ts**
   - ⏳ PENDIENTE: Verificar que solo se use para tratamiento principal
   - ⏳ PENDIENTE: Agregar validación para no completar sesiones individuales

### Frontend

1. **add-treatment-session.use-case.ts** (NUEVO)
   - ✅ Use case para agregar sesión vía API
   - ✅ Interface AddSessionData con todos los campos necesarios

2. **useTreatments.tsx** (ACTUALIZADO)
   - ✅ Nuevo hook `useAddTreatmentSession` para agregar sesiones
   - ✅ Helper `groupTreatmentsByBudgetItem` que agrupa tratamientos por budget_item_id
   - ✅ Nuevo hook `useTreatmentsByBudgetGrouped` que retorna tratamientos ya agrupados
   - ✅ Interface `TreatmentGroup` con mainTreatment + sessions[]
   - ✅ Lógica de estado del grupo basada en sesiones

⏳ **PENDIENTE**:
1. Crear UI expandible: tratamiento principal + lista de sesiones
2. Modal/formulario para agregar nueva sesión
3. Botón "Completar tratamiento" solo en tratamiento principal
4. Integrar hooks en componentes existentes

## Próximos Pasos

1. ✅ Actualizar lógica de ingresos (getRevenueByCompletedTreatments)
2. ⏳ Crear/actualizar hooks frontend
3. ⏳ Implementar UI expandible
4. ⏳ Testing completo del flujo

## Notas Importantes

- **NO eliminar LEGACY_TREATMENT_STATUS** - mantener compatibilidad con código antiguo
- **Las sesiones NUNCA tienen status='completado'** - solo el tratamiento principal
- **1 ingreso por budget_item**, independiente del número de sesiones
