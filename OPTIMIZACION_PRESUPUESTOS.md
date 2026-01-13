# Plan de Optimización: Carga de Presupuestos y Dashboard

## 🎯 Objetivo
Reducir el tiempo de carga inicial del dashboard y presupuestos de **3-4 segundos a menos de 1 segundo**.

---

## 📊 Problemas Identificados

### 1. **N+1 Query Problem en Budget Service** (CRÍTICO)
**Archivo**: `netlify/services/budget.service.ts:157-205`

**Problema Actual**:
```typescript
async findAllByPatientId(patientId: number, userId: number) {
    const budgets = await db.select().from(budgetsTable).where(...);

    // ❌ PROBLEMA: Loop con 1 query por presupuesto
    for (const budget of budgets) {
        const items = await db
            .select()
            .from(budgetItemsTable)
            .where(eq(budgetItemsTable.budget_id, budget.id));
    }
}
```

**Impacto**:
- Paciente con 5 presupuestos = **6 queries** (1 + 5)
- Tiempo: ~500ms base + 100ms por query = **1000ms total**

**Solución 1 (Recomendada)**: Usar LEFT JOIN
```typescript
async findAllByPatientId(patientId: number, userId: number): Promise<BudgetWithItems[]> {
    // ✅ UNA SOLA QUERY con LEFT JOIN
    const result = await db
        .select({
            // Budget fields
            budget_id: budgetsTable.id,
            patient_id: budgetsTable.patient_id,
            user_id: budgetsTable.user_id,
            total_amount: budgetsTable.total_amount,
            status: budgetsTable.status,
            budget_type: budgetsTable.budget_type,
            created_at: budgetsTable.created_at,
            updated_at: budgetsTable.updated_at,
            doctor_name: usersTable.name,
            doctor_lastName: usersTable.lastName,
            // Budget item fields
            item_id: budgetItemsTable.id,
            item_pieza: budgetItemsTable.pieza,
            item_accion: budgetItemsTable.accion,
            item_valor: budgetItemsTable.valor,
            item_orden: budgetItemsTable.orden,
            item_created_at: budgetItemsTable.created_at,
        })
        .from(budgetsTable)
        .innerJoin(usersTable, eq(budgetsTable.user_id, usersTable.id))
        .leftJoin(
            budgetItemsTable,
            and(
                eq(budgetItemsTable.budget_id, budgetsTable.id),
                eq(budgetItemsTable.is_active, true) // ✅ Filtro en JOIN
            )
        )
        .where(
            and(
                eq(budgetsTable.patient_id, patientId),
                eq(budgetsTable.user_id, userId)
            )
        )
        .orderBy(desc(budgetsTable.updated_at), desc(budgetsTable.created_at));

    // ✅ Agrupar resultados en memoria (más rápido que N queries)
    const budgetsMap = new Map<number, BudgetWithItems>();

    for (const row of result) {
        if (!budgetsMap.has(row.budget_id)) {
            budgetsMap.set(row.budget_id, {
                id: row.budget_id,
                patient_id: row.patient_id,
                user_id: row.user_id,
                total_amount: row.total_amount,
                status: row.status ?? '',
                budget_type: row.budget_type,
                created_at: row.created_at,
                updated_at: row.updated_at,
                doctor_name: row.doctor_name,
                doctor_lastName: row.doctor_lastName,
                items: [],
            });
        }

        // Agregar item si existe (LEFT JOIN puede retornar nulls)
        if (row.item_id) {
            budgetsMap.get(row.budget_id)!.items.push({
                id: row.item_id,
                budget_id: row.budget_id,
                pieza: row.item_pieza,
                accion: row.item_accion,
                valor: row.item_valor,
                orden: row.item_orden,
                created_at: row.item_created_at,
            });
        }
    }

    return Array.from(budgetsMap.values());
}
```

**Ganancia Esperada**:
- De **6 queries** a **1 query**
- Tiempo reducido de ~1000ms a **~200-300ms**
- **Mejora: 70%**

---

**Solución 2 (Alternativa)**: Batch query con IN
```typescript
async findAllByPatientId(patientId: number, userId: number): Promise<BudgetWithItems[]> {
    // Query 1: Obtener presupuestos
    const budgets = await db.select().from(budgetsTable).where(...);

    if (budgets.length === 0) return [];

    // Query 2: Obtener TODOS los items de una vez con IN
    const budgetIds = budgets.map(b => b.id);
    const allItems = await db
        .select()
        .from(budgetItemsTable)
        .where(
            and(
                inArray(budgetItemsTable.budget_id, budgetIds), // ✅ IN clause
                eq(budgetItemsTable.is_active, true)
            )
        )
        .orderBy(budgetItemsTable.orden, budgetItemsTable.created_at);

    // Agrupar items por budget_id
    const itemsByBudget = allItems.reduce((acc, item) => {
        if (!acc[item.budget_id]) acc[item.budget_id] = [];
        acc[item.budget_id].push(item);
        return acc;
    }, {} as Record<number, any[]>);

    // Combinar
    return budgets.map(budget => ({
        ...budget,
        items: itemsByBudget[budget.id] || [],
    }));
}
```

**Ganancia Esperada**:
- De **6 queries** a **2 queries**
- Tiempo reducido de ~1000ms a **~300-400ms**
- **Mejora: 60%**

---

### 2. **React Query Caching Agresivo**

**Problema**: Cache demasiado largo = datos viejos en primera carga

**Solución**: Reducir `staleTime` para queries críticas

