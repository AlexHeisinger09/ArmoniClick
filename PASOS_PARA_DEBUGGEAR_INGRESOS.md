# 📊 Pasos para Debuggear los Ingresos Mensuales

## Paso 1: Verificar si hay datos en la BD

Ejecuta estas queries en tu DB (Neon):

### Query 1: ¿Hay presupuestos completados?
```sql
SELECT COUNT(*) FROM budgets WHERE status = 'completed';
```

**Resultado esperado:** Un número > 0

Si es 0, necesitas crear presupuestos y marcarlos como completados.

---

### Query 2: Ver los presupuestos completados
```sql
SELECT
  id,
  patient_id,
  total_amount,
  status,
  created_at,
  updated_at
FROM budgets
WHERE status = 'completed'
LIMIT 5;
```

**Resultado esperado:**
```
id  | patient_id | total_amount | status    | created_at | updated_at
1   | 10         | 150000       | completed | 2024-10-15 | 2024-10-20
2   | 20         | 250000       | completed | 2024-09-10 | 2024-09-25
```

---

## Paso 2: Verificar el Endpoint en el Backend

### 2a: Ejecuta esta petición HTTP

```bash
curl -X GET "http://localhost:8888/.netlify/functions/budgets/completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

O en Postman:
- **Método:** GET
- **URL:** `http://localhost:8888/.netlify/functions/budgets/completed`
- **Headers:**
  - `Authorization: Bearer YOUR_JWT_TOKEN`

### 2b: ¿Qué debería retornar?

```json
{
  "budgets": [
    {
      "id": 1,
      "patient_id": 10,
      "user_id": 5,
      "total_amount": "150000",
      "status": "completed",
      "budget_type": "estetica",
      "created_at": "2024-10-15T10:30:00Z",
      "updated_at": "2024-10-20T15:45:00Z",
      "doctor_name": "Juan",
      "doctor_lastName": "Pérez",
      "items": [...]
    }
  ],
  "count": 1
}
```

**Si ves error 404 o 500:**
- El endpoint `/budgets/completed` no existe o hay error en backend
- Verifica que subiste los cambios del backend

---

## Paso 3: Verificar en el Frontend

### 3a: Abre DevTools (F12)

1. Presiona **F12**
2. Ve a **Console**
3. Recarga la página (F5)

### 3b: Busca los logs

Deberías ver:

```
📊 useMonthlyRevenueHistory - Presupuestos recibidos: {total: 2, datos: Array(2)}
📅 Meses inicializados: [...]
💰 Procesando budget: 10/2024 = $ 150000
✅ Actualizado Nov 2024: $ 150000
📊 Datos finales de ingresos: [...]
```

### 3c: Verifica la pestaña Network

1. Ve a **Network**
2. Recarga la página (F5)
3. Busca la petición `budgets/completed`
4. Mira el **Response** - ¿Tiene datos?

---

## Paso 4: Casos Comunes

### ❌ Caso 1: "Presupuestos recibidos: {total: 0}"

**Significa:** No hay presupuestos completados en BD

**Solución:**
```sql
-- Verifica cuántos presupuestos hay
SELECT COUNT(*) FROM budgets;

-- Verifica cuántos están completados
SELECT COUNT(*) FROM budgets WHERE status = 'completed';

-- Verifica los estados disponibles
SELECT status, COUNT(*) FROM budgets GROUP BY status;
```

Si hay presupuestos pero con otros estados (activo, borrador, etc):
1. Ve a la aplicación
2. Activa y completa algunos presupuestos
3. Recarga el dashboard

---

### ❌ Caso 2: "Datos finales de ingresos: [] (todos en 0)"

**Significa:** Los presupuestos están fuera del rango de 12 meses

**Ejemplo:**
- Hoy: 28 de octubre 2024
- Rango: Oct 2023 → Oct 2024
- Presupuesto completado: enero 2023 ❌ (fuera de rango)

**Solución:**
```sql
-- Ver las fechas de presupuestos completados
SELECT updated_at FROM budgets WHERE status = 'completed';
```

Si todos están hace mucho tiempo, crea nuevos presupuestos de prueba.

---

### ❌ Caso 3: Error en Network (404 o 500)

**Significa:** Problemas en el backend

**Verifica:**
1. ¿Está el archivo `get-all-completed-budgets.ts` creado? ✅
2. ¿Está exportado en `use-cases/index.ts`? ✅
3. ¿Está importado en `budgets.ts`? ✅
4. ¿Está agregado el endpoint en el handler? ✅

Si todo está bien:
```bash
# En terminal, en la carpeta del proyecto
npm run netlify:dev
# Recarga la página
```

---

## Paso 5: Crear Datos de Prueba (si es necesario)

Si no hay presupuestos completados en tu BD:

### Opción A: Desde la Aplicación
1. Ve a `/dashboard/pacientes`
2. Selecciona un paciente
3. Crea un presupuesto → Actívalo → Complétalo
4. Repite con 2-3 pacientes más
5. Recarga el dashboard

### Opción B: Directo en BD (SQL)

```sql
-- Crear un presupuesto completado de prueba
INSERT INTO budgets (
  patient_id,
  user_id,
  total_amount,
  status,
  budget_type,
  created_at,
  updated_at
) VALUES (
  10,                              -- patient_id
  5,                               -- user_id (tu ID de doctor)
  150000,                          -- total_amount (CLP)
  'completed',                     -- status
  'estetica',                      -- budget_type
  NOW() - INTERVAL '5 days',       -- created_at (hace 5 días)
  NOW() - INTERVAL '3 days'        -- updated_at (hace 3 días)
);

-- Agregar items al presupuesto (si es necesario)
INSERT INTO budget_items (
  budget_id,
  pieza,
  accion,
  valor,
  is_active
) VALUES (
  (SELECT MAX(id) FROM budgets),  -- El presupuesto que acabamos de crear
  'Cara',
  'Botox',
  150000,
  true
);
```

---

## Paso 6: Verificar el Resultado

Después de crear datos o activar presupuestos:

1. Abre el Dashboard
2. Mira la sección "Ingresos Mensuales"
3. Deberías ver un gráfico con datos
4. El carrusel debe funcionar (< Ene-Jun > y < Jul-Dic >)

---

## Resumen de Checklist

- [ ] BD tiene presupuestos con status = 'completed'
- [ ] El endpoint `/budgets/completed` retorna 200 OK
- [ ] La respuesta tiene budgets con datos
- [ ] Console muestra logs de procesamiento
- [ ] El gráfico se renderiza en el dashboard
- [ ] El carrusel de meses funciona

---

## Si Aún No Funciona

Reporta con:
1. **Screenshot de la consola (F12 → Console)**
2. **Response de `/budgets/completed` (DevTools → Network)**
3. **Resultado de esta query SQL:**
```sql
SELECT COUNT(*) as total_completados FROM budgets WHERE status = 'completed';
```

Con esto podré identificar exactamente el problema.