```typescript
// ❌ ANTES
export const useAllBudgets = (patientId: number) => {
  const queryAllBudgets = useQuery({
    queryKey: ['budgets', 'patient', patientId, 'all'],
    queryFn: () => getAllBudgetsByPatientUseCase(apiFetcher, patientId),
    staleTime: 5 * 60 * 1000, // ❌ 5 minutos
  });
};

// ✅ DESPUÉS
export const useAllBudgets = (patientId: number) => {
  const queryAllBudgets = useQuery({
    queryKey: ['budgets', 'patient', patientId, 'all'],
    queryFn: () => getAllBudgetsByPatientUseCase(apiFetcher, patientId),
    staleTime: 30 * 1000, // ✅ 30 segundos (datos más frescos)
    gcTime: 5 * 60 * 1000, // Mantener en cache 5 minutos
  });
};
```

**Aplicar a**:
- `useBudgets.ts`: `staleTime: 30s` (era 5min)
- `useTreatments.tsx`: `staleTime: 1min` (era 2-5min)
- Dashboard hooks: `staleTime: 2min` (era 5-15min)

**Ganancia**: Datos siempre frescos en navegación normal

---

### 3. **Dashboard: Carga Progresiva**

**Problema**: 8 queries en paralelo bloquean el render inicial

**Solución 1**: Priorizar queries críticas
```typescript
// ✅ Cargar stats cards primero (rápido)
const { weeklyAppointmentsCount, isLoading: loadingWeekly } = useWeeklyAppointments();
const { monthlyPatientsCount, isLoading: loadingMonthlyPatients } = useMonthlyPatients();
const { currentMonthRevenueFormatted, isLoading: loadingRevenue } = useMonthlyRevenue();

// ✅ Cargar contenido pesado DESPUÉS (lazy)
const { upcomingAppointments, isLoading: loadingUpcoming } = useTodayAndUpcomingAppointments(
  { enabled: !loadingWeekly && !loadingMonthlyPatients } // ✅ Esperar a que stats carguen
);
```

**Solución 2**: Renderizar stats inmediatamente con skeleton para contenido
```typescript
// Ya implementado en Dashboard.tsx línea 109-176
if (isLoadingContent) {
  return (
    <>
      {/* Stats Cards siempre visibles */}
      <StatsCards />
      {/* Skeleton para resto */}
      <DashboardSkeleton />
    </>
  );
}
```

---

### 4. **SELECT específico en queries**

**Problema**: Traer todas las columnas desperdicia bandwidth

```typescript
// ❌ ANTES
const items = await db.select().from(budgetItemsTable);

// ✅ DESPUÉS
const items = await db
    .select({
        id: budgetItemsTable.id,
        pieza: budgetItemsTable.pieza,
        accion: budgetItemsTable.accion,
        valor: budgetItemsTable.valor,
        orden: budgetItemsTable.orden,
    })
    .from(budgetItemsTable);
```

**Ganancia**: ~10-20% menos datos transferidos

---

### 5. **Índices de Base de Datos** (Ya implementados)

**Verificar que existan**:
```sql
-- Índices críticos para multi-tenancy (ya en migrations/0001)
CREATE INDEX idx_budgets_patient_user ON budgets(patient_id, user_id);
CREATE INDEX idx_budget_items_budget_active ON budget_items(budget_id, is_active);
CREATE INDEX idx_treatments_patient_doctor ON treatments(patient_id, id_doctor);
```

**Comando para verificar**:
```bash
npm run check:rls
```

---

## 🚀 Plan de Implementación

### **Fase 1: Quick Wins (1-2 horas)**
1. ✅ Reducir `staleTime` en hooks críticos
   - `useBudgets.ts`: 5min → 30s
   - `useTreatments.tsx`: 2-5min → 1min
   - Dashboard hooks: 5-15min → 2min

2. ✅ Agregar SELECT específico en budget items query

### **Fase 2: Optimización Backend (2-3 horas)**
1. ✅ Refactorizar `findAllByPatientId()` con LEFT JOIN
2. ✅ Refactorizar `findActiveByPatientId()` con LEFT JOIN
3. ✅ Testing con pacientes que tengan múltiples presupuestos

### **Fase 3: Testing & Monitoring (1 hora)**
1. ✅ Medir tiempos de carga antes/después
2. ✅ Verificar que datos se muestren correctamente
3. ✅ Probar con diferentes tamaños de datos

---

## 📈 Resultados Esperados

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Dashboard primera carga | 3-4s | <1.5s | **60%** |
| Presupuestos paciente | 1-1.5s | 0.3-0.5s | **70%** |
| Navegación entre tabs | 2-3s | 0.5-1s | **65%** |
| Queries totales (5 budgets) | 6 | 1-2 | **80%** |

---

## 🛠️ Comandos para Testing

```bash
# 1. Verificar índices RLS
npm run check:rls

# 2. Ver estado de base de datos
npm run drizzle:studio

# 3. Probar localmente
npm run netlify:dev

# 4. Medir tiempos en DevTools
# Chrome DevTools > Network > Filter: XHR > Ver "Time"
```

---

## ⚠️ Precauciones

1. **Testing obligatorio**: Probar con múltiples presupuestos antes de deploy
2. **RLS activo**: Verificar que el LEFT JOIN respete las políticas de tenant
3. **Cache invalidation**: Asegurar que las mutations invaliden correctamente
4. **Rollback plan**: Guardar código original en comentarios por si falla

---

## 📝 Notas Adicionales

- El problema N+1 es **muy común** en ORMs como Drizzle
- La solución LEFT JOIN es **estándar** en bases de datos relacionales
- React Query ya está bien configurado, solo ajustar tiempos
- Los índices multi-tenant ya existen (verificar con `check:rls`)
